"use client";
import { useState, useEffect, useRef } from "react";
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

const HOLAT_RANG: Record<string, string> = {
  KELDI:      "bg-green-400 text-white",
  KELMADI:    "bg-red-400 text-white",
  KECH_KELDI: "bg-amber-400 text-white",
  SABABLI:    "bg-blue-300 text-white",
};

const HOLAT_QISQA: Record<string, string> = {
  KELDI: "+", KELMADI: "−", KECH_KELDI: "K", SABABLI: "S",
};

function Avatar({ ism, familiya }: { ism: string; familiya: string }) {
  const initials = `${ism[0]}${familiya[0]}`.toUpperCase();
  const colors = ["bg-purple-100 text-purple-700","bg-teal-100 text-teal-700","bg-blue-100 text-blue-700","bg-amber-100 text-amber-700"];
  const color  = colors[(ism.charCodeAt(0) + familiya.charCodeAt(0)) % colors.length];
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${color}`}>
      {initials}
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
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/guruhlar?faol=true")
      .then((r) => r.json())
      .then(setGuruhlar)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!guruhId) return;
    setYukl(true);
    fetch(`/api/hisobotlar/davomat?guruhId=${guruhId}&oy=${oy}&yil=${yil}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setYukl(false); })
      .catch(() => setYukl(false));
  }, [guruhId, oy, yil]);

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #davomat-print, #davomat-print * { visibility: visible; }
          #davomat-print { position: fixed; top: 0; left: 0; width: 100%; padding: 16px; font-size: 11px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print">
        <Topbar
          title="O'quvchilar davomati"
          actions={
            data && (
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                Sinov jadvalini chiqarish
              </button>
            )
          }
        />
      </div>

      <div className="p-6 space-y-4" id="davomat-print" ref={printRef}>
        {/* Filtrlar */}
        <div className="flex flex-wrap items-center gap-3 no-print">
          <select
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
            value={guruhId}
            onChange={(e) => setGuruhId(e.target.value)}
          >
            <option value="">Guruh tanlang</option>
            {guruhlar.map((g) => (
              <option key={g.id} value={g.id}>{g.kurs.nom} — {g.nom}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
            value={oy}
            onChange={(e) => setOy(parseInt(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{oyNomi(i + 1)}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
            value={yil}
            onChange={(e) => setYil(parseInt(e.target.value))}
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
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
        ) : !data ? (
          <p className="text-center text-gray-400 py-16">Ma'lumot topilmadi</p>
        ) : (
          <>
            {/* Sarlavha (printda ko'rinadi) */}
            <div className="hidden print:block mb-4">
              <h2 className="text-base font-bold">{data.kursNom} — {data.guruhNom}</h2>
              <p className="text-xs text-gray-500">{oyNomi(data.oy)} {data.yil} davomati</p>
            </div>

            {/* Davomat grid */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-48 sticky left-0 bg-white z-10">
                      O'quvchi
                    </th>
                    {data.sanalar.map((sana) => (
                      <th key={sana} className="px-1.5 py-3 font-medium text-gray-400 text-center min-w-[28px]">
                        {sana}
                      </th>
                    ))}
                    <th className="px-3 py-3 font-medium text-gray-500 text-center">Keldi</th>
                    <th className="px-3 py-3 font-medium text-gray-500 text-center">Kelmadi</th>
                    <th className="px-3 py-3 font-medium text-gray-500 text-center">Kech</th>
                    <th className="px-3 py-3 font-medium text-gray-500 text-center">Foiz</th>
                  </tr>
                </thead>
                <tbody>
                  {data.talabalar.map((t, i) => (
                    <tr
                      key={t.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        i % 2 === 0 ? "" : "bg-gray-50/50"
                      }`}
                    >
                      {/* Ism */}
                      <td className="px-4 py-2.5 sticky left-0 bg-inherit z-10">
                        <div className="flex items-center gap-2">
                          <Avatar ism={t.ism} familiya={t.familiya} />
                          <span className="font-medium text-gray-800 truncate max-w-[120px]">
                            {t.ism} {t.familiya}
                          </span>
                        </div>
                      </td>

                      {/* Kunlik davomat */}
                      {data.sanalar.map((sana) => {
                        const holat = t.kunlar[sana];
                        return (
                          <td key={sana} className="px-1 py-2.5 text-center">
                            {holat ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${HOLAT_RANG[holat]}`}>
                                {HOLAT_QISQA[holat]}
                              </span>
                            ) : (
                              <span className="text-gray-200">·</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Statistika */}
                      <td className="px-3 py-2.5 text-center font-semibold text-green-600">{t.keldi}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-red-500">{t.kelmadi}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-amber-500">{t.kech}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`font-bold ${
                          t.foiz === null ? "text-gray-300" :
                          t.foiz >= 80 ? "text-green-600" :
                          t.foiz >= 60 ? "text-amber-500" : "text-red-500"
                        }`}>
                          {t.foiz !== null ? `${t.foiz}%` : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Izoh */}
            <div className="flex gap-4 text-xs text-gray-500 no-print">
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded bg-green-400 inline-flex items-center justify-center text-white font-bold text-xs">+</span> Keldi
              </span>
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded bg-red-400 inline-flex items-center justify-center text-white font-bold text-xs">−</span> Kelmadi
              </span>
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded bg-amber-400 inline-flex items-center justify-center text-white font-bold text-xs">K</span> Kech keldi
              </span>
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded bg-blue-300 inline-flex items-center justify-center text-white font-bold text-xs">S</span> Sababli
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
