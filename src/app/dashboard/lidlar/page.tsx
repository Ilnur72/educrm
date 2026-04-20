"use client";
import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td, TableEmpty } from "@/components/ui/Table";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatSana } from "@/lib/utils";
import type { LidHolat, LidManba } from "@/types";

type GuruhOption = { id: string; nom: string; kurs: { nom: string } };

type TavsiyaGuruh = {
  id: string;
  nom: string;
  kursNom: string;
  narxi: number;
  vaqt: string;
  kunlar: string[];
  xona: string | null;
  oqituvchi: string | null;
  talabalar: number;
  maxTalaba: number;
  boshJoy: number;
  ball: number;
  tolib: boolean;
};

type LidRow = {
  id: string;
  ism: string;
  telefon: string;
  kurs: string;
  manba: LidManba;
  holat: LidHolat;
  createdAt: string;
  sinovSanasi: string | null;
  talaba: {
    id: string;
    ism: string;
    familiya: string;
    guruhlar: { guruh: { nom: string; kurs: { nom: string } } }[];
  } | null;
};

const HOLAT_CONFIG: Record<
  LidHolat,
  { label: string; variant: "info" | "warning" | "purple" | "success" | "danger" }
> = {
  YANGI: { label: "Yangi", variant: "info" },
  QONGIROQ_QILINDI: { label: "Qo'ng'iroq", variant: "warning" },
  SINOV_DARSI: { label: "Sinov darsi", variant: "purple" },
  YOZILDI: { label: "Yozildi", variant: "success" },
  RAD_ETDI: { label: "Rad etdi", variant: "danger" },
};

const MANBA_LABEL: Record<LidManba, string> = {
  INSTAGRAM: "Instagram",
  TELEGRAM: "Telegram",
  GOOGLE: "Google",
  DOST_TAVSIYASI: "Do'st tavsiyasi",
  BOSHQA: "Boshqa",
};

const FUNNEL: {
  holat: LidHolat;
  label: string;
  color: string;
  bgColor: string;
}[] = [
  { holat: "YANGI", label: "Yangi", color: "bg-blue-500", bgColor: "bg-blue-500/10" },
  { holat: "QONGIROQ_QILINDI", label: "Qo'ng'iroq", color: "bg-warning", bgColor: "bg-warning/10" },
  { holat: "SINOV_DARSI", label: "Sinov darsi", color: "bg-primary", bgColor: "bg-primary/10" },
  { holat: "YOZILDI", label: "Yozildi", color: "bg-success", bgColor: "bg-success/10" },
  { holat: "RAD_ETDI", label: "Rad etdi", color: "bg-destructive", bgColor: "bg-destructive/10" },
];

