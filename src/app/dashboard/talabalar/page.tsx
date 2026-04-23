"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { IconButton, TrashIcon, LinkIcon } from "@/components/ui/IconButton";
import { excelYuklab, excelOqish } from "@/lib/excel";
import type { TalabaWithGuruh } from "@/types";

type GuruhOption = { id: string; nom: string; kurs: { nom: string } };

function Avatar({ ism, familiya }: { ism: string; familiya: string }) {
  const initials = `${ism[0]}${familiya[0]}`.toUpperCase();
  const colors = ["bg-purple-100 text-purple-700", "bg-teal-100 text-teal-700",
                  "bg-blue-100 text-blue-700", "bg-amber-100 text-amber-700"];
  const color = colors[(ism.charCodeAt(0) + familiya.charCodeAt(0)) % colors.length];
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

function tolovHolat(talaba: TalabaWithGuruh): { label: string; variant: "green"|"amber"|"red" } {
  const hozir = new Date();
  const oyTolov = talaba.tolovlar.find(
    (t) => t.oy === hozir.getMonth() + 1 && t.yil === hozir.getFullYear()
  );
  if (!oyTolov) return { label: "Qarzdor", variant: "red" };
  const guruhNarxi = talaba.guruhlar[0]?.guruh.kurs.narxi ?? 0;
  if (oyTolov.summa >= guruhNarxi) return { label: "To'langan", variant: "green" };
  return { label: "Qisman", variant: "amber" };
}

export default function TalabalarPage() {
  const [talabalar, setTalabalar] = useState<TalabaWithGuruh[]>([]);
  const [xavfliIds, setXavfliIds] = useState<Map<string, "XAVFLI"|"DIQQAT">>(new Map());
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    ism: "", familiya: "", telefon: "", otaTelefon: "", email: "", manzil: "", izoh: ""
  });
  const [saqlanyapti, setSaqlanyapti] = useState(false);

  // Guruhga biriktirish
  const [guruhlar, setGuruhlar] = useState<GuruhOption[]>([]);
  const [birikModal, setBirikModal] = useState(false);
  const [birikTalaba, setBirikTalaba] = useState<TalabaWithGuruh | null>(null);
  const [birikGuruhId, setBirikGuruhId] = useState("");
  const [birikSaqlanmoqda, setBirikSaqlanmoqda] = useState(false);

  const fetchTalabalar = useCallback(async () => {
    const params = new URLSearchParams({ faol: "true" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/talabalar?${params}`);
    const data = await res.json();
    setTalabalar(data);
  }, [search]);

  useEffect(() => { fetchTalabalar(); }, [fetchTalabalar]);

  useEffect(() => {
    fetch("/api/xavf-tahlil")
      .then((r) => r.json())
      .then((data: { id: string; daraja: "XAVFLI" | "DIQQAT" }[]) => {
        setXavfliIds(new Map(data.map((t) => [t.id, t.daraja])));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/guruhlar?faol=true")
      .then((r) => r.json())
      .then(setGuruhlar)
      .catch(() => {});
  }, []);

  const birikOch = (t: TalabaWithGuruh) => {
    setBirikTalaba(t);
    setBirikGuruhId(t.guruhlar[0]?.guruh.id ?? "");
    setBirikModal(true);
  };

  const birikSaqlash = async () => {
    if (!birikTalaba || !birikGuruhId) return;
    setBirikSaqlanmoqda(true);
    await fetch(`/api/talabalar/${birikTalaba.id}/guruh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guruhId: birikGuruhId }),
    });
    setBirikSaqlanmoqda(false);
    setBirikModal(false);
    fetchTalabalar();
  };

  const saqlash = async () => {
    setSaqlanyapti(true);
    await fetch("/api/talabalar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaqlanyapti(false);
    setModal(false);
    setForm({ ism: "", familiya: "", telefon: "", otaTelefon: "", email: "", manzil: "", izoh: "" });
    fetchTalabalar();
  };

  const router = useRouter();

  const ochirish = async (id: string) => {
    if (!confirm("Talabani arxivlash?")) return;
    await fetch(`/api/talabalar/${id}`, { method: "DELETE" });
    fetchTalabalar();
  };

  return (
    <div>
      <Topbar
        title="Talabalar"
        actions={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => excelYuklab(
                talabalar.map((t) => ({
                  "Ism": t.ism,
                  "Familiya": t.familiya,
                  "Telefon": t.telefon,
                  "Ota telefon": t.otaTelefon ?? "",
                  "Email": t.email ?? "",
                  "Guruh": t.guruhlar[0]?.guruh.nom ?? "",
                  "Kurs": t.guruhlar[0]?.guruh.kurs.nom ?? "",
                })),
                "talabalar"
              )}
            >
              Excel ↓
            </Button>
            <label className="cursor-pointer px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:border-brand-400 hover:text-brand-600 transition-colors">
              Excel ↑
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={async (e) => {
                  const fayl = e.target.files?.[0];
                  if (!fayl) return;
                  const rows = await excelOqish(fayl) as { Ism?: string; Familiya?: string; Telefon?: string; "Ota telefon"?: string }[];
                  for (const row of rows) {
                    if (!row.Ism || !row.Familiya || !row.Telefon) continue;
                    await fetch("/api/talabalar", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        ism: row.Ism, familiya: row.Familiya,
                        telefon: String(row.Telefon),
                        otaTelefon: row["Ota telefon"] ? String(row["Ota telefon"]) : null,
                      }),
                    });
                  }
                  fetchTalabalar();
                  e.target.value = "";
                }}
              />
            </label>
            <Button variant="primary" onClick={() => setModal(true)}>+ Yangi talaba</Button>
          </div>
        }
      />

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Barcha talabalar
              <span className="ml-2 text-gray-400 font-normal">({talabalar.length})</span>
            </CardTitle>
            <Input
              placeholder="Ism yoki telefon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-52"
            />
          </CardHeader>
          <Table>
            <Thead>
              <tr>
                <Th>#</Th>
                <Th>Ism Familiya</Th>
                <Th>Telefon</Th>
                <Th>Ota-ona tel.</Th>
                <Th>Kurs / Guruh</Th>
                <Th>To'lov</Th>
                <Th>Holat</Th>
                <Th></Th>
              </tr>
            </Thead>
            <Tbody>
              {talabalar.map((t, i) => {
                const tolov = tolovHolat(t);
                const guruh = t.guruhlar[0]?.guruh;
                return (
                  <Tr key={t.id} onClick={() => router.push(`/dashboard/talabalar/${t.id}`)}>
                    <Td className="text-gray-400 text-xs">{String(i + 1).padStart(3, "0")}</Td>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <Avatar ism={t.ism} familiya={t.familiya} />
                        <span className="font-medium text-gray-800">{t.ism} {t.familiya}</span>
                        {xavfliIds.get(t.id) === "XAVFLI" && (
                          <span title="Xavfli talaba" className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md font-medium">🔴</span>
                        )}
                        {xavfliIds.get(t.id) === "DIQQAT" && (
                          <span title="Diqqat talab qiladi" className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-md font-medium">🟡</span>
                        )}
                      </div>
                    </Td>
                    <Td className="font-mono text-xs">{t.telefon}</Td>
                    <Td className="text-gray-500 text-xs">{t.otaTelefon ?? "—"}</Td>
                    <Td>
                      {guruh ? (
                        <div>
                          <p className="text-sm">{guruh.kurs.nom}</p>
                          <p className="text-xs text-gray-400">{guruh.nom}</p>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </Td>
                    <Td className="font-medium">
                      {guruh ? `${guruh.kurs.narxi.toLocaleString()} so'm` : "—"}
                    </Td>
                    <Td><Badge variant={tolov.variant}>{tolov.label}</Badge></Td>
                    <Td>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <IconButton title="Guruhga biriktirish" onClick={() => birikOch(t)}>
                          <LinkIcon />
                        </IconButton>
                        <IconButton title="Arxivlash" onClick={() => ochirish(t.id)} variant="danger">
                          <TrashIcon />
                        </IconButton>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
              {talabalar.length === 0 && (
                <Tr>
                  <Td colSpan={8} className="text-center text-gray-400 py-10">
                    Talaba topilmadi
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Card>
      </div>

      {/* Guruhga biriktirish modali */}
      <Modal open={birikModal} onClose={() => setBirikModal(false)} title="Guruhga biriktirish">
        {birikTalaba && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-xl text-sm">
              <p className="font-medium text-gray-900">{birikTalaba.ism} {birikTalaba.familiya}</p>
              <p className="text-xs text-gray-400 mt-0.5">{birikTalaba.telefon}</p>
              {birikTalaba.guruhlar[0] && (
                <p className="text-xs text-amber-600 mt-1">
                  Hozir: {birikTalaba.guruhlar[0].guruh.kurs.nom} — {birikTalaba.guruhlar[0].guruh.nom}
                </p>
              )}
            </div>
            <Select
              label="Guruh tanlang *"
              value={birikGuruhId}
              onChange={(e) => setBirikGuruhId(e.target.value)}
            >
              <option value="">— Tanlang —</option>
              {guruhlar.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.kurs.nom} — {g.nom}
                </option>
              ))}
            </Select>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setBirikModal(false)}>Bekor</Button>
              <Button
                variant="primary"
                onClick={birikSaqlash}
                disabled={!birikGuruhId || birikSaqlanmoqda}
              >
                {birikSaqlanmoqda ? "Saqlanmoqda..." : "Biriktirish"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={modal} onClose={() => setModal(false)} title="Yangi talaba qo'shish">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ism *" placeholder="Aziza" value={form.ism}
              onChange={(e) => setForm({ ...form, ism: e.target.value })} />
            <Input label="Familiya *" placeholder="Rahimova" value={form.familiya}
              onChange={(e) => setForm({ ...form, familiya: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Telefon *" placeholder="+998 90 123 45 67" value={form.telefon}
              onChange={(e) => setForm({ ...form, telefon: e.target.value })} />
            <Input label="Ota-ona telefoni" placeholder="+998 90 000 00 00" value={form.otaTelefon}
              onChange={(e) => setForm({ ...form, otaTelefon: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" placeholder="aziza@mail.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Manzil" placeholder="Toshkent, Yunusobod" value={form.manzil}
              onChange={(e) => setForm({ ...form, manzil: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Izoh</label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
              rows={2}
              value={form.izoh}
              onChange={(e) => setForm({ ...form, izoh: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModal(false)}>Bekor</Button>
            <Button
              variant="primary"
              onClick={saqlash}
              disabled={!form.ism || !form.familiya || !form.telefon || saqlanyapti}
            >
              {saqlanyapti ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
