"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { formatSum, formatSana, oyNomi } from "@/lib/utils";
import { DavomatGrafik } from "@/components/ui/DavomatGrafik";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { IconButton, PencilIcon } from "@/components/ui/IconButton";
import type { DavomatHolat, TolovTur } from "@/types";

type Guruh = {
  id: string;
  guruh: {
    id: string;
    nom: string;
    vaqt: string;
    xona: string | null;
    kurs: { nom: string; narxi: number };
    oqituvchi: { user: { name: string } } | null;
  };
  faol: boolean;
  kirishSana: string;
};

type Tolov = {
  id: string;
  summa: number;
  tur: TolovTur;
  oy: number;
  yil: number;
  izoh: string | null;
  createdAt: string;
};

type Davomat = {
  id: string;
  holat: DavomatHolat;
  dars: { sana: string; mavzu: string | null };
  createdAt: string;
};

type Talaba = {
  id: string;
  ism: string;
  familiya: string;
  telefon: string;
  otaTelefon: string | null;
  otaTelegramId: string | null;
  email: string | null;
  tugilganKun: string | null;
  manzil: string | null;
  izoh: string | null;
  faol: boolean;
  createdAt: string;
  guruhlar: Guruh[];
  tolovlar: Tolov[];
  davomatlar: Davomat[];
};

const DAVOMAT_CONFIG: Record<DavomatHolat, { label: string; variant: "green" | "red" | "amber" | "blue"; short: string }> = {
  KELDI:      { label: "Keldi",       variant: "green", short: "K"  },
  KELMADI:    { label: "Kelmadi",     variant: "red",   short: "X"  },
  KECH_KELDI: { label: "Kech keldi",  variant: "amber", short: "KK" },
  SABABLI:    { label: "Sababli",     variant: "blue",  short: "S"  },
};

const TUR_LABEL: Record<TolovTur, string> = {
  NAQD: "Naqd", KARTA: "Karta", CLICK: "Click", PAYME: "Payme",
};