export default function LidlarPage() {
  const [lidlar, setLidlar] = useState<LidRow[]>([]);
  const [filterHolat, setFilterHolat] = useState<string>("");
  const [search, setSearch] = useState("");
  const [filterOy, setFilterOy] = useState<string>(
    String(new Date().getMonth() + 1)
  );
  const [filterYil, setFilterYil] = useState<string>(
    String(new Date().getFullYear())
  );
  const [guruhlar, setGuruhlar] = useState<GuruhOption[]>([]);

  // Yangi lid modal
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    ism: "",
    telefon: "",
    kurs: "",
    manba: "INSTAGRAM",
    izoh: "",
  });
  const [saqlanyapti, setSaqlanyapti] = useState(false);

  // Talabaga yozish modal
  const [yozishModal, setYozishModal] = useState(false);
  const [yozishLid, setYozishLid] = useState<LidRow | null>(null);
  const [yozishGuruhId, setYozishGuruhId] = useState("");
  const [yozishTelefon, setYozishTelefon] = useState("");
  const [yozishSaqlanmoqda, setYozishSaqlanmoqda] = useState(false);
  const [tavsiyalar, setTavsiyalar] = useState<TavsiyaGuruh[]>([]);

  const fetchLidlar = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterHolat) params.set("holat", filterHolat);
    if (search) params.set("search", search);
    if (filterOy) params.set("oy", filterOy);
    if (filterYil) params.set("yil", filterYil);
    const res = await fetch(`/api/lidlar?${params}`);
    setLidlar(await res.json());
  }, [filterHolat, search, filterOy, filterYil]);

  useEffect(() => {
    fetchLidlar();
  }, [fetchLidlar]);

  useEffect(() => {
    fetch("/api/guruhlar?faol=true")
      .then((r) => r.json())
      .then(setGuruhlar)
      .catch(() => {});
  }, []);

  const holatCounts = FUNNEL.reduce(
    (acc, f) => {
      acc[f.holat] = lidlar.filter((l) => l.holat === f.holat).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const yangilash = async (id: string, holat: LidHolat) => {
    await fetch(`/api/lidlar/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ holat }),
    });
    fetchLidlar();
  };

  const sinovSanasiniYangilash = async (id: string, sana: string) => {
    await fetch(`/api/lidlar/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sinovSanasi: sana ? new Date(sana).toISOString() : null,
      }),
    });
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
      body: JSON.stringify({
        guruhId: yozishGuruhId || null,
        telefon: yozishTelefon,
      }),
    });
    setYozishSaqlanmoqda(false);
    setYozishModal(false);
    fetchLidlar();
  };

  return (
    <div className="min-h-screen">
      <Topbar
        title="Lidlar"
        description="Sotish funeli va potensial mijozlar"
        actions={
          <Button variant="primary" onClick={() => setModal(true)}>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Yangi lid
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Funnel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {FUNNEL.map((f) => (
            <button
              key={f.holat}
              onClick={() =>
                setFilterHolat(filterHolat === f.holat ? "" : f.holat)
              }
              className={`rounded-xl p-4 text-left border-2 transition-all duration-200 ${
                filterHolat === f.holat
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-card hover:border-border"
              }`}
            >
              <p className="text-2xl font-bold text-foreground">
                {holatCounts[f.holat] ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{f.label}</p>
              <div className={`h-1 rounded-full mt-3 ${f.color}`} />
            </button>
          ))}
        </div>

        {/* Jadval */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>
                {filterHolat
                  ? `${HOLAT_CONFIG[filterHolat as LidHolat].label} lidlar`
                  : "Barcha lidlar"}
              </CardTitle>
              <Badge variant="outline">{lidlar.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={filterOy}
                onChange={(e) => setFilterOy(e.target.value)}
                className="text-xs py-1.5 px-3 w-32"
              >
                <option value="">Barcha oylar</option>
                {[
                  "Yanvar",
                  "Fevral",
                  "Mart",
                  "Aprel",
                  "May",
                  "Iyun",
                  "Iyul",
                  "Avgust",
                  "Sentabr",
                  "Oktabr",
                  "Noyabr",
                  "Dekabr",
                ].map((m, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {m}
                  </option>
                ))}
              </Select>
              <Select
                value={filterYil}
                onChange={(e) => setFilterYil(e.target.value)}
                className="text-xs py-1.5 px-3 w-24"
              >
                <option value="">Barcha</option>
                {[2023, 2024, 2025, 2026].map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </Select>
              <Input
                placeholder="Qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-44"
                leftIcon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                }
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
              {lidlar.length === 0 ? (
                <TableEmpty message="Lid topilmadi" colSpan={8} />
              ) : (
                lidlar.map((lid) => {
                  const h = HOLAT_CONFIG[lid.holat as LidHolat];
                  const yozishMumkin = !lid.talaba && lid.holat !== "RAD_ETDI";
                  const talaba = lid.talaba;
                  const guruhNom = talaba?.guruhlar?.[0]?.guruh?.nom;
                  return (
                    <Tr key={lid.id}>
                      <Td className="font-medium">{lid.ism}</Td>
                      <Td>
                        <span className="font-mono text-xs">{lid.telefon}</span>
                      </Td>
                      <Td>{lid.kurs}</Td>
                      <Td className="text-muted-foreground">
                        {MANBA_LABEL[lid.manba as LidManba]}
                      </Td>
                      <Td className="text-xs text-muted-foreground">
                        {lid.holat === "SINOV_DARSI" ? (
                          <input
                            type="date"
                            value={
                              lid.sinovSanasi ? lid.sinovSanasi.slice(0, 10) : ""
                            }
                            onChange={(e) =>
                              sinovSanasiniYangilash(lid.id, e.target.value)
                            }
                            className="text-xs border border-primary/30 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring bg-primary/5 text-foreground"
                          />
                        ) : (
                          formatSana(lid.createdAt)
                        )}
                      </Td>
                      <Td>
                        <Badge variant={h.variant} dot>
                          {h.label}
                        </Badge>
                      </Td>
                      <Td>
                        {talaba ? (
                          <div className="text-xs">
                            <p className="font-medium text-foreground">
                              {talaba.ism} {talaba.familiya}
                            </p>
                            {guruhNom && (
                              <p className="text-muted-foreground">{guruhNom}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          {yozishMumkin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => yozishOch(lid)}
                            >
                              Talabaga yozish
                            </Button>
                          )}
                          <Select
                            value={lid.holat}
                            onChange={(e) =>
                              yangilash(lid.id, e.target.value as LidHolat)
                            }
                            className="text-xs py-1.5 px-2 w-32"
                            disabled={lid.holat === "YOZILDI"}
                          >
                            {Object.entries(HOLAT_CONFIG)
                              .filter(([k]) => k !== "YOZILDI")
                              .map(([k, v]) => (
                                <option key={k} value={k}>
                                  {v.label}
                                </option>
                              ))}
                            {lid.holat === "YOZILDI" && (
                              <option value="YOZILDI">Yozildi</option>
                            )}
                          </Select>
                          <button
                            onClick={() => ochirish(lid.id)}
                            className="text-muted-foreground hover:text-destructive text-lg leading-none transition-colors p-1"
                          >
                            ×
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </Card>
      </div>

      {/* Talabaga yozish modali */}
      <Modal
        open={yozishModal}
        onClose={() => setYozishModal(false)}
        title="Talabaga yozish"
        description="Lidni talaba sifatida ro'yxatdan o'tkazing"
      >
        {yozishLid && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium text-foreground">{yozishLid.ism}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Qiziqgan kurs: {yozishLid.kurs}
              </p>
            </div>
            <Input
              label="Telefon"
              value={yozishTelefon}
              onChange={(e) => setYozishTelefon(e.target.value)}
              placeholder="+998 90 123 45 67"
            />

            {/* Tavsiya etilgan guruhlar */}
            {tavsiyalar.length > 0 && (
              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Tavsiya etilgan guruhlar
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {tavsiyalar.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setYozishGuruhId(g.id)}
                      className={`text-left p-3 rounded-lg border-2 transition-all text-xs ${
                        yozishGuruhId === g.id
                          ? "border-primary bg-primary/5"
                          : g.tolib
                            ? "border-destructive/30 bg-destructive/5 opacity-60"
                            : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <p className="font-semibold text-foreground truncate">
                        {g.kursNom}
                      </p>
                      <p className="text-muted-foreground truncate">{g.nom}</p>
                      <div className="flex items-center justify-between mt-1.5 gap-1">
                        <span className="text-muted-foreground">{g.vaqt}</span>
                        <Badge
                          variant={
                            g.tolib
                              ? "danger"
                              : g.boshJoy <= 2
                                ? "warning"
                                : "success"
                          }
                          size="sm"
                        >
                          {g.tolib ? "To'lgan" : `${g.boshJoy} joy`}
                        </Badge>
                      </div>
                      {g.oqituvchi && (
                        <p className="text-muted-foreground mt-1 truncate">
                          {g.oqituvchi}
                        </p>
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
              <option value="">-- Guruhsiz qo'shish --</option>
              {guruhlar.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.kurs.nom} - {g.nom}
                </option>
              ))}
            </Select>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setYozishModal(false)}>
                Bekor
              </Button>
              <Button
                variant="primary"
                onClick={yozishSaqlash}
                disabled={!yozishTelefon || yozishSaqlanmoqda}
                loading={yozishSaqlanmoqda}
              >
                Talaba sifatida yozish
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>

      {/* Yangi lid modali */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Yangi lid qo'shish"
        description="Yangi potensial mijoz ma'lumotlarini kiriting"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ism Familiya"
              placeholder="Aziza Rahimova"
              value={form.ism}
              onChange={(e) => setForm({ ...form, ism: e.target.value })}
            />
            <Input
              label="Telefon"
              placeholder="+998 90 123 45 67"
              value={form.telefon}
              onChange={(e) => setForm({ ...form, telefon: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Qiziqgan kurs"
              placeholder="IELTS, Python..."
              value={form.kurs}
              onChange={(e) => setForm({ ...form, kurs: e.target.value })}
            />
            <Select
              label="Manba"
              value={form.manba}
              onChange={(e) => setForm({ ...form, manba: e.target.value })}
            >
              {Object.entries(MANBA_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Izoh</label>
            <textarea
              className="w-full px-3.5 py-2.5 text-sm border border-input rounded-lg bg-card text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
              rows={3}
              placeholder="Qo'shimcha ma'lumot..."
              value={form.izoh}
              onChange={(e) => setForm({ ...form, izoh: e.target.value })}
            />
          </div>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setModal(false)}>
              Bekor
            </Button>
            <Button
              variant="primary"
              onClick={saqlash}
              disabled={
                !form.ism || !form.telefon || !form.kurs || saqlanyapti
              }
              loading={saqlanyapti}
            >
              Saqlash
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  );
}
