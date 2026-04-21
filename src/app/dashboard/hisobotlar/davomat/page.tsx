"use client";
import { useState, useEffect } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { oyNomi } from "@/lib/utils";

type DayRecord = { holat: string; baho: number | null };

type TalabaStat = {
  id: string; ism: string; familiya: string;
  kunlar: Record<number, DayRecord>;
  keldi: number; kelmadi: number; kech: number; sababli: number;
  ortachaBaho: number | null;
};

type Sana = { kun: number; hafta: number };

type Hisobot = {
  guruhNom: string; kursNom: string;
  oy: number; yil: number;
  sanalar: Sana[];
  talabalar: TalabaStat[];
};

type GuruhOption = { id: string; nom: string; kurs: { nom: string } };

// 0=Ya 1=Du 2=Se 3=Ch 4=Pa 5=Ju 6=Sh
const HAFTA = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];

function Avatar({ ism, familiya }: { ism: string; familiya: string }) {
  const colors = [
    "bg-purple-100 text-purple-700", "bg-teal-100 text-teal-700",
    "bg-blue-100 text-blue-700",   "bg-amber-100 text-amber-700",
  ];
  const color = colors[(ism.charCodeAt(0) + familiya.charCodeAt(0)) % colors.length];
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${color}`}>
      {`${ism[0]}${familiya[0]}`.toUpperCase()}
    </div>
  );
}

function DayCell({ record }: { record: DayRecord | undefined }) {
  if (!record) {
    return <td className="w-9 h-9 text-center border-r border-gray-100" />;
  }
  const { holat, baho } = record;

  if (holat === "KELMADI") {
    return (
      <td className="w-9 text-center border-r border-gray-100 p-0">
        <div className="mx-auto w-8 h-8 flex items-center justify-center rounded bg-red-100">
          <span className="text-red-600 text-[11px] font-semibold">YK</span>
        </div>
      </td>
    );
  }
  if (holat === "SABABLI") {
    return (
      <td className="w-9 text-center border-r border-gray-100 p-0">
        <div className="mx-auto w-8 h-8 flex items-center justify-center rounded bg-blue-100">
          <span className="text-blue-600 text-[11px] font-semibold">S</span>
        </div>
      </td>
    );
  }
  // KELDI or KECH_KELDI
  if (baho !== null && baho !== undefined) {
    return (
      <td className="w-9 text-center border-r border-gray-100 p-0">
        <div className="mx-auto w-8 h-8 flex items-center justify-center rounded bg-green-50">
          <span className="text-gray-800 text-[11px] font-bold">{baho}</span>
        </div>
      </td>
    );
  }
  return (
    <td className="w-9 text-center border-r border-gray-100 p-0">
      <div className="mx-auto w-8 h-8 flex items-center justify-center rounded bg-green-400">
        <span className="text-white text-[11px] font-semibold">K</span>
      </div>
    </td>
  );
}

export default function DavomatHisobotiPage() {
  const hozir = new Date();
  const [oy,  setOy]  = useState(hozir.getMonth() + 1);
  const [yil, setYil] = useState(hozir.getFullYear());
  const [guruhId, setGuruhId]   = useState("");
  const [guruhlar, setGuruhlar] = useState<GuruhOption[]>([]);
  const [data, setData]         = useState<Hisobot | null>(null);
  const [yukl, setYukl]         = useState(false);

  useEffect(() => {
    fetch("/api/guruhlar?faol=true")
      .then(r => r.json()).then(setGuruhlar).catch(() => {});
  }, []);

  useEffect(() => {
    if (!guruhId) return;
    setYukl(true); setData(null);
    fetch(`/api/hisobotlar/davomat?guruhId=${guruhId}&oy=${oy}&yil=${yil}`)
      .then(r => r.json())
      .then(d => { setData(d); setYukl(false); })
      .catch(() => setYukl(false));
  }, [guruhId, oy, yil]);

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #dp, #dp * { visibility: visible; }
          #dp { position: fixed; top: 0; left: 0; width: 100%; padding: 8px; font-size: 11px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print">
        <Topbar
          title="O'quvchilar davomati"
          actions={data && (
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              Chop etish
            </button>
          )}
        />
      </div>

      <div className="p-6" id="dp">
        {/* ─── Filter bar ─── */}
        <div className="flex items-center justify-between mb-4 no-print">
          {/* Chap: guruh */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Guruh</p>
            <select
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 min-w-48"
              value={guruhId}
              onChange={e => setGuruhId(e.target.value)}
            >
              <option value="">Guruh tanlang</option>
              {guruhlar.map(g => (
                <option key={g.id} value={g.id}>{g.kurs.nom} — {g.nom}</option>
              ))}
            </select>
          </div>
          {/* O'ng: oy + yil */}
          <div className="flex items-end gap-2">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Oy</p>
              <select
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={oy} onChange={e => setOy(parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i+1} value={i+1}>{oyNomi(i+1)}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Yil</p>
              <select
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={yil} onChange={e => setYil(parseInt(e.target.value))}
              >
                {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ─── States ─── */}
        {!guruhId ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm">Guruh tanlang</p>
          </div>
        ) : yukl ? (
          <p className="text-center text-gray-400 py-20 text-sm">Yuklanmoqda...</p>
        ) : !data || data.talabalar.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-sm">Bu oy uchun davomat ma&apos;lumoti yo&apos;q</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

            {/* Guruh sarlavhasi */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-gray-900">{data.guruhNom}</span>
                <span className="text-xs text-gray-400 ml-2">· {data.kursNom} · {oyNomi(data.oy)} {data.yil}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 no-print">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-green-400 inline-flex items-center justify-center text-white font-bold text-[9px]">K</span>
                  Keldi
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-green-50 border border-green-200 inline-flex items-center justify-center text-gray-700 font-bold text-[9px]">85</span>
                  Keldi + Ball
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-red-100 inline-flex items-center justify-center text-red-600 font-bold text-[9px]">YK</span>
                  Kelmadi
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-blue-100 inline-flex items-center justify-center text-blue-600 font-bold text-[9px]">S</span>
                  Sababli
                </span>
              </div>
            </div>

            {/* ─── Jadval ─── */}
            <div className="overflow-x-auto">
              <table className="text-xs border-collapse" style={{ minWidth: "max-content" }}>
                <thead>
                  {/* Qator 1: hafta kunlari */}
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="sticky left-0 bg-gray-50 z-10 w-10 border-r border-gray-100 py-2" />
                    <th className="sticky left-10 bg-gray-50 z-10 w-44 border-r border-gray-200 py-2 px-4 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      O&apos;QUVCHI
                    </th>
                    {data.sanalar.map((s) => (
                      <th key={s.kun} className="w-9 py-1.5 text-center text-[10px] font-semibold text-gray-400 border-r border-gray-100">
                        {HAFTA[s.hafta]}
                      </th>
                    ))}
                    <th className="w-14 py-2 text-center text-[10px] font-semibold text-gray-500 border-l border-gray-200 px-2">Keldi</th>
                    <th className="w-16 py-2 text-center text-[10px] font-semibold text-gray-500 border-l border-gray-200 px-2">Kelmadi</th>
                    <th className="w-24 py-2 text-center text-[10px] font-semibold text-gray-500 border-l border-gray-200 px-2">O&apos;rtacha baho</th>
                  </tr>
                  {/* Qator 2: kun raqamlari */}
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="sticky left-0 bg-gray-50 z-10 w-10 border-r border-gray-100" />
                    <th className="sticky left-10 bg-gray-50 z-10 w-44 border-r border-gray-200" />
                    {data.sanalar.map((s) => (
                      <th key={s.kun} className="w-9 py-1 text-center text-[11px] font-bold text-gray-600 border-r border-gray-100">
                        {s.kun}
                      </th>
                    ))}
                    <th className="border-l border-gray-200" />
                    <th className="border-l border-gray-200" />
                    <th className="border-l border-gray-200" />
                  </tr>
                </thead>
                <tbody>
                  {data.talabalar.map((t, i) => (
                    <tr
                      key={t.id}
                      className={`border-b border-gray-50 hover:bg-brand-50/20 transition-colors ${
                        i % 2 === 1 ? "bg-gray-50/30" : "bg-white"
                      }`}
                    >
                      {/* Raqam */}
                      <td className="sticky left-0 bg-inherit z-10 w-10 text-center text-xs text-gray-400 border-r border-gray-100 py-2">
                        {i + 1}
                      </td>
                      {/* Ism */}
                      <td className="sticky left-10 bg-inherit z-10 w-44 px-3 py-2 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <Avatar ism={t.ism} familiya={t.familiya} />
                          <span className="font-medium text-gray-800 truncate max-w-[110px] text-[12px]">
                            {t.ism} {t.familiya}
                          </span>
                        </div>
                      </td>
                      {/* Kunlik hujayralar */}
                      {data.sanalar.map((s) => (
                        <DayCell key={s.kun} record={t.kunlar[s.kun]} />
                      ))}
                      {/* Keldi */}
                      <td className="w-14 text-center border-l border-gray-200 py-2">
                        <span className="font-semibold text-gray-700 text-[12px]">{t.keldi + t.kech}</span>
                      </td>
                      {/* Kelmadi */}
                      <td className="w-16 text-center border-l border-gray-200 py-2">
                        <span className={`font-semibold text-[12px] ${t.kelmadi > 0 ? "text-red-500" : "text-gray-400"}`}>
                          {t.kelmadi}
                        </span>
                      </td>
                      {/* O'rtacha baho */}
                      <td className="w-24 text-center border-l border-gray-200 py-2 px-2">
                        {t.ortachaBaho !== null ? (
                          <span className={`font-bold text-[12px] ${
                            t.ortachaBaho >= 80 ? "text-green-600" :
                            t.ortachaBaho >= 60 ? "text-amber-600" : "text-red-500"
                          }`}>
                            {t.ortachaBaho}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-[12px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ─── Footer ─── */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-6 text-xs text-gray-500">
              <span>Jami o&apos;quvchilar: <b className="text-gray-800">{data.talabalar.length}</b></span>
              <span>Dars kunlari: <b className="text-gray-800">{data.sanalar.length}</b></span>
              {(() => {
                const bilan = data.talabalar.filter(t => t.ortachaBaho !== null);
                if (bilan.length === 0) return null;
                const ort = Math.round(bilan.reduce((s, t) => s + (t.ortachaBaho ?? 0), 0) / bilan.length * 10) / 10;
                return (
                  <span>O&apos;rtacha baho:
                    <b className={`ml-1 ${ort >= 80 ? "text-green-600" : ort >= 60 ? "text-amber-600" : "text-red-500"}`}>
                      {ort}
                    </b>
                  </span>
                );
              })()}
              {(() => {
                const jami = data.talabalar.reduce((s, t) => s + t.keldi + t.kech + t.kelmadi + t.sababli, 0);
                const keldi = data.talabalar.reduce((s, t) => s + t.keldi + t.kech, 0);
                if (jami === 0) return null;
                const foiz = Math.round(keldi / jami * 100);
                return (
                  <span>Davomat foizi:
                    <b className={`ml-1 ${foiz >= 80 ? "text-green-600" : "text-amber-600"}`}>{foiz}%</b>
                  </span>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
