"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";

type Guruh = {
  id: string; nom: string; vaqt: string; xona: string | null;
  kunlar: string[]; faol: boolean; kursId: string;
  kurs: { id: string; nom: string; narxi: number; maxTalaba: number };
  oqituvchi: { id: string; user: { name: string } } | null;
  _count: { talabalar: number };
};

type KursOption      = { id: string; nom: string };
type OqituvchiOption = { id: string; user: { name: string } };
type XonaOption      = { id: string; nom: string; sigim: number | null };

const KUNLAR = ["Du", "Se", "Ch", "Pa", "Ju", "Sha", "Ya"];
const emptyForm = { nom: "", kursId: "", oqituvchiId: "", xona: "", kunlar: [] as string[], vaqt: "", boshlanish: "" };

const RANG_MAP: Record<string, string> = {
  "Du": "bg-blue-100 text-blue-700",
  "Se": "bg-purple-100 text-purple-700",
  "Ch": "bg-teal-100 text-teal-700",
  "Pa": "bg-amber-100 text-amber-700",
  "Ju": "bg-green-100 text-green-700",
  "Sha": "bg-rose-100 text-rose-700",
  "Ya": "bg-gray-100 text-gray-600",
};

function ToliganBar({ amalda, max }: { amalda: number; max: number }) {
  const foiz = Math.min(100, Math.round((amalda / max) * 100));
  const color = foiz >= 100 ? "bg-red-400" : foiz >= 80 ? "bg-amber-400" : "bg-green-400";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-gray-500">
        <span>{amalda}/{max} talaba</span>
        <span className={foiz >= 100 ? "text-red-500 font-medium" : foiz >= 80 ? "text-amber-600 font-medium" : "text-green-600"}>
          {foiz >= 100 ? "To'lgan" : foiz >= 80 ? "⚠ Yaqin" : `${max - amalda} bo'sh`}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${foiz}%` }} />
      </div>
    </div>
  );
}

export default function GuruhlarPage() {
  const router = useRouter();
  const [guruhlar, setGuruhlar]       = useState<Guruh[]>([]);
  const [kurslar, setKurslar]         = useState<KursOption[]>([]);
  const [oqituvchilar, setOqituvchilar] = useState<OqituvchiOption[]>([]);
  const [xonalar, setXonalar]         = useState<XonaOption[]>([]);
  const [yukl, setYukl]               = useState(true);
  const [filter, setFilter]           = useState(""); // kursId yoki ""
  const [modal, setModal]             = useState(false);
  const [form, setForm]               = useState(emptyForm);
  const [xato, setXato]               = useState<string | null>(null);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);

  const fetchGuruhlar = useCallback(async () => {
    const ac = new AbortController();
    const res = await fetch("/api/guruhlar?faol=true", { signal: ac.signal });
    const data = await res.json();
    setGuruhlar(data);
    setYukl(false);
    return () => ac.abort();
  }, []);

  useEffect(() => { fetchGuruhlar(); }, [fetchGuruhlar]);

  useEffect(() => {
    fetch("/api/kurslar").then(r => r.json()).then(d =>
      setKurslar(d.map((k: { id: string; nom: string }) => ({ id: k.id, nom: k.nom })))
    ).catch(() => {});
    fetch("/api/oqituvchilar").then(r => r.json()).then(setOqituvchilar).catch(() => {});
    fetch("/api/xonalar").then(r => r.json()).then(setXonalar).catch(() => {});
  }, []);

  const kunToggle = (kun: string) =>
    setForm(f => ({
      ...f,
      kunlar: f.kunlar.includes(kun) ? f.kunlar.filter(k => k !== kun) : [...f.kunlar, kun],
    }));

  const ochModal = () => { setForm(emptyForm); setXato(null); setModal(true); };

  const saqlash = async () => {
    if (!form.nom || !form.kursId || !form.vaqt || form.kunlar.length === 0) return;
    setSaqlanmoqda(true); setXato(null);
    const res = await fetch("/api/guruhlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: form.nom, kursId: form.kursId,
        oqituvchiId: form.oqituvchiId || null,
        xona: form.xona || null,
        kunlar: form.kunlar, vaqt: form.vaqt,
        boshlanish: form.boshlanish ? new Date(form.boshlanish).toISOString() : new Date().toISOString(),
      }),
    });
    setSaqlanmoqda(false);
    if (!res.ok) {
      const d = await res.json();
      setXato(d.error ?? "Xatolik yuz berdi");
      return;
    }
    setModal(false);
    fetchGuruhlar();
  };

  const filtered = filter ? guruhlar.filter(g => g.kursId === filter) : guruhlar;

  // Kurs nomi bo'yicha guruhlash
  const grouped = filtered.reduce<Record<string, Guruh[]>>((acc, g) => {
    const key = g.kurs.nom;
    if (!acc[key]) acc[key] = [];
    acc[key].push(g);
    return acc;
  }, {});

  return (
    <div>
      <Topbar
        title="Guruhlar"
        actions={<Button variant="primary" onClick={ochModal}>+ Yangi guruh</Button>}
      />

      <div className="p-6 space-y-5">
        {/* Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setFilter("")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              !filter ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            Hammasi <span className="ml-1 opacity-70">({guruhlar.length})</span>
          </button>
          {kurslar.map(k => {
            const soni = guruhlar.filter(g => g.kursId === k.id).length;
            if (!soni) return null;
            return (
              <button
                key={k.id}
                onClick={() => setFilter(k.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  filter === k.id ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {k.nom} <span className="ml-1 opacity-70">({soni})</span>
              </button>
            );
          })}
        </div>

        {yukl ? (
          <p className="text-center text-gray-400 py-16 text-sm">Yuklanmoqda...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">Guruh topilmadi</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([kursNom, list]) => (
              <div key={kursNom}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
                  {kursNom} · {list.length} ta guruh
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {list.map(g => {
                    const foiz = g._count.talabalar / g.kurs.maxTalaba;
                    return (
                      <div
                        key={g.id}
                        onClick={() => router.push(`/dashboard/guruhlar/${g.id}`)}
                        className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-brand-200 hover:shadow-sm transition-all cursor-pointer space-y-3"
                      >
                        {/* Sarlavha */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{g.nom}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{g.kurs.nom}</p>
                          </div>
                          <Badge variant={foiz >= 1 ? "red" : foiz >= 0.8 ? "amber" : "green"}>
                            {foiz >= 1 ? "To'lgan" : foiz >= 0.8 ? "Yaqin" : "Bo'sh"}
                          </Badge>
                        </div>

                        {/* Kunlar */}
                        <div className="flex flex-wrap gap-1">
                          {g.kunlar.map(k => (
                            <span key={k} className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${RANG_MAP[k] ?? "bg-gray-100 text-gray-600"}`}>
                              {k}
                            </span>
                          ))}
                          <span className="text-[11px] font-mono text-gray-500 px-1.5 py-0.5 bg-gray-50 rounded">
                            {g.vaqt}
                          </span>
                        </div>

                        {/* O'qituvchi + xona */}
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-300">👤</span>
                            <span className="truncate">{g.oqituvchi?.user.name ?? "O'qituvchi belgilanmagan"}</span>
                          </div>
                          {g.xona && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-300">📍</span>
                              <span>{g.xona}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress bar */}
                        <ToliganBar amalda={g._count.talabalar} max={g.kurs.maxTalaba} />

                        {/* Narx */}
                        <p className="text-[11px] text-gray-400 text-right">
                          {g.kurs.narxi.toLocaleString()} so'm/oy
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Yangi guruh modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Yangi guruh">
        <div className="space-y-4">
          <Select label="Kurs *" value={form.kursId}
            onChange={e => setForm({ ...form, kursId: e.target.value })}>
            <option value="">— Kurs tanlang —</option>
            {kurslar.map(k => <option key={k.id} value={k.id}>{k.nom}</option>)}
          </Select>
          <Input label="Guruh nomi *" placeholder="Python G-1" value={form.nom}
            onChange={e => setForm({ ...form, nom: e.target.value })} />
          <Select label="O'qituvchi" value={form.oqituvchiId}
            onChange={e => setForm({ ...form, oqituvchiId: e.target.value })}>
            <option value="">— Tanlang —</option>
            {oqituvchilar.map(o => <option key={o.id} value={o.id}>{o.user.name}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Xona" value={form.xona}
              onChange={e => setForm({ ...form, xona: e.target.value })}>
              <option value="">— Tanlang —</option>
              {xonalar.map(x => (
                <option key={x.id} value={x.nom}>
                  {x.nom}{x.sigim ? ` (${x.sigim} kishi)` : ""}
                </option>
              ))}
            </Select>
            <Input label="Vaqt *" placeholder="14:00" value={form.vaqt}
              onChange={e => setForm({ ...form, vaqt: e.target.value })} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Dars kunlari *</p>
            <div className="flex gap-2 flex-wrap">
              {KUNLAR.map(k => (
                <button key={k} type="button" onClick={() => kunToggle(k)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.kunlar.includes(k)
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"
                  }`}>
                  {k}
                </button>
              ))}
            </div>
          </div>
          <Input label="Boshlanish sanasi" type="date" value={form.boshlanish}
            onChange={e => setForm({ ...form, boshlanish: e.target.value })} />
          {xato && (
            <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              ⚠ {xato}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModal(false)}>Bekor</Button>
            <Button variant="primary" onClick={saqlash}
              disabled={!form.nom || !form.kursId || !form.vaqt || form.kunlar.length === 0 || saqlanmoqda}>
              {saqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
