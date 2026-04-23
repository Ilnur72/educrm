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
import { oyNomi, formatSum } from "@/lib/utils";

type XarajatTur = "IJARA" | "KOMMUNAL" | "REKLAMA" | "MAOSH" | "JIHOZLAR" | "BOSHQA";

type Xarajat = {
  id: string; tur: XarajatTur; summa: number;
  sana: string; izoh: string | null; createdAt: string;
};

const TUR_LABEL: Record<XarajatTur, string> = {
  IJARA: "Ijara", KOMMUNAL: "Kommunal", REKLAMA: "Reklama",
  MAOSH: "Maosh", JIHOZLAR: "Jihozlar", BOSHQA: "Boshqa",
};

const TUR_COLOR: Record<XarajatTur, "red" | "amber" | "blue" | "purple" | "green" | "gray"> = {
  IJARA: "red", KOMMUNAL: "amber", REKLAMA: "blue",
  MAOSH: "purple", JIHOZLAR: "green", BOSHQA: "gray",
};

export default function XarajatlarPage() {
  const hozir = new Date();
  const [xarajatlar, setXarajatlar] = useState<Xarajat[]>([]);
  const [oy,  setOy]  = useState(hozir.getMonth() + 1);
  const [yil, setYil] = useState(hozir.getFullYear());
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    tur: "IJARA", summa: "", sana: hozir.toISOString().slice(0, 10), izoh: "",
  });
  const [saqlanyapti, setSaqlanyapti] = useState(false);

  const fetchXarajatlar = useCallback(async () => {
    const res = await fetch(`/api/xarajatlar?oy=${oy}&yil=${yil}`);
    setXarajatlar(await res.json());
  }, [oy, yil]);

  useEffect(() => { fetchXarajatlar(); }, [fetchXarajatlar]);

  const saqlash = async () => {
    setSaqlanyapti(true);
    await fetch("/api/xarajatlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaqlanyapti(false);
    setModal(false);
    setForm({ tur: "IJARA", summa: "", sana: hozir.toISOString().slice(0, 10), izoh: "" });
    fetchXarajatlar();
  };

  const ochirish = async (id: string) => {
    if (!confirm("Bu xarajatni o'chirish?")) return;
    await fetch(`/api/xarajatlar/${id}`, { method: "DELETE" });
    fetchXarajatlar();
  };

  const jami = xarajatlar.reduce((s, x) => s + x.summa, 0);

  // Tur bo'yicha guruhlash
  const turStat = Object.keys(TUR_LABEL).map((tur) => ({
    tur: tur as XarajatTur,
    summa: xarajatlar.filter((x) => x.tur === tur).reduce((s, x) => s + x.summa, 0),
  })).filter((t) => t.summa > 0);

  return (
    <div>
      <Topbar
        title="Xarajatlar"
        actions={
          <Button variant="primary" onClick={() => setModal(true)}>+ Xarajat qo'shish</Button>
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
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Jami xarajat" value={formatSum(jami)} subColor="red" />
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-2">Tur bo'yicha</p>
            <div className="flex flex-wrap gap-2">
              {turStat.map((t) => (
                <div key={t.tur} className="text-xs">
                  <Badge variant={TUR_COLOR[t.tur]}>{TUR_LABEL[t.tur]}: {formatSum(t.summa)}</Badge>
                </div>
              ))}
              {turStat.length === 0 && <span className="text-xs text-gray-300">Ma'lumot yo'q</span>}
            </div>
          </div>
        </div>

        {/* Jadval */}
        <Card>
          <CardHeader>
            <CardTitle>
              {oyNomi(oy)} xarajatlari
              <span className="ml-2 text-gray-400 font-normal">({xarajatlar.length} ta)</span>
            </CardTitle>
          </CardHeader>
          <Table>
            <Thead>
              <tr>
                <Th>Tur</Th>
                <Th>Summa</Th>
                <Th>Sana</Th>
                <Th>Izoh</Th>
                <Th></Th>
              </tr>
            </Thead>
            <Tbody>
              {xarajatlar.map((x) => (
                <Tr key={x.id}>
                  <Td><Badge variant={TUR_COLOR[x.tur]}>{TUR_LABEL[x.tur]}</Badge></Td>
                  <Td className="font-semibold text-gray-900">{formatSum(x.summa)}</Td>
                  <Td className="text-xs text-gray-400 font-mono">
                    {new Date(x.sana).toLocaleDateString("uz-UZ")}
                  </Td>
                  <Td className="text-gray-400">{x.izoh ?? "—"}</Td>
                  <Td>
                    <button
                      onClick={() => ochirish(x.id)}
                      className="text-gray-300 hover:text-red-400 text-lg leading-none transition-colors"
                    >
                      ×
                    </button>
                  </Td>
                </Tr>
              ))}
              {xarajatlar.length === 0 && (
                <Tr>
                  <Td colSpan={5} className="text-center text-gray-400 py-10">
                    Bu oy xarajat yo'q
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Card>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Xarajat qo'shish">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tur *" value={form.tur} onChange={(e) => setForm({ ...form, tur: e.target.value })}>
              {Object.entries(TUR_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
            <Input
              label="Summa (so'm) *"
              type="number"
              placeholder="500000"
              value={form.summa}
              onChange={(e) => setForm({ ...form, summa: e.target.value })}
            />
          </div>
          <Input
            label="Sana *"
            type="date"
            value={form.sana}
            onChange={(e) => setForm({ ...form, sana: e.target.value })}
          />
          <Input
            label="Izoh"
            placeholder="Ixtiyoriy..."
            value={form.izoh}
            onChange={(e) => setForm({ ...form, izoh: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModal(false)}>Bekor</Button>
            <Button
              variant="primary"
              onClick={saqlash}
              disabled={!form.summa || !form.sana || saqlanyapti}
            >
              {saqlanyapti ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
