"use client";
import { useState, useEffect } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardBody } from "@/components/ui/Card";
import { oyNomi } from "@/lib/utils";

type TalabaStat = {
  id: string; ism: string; familiya: string;
  kunlar: Record<number, string>;
  keldi: number; kelmadi: number; kech: number; sababli: number;
  foiz: number | null;
};

type Hisobot = {
  guruhNom: string; kursNom: string;
  oy: number; yil: number;
  sanalar: number[];
  talabalar: TalabaStat[];
};

type GuruhOption = { id: string; nom: string; kurs: { nom: string } };

const CELL: Record<string, { bg: string; label: string }> = {
  KELDI:      { bg: "bg-green-400",  label: "+" },
  KELMADI:    { bg: "bg-red-400",    label: "−" },
  KECH_KELDI: { bg: "bg-amber-400",  label: "K" },
  SABABLI:    { bg: "bg-blue-300",   label: "S" },
};

function Avatar({ ism, familiya }: { ism: string; familiya: string }) {
  const c = ["bg-purple-100 text-purple-700","bg-teal-100 text-teal-700",
             "bg-blue-100 text-blue-700","bg-amber-100 text-amber-700"];
  const color = c[(ism.charCodeAt(0) + familiya.charCodeAt(0)) % c.length];
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${color}`}>
      {`${ism[0]}${familiya[0]}`.toUpperCase()}
    </div>
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
    setYukl(true);
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
          #dp { position: fixed; top: 0; left: 0; width: 100%; padding: 12px; }
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
              Jadval chiqarish
            </button>
          )}
        />
      </div>

      <div className="p-6 space-y-4" id="dp">
        {/* Filtrlar */}
        <div className="flex flex-wrap items-center gap-3 no-print">
          <select
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
            value={guruhId}
            onChange={e => setGuruhId(e.target.value)}
          >
            <option value="">Guruh tanlang</option>
            {guruhlar.map(g => (
              <option key={g.id} value={g.id}>{g.kurs.nom} — {g.nom}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
            value={oy} onChange={e => setOy(parseInt(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i+1} value={i+1}>{oyNomi(i+1)}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
            value={yil} onChange={e => setYil(parseInt(e.target.value))}
          >
            {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {!guruhId ? (
          <Card>
            <CardBody className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-sm">Guruh tanlang</p>
            </CardBody>
          </Card>
        ) : yukl ? (
          <p className="text-center text-gray-400 py-16">Yuklanmoqda...</p>
        ) : !data || data.talabalar.length === 0 ? (
          <Card>
            <CardBody className="text-center py-16 text-gray-400">
              <p className="text-sm">Bu oy uchun davomat ma'lumoti yo'q</p>
            </CardBody>
          </Card>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Guruh sarlavhasi */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{data.guruhNom}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{data.kursNom} · {oyNomi(data.oy)} {data.yil}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 no-print">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-green-400 inline-block" /> Keldi
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Kelmadi
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> Kech
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-blue-300 inline-block" /> Sababli
                </span>
              </div>
            </div>

            {/* Jadval */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500 sticky left-0 bg-gray-50 z-10 w-44 border-b border-r border-gray-100">
                      O'quvchi
                    </th>
                    {data.sanalar.map((sana, idx) => (
                      <th
                        key={sana}
                        className={`py-2.5 font-medium text-gray-400 text-center w-8 border-b border-gray-100 ${
                          idx > 0 && idx % 5 === 0 ? "border-l border-gray-200" : ""
                        }`}
                      >
                        {sana}
                      </th>
                    ))}
                    <th className="py-2.5 font-medium text-gray-500 text-center w-16 border-b border-l border-gray-200 px-2">
                      Jami
                    </th>
                    <th className="py-2.5 font-medium text-gray-500 text-center w-24 border-b border-l border-gray-200 px-2">
                      O'rtacha davomati
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.talabalar.map((t, i) => (
                    <tr
                      key={t.id}
                      className={`border-b border-gray-50 hover:bg-brand-50/30 transition-colors ${
                        i % 2 === 1 ? "bg-gray-50/40" : ""
                      }`}
                    >
                      {/* Ism */}
                      <td className="px-4 py-2 sticky left-0 bg-inherit z-10 border-r border-gray-100">
                        <div className="flex items-center gap-2">
                          <Avatar ism={t.ism} familiya={t.familiya} />
                          <span className="font-medium text-gray-800 truncate max-w-[100px]">
                            {t.ism} {t.familiya}
                          </span>
                        </div>
                      </td>

                      {/* Kunlik */}
                      {data.sanalar.map((sana, idx) => {
                        const holat = t.kunlar[sana];
                        const cell  = holat ? CELL[holat] : null;
                        return (
                          <td
                            key={sana}
                            className={`py-2 text-center ${
                              idx > 0 && idx % 5 === 0 ? "border-l border-gray-200" : ""
                            }`}
                          >
                            {cell ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-white font-bold text-[10px] ${cell.bg}`}>
                                {cell.label}
                              </span>
                            ) : (
                              <span className="text-gray-200 text-base leading-none">·</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Jami */}
                      <td className="py-2 text-center border-l border-gray-200 px-2">
                        <span className="font-semibold text-gray-700">
                          {t.keldi + t.kech}/{t.keldi + t.kelmadi + t.kech + t.sababli}
                        </span>
                      </td>

                      {/* O'rtacha davomati */}
                      <td className="py-2 text-center border-l border-gray-200 px-2">
                        {t.foiz !== null ? (
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            t.foiz >= 80 ? "bg-green-100 text-green-700" :
                            t.foiz >= 60 ? "bg-amber-100 text-amber-700" :
                                           "bg-red-100 text-red-600"
                          }`}>
                            {t.foiz}%
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

            {/* Footer statistika */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex gap-6 text-xs text-gray-500">
              <span>Jami o'quvchilar: <b className="text-gray-800">{data.talabalar.length}</b></span>
              <span>Dars kunlari: <b className="text-gray-800">{data.sanalar.length}</b></span>
              <span>O'rtacha davomat:
                <b className={`ml-1 ${
                  (data.talabalar.reduce((s,t) => s + (t.foiz ?? 0), 0) / data.talabalar.length) >= 80
                    ? "text-green-600" : "text-amber-600"
                }`}>
                  {Math.round(data.talabalar.reduce((s,t) => s + (t.foiz ?? 0), 0) / data.talabalar.length)}%
                </b>
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
