"use client";
import { useState, useEffect } from "react";
import { oyNomi, formatSum } from "@/lib/utils";

const TUR_LABEL: Record<string, string> = {
  NAQD: "Naqd", KARTA: "Karta", CLICK: "Click", PAYME: "Payme",
};

type Tolov = {
  id: string; summa: number; tur: string; oy: number; yil: number;
  izoh: string | null; qabulQildi: string | null; createdAt: string;
};

export default function PortalTolovlarPage() {
  const hozir = new Date();
  const [tolovlar, setTolovlar] = useState<Tolov[]>([]);
  const [yuklanyapti, setYuklanyapti] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/portal/tolovlar", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => { setTolovlar(d); setYuklanyapti(false); })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  const oyTolov = tolovlar.find(
    (t) => t.oy === hozir.getMonth() + 1 && t.yil === hozir.getFullYear()
  );

  const jami = tolovlar.reduce((s, t) => s + t.summa, 0);

  // Oylar bo'yicha guruhlash
  const oylarMap = new Map<string, Tolov[]>();
  for (const t of tolovlar) {
    const key = `${t.yil}-${t.oy}`;
    if (!oylarMap.has(key)) oylarMap.set(key, []);
    oylarMap.get(key)!.push(t);
  }
  const oylar = Array.from(oylarMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">To'lovlar tarixi</h1>

      {/* Bu oy holati */}
      <div className={`rounded-xl border p-4 ${
        oyTolov ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">
              {oyNomi(hozir.getMonth() + 1)} {hozir.getFullYear()}
            </p>
            <p className={`text-xl lg:text-2xl font-bold mt-1 ${oyTolov ? "text-green-700" : "text-red-600"}`}>
              {oyTolov ? `${formatSum(oyTolov.summa)} to'langan` : "To'lanmagan"}
            </p>
          </div>
          <div className={`text-3xl lg:text-4xl ${oyTolov ? "text-green-500" : "text-red-400"}`}>
            {oyTolov ? "✓" : "✗"}
          </div>
        </div>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{tolovlar.length}</p>
          <p className="text-xs text-gray-400 mt-1">Jami to'lovlar</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-xl font-bold text-green-600">{formatSum(jami)}</p>
          <p className="text-xs text-gray-400 mt-1">Jami summa</p>
        </div>
      </div>

      {/* To'lovlar ro'yxati */}
      {yuklanyapti ? (
        <div className="text-center text-gray-400 py-10">Yuklanmoqda...</div>
      ) : tolovlar.length === 0 ? (
        <div className="text-center text-gray-400 py-10">To'lovlar mavjud emas</div>
      ) : (
        <div className="space-y-4">
          {oylar.map(([key, oyTolovlar]) => {
            const [yilStr, oyStr] = key.split("-");
            return (
              <div key={key} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="font-medium text-gray-700">
                    {oyNomi(parseInt(oyStr))} {yilStr}
                  </p>
                </div>
                <div className="divide-y divide-gray-50">
                  {oyTolovlar.map((t) => (
                    <div key={t.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-900">{formatSum(t.summa)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {TUR_LABEL[t.tur]}
                          {t.qabulQildi && ` · ${t.qabulQildi}`}
                          {t.izoh && ` · ${t.izoh}`}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(t.createdAt).toLocaleDateString("uz-UZ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
