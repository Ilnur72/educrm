import { prisma } from "@/lib/db";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { oyNomi } from "@/lib/utils";

async function getStats() {
  const hozir = new Date();
  const oyBoshi = new Date(hozir.getFullYear(), hozir.getMonth(), 1);

  const [kurslar, lidHolat, oylikTolov, manba] = await Promise.all([
    prisma.kurs.findMany({
      include: {
        guruhlar: {
          where: { faol: true },
          include: { _count: { select: { talabalar: { where: { faol: true } } } } },
        },
        _count: { select: { guruhlar: { where: { faol: true } } } },
      },
    }),
    prisma.lid.groupBy({ by: ["holat"], _count: true }),
    prisma.tolov.aggregate({ where: { createdAt: { gte: oyBoshi } }, _sum: { summa: true }, _count: true }),
    prisma.lid.groupBy({ by: ["manba"], _count: true, orderBy: { _count: { manba: "desc" } } }),
  ]);

  return { kurslar, lidHolat, oylikTolov, manba, hozir };
}

const MANBA_LABEL: Record<string, string> = {
  INSTAGRAM: "Instagram", TELEGRAM: "Telegram",
  GOOGLE: "Google", DOST_TAVSIYASI: "Do'st tavsiyasi", BOSHQA: "Boshqa",
};

export default async function HisobotlarPage() {
  const { kurslar, lidHolat, oylikTolov, manba, hozir } = await getStats();

  const yozildi = lidHolat.find((h) => h.holat === "YOZILDI")?._count ?? 0;
  const jami_lid = lidHolat.reduce((s, h) => s + h._count, 0);
  const konversiya = jami_lid ? Math.round((yozildi / jami_lid) * 100) : 0;

  return (
    <div>
      <Topbar title="Hisobotlar va statistika" />
      <div className="p-6 space-y-6">

        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label={`${oyNomi(hozir.getMonth() + 1)} tushuми`}
            value={`${(oylikTolov._sum.summa ?? 0).toLocaleString()} so'm`}
            subColor="green"
          />
          <StatCard label="Jami lidlar" value={jami_lid} />
          <StatCard label="Konversiya" value={`${konversiya}%`} subColor="green" />
          <StatCard label="Bu oy to'lovlar" value={`${oylikTolov._count} ta`} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Lidlar holati */}
          <Card>
            <CardHeader><CardTitle>Lidlar holati</CardTitle></CardHeader>
            <Table>
              <Thead>
                <tr><Th>Holat</Th><Th>Soni</Th><Th>Foiz</Th></tr>
              </Thead>
              <Tbody>
                {lidHolat.map((h) => (
                  <Tr key={h.holat}>
                    <Td>{h.holat.replace(/_/g, " ")}</Td>
                    <Td className="font-medium">{h._count}</Td>
                    <Td className="text-gray-500">
                      {jami_lid ? Math.round((h._count / jami_lid) * 100) : 0}%
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Card>

          {/* Manba bo'yicha */}
          <Card>
            <CardHeader><CardTitle>Manbalar bo'yicha lidlar</CardTitle></CardHeader>
            <CardBody className="space-y-3">
              {manba.map((m) => {
                const foiz = jami_lid ? Math.round((m._count / jami_lid) * 100) : 0;
                return (
                  <div key={m.manba}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{MANBA_LABEL[m.manba] ?? m.manba}</span>
                      <span className="text-gray-500">{m._count} ({foiz}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className="h-full bg-brand-600 rounded-full"
                        style={{ width: `${foiz}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>

        {/* Kurslar reytingi */}
        <Card>
          <CardHeader><CardTitle>Kurslar reytingi</CardTitle></CardHeader>
          <Table>
            <Thead>
              <tr>
                <Th>#</Th>
                <Th>Kurs</Th>
                <Th>Narxi</Th>
                <Th>Guruhlar</Th>
                <Th>Talabalar</Th>
                <Th>Oylik tushum</Th>
              </tr>
            </Thead>
            <Tbody>
              {kurslar
                .map((k) => ({
                  ...k,
                  jami: k.guruhlar.reduce((s, g) => s + g._count.talabalar, 0),
                }))
                .sort((a, b) => b.jami - a.jami)
                .map((k, i) => (
                  <Tr key={k.id}>
                    <Td className="text-gray-400">{i + 1}</Td>
                    <Td className="font-medium">{k.nom}</Td>
                    <Td>{k.narxi.toLocaleString()} so'm</Td>
                    <Td>{k._count.guruhlar} ta</Td>
                    <Td className="font-medium text-gray-900">{k.jami}</Td>
                    <Td className="font-medium text-green-700">
                      {(k.jami * k.narxi).toLocaleString()} so'm
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </Card>

      </div>
    </div>
  );
}
