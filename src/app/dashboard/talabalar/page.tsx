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
import type { TalabaWithGuruh } from "@/types";

type GuruhOption = { id: string; nom: string; kurs: { nom: string } };

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
          <Button variant="primary" onClick={() => setModal(true)}>
            + Yangi talaba
          </Button>
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
                    <Td className="text-muted-foreground text-xs font-mono">{String(i + 1).padStart(3, "0")}</Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar ism={t.ism} familiya={t.familiya} />
                        <div>
                          <span className="font-medium text-foreground">{t.ism} {t.familiya}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {xavfliIds.get(t.id) === "XAVFLI" && (
                              <span title="Xavfli talaba" className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-lg font-medium">Xavfli</span>
                            )}
                            {xavfliIds.get(t.id) === "DIQQAT" && (
                              <span title="Diqqat talab qiladi" className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-lg font-medium">Diqqat</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td><span className="font-mono text-xs bg-muted px-2 py-1 rounded-lg">{t.telefon}</span></Td>
                    <Td className="text-muted-foreground text-sm">{t.otaTelefon ?? "—"}</Td>
                    <Td>
                      {guruh ? (
                        <div>
                          <p className="text-sm font-medium text-foreground">{guruh.kurs.nom}</p>
                          <p className="text-xs text-muted-foreground">{guruh.nom}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </Td>
                    <Td>
                      {guruh ? (
                        <span className="font-medium text-foreground">{guruh.kurs.narxi.toLocaleString()} so'm</span>
                      ) : "—"}
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
                  <Td colSpan={8} className="text-center py-12">
                    <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <p className="text-muted-foreground">Talaba topilmadi</p>
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
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <p className="font-semibold text-foreground">{birikTalaba.ism} {birikTalaba.familiya}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{birikTalaba.telefon}</p>
              {birikTalaba.guruhlar[0] && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-lg font-medium">
                    Hozir: {birikTalaba.guruhlar[0].guruh.kurs.nom} — {birikTalaba.guruhlar[0].guruh.nom}
                  </span>
                </div>
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
