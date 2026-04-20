"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td, TableEmpty } from "@/components/ui/Table";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { IconButton, TrashIcon, LinkIcon } from "@/components/ui/IconButton";
import type { TalabaWithGuruh } from "@/types";

type GuruhOption = { id: string; nom: string; kurs: { nom: string } };

function Avatar({ ism, familiya }: { ism: string; familiya: string }) {
  const initials = `${ism[0]}${familiya[0]}`.toUpperCase();
  const colors = [
    "bg-primary/10 text-primary",
    "bg-success/10 text-success",
    "bg-blue-500/10 text-blue-400",
    "bg-warning/10 text-warning",
  ];
  const color = colors[(ism.charCodeAt(0) + familiya.charCodeAt(0)) % colors.length];
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${color}`}
    >
      {initials}
    </div>
  );
}

function tolovHolat(talaba: TalabaWithGuruh): {
  label: string;
  variant: "success" | "warning" | "danger";
} {
  const hozir = new Date();
  const oyTolov = talaba.tolovlar.find(
    (t) => t.oy === hozir.getMonth() + 1 && t.yil === hozir.getFullYear()
  );
  if (!oyTolov) return { label: "Qarzdor", variant: "danger" };
  const guruhNarxi = talaba.guruhlar[0]?.guruh.kurs.narxi ?? 0;
  if (oyTolov.summa >= guruhNarxi) return { label: "To'langan", variant: "success" };
  return { label: "Qisman", variant: "warning" };
}

export default function TalabalarPage() {
  const [talabalar, setTalabalar] = useState<TalabaWithGuruh[]>([]);
  const [xavfliIds, setXavfliIds] = useState<Map<string, "XAVFLI" | "DIQQAT">>(
    new Map()
  );
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    ism: "",
    familiya: "",
    telefon: "",
    otaTelefon: "",
    email: "",
    manzil: "",
    izoh: "",
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

  useEffect(() => {
    fetchTalabalar();
  }, [fetchTalabalar]);

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
    setForm({
      ism: "",
      familiya: "",
      telefon: "",
      otaTelefon: "",
      email: "",
      manzil: "",
      izoh: "",
    });
    fetchTalabalar();
  };

  const router = useRouter();

  const ochirish = async (id: string) => {
    if (!confirm("Talabani arxivlash?")) return;
    await fetch(`/api/talabalar/${id}`, { method: "DELETE" });
    fetchTalabalar();
  };

  return (
    <div className="min-h-screen">
      <Topbar
        title="Talabalar"
        description="Barcha faol talabalar ro'yxati"
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
            Yangi talaba
          </Button>
        }
      />

      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Barcha talabalar</CardTitle>
              <Badge variant="outline">{talabalar.length}</Badge>
            </div>
            <Input
              placeholder="Ism yoki telefon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
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
              {talabalar.length === 0 ? (
                <TableEmpty message="Talaba topilmadi" colSpan={8} />
              ) : (
                talabalar.map((t, i) => {
                  const tolov = tolovHolat(t);
                  const guruh = t.guruhlar[0]?.guruh;
                  return (
                    <Tr
                      key={t.id}
                      onClick={() => router.push(`/dashboard/talabalar/${t.id}`)}
                    >
                      <Td className="text-muted-foreground text-xs font-mono">
                        {String(i + 1).padStart(3, "0")}
                      </Td>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar ism={t.ism} familiya={t.familiya} />
                          <span className="font-medium text-foreground">
                            {t.ism} {t.familiya}
                          </span>
                          {xavfliIds.get(t.id) === "XAVFLI" && (
                            <Badge variant="danger" size="sm" dot>
                              Xavfli
                            </Badge>
                          )}
                          {xavfliIds.get(t.id) === "DIQQAT" && (
                            <Badge variant="warning" size="sm" dot>
                              Diqqat
                            </Badge>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <span className="font-mono text-xs">{t.telefon}</span>
                      </Td>
                      <Td className="text-muted-foreground text-xs">
                        {t.otaTelefon ?? "—"}
                      </Td>
                      <Td>
                        {guruh ? (
                          <div>
                            <p className="text-sm font-medium">{guruh.kurs.nom}</p>
                            <p className="text-xs text-muted-foreground">
                              {guruh.nom}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </Td>
                      <Td className="font-medium">
                        {guruh ? (
                          <span className="font-mono text-sm">
                            {guruh.kurs.narxi.toLocaleString()} so'm
                          </span>
                        ) : (
                          "—"
                        )}
                      </Td>
                      <Td>
                        <Badge variant={tolov.variant} dot>
                          {tolov.label}
                        </Badge>
                      </Td>
                      <Td>
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconButton
                            title="Guruhga biriktirish"
                            onClick={() => birikOch(t)}
                          >
                            <LinkIcon />
                          </IconButton>
                          <IconButton
                            title="Arxivlash"
                            onClick={() => ochirish(t.id)}
                            variant="danger"
                          >
                            <TrashIcon />
                          </IconButton>
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

      {/* Guruhga biriktirish modali */}
      <Modal
        open={birikModal}
        onClose={() => setBirikModal(false)}
        title="Guruhga biriktirish"
        description="Talabani mavjud guruhga biriktiring"
      >
        {birikTalaba && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium text-foreground">
                {birikTalaba.ism} {birikTalaba.familiya}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {birikTalaba.telefon}
              </p>
              {birikTalaba.guruhlar[0] && (
                <Badge variant="warning" className="mt-2">
                  Hozir: {birikTalaba.guruhlar[0].guruh.kurs.nom} -{" "}
                  {birikTalaba.guruhlar[0].guruh.nom}
                </Badge>
              )}
            </div>
            <Select
              label="Guruh tanlang"
              value={birikGuruhId}
              onChange={(e) => setBirikGuruhId(e.target.value)}
            >
              <option value="">-- Tanlang --</option>
              {guruhlar.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.kurs.nom} - {g.nom}
                </option>
              ))}
            </Select>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setBirikModal(false)}>
                Bekor
              </Button>
              <Button
                variant="primary"
                onClick={birikSaqlash}
                disabled={!birikGuruhId || birikSaqlanmoqda}
                loading={birikSaqlanmoqda}
              >
                Biriktirish
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>

      {/* Yangi talaba modali */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Yangi talaba qo'shish"
        description="Yangi talaba ma'lumotlarini kiriting"
        width="max-w-xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ism"
              placeholder="Aziza"
              value={form.ism}
              onChange={(e) => setForm({ ...form, ism: e.target.value })}
            />
            <Input
              label="Familiya"
              placeholder="Rahimova"
              value={form.familiya}
              onChange={(e) => setForm({ ...form, familiya: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Telefon"
              placeholder="+998 90 123 45 67"
              value={form.telefon}
              onChange={(e) => setForm({ ...form, telefon: e.target.value })}
            />
            <Input
              label="Ota-ona telefoni"
              placeholder="+998 90 000 00 00"
              value={form.otaTelefon}
              onChange={(e) => setForm({ ...form, otaTelefon: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              placeholder="aziza@mail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Manzil"
              placeholder="Toshkent, Yunusobod"
              value={form.manzil}
              onChange={(e) => setForm({ ...form, manzil: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Izoh</label>
            <textarea
              className="w-full px-3.5 py-2.5 text-sm border border-input rounded-lg bg-card text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
              rows={2}
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
                !form.ism || !form.familiya || !form.telefon || saqlanyapti
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
