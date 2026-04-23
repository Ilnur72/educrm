import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { xavfliTalabalarniTopish } from "@/lib/xavfTahlil";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatSum, formatSana, oyNomi } from "@/lib/utils";
import { DashboardGrafik } from "@/components/ui/DashboardGrafik";

async function getStats() {
  const hozir = new Date();
  const oyBoshi = new Date(hozir.getFullYear(), hozir.getMonth(), 1);
  const bugunBoshi = new Date(hozir.getFullYear(), hozir.getMonth(), hozir.getDate());
  const bugunOxiri = new Date(bugunBoshi.getTime() + 86400000);

  const [
    jami_talabalar,
    faol_kurslar,
    yangi_lidlar,
    oylik_tolovlar,
    bugungi_darslar,
    bugungi_sinov,
    xavfli_talabalar,
    oxirgi_lidlar,
    oxirgi_tolovlar,
  ] = await Promise.all([
    prisma.talaba.count({ where: { faol: true } }),
    prisma.kurs.count({ where: { faol: true } }),
    prisma.lid.count({ where: { createdAt: { gte: oyBoshi } } }),
    prisma.tolov.aggregate({
      where: { createdAt: { gte: oyBoshi } },
      _sum: { summa: true },
    }),
    prisma.dars.findMany({
      where: { sana: { gte: bugunBoshi, lt: bugunOxiri } },
      include: { guruh: { include: { kurs: true, oqituvchi: { include: { user: true } } } } },
      orderBy: { sana: "asc" },
    }),
    prisma.lid.findMany({
      where: {
        holat: "SINOV_DARSI",
        sinovSanasi: { gte: bugunBoshi, lt: bugunOxiri },
      },
      orderBy: { sinovSanasi: "asc" },
    }),
    xavfliTalabalarniTopish(),
    prisma.lid.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.tolov.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { talaba: { select: { ism: true, familiya: true } } },
    }),
  ]);

  return {
    jami_talabalar,
    faol_kurslar,
    yangi_lidlar,
    oylik_tushum: oylik_tolovlar._sum.summa ?? 0,
    bugungi_darslar,
    bugungi_sinov,
    xavfli_talabalar,
    oxirgi_lidlar,
    oxirgi_tolovlar,
  };
}

const lidHolatBadge: Record<string, { label: string; variant: "blue" | "amber" | "purple" | "green" | "red" }> = {
  YANGI:             { label: "Yangi",          variant: "blue"   },
  QONGIROQ_QILINDI:  { label: "Qo'ng'iroq",     variant: "amber"  },
  SINOV_DARSI:       { label: "Sinov darsi",     variant: "purple" },
  YOZILDI:           { label: "Yozildi",         variant: "green"  },
  RAD_ETDI:          { label: "Rad etdi",        variant: "red"    },
};

