"use client";
import { useState, useEffect } from "react";

const HAFTA_FULL = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const KUN_MAP: Record<string, number> = {
  ya: 0, du: 1, se: 2, ch: 3, pa: 4, ju: 5, sha: 6, sh: 6,
};
const RANG_MAP: Record<string, string> = {
  du: "bg-blue-50 border-blue-200 text-blue-700",
  se: "bg-purple-50 border-purple-200 text-purple-700",
  ch: "bg-teal-50 border-teal-200 text-teal-700",
  pa: "bg-amber-50 border-amber-200 text-amber-700",
  ju: "bg-green-50 border-green-200 text-green-700",
  sh: "bg-rose-50 border-rose-200 text-rose-700",
  sha: "bg-rose-50 border-rose-200 text-rose-700",
  ya: "bg-gray-50 border-gray-200 text-gray-700",
};

type Guruh = {
  id: string; nom: string; vaqt: string; xona: string | null; kunlar: string[];
  kurs: { nom: string };
  oqituvchi: { user: { name: string } } | null;
};

export default function PortalJadvalPage() {
  const [guruhlar, setGuruhlar] = useState<Guruh[]>([]);
  const [yuklanyapti, setYuklanyapti] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/portal/jadval", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => { setGuruhlar(d); setYuklanyapti(false); })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  const bugunHafta = new Date().getDay();

  // Kunlar bo'yicha guruhlarni guruhlaymiz
  const jadval: Record<number, { guruh: Guruh; kun: string }[]> = {};
  for (const g of guruhlar) {
    for (const kun of g.kunlar) {
      const hafta = KUN_MAP[kun.toLowerCase()];
      if (hafta !== undefined) {
        if (!jadval[hafta]) jadval[hafta] = [];
        jadval[hafta].push({ guruh: g, kun: kun.toLowerCase() });
      }
    }
  }

  // Du dan Ya gacha tartib
  const tartib = [1, 2, 3, 4, 5, 6, 0];

  if (yuklanyapti) {
    return (
      <div className="p-6 text-center text-gray-400 py-20">Yuklanmoqda...</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Dars jadvali</h1>

      {guruhlar.length === 0 ? (
        <div className="text-center text-gray-400 py-20">Hech qanday guruhga biriktirilmagan</div>
      ) : (
        <div className="space-y-3">
          {tartib.map((hafta) => {
            const darslar = jadval[hafta];
            if (!darslar?.length) return null;
            const bugun = hafta === bugunHafta;
            return (
              <div
                key={hafta}
                className={`rounded-xl border p-4 ${
                  bugun ? "border-brand-300 bg-brand-50" : "border-gray-100 bg-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <h2 className={`font-semibold ${bugun ? "text-brand-700" : "text-gray-700"}`}>
                    {HAFTA_FULL[hafta]}
                  </h2>
                  {bugun && (
                    <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full">
                      Bugun
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {darslar.map(({ guruh, kun }) => (
                    <div
                      key={guruh.id}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${RANG_MAP[kun] ?? "bg-gray-50 border-gray-200"}`}
                    >
                      <div>
                        <p className="font-medium">{guruh.kurs.nom}</p>
                        <p className="text-xs opacity-70">{guruh.nom}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{guruh.vaqt}</p>
                        {guruh.xona && <p className="text-xs opacity-70">{guruh.xona}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* O'qituvchi */}
      {guruhlar.length > 0 && guruhlar[0].oqituvchi && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">O'qituvchi</p>
          <p className="font-medium text-gray-900">{guruhlar[0].oqituvchi.user.name}</p>
        </div>
      )}
    </div>
  );
}
