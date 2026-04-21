"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { formatSana, formatSum } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

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
  const colors = [
    "from-violet-500/20 to-violet-500/5 text-violet-700 ring-violet-500/20",
    "from-emerald-500/20 to-emerald-500/5 text-emerald-700 ring-emerald-500/20",
    "from-blue-500/20 to-blue-500/5 text-blue-700 ring-blue-500/20",
    "from-amber-500/20 to-amber-500/5 text-amber-700 ring-amber-500/20"
  ];
  const color = colors[(ism.charCodeAt(0) + familiya.charCodeAt(0)) % colors.length];
  return (
    <div className={`w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-semibold flex-shrink-0 ring-2 ${color}`}>
      {initials}
    </div>
  );
}

export default function GuruhDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const [guruh, setGuruh]           = useState<Guruh | null>(null);
  const [yuklanyapti, setYuklanyapti] = useState(true);

  // Dars bekor qilish
  const [bekorModal, setBekorModal]   = useState(false);
  const [bekorSana, setBekorSana]     = useState(new Date().toISOString().slice(0, 10));
  const [bekorSabab, setBekorSabab]   = useState("");
  const [bekorYuborilmoqda, setBekorYuborilmoqda] = useState(false);
  const [bekorNatija, setBekorNatija] = useState<{ jami: number; yuborildi: number } | null>(null);

  useEffect(() => {
    fetch(`/api/guruhlar/${id}`)
      .then((r) => r.json())
      .then((d) => { setGuruh(d); setYuklanyapti(false); })
      .catch(() => setYuklanyapti(false));
  }, [id]);

  if (yuklanyapti) return (
    <div>
      <Topbar title="Yuklanmoqda..." />
      <div className="p-6 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    </div>
  );

  if (!guruh) return (
    <div>
      <Topbar title="Topilmadi" />
      <div className="p-6 text-center py-20">
        <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p className="text-muted-foreground">Guruh topilmadi</p>
      </div>
    </div>
  );

  const jamiTolov     = guruh.talabalar.reduce((s, tg) => s + tg.talaba.tolovlar.reduce((ss, t) => ss + t.summa, 0), 0);
  const tolanganSoni  = guruh.talabalar.filter((tg) => tg.talaba.tolovlar.reduce((s, t) => s + t.summa, 0) >= guruh.kurs.narxi).length;
  const qarzdorSoni   = guruh.talabalar.length - tolanganSoni;

  return (
    <div>
      <Topbar
        title={guruh.nom}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setBekorSana(new Date().toISOString().slice(0, 10)); setBekorSabab(""); setBekorNatija(null); setBekorModal(true); }}>
              ❌ Dars bekor
            </Button>
            <Button variant="ghost" onClick={() => router.back()}>← Orqaga</Button>
          </div>
        }
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
                        <Td className="text-muted-foreground text-xs font-mono">{String(i + 1).padStart(2, "0")}</Td>
                        <Td>
                          <div className="flex items-center gap-3">
                            <Avatar ism={tg.talaba.ism} familiya={tg.talaba.familiya} />
                            <span className="font-medium text-foreground">{tg.talaba.ism} {tg.talaba.familiya}</span>
                          </div>
                        </Td>
                        <Td><span className="font-mono text-xs bg-muted px-2 py-1 rounded-lg">{tg.talaba.telefon}</span></Td>
                        <Td className="font-medium text-foreground">
                          {summa > 0 ? formatSum(summa) : <span className="text-muted-foreground/50">—</span>}
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
                      <Td><span className="font-mono text-xs bg-muted px-2 py-1 rounded-lg">{formatSana(d.sana)}</span></Td>
                      <Td className="text-muted-foreground">{d.mavzu ?? <span className="text-muted-foreground/50">—</span>}</Td>
                      <Td><span className="text-emerald-600 font-semibold">{keldi}</span></Td>
                      <Td><span className="text-red-500 font-semibold">{kelmadi}</span></Td>
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${foiz}%` }} />
                          </div>
                          <span className="text-xs font-medium text-foreground">{foiz}%</span>
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

      {/* Dars bekor qilish modali */}
      <Modal open={bekorModal} onClose={() => setBekorModal(false)} title="Dars bekor qilish">
        <div className="space-y-4">
          {bekorNatija ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-3xl">✅</p>
              <p className="font-semibold text-gray-900">Xabarlar yuborildi</p>
              <p className="text-sm text-gray-500">
                {bekorNatija.yuborildi} ta ota-onaga Telegram xabari yuborildi
                {bekorNatija.jami - bekorNatija.yuborildi > 0 && (
                  <span className="text-amber-500">
                    {" "}({bekorNatija.jami - bekorNatija.yuborildi} ta telegram ulanmagan)
                  </span>
                )}
              </p>
              <Button variant="primary" onClick={() => setBekorModal(false)}>Yopish</Button>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200/60 rounded-2xl">
                <div className="p-2 bg-red-100 rounded-xl flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <p className="text-sm text-red-700">Barcha ota-onalarga Telegram orqali dars bekor qilinishi haqida xabar yuboriladi.</p>
              </div>
              <Input
                label="Dars sanasi *"
                type="date"
                value={bekorSana}
                onChange={(e) => setBekorSana(e.target.value)}
              />
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Sabab (ixtiyoriy)</label>
                <textarea
                  className="w-full px-4 py-3 text-sm border-2 border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary transition-colors"
                  rows={2}
                  placeholder="O'qituvchi kasalligi, bayram..."
                  value={bekorSabab}
                  onChange={(e) => setBekorSabab(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setBekorModal(false)}>Bekor</Button>
                <Button
                  variant="primary"
                  disabled={!bekorSana || bekorYuborilmoqda}
                  onClick={async () => {
                    setBekorYuborilmoqda(true);
                    const res = await fetch(`/api/guruhlar/${id}/dars-bekor`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ sana: bekorSana, sabab: bekorSabab }),
                    });
                    const data = await res.json();
                    setBekorNatija(data);
                    setBekorYuborilmoqda(false);
                  }}
                >
                  {bekorYuborilmoqda ? "Yuborilmoqda..." : "Xabar yuborish"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2 py-1">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-foreground text-right font-medium ${mono ? "font-mono text-xs bg-muted px-2 py-0.5 rounded-lg" : ""}`}>{value}</span>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
      <p className={`text-2xl font-bold ${color ?? "text-foreground"}`}>{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
