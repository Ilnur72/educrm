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

const HAFTA = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];

function Avatar({ ism, familiya }: { ism: string; familiya: string }) {
  const colors = [
    "bg-purple-100 text-purple-700", "bg-teal-100 text-teal-700",
    "bg-blue-100 text-blue-700", "bg-amber-100 text-amber-700",
  ];
  const color = colors[(ism.charCodeAt(0) + familiya.charCodeAt(0)) % colors.length];
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
      {`${ism[0]}${familiya[0]}`.toUpperCase()}
    </div>
  );
}

function DayCell({ record }: { record: DayRecord | undefined }) {
  if (!record) {
    return (
      <td className="border-r border-gray-100 p-0">
        <div className="w-10 h-10" />
      </td>
    );
  }

  const { holat, baho } = record;

  if (holat === "KELMADI") {
    return (
      <td className="border-r border-gray-100 p-0 text-center">
        <div className="w-10 h-10 mx-auto flex items-center justify-center bg-red-400 rounded">
          <span className="text-white text-[11px] font-bold">YK</span>
        </div>
      </td>
    );
  }

  if (holat === "SABABLI") {
    return (
      <td className="border-r border-gray-100 p-0 text-center">
        <div className="w-10 h-10 mx-auto flex items-center justify-center bg-blue-300 rounded">
          <span className="text-white text-[11px] font-bold">S</span>
        </div>
      </td>
    );
  }

  // KELDI yoki KECH_KELDI — ball bor bo'lsa raqam, yo'q bo'lsa K
  if (baho !== null && baho !== undefined) {
    return (
      <td className="border-r border-gray-100 p-0 text-center">
        <div className="w-10 h-10 mx-auto flex items-center justify-center">
          <span className="text-gray-800 text-[13px] font-bold">{baho}</span>
        </div>
      </td>
    );
  }

  return (
    <td className="border-r border-gray-100 p-0 text-center">
      <div className="w-10 h-10 mx-auto flex items-center justify-center bg-green-400 rounded">
        <span className="text-white text-[11px] font-bold">K</span>
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
          #dp { position: fixed; top: 0; left: 0; width: 100%; padding: 8px; }
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
        {/* ─── Filter qatori ─── */}
        <div className="flex items-end justify-between mb-5 no-print">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Guruh</p>
            <select
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 min-w-52"
              value={guruhId}
              onChange={e => setGuruhId(e.target.value)}
            >
              <option value="">Guruh tanlang</option>
              {guruhlar.map(g => (
                <option key={g.id} value={g.id}>{g.kurs.nom} — {g.nom}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Oy</p>
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
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Yil</p>
              <select
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={yil} onChange={e => setYil(parseInt(e.target.value))}
              >
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

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

            {/* ─── Jadval ─── */}
            <div className="overflow-x-auto">
              <table className="text-xs border-collapse" style={{ minWidth: "max-content" }}>
                <thead>
                  {/* 1-qator: hafta kunlari */}
                  <tr className="border-b border-gray-100">
                    <th className="sticky left-0 z-20 bg-gray-50 w-8 py-2 border-r border-gray-100" />
                    <th className="sticky left-8 z-20 bg-gray-50 w-48 py-2 px-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-r border-gray-200">
                      O&apos;QUVCHI
                    </th>
                    {data.sanalar.map((s) => (
                      <th key={`h-${s.kun}`} className="w-10 py-2 text-center text-[10px] font-semibold text-gray-400 border-r border-gray-100 bg-gray-50">
                        {HAFTA[s.hafta]}
                      </th>
                    ))}
                    <th className="w-14 py-2 text-center text-[10px] font-semibold text-green-600 border-l border-gray-200 bg-gray-50 px-2">
                      Keldi
                    </th>
                    <th className="w-16 py-2 text-center text-[10px] font-semibold text-red-500 border-l border-gray-200 bg-gray-50 px-2">
                      Kelmadi
                    </th>
                    <th className="w-28 py-2 text-center text-[10px] font-semibold text-gray-500 border-l border-gray-200 bg-gray-50 px-2">
                      O&apos;rtacha baho
                    </th>
                  </tr>
                  {/* 2-qator: kun raqamlari */}
                  <tr className="border-b border-gray-200">
                    <th className="sticky left-0 z-20 bg-gray-50 w-8 border-r border-gray-100" />
                    <th className="sticky left-8 z-20 bg-gray-50 w-48 border-r border-gray-200" />
                    {data.sanalar.map((s) => (
                      <th key={`d-${s.kun}`} className="w-10 py-1.5 text-center text-[12px] font-bold text-gray-700 border-r border-gray-100 bg-gray-50">
                        {s.kun}
                      </th>
                    ))}
                    <th className="border-l border-gray-200 bg-gray-50" />
                    <th className="border-l border-gray-200 bg-gray-50" />
                    <th className="border-l border-gray-200 bg-gray-50" />
                  </tr>
                </thead>
                <tbody>
                  {data.talabalar.map((t, i) => (
                    <tr
                      key={t.id}
                      className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${
                        i % 2 === 1 ? "bg-gray-50/40" : "bg-white"
                      }`}
                    >
                      {/* # */}
                      <td className="sticky left-0 z-10 bg-inherit w-8 text-center text-[11px] text-gray-400 border-r border-gray-100 py-1">
                        {i + 1}
                      </td>
                      {/* Ism */}
                      <td className="sticky left-8 z-10 bg-inherit w-48 px-3 py-1 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <Avatar ism={t.ism} familiya={t.familiya} />
                          <span className="font-medium text-gray-800 text-[12px] truncate max-w-[110px]">
                            {t.ism} {t.familiya}
                          </span>
                        </div>
                      </td>
                      {/* Kunlik hujayralar */}
                      {data.sanalar.map((s) => (
                        <DayCell key={s.kun} record={t.kunlar[s.kun]} />
                      ))}
                      {/* Keldi */}
                      <td className="w-14 text-center border-l border-gray-200 py-1">
                        <span className="font-bold text-gray-700 text-[13px]">{t.keldi + t.kech}</span>
                      </td>
                      {/* Kelmadi */}
                      <td className="w-16 text-center border-l border-gray-200 py-1">
                        <span className={`font-bold text-[13px] ${t.kelmadi > 0 ? "text-red-500" : "text-gray-300"}`}>
                          {t.kelmadi || 0}
                        </span>
                      </td>
                      {/* O'rtacha baho */}
                      <td className="w-28 text-center border-l border-gray-200 py-1 px-2">
                        {t.ortachaBaho !== null ? (
                          <span className={`font-bold text-[13px] ${
                            t.ortachaBaho >= 80 ? "text-green-600" :
                            t.ortachaBaho >= 60 ? "text-amber-600" : "text-red-500"
                          }`}>
                            {t.ortachaBaho}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ─── Legend + Footer ─── */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
              {/* Legend */}
              <div className="flex items-center gap-4 mr-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-green-400 inline-flex items-center justify-center text-white font-bold text-[9px]">K</span>
                  Keldi
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded border border-gray-200 inline-flex items-center justify-center text-gray-700 font-bold text-[9px]">85</span>
                  Keldi + Baho
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-red-400 inline-flex items-center justify-center text-white font-bold text-[9px]">YK</span>
                  Kelmadi
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-blue-300 inline-flex items-center justify-center text-white font-bold text-[9px]">S</span>
                  Sababli
                </span>
              </div>
              {/* Stats */}
              <span className="ml-auto">
                Jami: <b className="text-gray-800">{data.talabalar.length}</b> o&apos;quvchi
              </span>
              <span>
                Dars kunlari: <b className="text-gray-800">{data.sanalar.length}</b>
              </span>
              {(() => {
                const jami  = data.talabalar.reduce((s, t) => s + t.keldi + t.kech + t.kelmadi + t.sababli, 0);
                const keldi = data.talabalar.reduce((s, t) => s + t.keldi + t.kech, 0);
                if (!jami) return null;
                const foiz = Math.round(keldi / jami * 100);
                return (
                  <span>Davomat: <b className={foiz >= 80 ? "text-green-600" : "text-amber-600"}>{foiz}%</b></span>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
