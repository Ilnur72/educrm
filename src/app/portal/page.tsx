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
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Xush kelibsiz */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-5 text-white">
        <p className="text-brand-100 text-sm mb-0.5">Xush kelibsiz!</p>
        <h1 className="text-xl lg:text-2xl font-bold mb-3">{name}</h1>
        {faolGuruh && (
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-brand-200 text-xs">Kurs</span>
              <span className="font-medium">{faolGuruh.kurs.nom}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-200 text-xs">Guruh</span>
              <span className="font-medium">{faolGuruh.nom}</span>
            </div>
            {faolGuruh.oqituvchi && (
              <div className="flex items-center gap-2">
                <span className="text-brand-200 text-xs">O'qituvchi</span>
                <span className="font-medium">{faolGuruh.oqituvchi.user.name}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stat kartalar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-3 lg:p-4">
          <p className="text-[11px] text-gray-400 mb-1 leading-tight">Bu oylik davomat</p>
          <p className={`text-xl lg:text-2xl font-bold ${
            davomiylik === null ? "text-gray-400"
            : davomiylik >= 80 ? "text-green-600"
            : davomiylik >= 60 ? "text-amber-500"
            : "text-red-500"
          }`}>
            {davomiylik !== null ? `${davomiylik}%` : "—"}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            {davomat?.keldi ?? 0}/{(davomat?.keldi ?? 0) + (davomat?.kelmadi ?? 0)} dars
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3 lg:p-4">
          <p className="text-[11px] text-gray-400 mb-1 leading-tight">O'rtacha ball</p>
          <p className={`text-xl lg:text-2xl font-bold ${
            davomat?.ortachaBaho == null ? "text-gray-400"
            : davomat.ortachaBaho >= 80 ? "text-green-600"
            : davomat.ortachaBaho >= 60 ? "text-amber-500"
            : "text-red-500"
          }`}>
            {davomat?.ortachaBaho ?? "—"}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">100 ball tizim</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3 lg:p-4">
          <p className="text-[11px] text-gray-400 mb-1 leading-tight">To'lov holati</p>
          <p className={`text-xl lg:text-2xl font-bold ${tolovHolat.ok ? "text-green-600" : "text-red-500"}`}>
            {tolovHolat.ok ? "✓" : "✗"}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">{tolovHolat.label}</p>
        </div>
      </div>

      {/* Bugungi dars */}
      {faolGuruh && (
        <div className={`rounded-xl border p-4 ${
          bugunDarsBor ? "bg-green-50 border-green-200" : "bg-white border-gray-100"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Bugungi dars</p>
              {bugunDarsBor ? (
                <p className="font-semibold text-green-700">Dars bor — {faolGuruh.vaqt}</p>
              ) : (
                <p className="font-medium text-gray-600">
                  Bugun dars yo'q
                  {keyingiKun && <span className="text-gray-400 font-normal"> · Keyingi: {keyingiKun}</span>}
                </p>
              )}
            </div>
            <div className="text-right text-sm text-gray-500">
              {faolGuruh.xona && <p className="text-xs">Xona: <span className="font-medium">{faolGuruh.xona}</span></p>}
              <p className="text-xs text-gray-400">{faolGuruh.kunlar.join(", ")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tezkor havolalar */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: "/portal/davomat",  icon: "◉", label: "Davomat",      sub: "Oylik hisobot" },
          { href: "/portal/tolovlar", icon: "◈", label: "To'lovlar",    sub: "To'lovlar tarixi" },
          { href: "/portal/jadval",   icon: "▣", label: "Dars jadvali", sub: "Haftalik jadval" },
          { href: "/portal/profil",   icon: "◍", label: "Profil",       sub: "Ma'lumotlar" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-xl border border-gray-100 p-4 active:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <p className="font-medium text-gray-900 text-sm">{item.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
