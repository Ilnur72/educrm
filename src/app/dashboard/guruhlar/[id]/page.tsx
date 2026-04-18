"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { formatSana, formatSum } from "@/lib/utils";

type Talaba = {
  id: string;
  ism: string;
  familiya: string;
  telefon: string;
  tolovlar: { summa: number }[];
};

type TalabaGuruh = {
  id: string;
  kirishSana: string;
  talaba: Talaba;
};

type Dars = {
  id: string;
  sana: string;
  mavzu: string | null;
  davomatlar: { holat: string }[];
};

type Guruh = {
  id: string;
  nom: string;
  xona: string | null;
  kunlar: string[];
  vaqt: string;
  boshlanish: string;
  faol: boolean;
  kurs: { nom: string; narxi: number; maxTalaba: number };
  oqituvchi: { user: { name: string; email: string } } | null;
  talabalar: TalabaGuruh[];
  darslar: Dars[];
  _count: { talabalar: number; darslar: number };
};

function tolovHolat(talaba: Talaba, kursNarxi: number) {
  const summa = talaba.tolovlar.reduce((s, t) => s + t.summa, 0);
  if (summa === 0)            return { label: "Qarzdor",  variant: "red"   as const };
  if (summa >= kursNarxi)     return { label: "To'langan", variant: "green" as const };
  return                             { label: "Qisman",   variant: "amber" as const };
}

