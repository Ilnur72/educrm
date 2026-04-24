"use client";
import { useState, useEffect } from "react";
import { oyNomi } from "@/lib/utils";

const HAFTA = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];

type DavomatData = {
  sanalar: { kun: number; hafta: number }[];
  kunlar:  Record<number, { holat: string; baho: number | null } | null>;
  keldi:   number;
  kelmadi: number;
  ortachaBaho: number | null;
};

function DayCell({ data }: { data: { holat: string; baho: number | null } | null | undefined }) {
  if (!data) {
    return (
      <div className="w-9 h-9 rounded-md bg-gray-50 flex items-center justify-center text-xs text-gray-300">
        —
      </div>
    );
  }
  if (data.holat === "KELMADI") {
    return (
      <div className="w-9 h-9 rounded-md bg-red-400 flex items-center justify-center text-xs font-bold text-white">
        YK
      </div>
    );
  }
  if (data.holat === "SABABLI") {
    return (
      <div className="w-9 h-9 rounded-md bg-blue-300 flex items-center justify-center text-xs font-bold text-white">
        S
      </div>
    );
  }
  if (data.baho !== null && data.baho !== undefined) {
    return (
      <div className="w-9 h-9 rounded-md bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-900">
        {data.baho}
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-md bg-green-400 flex items-center justify-center text-xs font-bold text-white">
      K
    </div>
  );
}

export default function PortalDavomatPage() {
  const hozir = new Date();
  const [oy,  setOy]  = useState(hozir.getMonth() + 1);
  const [yil, setYil] = useState(hozir.getFullYear());
  const [data, setData] = useState<DavomatData | null>(null);
  const [yuklanyapti, setYuklanyapti] = useState(true);

  useEffect(() => {
    setYuklanyapti(true);
    const ctrl = new AbortController();
    fetch(`/api/portal/davomat?oy=${oy}&yil=${yil}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => { setData(d); setYuklanyapti(false); })
      .catch(() => {});
    return () => ctrl.abort();
  }, [oy, yil]);

  const davomiylik = data && data.sanalar.length > 0
    ? Math.round((data.keldi / data.sanalar.length) * 100)
    : null;

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Davomat va baholar</h1>
        <div className="flex items-center gap-2">
          <select
            value={oy}
            onChange={(e) => setOy(parseInt(e.target.value))}
            className="flex-1 sm:flex-none px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{oyNomi(i + 1)}</option>
            ))}
          </select>
          <select
            value={yil}
            onChange={(e) => setYil(parseInt(e.target.value))}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-3 lg:p-4 text-center">
          <p className={`text-2xl lg:text-3xl font-bold ${
            davomiylik === null ? "text-gray-400"
            : davomiylik >= 80 ? "text-green-600"
            : davomiylik >= 60 ? "text-amber-500"
            : "text-red-500"
          }`}>
            {davomiylik !== null ? `${davomiylik}%` : "—"}
          </p>
          <p className="text-[10px] lg:text-xs text-gray-400 mt-1">Davomiylik</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 lg:p-4 text-center">
          <p className="text-xl lg:text-3xl font-bold text-gray-900">
            {data ? `${data.keldi}/${data.sanalar.length}` : "—"}
          </p>
          <p className="text-[10px] lg:text-xs text-gray-400 mt-1">Keldi / Jami</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 lg:p-4 text-center">
          <p className={`text-2xl lg:text-3xl font-bold ${
            !data?.ortachaBaho ? "text-gray-400"
            : data.ortachaBaho >= 80 ? "text-green-600"
            : data.ortachaBaho >= 60 ? "text-amber-500"
            : "text-red-500"
          }`}>
            {data?.ortachaBaho ?? "—"}
          </p>
          <p className="text-[10px] lg:text-xs text-gray-400 mt-1">O'rtacha ball</p>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-medium text-gray-900 mb-4">{oyNomi(oy)} {yil}</h2>

        {yuklanyapti ? (
          <div className="text-center text-gray-400 py-10">Yuklanmoqda...</div>
        ) : !data || data.sanalar.length === 0 ? (
          <div className="text-center text-gray-400 py-10">Bu oy dars ma'lumotlari yo'q</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs">
              <thead>
                <tr>
                  <th className="text-left px-3 py-2 text-gray-500 font-medium border border-gray-100 min-w-[60px]">Hafta</th>
                  {data.sanalar.map(({ kun, hafta }) => (
                    <th key={kun} className="px-1 py-1 border border-gray-100 text-center min-w-[44px]">
                      <div className="text-gray-400">{HAFTA[hafta]}</div>
                      <div className="text-gray-600 font-semibold">{kun}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 text-gray-500 font-medium border border-gray-100">
                    Holat
                  </td>
                  {data.sanalar.map(({ kun }) => (
                    <td key={kun} className="px-1 py-1 border border-gray-100 text-center">
                      <div className="flex justify-center">
                        <DayCell data={data.kunlar[kun]} />
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Izoh */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-green-400"></div> Keldi (K)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-red-400"></div> Kelmadi (YK)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-blue-300"></div> Sababli (S)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-white border border-gray-200"></div> Ball
        </div>
      </div>
    </div>
  );
}
