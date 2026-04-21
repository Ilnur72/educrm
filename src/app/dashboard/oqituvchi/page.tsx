"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { formatSum, oyNomi } from "@/lib/utils";

type Guruh = {
  id: string; nom: string; vaqt: string; xona: string | null;
  kunlar: string[];
  kurs: { nom: string; narxi: number };
  _count: { talabalar: number };
  darslar: { sana: string }[];
};

type IshHaq = { id: string; summa: number; oy: number; yil: number; tolanganMi: boolean; izoh: string | null };
type IshHaqiInfo = { ishHaqiTuri: string; foiz: number | null; soatlik: number | null; ishHaqlar: IshHaq[] };

// JS getDay(): 0=Ya,1=Du,2=Se,3=Ch,4=Pa,5=Ju,6=Sha
const HAFTA_KODLAR = ["Ya","Du","Se","Ch","Pa","Ju","Sha"];
const HAFTA_NOMLAR = ["Yakshanba","Dushanba","Seshanba","Chorshanba","Payshanba","Juma","Shanba"];

const KUN_RANG: Record<string, string> = {
  Du: "bg-blue-100 text-blue-700", Se: "bg-purple-100 text-purple-700",
  Ch: "bg-teal-100 text-teal-700",  Pa: "bg-amber-100 text-amber-700",
  Ju: "bg-green-100 text-green-700", Sha: "bg-rose-100 text-rose-700",
  Ya: "bg-gray-100 text-gray-600",
};

