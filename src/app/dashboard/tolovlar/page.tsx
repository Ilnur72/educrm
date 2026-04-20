"use client";
import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Table, Thead, Th, Tbody, Tr, Td, TableEmpty } from "@/components/ui/Table";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { oyNomi } from "@/lib/utils";
import type { TolovTur } from "@/types";

type TolovRow = {
  id: string;
  summa: number;
  tur: TolovTur;
  oy: number;
  yil: number;
  izoh: string | null;
  createdAt: string;
  talaba: { id: string; ism: string; familiya: string; telefon: string };
};

const TUR_LABEL: Record<TolovTur, string> = {
  NAQD: "Naqd",
  KARTA: "Karta",
  CLICK: "Click",
  PAYME: "Payme",
};

const Icons = {
  money: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  cash: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  ),
  card: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
};

export default function TolovlarPage() {
  const hozir = new Date();
  const [tolovlar, setTolovlar] = useState<TolovRow[]>([]);
  const [oy, setOy] = useState(hozir.getMonth() + 1);
  const [yil, setYil] = useState(hozir.getFullYear());
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    talabaId: "",
    summa: "",
    tur: "NAQD",
    oy: hozir.getMonth() + 1,
    yil: hozir.getFullYear(),
    izoh: "",
  });
  const [talabaQidiruv, setTalabaQidiruv] = useState("");
  const [talabalar, setTalabalar] = useState<
    { id: string; ism: string; familiya: string }[]
  >([]);
  const [saqlanyapti, setSaqlanyapti] = useState(false);

  const fetchTolovlar = useCallback(async () => {
    const res = await fetch(`/api/tolovlar?oy=${oy}&yil=${yil}`);
    const data = await res.json();
    setTolovlar(data);
  }, [oy, yil]);

  useEffect(() => {
    fetchTolovlar();
  }, [fetchTolovlar]);

  useEffect(() => {
    if (!talabaQidiruv) {
      setTalabalar([]);
      return;
    }
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
    setForm({
      talabaId: "",
      summa: "",
      tur: "NAQD",
      oy: hozir.getMonth() + 1,
      yil: hozir.getFullYear(),
      izoh: "",
    });
    setTalabaQidiruv("");
    fetchTolovlar();
  };

  const jami = tolovlar.reduce((s, t) => s + t.summa, 0);
  const naqd = tolovlar
    .filter((t) => t.tur === "NAQD")
    .reduce((s, t) => s + t.summa, 0);
  const karta = tolovlar
    .filter(
      (t) => t.tur === "KARTA" || t.tur === "CLICK" || t.tur === "PAYME"
    )
    .reduce((s, t) => s + t.summa, 0);

  return (
    <div className="min-h-screen">
      <Topbar
        title="To'lovlar"
        description="Barcha to'lovlar tarixi va statistikasi"
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
            To'lov qo'shish
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Month Selection */}
        <div className="flex items-center gap-3">
          <Select
            value={oy}
            onChange={(e) => setOy(parseInt(e.target.value))}
            className="w-36"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {oyNomi(i + 1)}
              </option>
            ))}
          </Select>
          <Select
            value={yil}
            onChange={(e) => setYil(parseInt(e.target.value))}
            className="w-24"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
          <Badge variant="outline">
            {oyNomi(oy)} {yil}
          </Badge>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Jami tushum"
            value={`${jami.toLocaleString()} so'm`}
            subColor="success"
            icon={Icons.money}
          />
          <StatCard
            label="Naqd"
            value={`${naqd.toLocaleString()} so'm`}
            icon={Icons.cash}
          />
          <StatCard
            label="Karta / Online"
            value={`${karta.toLocaleString()} so'm`}
            icon={Icons.card}
          />
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>{oyNomi(oy)} to'lovlari</CardTitle>
              <Badge variant="outline">{tolovlar.length} ta</Badge>
            </div>
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
              {tolovlar.length === 0 ? (
                <TableEmpty message="Bu oy to'lov yo'q" colSpan={6} />
              ) : (
                tolovlar.map((t) => (
                  <Tr key={t.id}>
                    <Td className="font-medium">
                      {t.talaba.ism} {t.talaba.familiya}
                    </Td>
                    <Td>
                      <span className="font-mono text-xs text-muted-foreground">
                        {t.talaba.telefon}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-mono font-semibold text-success">
                        +{t.summa.toLocaleString()} so'm
                      </span>
                    </Td>
                    <Td>
                      <Badge variant="success">{TUR_LABEL[t.tur]}</Badge>
                    </Td>
                    <Td className="text-muted-foreground">{t.izoh ?? "—"}</Td>
                    <Td className="text-xs text-muted-foreground">
                      {new Date(t.createdAt).toLocaleDateString("uz-UZ")}
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Card>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="To'lov qo'shish"
        description="Yangi to'lov ma'lumotlarini kiriting"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Talaba
            </label>
            <input
              type="text"
              placeholder="Ism yoki telefon bilan qidiring..."
              value={talabaQidiruv}
              onChange={(e) => setTalabaQidiruv(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-input rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
            />
            {talabalar.length > 0 && (
              <div className="border border-border rounded-lg mt-1 divide-y divide-border max-h-40 overflow-y-auto">
                {talabalar.map((t) => (
                  <button
                    key={t.id}
                    className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors ${
                      form.talabaId === t.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted"
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
              label="Summa (so'm)"
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
              {Object.entries(TUR_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Oy"
              value={form.oy}
              onChange={(e) =>
                setForm({ ...form, oy: parseInt(e.target.value) })
              }
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {oyNomi(i + 1)}
                </option>
              ))}
            </Select>
            <Select
              label="Yil"
              value={form.yil}
              onChange={(e) =>
                setForm({ ...form, yil: parseInt(e.target.value) })
              }
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
          <Input
            label="Izoh"
            placeholder="Ixtiyoriy..."
            value={form.izoh}
            onChange={(e) => setForm({ ...form, izoh: e.target.value })}
          />
          <ModalFooter>
            <Button variant="ghost" onClick={() => setModal(false)}>
              Bekor
            </Button>
            <Button
              variant="primary"
              onClick={saqlash}
              disabled={!form.talabaId || !form.summa || saqlanyapti}
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