export default async function DashboardPage() {
  const session = await getSession();
  if (session?.user.role === "OQITUVCHI") {
    redirect("/dashboard/oqituvchi");
  }

  const stats = await getStats();
  const hozir = new Date();

  return (
    <div>
      <Topbar
        title={`${oyNomi(hozir.getMonth() + 1)} ${hozir.getFullYear()} — Dashboard`}
      />

      <div className="p-6 space-y-6">
        {/* Statistika */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Jami talabalar"
            value={stats.jami_talabalar}
            sub="faol o'quvchilar"
            subColor="gray"
          />
          <StatCard
            label="Oylik tushum"
            value={formatSum(stats.oylik_tushum)}
            sub={`+bu oy`}
            subColor="green"
          />
          <StatCard
            label="Faol kurslar"
            value={stats.faol_kurslar}
          />
          <StatCard
            label="Yangi lidlar"
            value={stats.yangi_lidlar}
            sub="bu oy"
            subColor="gray"
          />
        </div>

        {/* Bugungi sinov darslar reminder */}
        {stats.bugungi_sinov.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-purple-600 text-lg">🎯</span>
              <p className="font-semibold text-purple-800">
                Bugun {stats.bugungi_sinov.length} ta sinov darsi bor
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.bugungi_sinov.map((lid) => (
                <div
                  key={lid.id}
                  className="bg-white border border-purple-200 rounded-xl px-3 py-2"
                >
                  <p className="text-sm font-medium text-gray-800">{lid.ism}</p>
                  <p className="text-xs text-gray-400">{lid.kurs}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Xavfli talabalar widget */}
        {stats.xavfli_talabalar.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-red-800">
                ⚠ {stats.xavfli_talabalar.length} ta talaba diqqat talab qiladi
              </p>
              <span className="text-xs text-red-400">
                {stats.xavfli_talabalar.filter((t) => t.daraja === "XAVFLI").length} xavfli ·{" "}
                {stats.xavfli_talabalar.filter((t) => t.daraja === "DIQQAT").length} diqqat
              </span>
            </div>
            <div className="space-y-2">
              {stats.xavfli_talabalar.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-start justify-between bg-white border border-red-100 rounded-xl px-3 py-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        t.daraja === "XAVFLI"
                          ? "bg-red-100 text-red-600"
                          : "bg-amber-100 text-amber-600"
                      }`}>
                        {t.daraja === "XAVFLI" ? "🔴 Xavfli" : "🟡 Diqqat"}
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        {t.ism} {t.familiya}
                      </span>
                      <span className="text-xs text-gray-400">{t.guruhNom}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t.sabablar.join(" · ")}
                    </p>
                  </div>
                </div>
              ))}
              {stats.xavfli_talabalar.length > 5 && (
                <p className="text-xs text-red-400 text-center pt-1">
                  + {stats.xavfli_talabalar.length - 5} ta talaba yana bor
                </p>
              )}
            </div>
          </div>
        )}

        {/* Grafik */}
        <DashboardGrafik />

        {/* Bugungi darslar */}
        <Card>
          <CardHeader>
            <CardTitle>Bugungi darslar</CardTitle>
            <span className="text-xs text-gray-400">{formatSana(new Date())}</span>
          </CardHeader>
          {stats.bugungi_darslar.length === 0 ? (
            <CardBody>
              <p className="text-sm text-gray-400 text-center py-4">Bugun dars yo'q</p>
            </CardBody>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Vaqt</Th>
                  <Th>Kurs</Th>
                  <Th>Guruh</Th>
                  <Th>O'qituvchi</Th>
                  <Th>Xona</Th>
                </tr>
              </Thead>
              <Tbody>
                {stats.bugungi_darslar.map((dars) => (
                  <Tr key={dars.id}>
                    <Td className="font-mono text-xs">{dars.guruh.vaqt}</Td>
                    <Td>{dars.guruh.kurs.nom}</Td>
                    <Td>{dars.guruh.nom}</Td>
                    <Td>{dars.guruh.oqituvchi?.user.name ?? "—"}</Td>
                    <Td>{dars.guruh.xona ?? "—"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Oxirgi lidlar */}
          <Card>
            <CardHeader>
              <CardTitle>Oxirgi lidlar</CardTitle>
            </CardHeader>
            <Table>
              <Thead>
                <tr>
                  <Th>Ism</Th>
                  <Th>Kurs</Th>
                  <Th>Holat</Th>
                </tr>
              </Thead>
              <Tbody>
                {stats.oxirgi_lidlar.map((lid) => {
                  const h = lidHolatBadge[lid.holat];
                  return (
                    <Tr key={lid.id}>
                      <Td>{lid.ism}</Td>
                      <Td className="text-gray-500">{lid.kurs}</Td>
                      <Td><Badge variant={h.variant}>{h.label}</Badge></Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Card>

          {/* Oxirgi to'lovlar */}
          <Card>
            <CardHeader>
              <CardTitle>Oxirgi to'lovlar</CardTitle>
            </CardHeader>
            <Table>
              <Thead>
                <tr>
                  <Th>Talaba</Th>
                  <Th>Summa</Th>
                  <Th>Sana</Th>
                </tr>
              </Thead>
              <Tbody>
                {stats.oxirgi_tolovlar.map((t) => (
                  <Tr key={t.id}>
                    <Td>{t.talaba.ism} {t.talaba.familiya}</Td>
                    <Td className="font-medium">{t.summa.toLocaleString()}</Td>
                    <Td className="text-gray-400 text-xs">{formatSana(t.createdAt)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
