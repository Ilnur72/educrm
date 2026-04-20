import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { xavfliTalabalarniTopish } from "@/lib/xavfTahlil";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td, TableEmpty } from "@/components/ui/Table";
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

const lidHolatBadge: Record<string, { label: string; variant: "info" | "warning" | "purple" | "success" | "danger" }> = {
  YANGI: { label: "Yangi", variant: "info" },
  QONGIROQ_QILINDI: { label: "Qo'ng'iroq", variant: "warning" },
  SINOV_DARSI: { label: "Sinov darsi", variant: "purple" },
  YOZILDI: { label: "Yozildi", variant: "success" },
  RAD_ETDI: { label: "Rad etdi", variant: "danger" },
};

// Icons
const Icons = {
  users: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  money: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  book: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  leads: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  target: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3M6 12H3" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
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
    <div className="min-h-screen">
      <Topbar
        title="Dashboard"
        description={`${oyNomi(hozir.getMonth() + 1)} ${hozir.getFullYear()} - Umumiy ko'rinish`}
      />

      <div className="p-6 space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Jami talabalar"
            value={stats.jami_talabalar}
            sub="faol o'quvchilar"
            subColor="default"
            icon={Icons.users}
          />
          <StatCard
            label="Oylik tushum"
            value={formatSum(stats.oylik_tushum)}
            sub="+bu oy"
            subColor="success"
            icon={Icons.money}
          />
          <StatCard
            label="Faol kurslar"
            value={stats.faol_kurslar}
            icon={Icons.book}
          />
          <StatCard
            label="Yangi lidlar"
            value={stats.yangi_lidlar}
            sub="bu oy"
            subColor="default"
            icon={Icons.leads}
          />
        </div>

        {/* Trial Lessons Alert */}
        {stats.bugungi_sinov.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {Icons.target}
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Bugun {stats.bugungi_sinov.length} ta sinov darsi bor
                </p>
                <p className="text-sm text-muted-foreground">
                  Quyidagi talabalar sinov darsiga kelishi kerak
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {stats.bugungi_sinov.map((lid) => (
                <div
                  key={lid.id}
                  className="bg-card border border-border rounded-lg px-4 py-3 card-hover"
                >
                  <p className="text-sm font-medium text-foreground">{lid.ism}</p>
                  <p className="text-xs text-muted-foreground">{lid.kurs}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* At-Risk Students Alert */}
        {stats.xavfli_talabalar.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                  {Icons.warning}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {stats.xavfli_talabalar.length} ta talaba diqqat talab qiladi
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {stats.xavfli_talabalar.filter((t) => t.daraja === "XAVFLI").length} xavfli,{" "}
                    {stats.xavfli_talabalar.filter((t) => t.daraja === "DIQQAT").length} diqqat
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {stats.xavfli_talabalar.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-start justify-between bg-card border border-border rounded-lg px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <Badge
                      variant={t.daraja === "XAVFLI" ? "danger" : "warning"}
                      size="sm"
                      dot
                    >
                      {t.daraja === "XAVFLI" ? "Xavfli" : "Diqqat"}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t.ism} {t.familiya}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t.guruhNom}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-xs text-right">
                    {t.sabablar.join(" | ")}
                  </p>
                </div>
              ))}
              {stats.xavfli_talabalar.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  + {stats.xavfli_talabalar.length - 5} ta talaba yana bor
                </p>
              )}
            </div>
          </div>
        )}

        {/* Today's Lessons */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Bugungi darslar</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatSana(new Date())}
              </p>
            </div>
            <Badge variant="outline">{stats.bugungi_darslar.length} ta dars</Badge>
          </CardHeader>
          {stats.bugungi_darslar.length === 0 ? (
            <CardBody>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
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
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {dars.guruh.vaqt}
                      </span>
                    </Td>
                    <Td className="font-medium">{dars.guruh.kurs.nom}</Td>
                    <Td>{dars.guruh.nom}</Td>
                    <Td className="text-muted-foreground">
                      {dars.guruh.oqituvchi?.user.name ?? "—"}
                    </Td>
                    <Td>
                      <Badge variant="outline">{dars.guruh.xona ?? "—"}</Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <CardTitle>Oxirgi lidlar</CardTitle>
              <Badge variant="outline">{stats.oxirgi_lidlar.length}</Badge>
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
                {stats.oxirgi_lidlar.length === 0 ? (
                  <TableEmpty message="Lidlar topilmadi" colSpan={3} />
                ) : (
                  stats.oxirgi_lidlar.map((lid) => {
                    const h = lidHolatBadge[lid.holat];
                    return (
                      <Tr key={lid.id}>
                        <Td className="font-medium">{lid.ism}</Td>
                        <Td className="text-muted-foreground">{lid.kurs}</Td>
                        <Td>
                          <Badge variant={h.variant} dot>
                            {h.label}
                          </Badge>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </Tbody>
            </Table>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Oxirgi to'lovlar</CardTitle>
              <Badge variant="outline">{stats.oxirgi_tolovlar.length}</Badge>
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
                {stats.oxirgi_tolovlar.length === 0 ? (
                  <TableEmpty message="To'lovlar topilmadi" colSpan={3} />
                ) : (
                  stats.oxirgi_tolovlar.map((t) => (
                    <Tr key={t.id}>
                      <Td className="font-medium">
                        {t.talaba.ism} {t.talaba.familiya}
                      </Td>
                      <Td>
                        <span className="font-mono text-success">
                          +{t.summa.toLocaleString()}
                        </span>
                      </Td>
                      <Td className="text-muted-foreground text-xs">
                        {formatSana(t.createdAt)}
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
