"use client";
import { useState, useEffect } from "react";

type ProfilData = {
  id: string; ism: string; familiya: string; telefon: string;
  email: string | null; login: string | null;
};

export default function PortalProfilPage() {
  const [profil, setProfil] = useState<ProfilData | null>(null);
  const [parolForm, setParolForm] = useState({ joriy: "", yangi: "", tasdiq: "" });
  const [parolXato, setParolXato] = useState("");
  const [parolMuvaffaq, setParolMuvaffaq] = useState(false);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);

  useEffect(() => {
    fetch("/api/portal/me")
      .then((r) => r.json())
      .then(setProfil);
  }, []);

  const parolSaqlash = async (e: React.FormEvent) => {
    e.preventDefault();
    setParolXato("");
    setParolMuvaffaq(false);

    if (parolForm.yangi !== parolForm.tasdiq) {
      setParolXato("Yangi parollar mos kelmadi");
      return;
    }
    if (parolForm.yangi.length < 6) {
      setParolXato("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setSaqlanmoqda(true);
    const res = await fetch("/api/portal/profil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        joriyParol: parolForm.joriy,
        yangiParol: parolForm.yangi,
      }),
    });

    setSaqlanmoqda(false);

    if (res.ok) {
      setParolMuvaffaq(true);
      setParolForm({ joriy: "", yangi: "", tasdiq: "" });
    } else {
      const data = await res.json();
      setParolXato(data.error ?? "Xato yuz berdi");
    }
  };

  if (!profil) {
    return <div className="p-6 text-center text-gray-400 py-20">Yuklanmoqda...</div>;
  }

  const initials = `${profil.ism[0]}${profil.familiya[0]}`.toUpperCase();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Profil</h1>

      {/* Avatar + ism */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-700 flex-shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {profil.ism} {profil.familiya}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">O'quvchi</p>
          </div>
        </div>
      </div>

      {/* Ma'lumotlar */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-medium text-gray-900">Shaxsiy ma'lumotlar</h2>
        <div className="space-y-3">
          <Row label="Ism" value={profil.ism} />
          <Row label="Familiya" value={profil.familiya} />
          <Row label="Telefon" value={profil.telefon} mono />
          <Row label="Email" value={profil.email} />
          <Row label="Login" value={profil.login} mono />
        </div>
        <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
          Ma'lumotlarni o'zgartirish uchun administrator bilan bog'laning
        </p>
      </div>

      {/* Parol o'zgartirish */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-medium text-gray-900 mb-4">Parol o'zgartirish</h2>
        <form onSubmit={parolSaqlash} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Joriy parol</label>
            <input
              type="password"
              value={parolForm.joriy}
              onChange={(e) => setParolForm({ ...parolForm, joriy: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Yangi parol</label>
            <input
              type="password"
              value={parolForm.yangi}
              onChange={(e) => setParolForm({ ...parolForm, yangi: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Yangi parolni tasdiqlash</label>
            <input
              type="password"
              value={parolForm.tasdiq}
              onChange={(e) => setParolForm({ ...parolForm, tasdiq: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
              required
            />
          </div>

          {parolXato && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{parolXato}</div>
          )}
          {parolMuvaffaq && (
            <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg">
              Parol muvaffaqiyatli o'zgartirildi!
            </div>
          )}

          <button
            type="submit"
            disabled={saqlanmoqda || !parolForm.joriy || !parolForm.yangi || !parolForm.tasdiq}
            className="w-full py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saqlanmoqda ? "Saqlanmoqda..." : "Parolni o'zgartirish"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm text-gray-700 ${mono ? "font-mono" : ""}`}>{value ?? "—"}</span>
    </div>
  );
}
