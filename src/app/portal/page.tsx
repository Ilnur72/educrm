"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const KUN_MAP: Record<string, number> = {
  ya: 0, du: 1, se: 2, ch: 3, pa: 4, ju: 5, sha: 6, sh: 6,
};
const HAFTA = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];

type GuruhInfo = {
  id: string; nom: string; vaqt: string; xona: string | null; kunlar: string[];
  kurs: { nom: string; narxi: number };
  oqituvchi: { user: { name: string } } | null;
};

type MeData = {
  id: string; ism: string; familiya: string;
  guruhlar: { guruh: GuruhInfo }[];
  tolovlar: { oy: number; yil: number; summa: number }[];
};

type DavomatData = {
  keldi: number; kelmadi: number; ortachaBaho: number | null;
  sanalar: { kun: number }[];
};

export default function PortalDashboard() {
  const { data: session } = useSession();
  const [me, setMe] = useState<MeData | null>(null);
  const [davomat, setDavomat] = useState<DavomatData | null>(null);

  const hozir = new Date();

  useEffect(() => {
    const ctrl = new AbortController();
    Promise.all([
      fetch("/api/portal/me", { signal: ctrl.signal }).then((r) => r.json()),
      fetch(`/api/portal/davomat?oy=${hozir.getMonth() + 1}&yil=${hozir.getFullYear()}`, {
        signal: ctrl.signal,
      }).then((r) => r.json()),
    ]).then(([meData, davData]) => {
      setMe(meData);
      setDavomat(davData);
    }).catch(() => {});
    return () => ctrl.abort();
  }, []);

  const faolGuruh = me?.guruhlar?.[0]?.guruh ?? null;
  const bugunHafta = hozir.getDay();

  // Bugun dars bormi?
  const bugunDarsBor = faolGuruh?.kunlar.some(
    (k) => KUN_MAP[k.toLowerCase()] === bugunHafta
  ) ?? false;

  // Keyingi dars
  const keyingiKun = (() => {
    if (!faolGuruh) return null;
    const kunlar = faolGuruh.kunlar
      .map((k) => KUN_MAP[k.toLowerCase()])
      .filter((n): n is number => n !== undefined)
      .sort((a, b) => a - b);
    for (let i = 1; i <= 7; i++) {
      const d = (bugunHafta + i) % 7;
      if (kunlar.includes(d)) return HAFTA[d];
    }
    return null;
  })();

  // To'lov holati
  const oyTolov = me?.tolovlar?.[0];
  const tolovHolat = !oyTolov
    ? { label: "To'lanmagan", ok: false }
    : { label: "To'langan", ok: true };

  // Davomat foiz
  const jamiDars = davomat?.sanalar?.length ?? 0;
  const davomiylik = jamiDars > 0
    ? Math.round(((davomat?.keldi ?? 0) / jamiDars) * 100)
    : null;

  const name = session?.user?.name ?? me ? `${me?.ism} ${me?.familiya}` : "";

  return (
    <div className="p-6 space-y-6">
      {/* Xush kelibsiz */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 text-white">
        <p className="text-brand-100 text-sm mb-1">Xush kelibsiz!</p>
        <h1 className="text-2xl font-bold mb-4">{name}</h1>
        {faolGuruh && (
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="bg-white/10 rounded-lg px-3 py-1.5">
              <span className="text-brand-200">Kurs: </span>
              <span className="font-medium">{faolGuruh.kurs.nom}</span>
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-1.5">
              <span className="text-brand-200">Guruh: </span>
              <span className="font-medium">{faolGuruh.nom}</span>
            </div>
            {faolGuruh.oqituvchi && (
              <div className="bg-white/10 rounded-lg px-3 py-1.5">
                <span className="text-brand-200">O'qituvchi: </span>
                <span className="font-medium">{faolGuruh.oqituvchi.user.name}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stat kartalar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">Bu oylik davomat</p>
          <p className={`text-2xl font-bold ${
            davomiylik === null ? "text-gray-400"
            : davomiylik >= 80 ? "text-green-600"
            : davomiylik >= 60 ? "text-amber-500"
            : "text-red-500"
          }`}>
            {davomiylik !== null ? `${davomiylik}%` : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {davomat?.keldi ?? 0} keldi / {davomat?.kelmadi ?? 0} kelmadi
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">O'rtacha ball</p>
          <p className={`text-2xl font-bold ${
            davomat?.ortachaBaho === null || davomat?.ortachaBaho === undefined
              ? "text-gray-400"
              : davomat.ortachaBaho >= 80 ? "text-green-600"
              : davomat.ortachaBaho >= 60 ? "text-amber-500"
              : "text-red-500"
          }`}>
            {davomat?.ortachaBaho !== null && davomat?.ortachaBaho !== undefined
              ? davomat.ortachaBaho
              : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">100 ball tizimida</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">To'lov holati</p>
          <p className={`text-2xl font-bold ${tolovHolat.ok ? "text-green-600" : "text-red-500"}`}>
            {tolovHolat.ok ? "✓" : "✗"}
          </p>
          <p className="text-xs text-gray-400 mt-1">{tolovHolat.label}</p>
        </div>
      </div>

      {/* Dars ma'lumoti */}
      {faolGuruh && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <h2 className="font-medium text-gray-900">Dars ma'lumoti</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-gray-400">Vaqt:</span>
              <span className="font-medium">{faolGuruh.vaqt}</span>
            </div>
            {faolGuruh.xona && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-gray-400">Xona:</span>
                <span className="font-medium">{faolGuruh.xona}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-gray-400">Kunlar:</span>
              <span className="font-medium">{faolGuruh.kunlar.join(", ")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Bugun:</span>
              {bugunDarsBor
                ? <span className="text-green-600 font-medium">Dars bor — {faolGuruh.vaqt}</span>
                : <span className="text-gray-500">Dars yo'q {keyingiKun ? `(keyingi: ${keyingiKun})` : ""}</span>
              }
            </div>
          </div>
        </div>
      )}

      {/* Tezkor havolalar */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/portal/davomat"
          className="bg-white rounded-xl border border-gray-100 p-4 hover:border-brand-200 hover:bg-brand-50 transition-colors group"
        >
          <div className="text-2xl mb-2">◉</div>
          <p className="font-medium text-gray-900 group-hover:text-brand-700">Davomat va baholar</p>
          <p className="text-xs text-gray-400 mt-0.5">Oylik davomat hisoboti</p>
        </Link>
        <Link
          href="/portal/tolovlar"
          className="bg-white rounded-xl border border-gray-100 p-4 hover:border-brand-200 hover:bg-brand-50 transition-colors group"
        >
          <div className="text-2xl mb-2">◈</div>
          <p className="font-medium text-gray-900 group-hover:text-brand-700">To'lovlar</p>
          <p className="text-xs text-gray-400 mt-0.5">To'lovlar tarixi</p>
        </Link>
        <Link
          href="/portal/jadval"
          className="bg-white rounded-xl border border-gray-100 p-4 hover:border-brand-200 hover:bg-brand-50 transition-colors group"
        >
          <div className="text-2xl mb-2">▣</div>
          <p className="font-medium text-gray-900 group-hover:text-brand-700">Dars jadvali</p>
          <p className="text-xs text-gray-400 mt-0.5">Haftalik jadval</p>
        </Link>
        <Link
          href="/portal/profil"
          className="bg-white rounded-xl border border-gray-100 p-4 hover:border-brand-200 hover:bg-brand-50 transition-colors group"
        >
          <div className="text-2xl mb-2">◍</div>
          <p className="font-medium text-gray-900 group-hover:text-brand-700">Profil</p>
          <p className="text-xs text-gray-400 mt-0.5">Ma'lumotlar va parol</p>
        </Link>
      </div>
    </div>
  );
}