function Avatar({ ism, familiya }: { ism: string; familiya: string }) {
  const initials = `${ism[0]}${familiya[0]}`.toUpperCase();
  const colors = ["bg-purple-100 text-purple-700","bg-teal-100 text-teal-700","bg-blue-100 text-blue-700","bg-amber-100 text-amber-700"];
  const color  = colors[(ism.charCodeAt(0) + familiya.charCodeAt(0)) % colors.length];
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

export default function GuruhDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const [guruh, setGuruh]           = useState<Guruh | null>(null);
  const [yuklanyapti, setYuklanyapti] = useState(true);

  useEffect(() => {
    fetch(`/api/guruhlar/${id}`)
      .then((r) => r.json())
      .then((d) => { setGuruh(d); setYuklanyapti(false); })
      .catch(() => setYuklanyapti(false));
  }, [id]);

  if (yuklanyapti) return (
    <div><Topbar title="Yuklanmoqda..." /><div className="p-6 text-center text-gray-400 py-20">Yuklanmoqda...</div></div>
  );

  if (!guruh) return (
    <div><Topbar title="Topilmadi" /><div className="p-6 text-center text-gray-400 py-20">Guruh topilmadi</div></div>
  );

  const jamiTolov     = guruh.talabalar.reduce((s, tg) => s + tg.talaba.tolovlar.reduce((ss, t) => ss + t.summa, 0), 0);
  const tolanganSoni  = guruh.talabalar.filter((tg) => tg.talaba.tolovlar.reduce((s, t) => s + t.summa, 0) >= guruh.kurs.narxi).length;
  const qarzdorSoni   = guruh.talabalar.length - tolanganSoni;

  return (
    <div>
      <Topbar
        title={guruh.nom}
        actions={<Button variant="ghost" onClick={() => router.back()}>← Orqaga</Button>}
      />

      <div className="p-6 space-y-5">
        {/* Yuqori info kartalar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniStat label="Talabalar"    value={`${guruh._count.talabalar}/${guruh.kurs.maxTalaba}`} color={guruh._count.talabalar >= guruh.kurs.maxTalaba ? "text-red-500" : "text-green-600"} />
          <MiniStat label="Oylik tushum" value={formatSum(jamiTolov)} />
          <MiniStat label="To'lagan"     value={`${tolanganSoni} ta`} color="text-green-600" />
          <MiniStat label="Qarzdor"      value={`${qarzdorSoni} ta`}  color={qarzdorSoni > 0 ? "text-red-500" : "text-gray-900"} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Guruh ma'lumoti */}
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Guruh ma'lumoti</CardTitle></CardHeader>
            <CardBody>
              <div className="space-y-3 text-sm">
                <Row label="Kurs"        value={guruh.kurs.nom} />
                <Row label="O'qituvchi"  value={guruh.oqituvchi?.user.name ?? "—"} />
                <Row label="Xona"        value={guruh.xona ?? "—"} />
                <Row label="Vaqt"        value={guruh.vaqt} mono />
                <Row label="Kunlar"      value={guruh.kunlar.join(", ") || "—"} />
                <Row label="Boshlanish"  value={formatSana(guruh.boshlanish)} />
                <Row label="Kurs narxi"  value={formatSum(guruh.kurs.narxi)} />
                <Row label="Max talaba"  value={`${guruh.kurs.maxTalaba} kishi`} />
                <div className="pt-2 border-t border-gray-100">
                  <Badge variant={guruh.faol ? "green" : "gray"}>
                    {guruh.faol ? "Faol" : "Nofaol"}
                  </Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Talabalar jadvali */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                Talabalar
                <span className="ml-2 text-gray-400 font-normal">({guruh.talabalar.length} ta)</span>
              </CardTitle>
            </CardHeader>
            {guruh.talabalar.length === 0 ? (
              <CardBody>
                <p className="text-sm text-gray-400 text-center py-4">Hali talaba yo'q</p>
              </CardBody>
            ) : (
              <Table>
                <Thead>
                  <tr>
                    <Th>#</Th>
                    <Th>Talaba</Th>
                    <Th>Telefon</Th>
                    <Th>Bu oy to'lov</Th>
                    <Th>Holat</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {guruh.talabalar.map((tg, i) => {
                    const holat = tolovHolat(tg.talaba, guruh.kurs.narxi);
                    const summa = tg.talaba.tolovlar.reduce((s, t) => s + t.summa, 0);
                    return (
                      <Tr
                        key={tg.id}
                        onClick={() => router.push(`/dashboard/talabalar/${tg.talaba.id}`)}
                      >
                        <Td className="text-gray-400 text-xs">{String(i + 1).padStart(2, "0")}</Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <Avatar ism={tg.talaba.ism} familiya={tg.talaba.familiya} />
                            <span className="font-medium">{tg.talaba.ism} {tg.talaba.familiya}</span>
                          </div>
                        </Td>
                        <Td className="font-mono text-xs text-gray-500">{tg.talaba.telefon}</Td>
                        <Td className="font-medium">
                          {summa > 0 ? formatSum(summa) : "—"}
                        </Td>
                        <Td><Badge variant={holat.variant}>{holat.label}</Badge></Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            )}
          </Card>
        </div>

        {/* So'nggi darslar */}
        <Card>
          <CardHeader>
            <CardTitle>So'nggi darslar</CardTitle>
          </CardHeader>
          {guruh.darslar.length === 0 ? (
            <CardBody>
              <p className="text-sm text-gray-400 text-center py-4">Hali dars o'tilmagan</p>
            </CardBody>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Sana</Th>
                  <Th>Mavzu</Th>
                  <Th>Keldi</Th>
                  <Th>Kelmadi</Th>
                  <Th>Davomiylik</Th>
                </tr>
              </Thead>
              <Tbody>
                {guruh.darslar.map((d) => {
                  const keldi   = d.davomatlar.filter((dv) => dv.holat === "KELDI").length;
                  const kelmadi = d.davomatlar.filter((dv) => dv.holat === "KELMADI").length;
                  const jami    = d.davomatlar.length;
                  const foiz    = jami > 0 ? Math.round((keldi / jami) * 100) : 0;
                  return (
                    <Tr key={d.id}>
                      <Td className="font-mono text-xs">{formatSana(d.sana)}</Td>
                      <Td className="text-gray-600">{d.mavzu ?? "—"}</Td>
                      <Td className="text-green-600 font-medium">{keldi}</Td>
                      <Td className="text-red-500 font-medium">{kelmadi}</Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-400 rounded-full" style={{ width: `${foiz}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{foiz}%</span>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className={`text-gray-800 text-right ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <p className={`text-xl font-bold ${color ?? "text-gray-900"}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
