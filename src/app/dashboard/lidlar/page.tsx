"use client";
import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatSana } from "@/lib/utils";
import type { LidHolat, LidManba } from "@/types";

type GuruhOption = { id: string; nom: string; kurs: { nom: string } };

type TavsiyaGuruh = {
  id: string; nom: string; kursNom: string; narxi: number;
  vaqt: string; kunlar: string[]; xona: string | null;
  oqituvchi: string | null; talabalar: number; maxTalaba: number;
  boshJoy: number; ball: number; tolib: boolean;
};

type LidRow = {
  id: string; ism: string; telefon: string; kurs: string;
  manba: LidManba; holat: LidHolat; createdAt: string;
  sinovSanasi: string | null; sinovGuruhId: string | null;
  talaba: {
    id: string; ism: string; familiya: string;
    guruhlar: { guruh: { nom: string; kurs: { nom: string } } }[];
  } | null;
};

const HOLAT_CONFIG: Record<LidHolat, { label: string; variant: "blue"|"amber"|"purple"|"green"|"red" }> = {
  YANGI:            { label: "Yangi",          variant: "blue"   },
  QONGIROQ_QILINDI: { label: "Qo'ng'iroq",     variant: "amber"  },
  SINOV_DARSI:      { label: "Sinov darsi",     variant: "purple" },
  YOZILDI:          { label: "Yozildi",         variant: "green"  },
  RAD_ETDI:         { label: "Rad etdi",        variant: "red"    },
};

const MANBA_LABEL: Record<LidManba, string> = {
  INSTAGRAM:      "Instagram",
  TELEGRAM:       "Telegram",
  GOOGLE:         "Google",
  DOST_TAVSIYASI: "Do'st tavsiyasi",
  BOSHQA:         "Boshqa",
};

const FUNNEL: { holat: LidHolat; label: string; color: string }[] = [
  { holat: "YANGI",            label: "Yangi",       color: "bg-blue-100 text-blue-800" },
  { holat: "QONGIROQ_QILINDI", label: "Qo'ng'iroq",  color: "bg-amber-100 text-amber-800" },
  { holat: "SINOV_DARSI",      label: "Sinov darsi", color: "bg-purple-100 text-purple-800" },
  { holat: "YOZILDI",          label: "Yozildi",     color: "bg-green-100 text-green-800" },
  { holat: "RAD_ETDI",         label: "Rad etdi",    color: "bg-red-100 text-red-800" },
];

