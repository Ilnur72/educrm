"use client";
import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { formatSum, oyNomi } from "@/lib/utils";

type GuruhStat = { id: string; nom: string; kursNom: string; talabaSoni: number; darslarSoni: number };

type OqituvchiRow = {
  id: string; ism: string; email: string; telefon: string | null;
  mutaxassislik: string[];
  ishHaqiTuri: "FOIZ" | "SOATLIK" | "OYLIK";
  foiz: number | null; soatlik: number | null;
  guruhlar: GuruhStat[];
  oylikDaromad: number;
  hisoblangan: number;
  tolangan: number | null;
  tolanganMi: boolean;
  ishHaqId: string | null;
};

const TURI_LABEL: Record<string, string> = {
  FOIZ: "Foiz", SOATLIK: "Soatlik", OYLIK: "Oylik",
};

function Initials({ ism }: { ism: string }) {
  const parts = ism.trim().split(" ");
  const txt = parts.length >= 2 ? parts[0][0] + parts[1][0] : ism.slice(0, 2);
  return (
    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold shrink-0">
      {txt.toUpperCase()}
    </div>
  );
}

export default function IshHaqiPage() {
  const hozir = new Date();
  const [oy,  setOy]  = useState(hozir.getMonth() + 1);
  const [yil, setYil] = useState(hozir.getFullYear());
  const [rows, setRows]   = useState<OqituvchiRow[]>([]);
  const [yukl, setYukl]   = useState(false);

  // To'lash modal
  const [modal, setModal]       = useState(false);
  const [tanlangan, setTanlangan] = useState<OqituvchiRow | null>(null);
  const [summaInput, setSummaInput] = useState("");
  const [izohInput, setIzohInput]   = useState("");
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [xato, setXato]               = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setYukl(true);
    const ac = new AbortController();
    const res = await fetch(`/api/ish-haqi?oy=${oy}&yil=${yil}`, { signal: ac.signal });
    setRows(await res.json());
    setYukl(false);
  }, [oy, yil]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const ochModal = (row: OqituvchiRow) => {
    setTanlangan(row);
    setSummaInput(String(row.hisoblangan || ""));
    setIzohInput("");
    setXato(null);
    setModal(true);
  };

  const tolaish = async () => {
    if (!tanlangan || !summaInput) return;
    setSaqlanmoqda(true); setXato(null);
    const res = await fetch("/api/ish-haqi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oqituvchiId: tanlangan.id,
        summa: parseInt(summaInput),
        oy, yil,
        izoh: izohInput || null,
      }),
    });
    setSaqlanmoqda(false);
    if (!res.ok) {
      const d = await res.json();
      setXato(d.error ?? "Xatolik");
      return;
    }
    setModal(false);
    fetchData();
  };

  const tolanganSoni   = rows.filter(r => r.tolanganMi).length;
  const tolanmaganSoni = rows.filter(r => !r.tolanganMi).length;
  const jamilTolangan  = rows.filter(r => r.tolanganMi).reduce((s, r) => s + (r.tolangan ?? 0), 0);
  const jamilHisob     = rows.reduce((s, r) => s + r.hisoblangan, 0);

  return (
    <div>
      <Topbar title="O'qituvchilar ish haqi" />

      <div className="p-6 space-y-5">

        {/* Filter */}
        <div className="flex items-end gap-3">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Oy</p>
            <select value={oy} onChange={e => setOy(parseInt(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i+1} value={i+1}>{oyNomi(i+1)}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Yil</p>
            <select value={yil} onChange={e => setYil(parseInt(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Umumiy statistika */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Jami o'qituvchi", val: rows.length, color: "text-gray-900" },
            { label: "Hisoblangan jami", val: formatSum(jamilHisob), color: "text-gray-900" },
            { label: "To'langan", val: `${tolanganSoni} ta · ${formatSum(jamilTolangan)}`, color: "text-green-600" },
            { label: "To'lanmagan", val: `${tolanmaganSoni} ta`, color: tolanmaganSoni > 0 ? "text-amber-600" : "text-gray-400" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Jadval */}
        {yukl ? (
          <p className="text-center text-gray-400 py-12 text-sm">Yuklanmoqda...</p>
        ) : rows.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">O'qituvchilar topilmadi</p>
        ) : (
          <div className="space-y-3">
            {rows.map(row => (
              <div key={row.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-5">

                {/* Ism */}
                <div className="flex items-center gap-3 w-52 shrink-0">
                  <Initials ism={row.ism} />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{row.ism}</p>
                    <p className="text-xs text-gray-400 truncate">{row.mutaxassislik.join(", ") || "—"}</p>
                  </div>
                </div>

                {/* Shartnoma turi */}
                <div className="w-32 shrink-0">
                  <p className="text-[10px] text-gray-400 uppercase font-medium mb-0.5">Shartnoma</p>
                  <p className="text-xs font-medium text-gray-700">
                    {TURI_LABEL[row.ishHaqiTuri]}
                    {row.ishHaqiTuri === "FOIZ" && row.foiz ? ` · ${row.foiz}%` : ""}
                    {row.ishHaqiTuri === "SOATLIK" && row.soatlik ? ` · ${formatSum(row.soatlik)}/soat` : ""}
                    {row.ishHaqiTuri === "OYLIK" && row.soatlik ? ` · ${formatSum(row.soatlik)}` : ""}
                  </p>
                </div>

                {/* Guruhlar */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase font-medium mb-1">Guruhlar ({row.guruhlar.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {row.guruhlar.length === 0 ? (
                      <span className="text-xs text-gray-400">Guruh yo'q</span>
                    ) : row.guruhlar.map(g => (
                      <span key={g.id} className="text-[11px] bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md text-gray-600">
                        {g.nom} · {g.talabaSoni} o'q
                      </span>
                    ))}
                  </div>
                </div>

                {/* Oylik daromad */}
                <div className="w-32 shrink-0 text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-medium mb-0.5">Oylik tushum</p>
                  <p className="text-xs text-gray-600">{formatSum(row.oylikDaromad)}</p>
                </div>

                {/* Hisoblangan */}
                <div className="w-36 shrink-0 text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-medium mb-0.5">Hisoblangan</p>
                  <p className="text-base font-bold text-gray-900">{formatSum(row.hisoblangan)}</p>
                </div>

                {/* Holat + tugma */}
                <div className="w-36 shrink-0 flex flex-col items-end gap-2">
                  {row.tolanganMi ? (
                    <>
                      <Badge variant="green">To'langan</Badge>
                      <p className="text-xs text-gray-400">{formatSum(row.tolangan ?? 0)}</p>
                    </>
                  ) : (
                    <>
                      <Badge variant="amber">To'lanmagan</Badge>
                      <Button size="sm" variant="primary" onClick={() => ochModal(row)}>
                        To'lash
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* To'lash modal */}
      <Modal open={modal} onClose={() => setModal(false)}
        title={`Ish haqi to'lash — ${tanlangan?.ism}`}>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Oy:</span>
              <span className="font-medium">{oyNomi(oy)} {yil}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Hisoblangan:</span>
              <span className="font-semibold text-gray-900">{formatSum(tanlangan?.hisoblangan ?? 0)}</span>
            </div>
          </div>
          <Input
            label="To'lanadigan summa (so'm) *"
            type="number"
            value={summaInput}
            onChange={e => setSummaInput(e.target.value)}
            placeholder="2500000"
          />
          <Input
            label="Izoh (ixtiyoriy)"
            value={izohInput}
            onChange={e => setIzohInput(e.target.value)}
            placeholder="Naqd to'landi..."
          />
          {xato && (
            <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              ⚠ {xato}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModal(false)}>Bekor</Button>
            <Button variant="primary" onClick={tolaish}
              disabled={!summaInput || saqlanmoqda}>
              {saqlanmoqda ? "Saqlanmoqda..." : "To'lash"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
