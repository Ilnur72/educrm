"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";

type Guruh = {
  id: string; nom: string; vaqt: string; xona: string | null;
  kunlar: string[]; kurs: { nom: string };
  oqituvchi: { user: { name: string } } | null;
  _count: { talabalar: number };
};

const KUNLAR = [
  { kod: "Du", nom: "Dushanba" },
  { kod: "Se", nom: "Seshanba" },
  { kod: "Ch", nom: "Chorshanba" },
  { kod: "Pa", nom: "Payshanba" },
  { kod: "Ju", nom: "Juma" },
  { kod: "Sha", nom: "Shanba" },
  { kod: "Ya", nom: "Yakshanba" },
];

const RANG = [
  "bg-blue-50 border-blue-200 text-blue-900",
  "bg-purple-50 border-purple-200 text-purple-900",
  "bg-teal-50 border-teal-200 text-teal-900",
  "bg-amber-50 border-amber-200 text-amber-900",
  "bg-green-50 border-green-200 text-green-900",
  "bg-rose-50 border-rose-200 text-rose-900",
];

function vaqtSort(a: Guruh, b: Guruh) {
  return a.vaqt.localeCompare(b.vaqt);
}

export default function JadvalPage() {
  const router = useRouter();
  const [guruhlar, setGuruhlar] = useState<Guruh[]>([]);
  const [yukl, setYukl]         = useState(true);
  const [tanlangan, setTanlangan] = useState<string>("Du");

  useEffect(() => {
    fetch("/api/jadval")
      .then((r) => r.json())
      .then((d) => { setGuruhlar(d); setYukl(false); })
      .catch(() => setYukl(false));
  }, []);

  const bugunKod = ["Ya","Du","Se","Ch","Pa","Ju","Sha"][new Date().getDay()];

  const kunGuruhlar = (kod: string) =>
    guruhlar.filter((g) => g.kunlar.includes(kod)).sort(vaqtSort);

  const jami = guruhlar.length;

  return (
    <div>
      <Topbar
        title="Dars jadvali"
        actions={
          <button
            onClick={() => router.push("/dashboard/guruhlar")}
            className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            + Guruh qo'shish
          </button>
        }
      />

      <div className="p-6 space-y-4">
        <p className="text-sm text-gray-400">Jami: {jami} ta jadval</p>

        {/* Kun tablari */}
        <div className="flex gap-2 flex-wrap">
          {KUNLAR.map((k) => {
            const soni = kunGuruhlar(k.kod).length;
            if (soni === 0) return null;
            const active = tanlangan === k.kod;
            const bugun  = bugunKod === k.kod;
            return (
              <button
                key={k.kod}
                onClick={() => setTanlangan(k.kod)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  active
                    ? "bg-brand-600 text-white border-brand-600"
                    : bugun
                    ? "bg-brand-50 text-brand-700 border-brand-200"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {k.nom}
                <span className={`ml-1.5 text-xs ${active ? "opacity-80" : "text-gray-400"}`}>
                  ({soni})
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setTanlangan("jami")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              tanlangan === "jami"
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            Jami
          </button>
        </div>

        {yukl ? (
          <p className="text-gray-400 text-center py-16">Yuklanmoqda...</p>
        ) : (
          <div className="space-y-4">
            {(tanlangan === "jami" ? KUNLAR : KUNLAR.filter((k) => k.kod === tanlangan)).map((k) => {
              const list = kunGuruhlar(k.kod);
              if (list.length === 0) return null;
              return (
                <Card key={k.kod} className="overflow-hidden">
                  <div className={`px-4 py-2.5 flex items-center justify-between border-b ${
                    bugunKod === k.kod ? "bg-brand-50 border-brand-100" : "bg-gray-50 border-gray-100"
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        bugunKod === k.kod
                          ? "bg-brand-600 text-white"
                          : "bg-white text-gray-600 border border-gray-200"
                      }`}>
                        {k.kod}
                      </div>
                      <span className="font-semibold text-gray-800">{k.nom}</span>
                      {bugunKod === k.kod && (
                        <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                          Bugun
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{list.length} ta dars</span>
                  </div>

                  <div className="divide-y divide-gray-50">
                    {list.map((g, i) => {
                      const [soat, daqiqa] = g.vaqt.split(":").map(Number);
                      const tugash = `${String(soat + 1).padStart(2, "0")}:${String(daqiqa).padStart(2, "0")}`;
                      const rang = RANG[i % RANG.length];
                      return (
                        <div
                          key={g.id}
                          className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => router.push(`/dashboard/guruhlar/${g.id}`)}
                        >
                          {/* Vaqt */}
                          <div className="w-20 shrink-0 text-center">
                            <p className="text-sm font-semibold text-gray-800">{g.vaqt}</p>
                            <p className="text-xs text-gray-400">{tugash}</p>
                          </div>

                          {/* Rang chiziq */}
                          <div className={`w-1 h-10 rounded-full ${rang.split(" ")[0].replace("bg-", "bg-").replace("-50", "-400")}`} />

                          {/* Ma'lumot */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{g.kurs.nom}</p>
                            <p className="text-xs text-gray-500 truncate">{g.nom}</p>
                          </div>

                          {/* O'qituvchi */}
                          <div className="hidden sm:block text-xs text-gray-500 truncate max-w-[140px]">
                            {g.oqituvchi?.user.name ?? "—"}
                          </div>

                          {/* Xona */}
                          {g.xona && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                              <span>📍</span>
                              <span>{g.xona}</span>
                            </div>
                          )}

                          {/* Talabalar */}
                          <div className="text-xs text-gray-400 shrink-0">
                            {g._count.talabalar} o'q
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