export default function LidlarPage() {
  const [lidlar, setLidlar]           = useState<LidRow[]>([]);
  const [filterHolat, setFilterHolat] = useState<string>("");
  const [search, setSearch]           = useState("");
  const [filterOy, setFilterOy]       = useState<string>(String(new Date().getMonth() + 1));
  const [filterYil, setFilterYil]     = useState<string>(String(new Date().getFullYear()));
  const [guruhlar, setGuruhlar]       = useState<GuruhOption[]>([]);

  // Yangi lid modal
  const [modal, setModal]             = useState(false);
  const [form, setForm]               = useState({ ism: "", telefon: "", kurs: "", manba: "INSTAGRAM", izoh: "" });
  const [saqlanyapti, setSaqlanyapti] = useState(false);

  // Sinov darsi modal
  const [sinovModal, setSinovModal]           = useState(false);
  const [sinovLid, setSinovLid]               = useState<LidRow | null>(null);
  const [sinovSana, setSinovSana]             = useState("");
  const [sinovGuruhId, setSinovGuruhId]       = useState("");
  const [sinovSaqlanmoqda, setSinovSaqlanmoqda] = useState(false);

  // Talabaga yozish modal
  const [yozishModal, setYozishModal]         = useState(false);
  const [yozishLid, setYozishLid]             = useState<LidRow | null>(null);
  const [yozishGuruhId, setYozishGuruhId]     = useState("");
  const [yozishTelefon, setYozishTelefon]     = useState("");
  const [yozishSaqlanmoqda, setYozishSaqlanmoqda] = useState(false);
  const [tavsiyalar, setTavsiyalar]           = useState<TavsiyaGuruh[]>([]);

  const fetchLidlar = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterHolat) params.set("holat", filterHolat);
    if (search)      params.set("search", search);
    if (filterOy)    params.set("oy", filterOy);
    if (filterYil)   params.set("yil", filterYil);
    const res = await fetch(`/api/lidlar?${params}`);
    setLidlar(await res.json());
  }, [filterHolat, search, filterOy, filterYil]);

  useEffect(() => { fetchLidlar(); }, [fetchLidlar]);

  useEffect(() => {
    fetch("/api/guruhlar?faol=true")
      .then((r) => r.json())
      .then(setGuruhlar)
      .catch(() => {});
  }, []);

  const holatCounts = FUNNEL.reduce((acc, f) => {
    acc[f.holat] = lidlar.filter((l) => l.holat === f.holat).length;
    return acc;
  }, {} as Record<string, number>);

  const yangilash = async (id: string, holat: LidHolat) => {
    if (holat === "SINOV_DARSI") {
      const lid = lidlar.find(l => l.id === id);
      if (lid) {
        setSinovLid(lid);
        setSinovSana(lid.sinovSanasi?.slice(0, 10) ?? "");
        setSinovGuruhId(lid.sinovGuruhId ?? "");
        setSinovModal(true);
        // Holatni avval SINOV_DARSI ga o'tkazamiz
        await fetch(`/api/lidlar/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ holat }),
        });
        fetchLidlar();
        return;
      }
    }
    await fetch(`/api/lidlar/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ holat }),
    });
    fetchLidlar();
  };

  const sinovSaqlash = async () => {
    if (!sinovLid) return;
    setSinovSaqlanmoqda(true);
    await fetch(`/api/lidlar/${sinovLid.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sinovSanasi: sinovSana ? new Date(sinovSana).toISOString() : null,
        sinovGuruhId: sinovGuruhId || null,
      }),
    });
    setSinovSaqlanmoqda(false);
    setSinovModal(false);
    fetchLidlar();
  };

  const saqlash = async () => {
    setSaqlanyapti(true);
    await fetch("/api/lidlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaqlanyapti(false);
    setModal(false);
    setForm({ ism: "", telefon: "", kurs: "", manba: "INSTAGRAM", izoh: "" });
    fetchLidlar();
  };

  const ochirish = async (id: string) => {
    if (!confirm("Lidni o'chirish?")) return;
    await fetch(`/api/lidlar/${id}`, { method: "DELETE" });
    fetchLidlar();
  };

  const yozishOch = (lid: LidRow) => {
    setYozishLid(lid);
    setYozishTelefon(lid.telefon);
    setYozishGuruhId("");
    setTavsiyalar([]);
    setYozishModal(true);
    fetch(`/api/lidlar/${lid.id}/guruh-tavsiya`)
      .then((r) => r.json())
      .then(setTavsiyalar)
      .catch(() => {});
  };

  const yozishSaqlash = async () => {
    if (!yozishLid) return;
    setYozishSaqlanmoqda(true);
    await fetch(`/api/lidlar/${yozishLid.id}/yozish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guruhId: yozishGuruhId || null, telefon: yozishTelefon }),
    });
    setYozishSaqlanmoqda(false);
    setYozishModal(false);
    fetchLidlar();
  };

  return (
    <div>
      <Topbar
        title="Lidlar — Sotish funeli"
        actions={
          <Button variant="primary" onClick={() => setModal(true)}>+ Yangi lid</Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Funnel */}
        <div className="grid grid-cols-5 gap-3">
          {FUNNEL.map((f) => (
            <button
              key={f.holat}
              onClick={() => setFilterHolat(filterHolat === f.holat ? "" : f.holat)}
              className={`rounded-xl p-4 text-left border-2 transition-all ${
                filterHolat === f.holat
                  ? "border-brand-600 bg-brand-50"
                  : "border-transparent bg-white hover:border-gray-200"
              }`}
            >
              <p className="text-2xl font-semibold text-gray-900">{holatCounts[f.holat] ?? 0}</p>
              <p className="text-xs text-gray-500 mt-1">{f.label}</p>
              <div className={`h-1 rounded-full mt-3 ${f.color.split(" ")[0]}`} />
            </button>
          ))}
        </div>

        {/* Jadval */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filterHolat ? `${HOLAT_CONFIG[filterHolat as LidHolat].label} lidlar` : "Barcha lidlar"}
              <span className="ml-2 text-gray-400 font-normal">({lidlar.length})</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={filterOy}
                onChange={(e) => setFilterOy(e.target.value)}
                className="text-xs py-1 px-2 w-32"
              >
                <option value="">Barcha oylar</option>
                {["Yanvar","Fevral","Mart","Aprel","May","Iyun",
                  "Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"
                ].map((m, i) => (
                  <option key={i + 1} value={String(i + 1)}>{m}</option>
                ))}
              </Select>
              <Select
                value={filterYil}
                onChange={(e) => setFilterYil(e.target.value)}
                className="text-xs py-1 px-2 w-24"
              >
                <option value="">Barcha yillar</option>
                {[2023, 2024, 2025, 2026].map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </Select>
              <Input
                placeholder="Qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-40"
              />
            </div>
          </CardHeader>
          <Table>
            <Thead>
              <tr>
                <Th>Ism</Th>
                <Th>Telefon</Th>
                <Th>Kurs</Th>
                <Th>Manba</Th>
                <Th>Sana</Th>
                <Th>Holat</Th>
                <Th>Talaba / Guruh</Th>
                <Th></Th>
              </tr>
            </Thead>
            <Tbody>
              {lidlar.map((lid) => {
                const h = HOLAT_CONFIG[lid.holat as LidHolat];
                const yozishMumkin = !lid.talaba && lid.holat !== "RAD_ETDI";
                const talaba = lid.talaba;
                const guruhNom = talaba?.guruhlar?.[0]?.guruh?.nom;
                return (
                  <Tr key={lid.id}>
                    <Td className="font-medium">{lid.ism}</Td>
                    <Td className="font-mono text-xs">{lid.telefon}</Td>
                    <Td>{lid.kurs}</Td>
                    <Td className="text-gray-500">{MANBA_LABEL[lid.manba as LidManba]}</Td>
                    <Td className="text-xs text-gray-400">
                      {lid.holat === "SINOV_DARSI" ? (
                        <button
                          onClick={() => {
                            setSinovLid(lid);
                            setSinovSana(lid.sinovSanasi?.slice(0, 10) ?? "");
                            setSinovGuruhId(lid.sinovGuruhId ?? "");
                            setSinovModal(true);
                          }}
                          className="text-left space-y-1"
                        >
                          {lid.sinovSanasi ? (
                            <span className="block text-purple-700 bg-purple-50 border border-purple-200 rounded-lg px-2 py-1 font-medium">
                              {new Date(lid.sinovSanasi).toLocaleDateString("uz-UZ")}
                            </span>
                          ) : (
                            <span className="block text-purple-400 border border-dashed border-purple-300 rounded-lg px-2 py-1">
                              + Sana tanlang
                            </span>
                          )}
                          {lid.sinovGuruhId && (() => {
                            const g = guruhlar.find(g => g.id === lid.sinovGuruhId);
                            return g ? (
                              <span className="block text-gray-400 text-xs">{g.nom}</span>
                            ) : null;
                          })()}
                        </button>
                      ) : (
                        formatSana(lid.createdAt)
                      )}
                    </Td>
                    <Td><Badge variant={h.variant}>{h.label}</Badge></Td>
                    <Td>
                      {talaba ? (
                        <div className="text-xs">
                          <p className="font-medium text-gray-800">{talaba.ism} {talaba.familiya}</p>
                          {guruhNom && <p className="text-gray-400">{guruhNom}</p>}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        {yozishMumkin && (
                          <Button variant="secondary" size="sm" onClick={() => yozishOch(lid)}>
                            Talabaga yozish
                          </Button>
                        )}
                        <Select
                          value={lid.holat}
                          onChange={(e) => yangilash(lid.id, e.target.value as LidHolat)}
                          className="text-xs py-1 px-2 w-36"
                          disabled={lid.holat === "YOZILDI"}
                        >
                          {Object.entries(HOLAT_CONFIG)
                            .filter(([k]) => k !== "YOZILDI")
                            .map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          {lid.holat === "YOZILDI" && (
                            <option value="YOZILDI">Yozildi</option>
                          )}
                        </Select>
                        <button
                          onClick={() => ochirish(lid.id)}
                          className="text-gray-300 hover:text-red-400 text-lg leading-none transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
              {lidlar.length === 0 && (
                <Tr>
                  <Td colSpan={8} className="text-center text-gray-400 py-8">Lid topilmadi</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Card>
      </div>

      {/* Talabaga yozish modali */}
      <Modal open={yozishModal} onClose={() => setYozishModal(false)} title="Talabaga yozish">
        {yozishLid && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-xl text-sm space-y-1">
              <p className="font-medium text-gray-900">{yozishLid.ism}</p>
              <p className="text-xs text-gray-500">Qiziqgan kurs: {yozishLid.kurs}</p>
            </div>
            <Input
              label="Telefon *"
              value={yozishTelefon}
              onChange={(e) => setYozishTelefon(e.target.value)}
              placeholder="+998 90 123 45 67"
            />

            {/* Tavsiya etilgan guruhlar */}
            {tavsiyalar.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Tavsiya etilgan guruhlar</p>
                <div className="grid grid-cols-2 gap-2">
                  {tavsiyalar.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setYozishGuruhId(g.id)}
                      className={`text-left p-3 rounded-xl border-2 transition-all text-xs ${
                        yozishGuruhId === g.id
                          ? "border-brand-500 bg-brand-50"
                          : g.tolib
                          ? "border-red-100 bg-red-50 opacity-60"
                          : "border-gray-200 bg-white hover:border-brand-300"
                      }`}
                    >
                      <p className="font-semibold text-gray-900 truncate">{g.kursNom}</p>
                      <p className="text-gray-500 truncate">{g.nom}</p>
                      <div className="flex items-center justify-between mt-1.5 gap-1">
                        <span className="text-gray-400">{g.vaqt}</span>
                        <span className={`px-1.5 py-0.5 rounded-full font-medium ${
                          g.tolib
                            ? "bg-red-100 text-red-600"
                            : g.boshJoy <= 2
                            ? "bg-amber-100 text-amber-600"
                            : "bg-green-100 text-green-600"
                        }`}>
                          {g.tolib ? "To'lgan" : `${g.boshJoy} joy`}
                        </span>
                      </div>
                      {g.oqituvchi && (
                        <p className="text-gray-400 mt-1 truncate">{g.oqituvchi}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Select
              label="Yoki guruh tanlang (ixtiyoriy)"
              value={yozishGuruhId}
              onChange={(e) => setYozishGuruhId(e.target.value)}
            >
              <option value="">— Guruhsiz qo'shish —</option>
              {guruhlar.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.kurs.nom} — {g.nom}
                </option>
              ))}
            </Select>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setYozishModal(false)}>Bekor</Button>
              <Button
                variant="primary"
                onClick={yozishSaqlash}
                disabled={!yozishTelefon || yozishSaqlanmoqda}
              >
                {yozishSaqlanmoqda ? "Saqlanmoqda..." : "Talaba sifatida yozish"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Sinov darsi bron modal */}
      <Modal open={sinovModal} onClose={() => setSinovModal(false)}
        title={`Sinov darsi — ${sinovLid?.ism}`}>
        <div className="space-y-4">
          <div className="p-3 bg-purple-50 rounded-xl text-sm text-purple-700">
            Sinov darsi sanasi va guruhini belgilang
          </div>
          <Input
            label="Sinov darsi sanasi *"
            type="date"
            value={sinovSana}
            onChange={e => setSinovSana(e.target.value)}
          />
          <Select
            label="Guruh (ixtiyoriy)"
            value={sinovGuruhId}
            onChange={e => setSinovGuruhId(e.target.value)}
          >
            <option value="">— Guruh tanlang —</option>
            {guruhlar.map(g => (
              <option key={g.id} value={g.id}>{g.kurs.nom} — {g.nom}</option>
            ))}
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setSinovModal(false)}>Bekor</Button>
            <Button variant="primary" onClick={sinovSaqlash}
              disabled={!sinovSana || sinovSaqlanmoqda}>
              {sinovSaqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Yangi lid modali */}
      <Modal open={modal} onClose={() => setModal(false)} title="Yangi lid qo'shish">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ism Familiya *" placeholder="Aziza Rahimova" value={form.ism}
              onChange={(e) => setForm({ ...form, ism: e.target.value })} />
            <Input label="Telefon *" placeholder="+998 90 123 45 67" value={form.telefon}
              onChange={(e) => setForm({ ...form, telefon: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Qiziqgan kurs *" placeholder="IELTS, Python..." value={form.kurs}
              onChange={(e) => setForm({ ...form, kurs: e.target.value })} />
            <Select label="Manba" value={form.manba}
              onChange={(e) => setForm({ ...form, manba: e.target.value })}>
              {Object.entries(MANBA_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Izoh</label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
              rows={3}
              placeholder="Qo'shimcha ma'lumot..."
              value={form.izoh}
              onChange={(e) => setForm({ ...form, izoh: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModal(false)}>Bekor</Button>
            <Button variant="primary" onClick={saqlash}
              disabled={!form.ism || !form.telefon || !form.kurs || saqlanyapti}>
              {saqlanyapti ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
