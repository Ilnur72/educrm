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
  const colors = ["bg-purple-100 text-purple-700","bg-teal-100 text-teal-700","bg-blue-100 text-blue-700","bg-amber-100 text-amber-700"];
  const color  = colors[(ism.charCodeAt(0) + familiya.charCodeAt(0)) % colors.length];
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

type TalabaSearch = { id: string; ism: string; familiya: string; telefon: string };

export default function GuruhDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const [guruh, setGuruh]           = useState<Guruh | null>(null);
  const [yuklanyapti, setYuklanyapti] = useState(true);

  // Talaba qo'shish modal
  const [qoshModal, setQoshModal]     = useState(false);
  const [qidiruv, setQidiruv]         = useState("");
  const [natijalar, setNatijalar]     = useState<TalabaSearch[]>([]);
  const [qoshilmoqda, setQoshilmoqda] = useState(false);

  // Talabani chiqarish
  const [chiqarModal, setChiqarModal]   = useState(false);
  const [chiqarTalaba, setChiqarTalaba] = useState<TalabaGuruh | null>(null);

  // Dars bekor qilish
  const [bekorModal, setBekorModal]   = useState(false);
  const [bekorSana, setBekorSana]     = useState(new Date().toISOString().slice(0, 10));
  const [bekorSabab, setBekorSabab]   = useState("");
  const [bekorYuborilmoqda, setBekorYuborilmoqda] = useState(false);
  const [bekorNatija, setBekorNatija] = useState<{ jami: number; yuborildi: number } | null>(null);

  const fetchGuruh = () => {
    fetch(`/api/guruhlar/${id}`)
      .then((r) => r.json())
      .then((d) => { setGuruh(d); setYuklanyapti(false); })
      .catch(() => setYuklanyapti(false));
  };

  useEffect(() => { fetchGuruh(); }, [id]);

  useEffect(() => {
    if (!qidiruv) { setNatijalar([]); return; }
    fetch(`/api/talabalar?search=${qidiruv}&faol=true`)
      .then((r) => r.json())
      .then(setNatijalar);
  }, [qidiruv]);

  const talabaQosh = async (talabaId: string) => {
    setQoshilmoqda(true);
    await fetch(`/api/guruhlar/${id}/talabalar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ talabaId }),
    });
    setQoshilmoqda(false);
    setQoshModal(false);
    setQidiruv("");
    fetchGuruh();
  };

  const talabaChiqar = async () => {
    if (!chiqarTalaba) return;
    await fetch(`/api/guruhlar/${id}/talabalar`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ talabaId: chiqarTalaba.talaba.id }),
    });
    setChiqarModal(false);
    setChiqarTalaba(null);
    fetchGuruh();
  };

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
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setBekorSana(new Date().toISOString().slice(0, 10)); setBekorSabab(""); setBekorNatija(null); setBekorModal(true); }}>
              ❌ Dars bekor
            </Button>
            <Button variant="primary" onClick={() => { setQoshModal(true); setQidiruv(""); }}>
              + Talaba qo'shish
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
                    <Th></Th>
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
                        <Td>
                          <button
                            onClick={(e) => { e.stopPropagation(); setChiqarTalaba(tg); setChiqarModal(true); }}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                          >
                            Chiqarish
                          </button>
                        </Td>
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

      {/* Talaba qo'shish modali */}
      <Modal open={qoshModal} onClose={() => { setQoshModal(false); setQidiruv(""); }} title="Talaba qo'shish">
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Ism yoki telefon bilan qidiring..."
            value={qidiruv}
            onChange={(e) => setQidiruv(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
            autoFocus
          />
          {natijalar.length > 0 && (
            <div className="border border-gray-100 rounded-lg divide-y max-h-60 overflow-y-auto">
              {natijalar.map((t) => {
                const allaqachon = guruh?.talabalar.some((tg) => tg.talaba.id === t.id);
                return (
                  <button
                    key={t.id}
                    disabled={allaqachon || qoshilmoqda}
                    onClick={() => talabaQosh(t.id)}
                    className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                      allaqachon ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-medium">{t.ism} {t.familiya}</span>
                    <span className="text-gray-400 ml-2 text-xs font-mono">{t.telefon}</span>
                    {allaqachon && <span className="text-xs text-gray-300 ml-2">— allaqachon guruhda</span>}
                  </button>
                );
              })}
            </div>
          )}
          {qidiruv && natijalar.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-3">Talaba topilmadi</p>
          )}
        </div>
      </Modal>

      {/* Talabani chiqarish modali */}
      <Modal open={chiqarModal} onClose={() => setChiqarModal(false)} title="Talabani chiqarish">
        {chiqarTalaba && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{chiqarTalaba.talaba.ism} {chiqarTalaba.talaba.familiya}</span>ni{" "}
              <span className="font-semibold">{guruh?.nom}</span> guruhidan chiqarasizmi?
            </p>
            <p className="text-xs text-gray-400">Davomat va to'lov tarixi saqlanib qoladi.</p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setChiqarModal(false)}>Bekor</Button>
              <Button variant="danger" onClick={talabaChiqar}>Ha, chiqarish</Button>
            </div>
          </div>
        )}
      </Modal>

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
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                Barcha ota-onalarga Telegram orqali dars bekor qilinishi haqida xabar yuboriladi.
              </div>
              <Input
                label="Dars sanasi *"
                type="date"
                value={bekorSana}
                onChange={(e) => setBekorSana(e.target.value)}
              />
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Sabab (ixtiyoriy)</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
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
