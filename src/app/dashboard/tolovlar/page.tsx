"use client";
import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { oyNomi } from "@/lib/utils";
import type { TolovTur } from "@/types";

type TolovRow = {
  id: string; summa: number; tur: TolovTur; oy: number; yil: number;
  izoh: string | null; createdAt: string;
  talaba: { id: string; ism: string; familiya: string; telefon: string };
};

const TUR_LABEL: Record<TolovTur, string> = {
  NAQD: "Naqd", KARTA: "Karta", CLICK: "Click", PAYME: "Payme"
};

export default function TolovlarPage() {
  const hozir = new Date();
  const [tolovlar, setTolovlar] = useState<TolovRow[]>([]);
  const [oy, setOy] = useState(hozir.getMonth() + 1);
  const [yil, setYil] = useState(hozir.getFullYear());
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    talabaId: "", summa: "", tur: "NAQD", oy: hozir.getMonth() + 1, yil: hozir.getFullYear(), izoh: ""
  });
  const [talabaQidiruv, setTalabaQidiruv] = useState("");
  const [talabalar, setTalabalar] = useState<{ id: string; ism: string; familiya: string }[]>([]);
  const [saqlanyapti, setSaqlanyapti] = useState(false);

  const fetchTolovlar = useCallback(async () => {
    const res = await fetch(`/api/tolovlar?oy=${oy}&yil=${yil}`);
    const data = await res.json();
    setTolovlar(data);
  }, [oy, yil]);

  useEffect(() => { fetchTolovlar(); }, [fetchTolovlar]);

  useEffect(() => {
    if (!talabaQidiruv) { setTalabalar([]); return; }
    fetch(`/api/talabalar?search=${talabaQidiruv}&faol=true`)
      .then((r) => r.json())
      .then(setTalabalar);
  }, [talabaQidiruv]);

  const saqlash = async () => {
    setSaqlanyapti(true);
    await fetch("/api/tolovlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, summa: parseInt(form.summa) }),
    });
    setSaqlanyapti(false);
    setModal(false);
    setForm({ talabaId: "", summa: "", tur: "NAQD", oy: hozir.getMonth() + 1, yil: hozir.getFullYear(), izoh: "" });
    setTalabaQidiruv("");
    fetchTolovlar();
  };

  const jami = tolovlar.reduce((s, t) => s + t.summa, 0);
  const naqd = tolovlar.filter((t) => t.tur === "NAQD").reduce((s, t) => s + t.summa, 0);
  const karta = tolovlar.filter((t) => t.tur === "KARTA" || t.tur === "CLICK" || t.tur === "PAYME").reduce((s, t) => s + t.summa, 0);

  return (
    <div>
      <Topbar
        title="To'lovlar"
        actions={
          <Button variant="primary" onClick={() => setModal(true)}>+ To'lov qo'shish</Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Oy tanlash */}
        <div className="flex items-center gap-3">
          <select
            value={oy}
            onChange={(e) => setOy(parseInt(e.target.value))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{oyNomi(i + 1)}</option>
            ))}
          </select>
          <select
            value={yil}
            onChange={(e) => setYil(parseInt(e.target.value))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="text-sm text-gray-500">{oyNomi(oy)} {yil}</span>
        </div>

        {/* Statistika */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Jami tushum" value={`${jami.toLocaleString()} so'm`} subColor="green" />
          <StatCard label="Naqd" value={`${naqd.toLocaleString()} so'm`} />
          <StatCard label="Karta / Online" value={`${karta.toLocaleString()} so'm`} />
        </div>

        {/* Jadval */}
        <Card>
          <CardHeader>
            <CardTitle>
              {oyNomi(oy)} to'lovlari
              <span className="ml-2 text-gray-400 font-normal">({tolovlar.length} ta)</span>
            </CardTitle>
          </CardHeader>
          <Table>
            <Thead>
              <tr>
                <Th>Talaba</Th>
                <Th>Telefon</Th>
                <Th>Summa</Th>
                <Th>Tur</Th>
                <Th>Izoh</Th>
                <Th>Sana</Th>
              </tr>
            </Thead>
            <Tbody>
              {tolovlar.map((t) => (
                <Tr key={t.id}>
                  <Td className="font-medium">{t.talaba.ism} {t.talaba.familiya}</Td>
                  <Td className="font-mono text-xs text-gray-500">{t.talaba.telefon}</Td>
                  <Td className="font-semibold text-gray-900">{t.summa.toLocaleString()} so'm</Td>
                  <Td><Badge variant="green">{TUR_LABEL[t.tur]}</Badge></Td>
                  <Td className="text-gray-400">{t.izoh ?? "—"}</Td>
                  <Td className="text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleDateString("uz-UZ")}
                  </Td>
                </Tr>
              ))}
              {tolovlar.length === 0 && (
                <Tr>
                  <Td colSpan={6} className="text-center text-gray-400 py-10">Bu oy to'lov yo'q</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Card>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="To'lov qo'shish">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Talaba *</label>
            <input
              type="text"
              placeholder="Ism yoki telefon bilan qidiring..."
              value={talabaQidiruv}
              onChange={(e) => setTalabaQidiruv(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            {talabalar.length > 0 && (
              <div className="border border-gray-100 rounded-lg mt-1 divide-y max-h-40 overflow-y-auto">
                {talabalar.map((t) => (
                  <button
                    key={t.id}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      form.talabaId === t.id ? "bg-brand-50 text-brand-800 font-medium" : ""
                    }`}
                    onClick={() => {
                      setForm({ ...form, talabaId: t.id });
                      setTalabaQidiruv(`${t.ism} ${t.familiya}`);
                      setTalabalar([]);
                    }}
                  >
                    {t.ism} {t.familiya}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Summa (so'm) *"
              type="number"
              placeholder="850000"
              value={form.summa}
              onChange={(e) => setForm({ ...form, summa: e.target.value })}
            />
            <Select
              label="To'lov turi"
              value={form.tur}
              onChange={(e) => setForm({ ...form, tur: e.target.value })}
            >
              {Object.entries(TUR_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Oy" value={form.oy} onChange={(e) => setForm({ ...form, oy: parseInt(e.target.value) })}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{oyNomi(i + 1)}</option>
              ))}
            </Select>
            <Select label="Yil" value={form.yil} onChange={(e) => setForm({ ...form, yil: parseInt(e.target.value) })}>
              {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
          </div>
          <Input label="Izoh" placeholder="Ixtiyoriy..." value={form.izoh}
            onChange={(e) => setForm({ ...form, izoh: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModal(false)}>Bekor</Button>
            <Button
              variant="primary"
              onClick={saqlash}
              disabled={!form.talabaId || !form.summa || saqlanyapti}
            >
              {saqlanyapti ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
