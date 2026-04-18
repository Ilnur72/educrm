"use client";
import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { Select } from "@/components/ui/Select";
import { IconButton, PencilIcon, TrashIcon } from "@/components/ui/IconButton";

type Guruh = {
  id: string;
  nom: string;
  xona: string | null;
  kunlar: string[];
  vaqt: string;
  faol: boolean;
  oqituvchi: { user: { name: string } } | null;
  _count: { talabalar: number };
};

type Kurs = {
  id: string;
  nom: string;
  tavsif: string | null;
  davomiyligi: number;
  narxi: number;
  maxTalaba: number;
  faol: boolean;
  guruhlar: Guruh[];
};

type OqituvchiOption = { id: string; user: { name: string } };
type XonaOption     = { id: string; nom: string; sigim: number | null };

const KUNLAR = ["Du", "Se", "Ch", "Pa", "Ju", "Sha", "Ya"];

const emptyKursForm  = { nom: "", tavsif: "", davomiyligi: "3", narxi: "", maxTalaba: "12" };
const emptyGuruhForm = { nom: "", oqituvchiId: "", xona: "", kunlar: [] as string[], vaqt: "", boshlanish: "" };

export default function KurslarPage() {
  const [kurslar, setKurslar]             = useState<Kurs[]>([]);
  const [oqituvchilar, setOqituvchilar]   = useState<OqituvchiOption[]>([]);
  const [xonalar, setXonalar]             = useState<XonaOption[]>([]);

  // Kurs modal
  const [kursModal, setKursModal]         = useState(false);
  const [tahrirKurs, setTahrirKurs]       = useState<Kurs | null>(null);
  const [kursForm, setKursForm]           = useState(emptyKursForm);
  const [kursSaqlanmoqda, setKursSaqlanmoqda] = useState(false);

  // Guruh modal
  const [guruhModal, setGuruhModal]       = useState(false);
  const [tahrirGuruh, setTahrirGuruh]     = useState<Guruh | null>(null);
  const [guruhKursId, setGuruhKursId]     = useState("");
  const [guruhForm, setGuruhForm]         = useState(emptyGuruhForm);
  const [guruhSaqlanmoqda, setGuruhSaqlanmoqda] = useState(false);
  const [guruhXato, setGuruhXato]               = useState<string | null>(null);

  const fetchKurslar = useCallback(async () => {
    const res = await fetch("/api/kurslar");
    setKurslar(await res.json());
  }, []);

  useEffect(() => { fetchKurslar(); }, [fetchKurslar]);

  useEffect(() => {
    fetch("/api/oqituvchilar").then((r) => r.json()).then(setOqituvchilar).catch(() => {});
    fetch("/api/xonalar").then((r) => r.json()).then(setXonalar).catch(() => {});
  }, []);

  // ─── Kurs ───────────────────────────────────────────────────────────────────
  const kursOch = (kurs?: Kurs) => {
    if (kurs) {
      setTahrirKurs(kurs);
      setKursForm({
        nom: kurs.nom, tavsif: kurs.tavsif ?? "",
        davomiyligi: String(kurs.davomiyligi),
        narxi: String(kurs.narxi), maxTalaba: String(kurs.maxTalaba),
      });
    } else {
      setTahrirKurs(null);
      setKursForm(emptyKursForm);
    }
    setKursModal(true);
  };

  const kursSaqlash = async () => {
    if (!kursForm.nom || !kursForm.narxi) return;
    setKursSaqlanmoqda(true);
    const payload = {
      nom: kursForm.nom, tavsif: kursForm.tavsif || null,
      davomiyligi: parseInt(kursForm.davomiyligi),
      narxi: parseInt(kursForm.narxi), maxTalaba: parseInt(kursForm.maxTalaba),
    };
    if (tahrirKurs) {
      await fetch(`/api/kurslar/${tahrirKurs.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/kurslar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setKursSaqlanmoqda(false);
    setKursModal(false);
    fetchKurslar();
  };

  const kursOchirish = async (id: string) => {
    if (!confirm("Kursni nofaol qilish?")) return;
    await fetch(`/api/kurslar/${id}`, { method: "DELETE" });
    fetchKurslar();
  };

  // ─── Guruh ──────────────────────────────────────────────────────────────────
  const guruhOch = (kursId: string, guruh?: Guruh) => {
    setGuruhKursId(kursId);
    if (guruh) {
      setTahrirGuruh(guruh);
      setGuruhForm({
        nom: guruh.nom, oqituvchiId: guruh.oqituvchi ? "" : "",
        xona: guruh.xona ?? "", kunlar: guruh.kunlar,
        vaqt: guruh.vaqt, boshlanish: "",
      });
    } else {
      setTahrirGuruh(null);
      setGuruhForm(emptyGuruhForm);
    }
    setGuruhModal(true);
  };

  const kunToggle = (kun: string) =>
    setGuruhForm((f) => ({
      ...f,
      kunlar: f.kunlar.includes(kun) ? f.kunlar.filter((k) => k !== kun) : [...f.kunlar, kun],
    }));

  const guruhSaqlash = async () => {
    if (!guruhForm.nom || !guruhForm.vaqt) return;
    setGuruhSaqlanmoqda(true);
    setGuruhXato(null);
    const payload = {
      nom: guruhForm.nom, kursId: guruhKursId,
      oqituvchiId: guruhForm.oqituvchiId || null,
      xona: guruhForm.xona || null,
      kunlar: guruhForm.kunlar, vaqt: guruhForm.vaqt,
      ...(guruhForm.boshlanish && { boshlanish: new Date(guruhForm.boshlanish).toISOString() }),
    };
    const res = tahrirGuruh
      ? await fetch(`/api/guruhlar/${tahrirGuruh.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/guruhlar", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (!res.ok) {
      const data = await res.json();
      setGuruhXato(data.error ?? "Xatolik yuz berdi");
      setGuruhSaqlanmoqda(false);
      return;
    }

    setGuruhSaqlanmoqda(false);
    setGuruhModal(false);
    fetchKurslar();
  };

  const guruhOchirish = async (id: string) => {
    if (!confirm("Guruhni nofaol qilish?")) return;
    await fetch(`/api/guruhlar/${id}`, { method: "DELETE" });
    fetchKurslar();
  };

  return (
    <div>
      <Topbar
        title="Kurslar va guruhlar"
        actions={
          <Button variant="primary" onClick={() => kursOch()}>+ Yangi kurs</Button>
        }
      />

      <div className="p-6 space-y-5">
        {kurslar.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">Hali kurs qo'shilmagan</div>
        )}

        {kurslar.map((kurs) => {
          const jamiTalaba  = kurs.guruhlar.reduce((s, g) => s + g._count.talabalar, 0);
          const tolganGuruh = kurs.guruhlar.filter((g) => g._count.talabalar >= kurs.maxTalaba).length;
          const ogohGuruh   = kurs.guruhlar.filter((g) => {
            const f = g._count.talabalar / kurs.maxTalaba;
            return f >= 0.8 && f < 1;
          }).length;
          return (
            <Card key={kurs.id}>
              <CardHeader>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>{kurs.nom}</CardTitle>
                    {tolganGuruh > 0 && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        {tolganGuruh} guruh to'lgan
                      </span>
                    )}
                    {ogohGuruh > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                        ⚠ {ogohGuruh} guruh yaqin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {kurs.davomiyligi} oy · {kurs.narxi.toLocaleString()} so'm/oy · {jamiTalaba} talaba
                  </p>
                  {kurs.tavsif && <p className="text-xs text-gray-400 mt-0.5">{kurs.tavsif}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={kurs.faol ? "green" : "gray"}>
                    {kurs.faol ? "Faol" : "Nofaol"}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => guruhOch(kurs.id)}>+ Guruh</Button>
                  <IconButton title="Tahrirlash" onClick={() => kursOch(kurs)}>
                    <PencilIcon />
                  </IconButton>
                  <IconButton title="O'chirish" onClick={() => kursOchirish(kurs.id)} variant="danger">
                    <TrashIcon />
                  </IconButton>
                </div>
              </CardHeader>

              {kurs.guruhlar.length > 0 ? (
                <Table>
                  <Thead>
                    <tr>
                      <Th>Guruh</Th>
                      <Th>O'qituvchi</Th>
                      <Th>Xona</Th>
                      <Th>Kunlar</Th>
                      <Th>Vaqt</Th>
                      <Th>Talabalar</Th>
                      <Th></Th>
                    </tr>
                  </Thead>
                  <Tbody>
                    {kurs.guruhlar.map((g) => (
                      <Tr key={g.id}>
                        <Td>
                          <Link
                            href={`/dashboard/guruhlar/${g.id}`}
                            className="font-medium text-brand-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {g.nom}
                          </Link>
                        </Td>
                        <Td>{g.oqituvchi?.user.name ?? "—"}</Td>
                        <Td>{g.xona ?? "—"}</Td>
                        <Td className="text-xs text-gray-500">{g.kunlar.join(", ")}</Td>
                        <Td className="font-mono text-xs">{g.vaqt}</Td>
                        <Td>
                          {(() => {
                            const foiz = g._count.talabalar / kurs.maxTalaba;
                            const tolib = foiz >= 1;
                            const ogoh  = foiz >= 0.8;
                            return (
                              <div className="flex items-center gap-1.5">
                                <span className={`text-sm font-medium ${
                                  tolib ? "text-red-500" : ogoh ? "text-amber-500" : "text-green-600"
                                }`}>
                                  {g._count.talabalar}/{kurs.maxTalaba}
                                </span>
                                {tolib && (
                                  <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md font-medium">To'lgan</span>
                                )}
                                {!tolib && ogoh && (
                                  <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-md font-medium">⚠ Yaqin</span>
                                )}
                              </div>
                            );
                          })()}
                        </Td>
                        <Td>
                          <div className="flex items-center gap-1">
                            <IconButton title="Tahrirlash" onClick={() => guruhOch(kurs.id, g)}>
                              <PencilIcon />
                            </IconButton>
                            <IconButton title="O'chirish" onClick={() => guruhOchirish(g.id)} variant="danger">
                              <TrashIcon />
                            </IconButton>
                          </div>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <p className="px-5 py-4 text-sm text-gray-400">Guruh yo'q</p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Kurs modal */}
      <Modal open={kursModal} onClose={() => setKursModal(false)} title={tahrirKurs ? "Kursni tahrirlash" : "Yangi kurs"}>
        <div className="space-y-4">
          <Input label="Kurs nomi *" placeholder="Ingliz tili" value={kursForm.nom}
            onChange={(e) => setKursForm({ ...kursForm, nom: e.target.value })} />
          <Input label="Tavsif" placeholder="Ixtiyoriy..." value={kursForm.tavsif}
            onChange={(e) => setKursForm({ ...kursForm, tavsif: e.target.value })} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Davomiyligi (oy) *" type="number" placeholder="3" value={kursForm.davomiyligi}
              onChange={(e) => setKursForm({ ...kursForm, davomiyligi: e.target.value })} />
            <Input label="Narxi (so'm/oy) *" type="number" placeholder="850000" value={kursForm.narxi}
              onChange={(e) => setKursForm({ ...kursForm, narxi: e.target.value })} />
            <Input label="Max talaba" type="number" placeholder="12" value={kursForm.maxTalaba}
              onChange={(e) => setKursForm({ ...kursForm, maxTalaba: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setKursModal(false)}>Bekor</Button>
            <Button variant="primary" onClick={kursSaqlash}
              disabled={!kursForm.nom || !kursForm.narxi || kursSaqlanmoqda}>
              {kursSaqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Guruh modal */}
      <Modal open={guruhModal} onClose={() => { setGuruhModal(false); setGuruhXato(null); }} title={tahrirGuruh ? "Guruhni tahrirlash" : "Yangi guruh"}>
        <div className="space-y-4">
          <Input label="Guruh nomi *" placeholder="G-1 (Du/Ch 14:00)" value={guruhForm.nom}
            onChange={(e) => setGuruhForm({ ...guruhForm, nom: e.target.value })} />
          <Select label="O'qituvchi" value={guruhForm.oqituvchiId}
            onChange={(e) => setGuruhForm({ ...guruhForm, oqituvchiId: e.target.value })}>
            <option value="">— Tanlang —</option>
            {oqituvchilar.map((o) => (
              <option key={o.id} value={o.id}>{o.user.name}</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Xona" value={guruhForm.xona}
              onChange={(e) => setGuruhForm({ ...guruhForm, xona: e.target.value })}>
              <option value="">— Tanlang —</option>
              {xonalar.filter((x) => x.sigim == null || true).map((x) => (
                <option key={x.id} value={x.nom}>
                  {x.nom}{x.sigim ? ` (${x.sigim} kishi)` : ""}
                </option>
              ))}
            </Select>
            <Input label="Vaqt *" placeholder="14:00 - 16:00" value={guruhForm.vaqt}
              onChange={(e) => setGuruhForm({ ...guruhForm, vaqt: e.target.value })} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Dars kunlari</p>
            <div className="flex gap-2 flex-wrap">
              {KUNLAR.map((kun) => (
                <button key={kun} type="button" onClick={() => kunToggle(kun)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    guruhForm.kunlar.includes(kun)
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-brand-400"
                  }`}>
                  {kun}
                </button>
              ))}
            </div>
          </div>
          {!tahrirGuruh && (
            <Input label="Boshlanish sanasi *" type="date" value={guruhForm.boshlanish}
              onChange={(e) => setGuruhForm({ ...guruhForm, boshlanish: e.target.value })} />
          )}
          {guruhXato && (
            <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              ⚠ {guruhXato}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setGuruhModal(false)}>Bekor</Button>
            <Button variant="primary" onClick={guruhSaqlash}
              disabled={!guruhForm.nom || !guruhForm.vaqt || guruhSaqlanmoqda}>
              {guruhSaqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