export default function OqituvchiKabinetPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [guruhlar, setGuruhlar] = useState<Guruh[]>([]);
  const [ishHaqi, setIshHaqi]   = useState<IshHaqiInfo | null>(null);
  const [tab, setTab]           = useState<"jadval"|"guruhlar"|"ishhaqi">("jadval");

  useEffect(() => {
    const ac1 = new AbortController(), ac2 = new AbortController();
    fetch("/api/oqituvchi/guruhlar", { signal: ac1.signal })
      .then(r => r.json()).then(d => setGuruhlar(d.guruhlar ?? [])).catch(() => {});
    fetch("/api/oqituvchi/ish-haqi", { signal: ac2.signal })
      .then(r => r.json()).then(setIshHaqi).catch(() => {});
    return () => { ac1.abort(); ac2.abort(); };
  }, []);

  const hozir      = new Date();
  const bugunIdx   = hozir.getDay(); // 0-6
  const bugunKod   = HAFTA_KODLAR[bugunIdx];
  const bugungilar = guruhlar.filter(g =>
    g.kunlar.some(k => k.toLowerCase() === bugunKod.toLowerCase())
  );
  const jamiTalaba   = guruhlar.reduce((s, g) => s + g._count.talabalar, 0);
  const oxirgiIshHaq = ishHaqi?.ishHaqlar[0];

  // Haftalik jadval — Du..Sha tartibida
  const haftaKunlar = [1,2,3,4,5,6,0].map(idx => ({
    kod: HAFTA_KODLAR[idx],
    nom: HAFTA_NOMLAR[idx],
    bugun: idx === bugunIdx,
    guruhlar: guruhlar
      .filter(g => g.kunlar.some(k => k.toLowerCase() === HAFTA_KODLAR[idx].toLowerCase()))
      .sort((a,b) => a.vaqt.localeCompare(b.vaqt)),
  })).filter(k => k.guruhlar.length > 0);

  return (
    <div>
      <Topbar title={`Salom, ${session?.user.name ?? "O'qituvchi"} 👋`} />

      <div className="p-6 space-y-5">

        {/* ── Stat kartalar ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 font-medium">Guruhlarim</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{guruhlar.length}</p>
            <p className="text-xs text-gray-400 mt-1">faol guruh</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 font-medium">Jami o'quvchilar</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{jamiTalaba}</p>
            <p className="text-xs text-gray-400 mt-1">barcha guruhlar</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 font-medium">
              {oxirgiIshHaq ? `${oyNomi(oxirgiIshHaq.oy)} ish haqi` : "Ish haqi"}
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {oxirgiIshHaq ? formatSum(oxirgiIshHaq.summa) : "—"}
            </p>
            {oxirgiIshHaq && (
              <div className="mt-1">
                <Badge variant={oxirgiIshHaq.tolanganMi ? "green" : "amber"}>
                  {oxirgiIshHaq.tolanganMi ? "To'langan" : "Kutilmoqda"}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* ── Bugungi darslar ── */}
        {bugungilar.length > 0 && (
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5">
            <p className="font-semibold text-brand-800 text-sm mb-3">
              Bugun — {HAFTA_NOMLAR[bugunIdx]} · {bugungilar.length} ta dars
            </p>
            <div className="space-y-2">
              {bugungilar
                .sort((a,b) => a.vaqt.localeCompare(b.vaqt))
                .map(g => (
                  <div key={g.id} className="bg-white border border-brand-100 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                        <span className="text-brand-700 font-bold text-sm">{g.vaqt.slice(0,5)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{g.nom}</p>
                        <p className="text-xs text-gray-400">
                          {g.kurs.nom}{g.xona ? ` · ${g.xona}` : ""} · {g._count.talabalar} o'quvchi
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/dashboard/davomat?guruhId=${g.id}`)}
                      className="px-3 py-1.5 bg-brand-600 text-white text-xs font-medium rounded-lg hover:bg-brand-700 transition-colors shrink-0"
                    >
                      Davomat belgilash →
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 px-5">
            <div className="flex gap-1">
              {([
                { key: "jadval",   label: "Haftalik jadval" },
                { key: "guruhlar", label: `Guruhlarim (${guruhlar.length})` },
                { key: "ishhaqi",  label: "Ish haqi tarixi" },
              ] as const).map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    tab === t.key
                      ? "border-brand-600 text-brand-600"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Haftalik jadval */}
          {tab === "jadval" && (
            <div className="p-5">
              {haftaKunlar.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Hali guruh biriktirilmagan</p>
              ) : (
                <div className="space-y-3">
                  {haftaKunlar.map(k => (
                    <div key={k.kod}
                      className={`rounded-xl border p-4 ${k.bugun ? "border-brand-200 bg-brand-50/50" : "border-gray-100"}`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          k.bugun ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600"
                        }`}>{k.kod}</div>
                        <span className={`text-sm font-semibold ${k.bugun ? "text-brand-800" : "text-gray-700"}`}>
                          {k.nom}
                        </span>
                        {k.bugun && (
                          <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">Bugun</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {k.guruhlar.map(g => (
                          <button key={g.id}
                            onClick={() => router.push(`/dashboard/guruhlar/${g.id}`)}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-left hover:border-brand-300 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-800">{g.nom}</p>
                            <p className="text-xs text-gray-400">
                              {g.vaqt}{g.xona ? ` · ${g.xona}` : ""} · {g._count.talabalar} o'q
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Guruhlarim */}
          {tab === "guruhlar" && (
            guruhlar.length === 0 ? (
              <CardBody>
                <p className="text-sm text-gray-400 text-center py-8">Hali guruh biriktirilmagan</p>
              </CardBody>
            ) : (
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {guruhlar.map(g => (
                  <div key={g.id}
                    onClick={() => router.push(`/dashboard/guruhlar/${g.id}`)}
                    className="border border-gray-100 rounded-xl p-4 hover:border-brand-200 hover:shadow-sm transition-all cursor-pointer space-y-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{g.nom}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{g.kurs.nom}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {g.kunlar.map(k => (
                        <span key={k} className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${KUN_RANG[k] ?? "bg-gray-100 text-gray-600"}`}>
                          {k}
                        </span>
                      ))}
                      <span className="text-[11px] font-mono text-gray-500 px-1.5 py-0.5 bg-gray-50 rounded">{g.vaqt}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{g._count.talabalar} o'quvchi</span>
                      {g.xona && <span>📍 {g.xona}</span>}
                    </div>
                    <div className="text-xs text-gray-400">
                      Oxirgi dars: {g.darslar[0]
                        ? new Date(g.darslar[0].sana).toLocaleDateString("uz-UZ", { day:"numeric", month:"long" })
                        : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Ish haqi tarixi */}
          {tab === "ishhaqi" && (
            !ishHaqi?.ishHaqlar.length ? (
              <CardBody>
                <p className="text-sm text-gray-400 text-center py-8">Ish haqi tarixi yo'q</p>
              </CardBody>
            ) : (
              <Table>
                <Thead>
                  <tr>
                    <Th>Oy / Yil</Th>
                    <Th>Summa</Th>
                    <Th>Holat</Th>
                    <Th>Izoh</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {ishHaqi.ishHaqlar.map((ih) => (
                    <Tr key={ih.id}>
                      <Td className="font-medium">{oyNomi(ih.oy)} {ih.yil}</Td>
                      <Td className="font-semibold">{formatSum(ih.summa)}</Td>
                      <Td>
                        <Badge variant={ih.tolanganMi ? "green" : "amber"}>
                          {ih.tolanganMi ? "To'langan" : "Kutilmoqda"}
                        </Badge>
                      </Td>
                      <Td className="text-gray-400 text-sm">{ih.izoh ?? "—"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )
          )}
        </div>
      </div>
    </div>
  );
}
