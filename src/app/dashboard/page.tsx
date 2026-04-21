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
  SINOV_DARSI:       { label: "Sinov darsi",    variant: "purple" },
  YOZILDI:           { label: "Yozildi",        variant: "green"  },
  RAD_ETDI:          { label: "Rad etdi",       variant: "red"    },
};

// Icons for stats
const icons = {
  students: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  money: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  courses: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
    </svg>
  ),
  leads: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
    </svg>
  ),
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
        title="Dashboard"
        subtitle={`${oyNomi(hozir.getMonth() + 1)} ${hozir.getFullYear()} — Umumiy ko'rinish`}
      />

      <div className="p-6 space-y-6">
        {/* Statistika */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Jami talabalar"
            value={stats.jami_talabalar}
            sub="faol o'quvchilar"
            subColor="gray"
            icon={icons.students}
          />
          <StatCard
            label="Oylik tushum"
            value={formatSum(stats.oylik_tushum)}
            sub="bu oy"
            subColor="green"
            icon={icons.money}
          />
          <StatCard
            label="Faol kurslar"
            value={stats.faol_kurslar}
            subColor="gray"
            icon={icons.courses}
          />
          <StatCard
            label="Yangi lidlar"
            value={stats.yangi_lidlar}
            sub="bu oy"
            subColor="gray"
            icon={icons.leads}
          />
        </div>

        {/* Bugungi sinov darslar reminder */}
        {stats.bugungi_sinov.length > 0 && (
          <div className="bg-violet-50 border border-violet-200/60 rounded-2xl px-6 py-5 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-violet-100 rounded-xl">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-600">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-violet-900">
                  Bugun {stats.bugungi_sinov.length} ta sinov darsi bor
                </p>
                <p className="text-sm text-violet-600">Talabalarni kutib oling</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.bugungi_sinov.map((lid) => (
                <div
                  key={lid.id}
                  className="bg-white border border-violet-200 rounded-xl px-4 py-3 shadow-sm"
                >
                  <p className="text-sm font-semibold text-foreground">{lid.ism}</p>
                  <p className="text-xs text-muted-foreground">{lid.kurs}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Xavfli talabalar widget */}
        {stats.xavfli_talabalar.length > 0 && (
          <div className="bg-red-50 border border-red-200/60 rounded-2xl px-6 py-5 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-100 rounded-xl">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-red-900">
                    {stats.xavfli_talabalar.length} ta talaba diqqat talab qiladi
                  </p>
                  <p className="text-sm text-red-600">
                    {stats.xavfli_talabalar.filter((t) => t.daraja === "XAVFLI").length} xavfli, {" "}
                    {stats.xavfli_talabalar.filter((t) => t.daraja === "DIQQAT").length} diqqat
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {stats.xavfli_talabalar.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-start justify-between bg-white border border-red-100 rounded-xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      t.daraja === "XAVFLI"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {t.daraja === "XAVFLI" ? "Xavfli" : "Diqqat"}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {t.ism} {t.familiya}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">{t.guruhNom}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-xs text-right">
                    {t.sabablar.join(" | ")}
                  </p>
                </div>
              ))}
              {stats.xavfli_talabalar.length > 5 && (
                <p className="text-xs text-red-500 text-center pt-2 font-medium">
                  + {stats.xavfli_talabalar.length - 5} ta talaba yana bor
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bugungi darslar */}
        <Card>
          <CardHeader>
            <CardTitle>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Bugungi darslar
            </CardTitle>
            <span className="text-sm text-muted-foreground">{formatSana(new Date())}</span>
          </CardHeader>
          {stats.bugungi_darslar.length === 0 ? (
            <CardBody>
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">Bugun dars yo'q</p>
              </div>
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
                    <Td>
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded-lg">
                        {dars.guruh.vaqt}
                      </span>
                    </Td>
                    <Td className="font-medium">{dars.guruh.kurs.nom}</Td>
                    <Td>{dars.guruh.nom}</Td>
                    <Td className="text-muted-foreground">{dars.guruh.oqituvchi?.user.name ?? "—"}</Td>
                    <Td>
                      {dars.guruh.xona ? (
                        <Badge variant="gray" dot={false}>{dars.guruh.xona}</Badge>
                      ) : "—"}
                    </Td>
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
              <CardTitle>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
                </svg>
                Oxirgi lidlar
              </CardTitle>
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
                      <Td className="font-medium">{lid.ism}</Td>
                      <Td className="text-muted-foreground">{lid.kurs}</Td>
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
              <CardTitle>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
                Oxirgi to'lovlar
              </CardTitle>
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
                    <Td className="font-medium">{t.talaba.ism} {t.talaba.familiya}</Td>
                    <Td>
                      <span className="text-emerald-600 font-semibold">
                        {t.summa.toLocaleString()} so'm
                      </span>
                    </Td>
                    <Td className="text-muted-foreground text-sm">{formatSana(t.createdAt)}</Td>
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