function Avatar({ ism, familiya, size = "md" }: { ism: string; familiya: string; size?: "md" | "lg" }) {
  const initials = `${ism[0]}${familiya[0]}`.toUpperCase();
  const colors = ["bg-purple-100 text-purple-700", "bg-teal-100 text-teal-700",
                  "bg-blue-100 text-blue-700", "bg-amber-100 text-amber-700"];
  const color = colors[(ism.charCodeAt(0) + familiya.charCodeAt(0)) % colors.length];
  const sz = size === "lg" ? "w-16 h-16 text-xl" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

export default function TalabaProfilPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const [talaba, setTalaba]         = useState<Talaba | null>(null);
  const [yuklanyapti, setYuklanyapti] = useState(true);
  const [topTab, setTopTab]         = useState<"tolovlar" | "davomat">("tolovlar");

  // Edit modal
  const [editModal, setEditModal]       = useState(false);
  const [editForm, setEditForm]         = useState({
    ism: "", familiya: "", telefon: "", otaTelefon: "",
    email: "", manzil: "", tugilganKun: "", izoh: "",
  });
  const [editSaqlanmoqda, setEditSaqlanmoqda] = useState(false);

  const fetchTalaba = () =>
    fetch(`/api/talabalar/${id}`)
      .then((r) => r.json())
      .then((d) => { setTalaba(d); setYuklanyapti(false); })
      .catch(() => setYuklanyapti(false));

  useEffect(() => { fetchTalaba(); }, [id]);

  const editOch = () => {
    if (!talaba) return;
    setEditForm({
      ism:         talaba.ism,
      familiya:    talaba.familiya,
      telefon:     talaba.telefon,
      otaTelefon:  talaba.otaTelefon  ?? "",
      email:       talaba.email       ?? "",
      manzil:      talaba.manzil      ?? "",
      tugilganKun: talaba.tugilganKun ? talaba.tugilganKun.slice(0, 10) : "",
      izoh:        talaba.izoh        ?? "",
    });
    setEditModal(true);
  };

  const editSaqlash = async () => {
    if (!talaba) return;
    setEditSaqlanmoqda(true);
    await fetch(`/api/talabalar/${talaba.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ism:         editForm.ism,
        familiya:    editForm.familiya,
        telefon:     editForm.telefon,
        otaTelefon:  editForm.otaTelefon  || null,
        email:       editForm.email       || null,
        manzil:      editForm.manzil      || null,
        tugilganKun: editForm.tugilganKun ? new Date(editForm.tugilganKun).toISOString() : null,
        izoh:        editForm.izoh        || null,
      }),
    });
    setEditSaqlanmoqda(false);
    setEditModal(false);
    fetchTalaba();
  };

  if (yuklanyapti) {
    return (
      <div>
        <Topbar title="Yuklanmoqda..." />
        <div className="p-6 text-center text-gray-400 py-20">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!talaba) {
    return (
      <div>
        <Topbar title="Topilmadi" />
        <div className="p-6 text-center text-gray-400 py-20">Talaba topilmadi</div>
      </div>
    );
  }

  // Davomat statistikasi
  const davomatStat = talaba.davomatlar.reduce(
    (acc, d) => { acc[d.holat] = (acc[d.holat] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );
  const jamiDars    = talaba.davomatlar.length;
  const keldiSoni   = davomatStat["KELDI"] ?? 0;
  const davomiylik  = jamiDars > 0 ? Math.round((keldiSoni / jamiDars) * 100) : 0;

  // To'lov statistikasi
  const hozir       = new Date();
  const oyTolov     = talaba.tolovlar.find(
    (t) => t.oy === hozir.getMonth() + 1 && t.yil === hozir.getFullYear()
  );
  const faolGuruh   = talaba.guruhlar.find((g) => g.faol);
  const kursNarxi   = faolGuruh?.guruh.kurs.narxi ?? 0;
  const tolovHolat  = !oyTolov
    ? { label: "Qarzdor", variant: "red" as const }
    : oyTolov.summa >= kursNarxi
    ? { label: "To'langan", variant: "green" as const }
    : { label: "Qisman", variant: "amber" as const };

  return (
    <div>
      <Topbar
        title={`${talaba.ism} ${talaba.familiya}`}
        actions={
          <Button variant="ghost" onClick={() => router.back()}>← Orqaga</Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Yuqori qism: profil + guruhlar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Shaxsiy ma'lumot */}
          <Card className="lg:col-span-1">
            <CardBody>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <Avatar ism={talaba.ism} familiya={talaba.familiya} size="lg" />
                  <div>
                    <h2 className="font-semibold text-gray-900 text-lg">
                      {talaba.ism} {talaba.familiya}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={talaba.faol ? "green" : "red"}>
                        {talaba.faol ? "Faol" : "Arxiv"}
                      </Badge>
                      <Badge variant={tolovHolat.variant}>{tolovHolat.label}</Badge>
                    </div>
                  </div>
                </div>
                <IconButton title="Tahrirlash" onClick={editOch}>
                  <PencilIcon />
                </IconButton>
              </div>

              <div className="space-y-3 text-sm">
                <InfoRow label="Telefon"     value={talaba.telefon} mono />
                <InfoRow label="Ota-ona tel" value={talaba.otaTelefon} mono />
                <InfoRow label="Email"       value={talaba.email} />
                <InfoRow label="Manzil"      value={talaba.manzil} />
                <InfoRow
                  label="Tug'ilgan kun"
                  value={talaba.tugilganKun ? formatSana(talaba.tugilganKun) : null}
                />
                <InfoRow label="Ro'yxatga olingan" value={formatSana(talaba.createdAt)} />

                {/* Telegram ulash */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">Telegram bot</p>
                  {talaba.otaTelegramId ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 text-xs font-medium">✅ Ulangan</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">Ota-ona havolani bosib botni aktivlashtiradi</p>
                      <a
                        href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?start=${talaba.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.447l-2.95-.924c-.64-.203-.654-.64.136-.954l11.57-4.461c.537-.194 1.006.131.968.113z"/>
                        </svg>
                        Telegram havolasi
                      </a>
                    </div>
                  )}
                </div>

                {talaba.izoh && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">Izoh</p>
                    <p className="text-gray-600">{talaba.izoh}</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Guruhlar + Davomat statistikasi */}
          <div className="lg:col-span-2 space-y-5">
            {/* Guruhlar */}
            <Card>
              <CardHeader>
                <CardTitle>Guruhlar</CardTitle>
              </CardHeader>
              {talaba.guruhlar.length === 0 ? (
                <CardBody>
                  <p className="text-sm text-gray-400">Hech qanday guruhga biriktirilmagan</p>
                </CardBody>
              ) : (
                <Table>
                  <Thead>
                    <tr>
                      <Th>Kurs / Guruh</Th>
                      <Th>O'qituvchi</Th>
                      <Th>Vaqt</Th>
                      <Th>Narxi</Th>
                      <Th>Holat</Th>
                    </tr>
                  </Thead>
                  <Tbody>
                    {talaba.guruhlar.map((g) => (
                      <Tr key={g.id}>
                        <Td>
                          <p className="font-medium">{g.guruh.kurs.nom}</p>
                          <p className="text-xs text-gray-400">{g.guruh.nom}</p>
                        </Td>
                        <Td>{g.guruh.oqituvchi?.user.name ?? "—"}</Td>
                        <Td className="text-xs font-mono">{g.guruh.vaqt}</Td>
                        <Td>{formatSum(g.guruh.kurs.narxi)}</Td>
                        <Td>
                          <Badge variant={g.faol ? "green" : "red"}>
                            {g.faol ? "Faol" : "Tugatgan"}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Card>

            {/* Davomat statistika kartalar */}
            <div className="grid grid-cols-4 gap-3">
              <MiniStat label="Jami dars"    value={jamiDars} />
              <MiniStat label="Keldi"        value={davomatStat["KELDI"] ?? 0}      color="text-green-600" />
              <MiniStat label="Kelmadi"      value={davomatStat["KELMADI"] ?? 0}    color="text-red-500"   />
              <MiniStat label="Davomiylik"   value={`${davomiylik}%`}               color={davomiylik >= 80 ? "text-green-600" : "text-amber-500"} />
            </div>

            {/* Davomat trend grafigi */}
            <Card>
              <CardBody>
                <p className="text-sm font-medium text-gray-700 mb-3">Davomat trendi</p>
                <DavomatGrafik talabaId={talaba.id} />
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Quyi qism: To'lovlar / Davomat tabs */}
        <Card>
          <div className="border-b border-gray-100 px-4">
            <div className="flex gap-1">
              {(["tolovlar", "davomat"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTopTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    topTab === tab
                      ? "border-brand-600 text-brand-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "tolovlar" ? `To'lovlar (${talaba.tolovlar.length})` : `Davomat (${jamiDars})`}
                </button>
              ))}
            </div>
          </div>

          {topTab === "tolovlar" ? (
            <Table>
              <Thead>
                <tr>
                  <Th>Oy</Th>
                  <Th>Summa</Th>
                  <Th>Tur</Th>
                  <Th>Izoh</Th>
                  <Th>Sana</Th>
                </tr>
              </Thead>
              <Tbody>
                {talaba.tolovlar.map((t) => (
                  <Tr key={t.id}>
                    <Td className="font-medium">{oyNomi(t.oy)} {t.yil}</Td>
                    <Td className="font-semibold text-gray-900">{formatSum(t.summa)}</Td>
                    <Td><Badge variant="green">{TUR_LABEL[t.tur]}</Badge></Td>
                    <Td className="text-gray-400">{t.izoh ?? "—"}</Td>
                    <Td className="text-xs text-gray-400">{formatSana(t.createdAt)}</Td>
                  </Tr>
                ))}
                {talaba.tolovlar.length === 0 && (
                  <Tr>
                    <Td colSpan={5} className="text-center text-gray-400 py-8">
                      To'lovlar mavjud emas
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Sana</Th>
                  <Th>Mavzu</Th>
                  <Th>Holat</Th>
                </tr>
              </Thead>
              <Tbody>
                {talaba.davomatlar.map((d) => {
                  const cfg = DAVOMAT_CONFIG[d.holat];
                  return (
                    <Tr key={d.id}>
                      <Td className="text-xs font-mono">{formatSana(d.dars.sana)}</Td>
                      <Td className="text-gray-500">{d.dars.mavzu ?? "—"}</Td>
                      <Td><Badge variant={cfg.variant}>{cfg.label}</Badge></Td>
                    </Tr>
                  );
                })}
                {talaba.davomatlar.length === 0 && (
                  <Tr>
                    <Td colSpan={3} className="text-center text-gray-400 py-8">
                      Davomat ma'lumotlari yo'q
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          )}
        </Card>
      </div>

      {/* Edit modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Talaba ma'lumotlarini tahrirlash">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ism *" value={editForm.ism}
              onChange={(e) => setEditForm({ ...editForm, ism: e.target.value })} />
            <Input label="Familiya *" value={editForm.familiya}
              onChange={(e) => setEditForm({ ...editForm, familiya: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Telefon *" value={editForm.telefon} placeholder="+998901234567"
              onChange={(e) => setEditForm({ ...editForm, telefon: e.target.value })} />
            <Input label="Ota-ona telefon" value={editForm.otaTelefon} placeholder="+998901234567"
              onChange={(e) => setEditForm({ ...editForm, otaTelefon: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" value={editForm.email} placeholder="email@example.com"
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <Input label="Tug'ilgan kun" type="date" value={editForm.tugilganKun}
              onChange={(e) => setEditForm({ ...editForm, tugilganKun: e.target.value })} />
          </div>
          <Input label="Manzil" value={editForm.manzil} placeholder="Shahar, ko'cha..."
            onChange={(e) => setEditForm({ ...editForm, manzil: e.target.value })} />
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Izoh</label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
              rows={3}
              value={editForm.izoh}
              onChange={(e) => setEditForm({ ...editForm, izoh: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditModal(false)}>Bekor</Button>
            <Button
              variant="primary"
              onClick={editSaqlash}
              disabled={!editForm.ism || !editForm.familiya || !editForm.telefon || editSaqlanmoqda}
            >
              {editSaqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className={`text-gray-700 text-right ${mono ? "font-mono text-xs" : ""}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className={`text-xl font-bold ${color ?? "text-gray-900"}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
