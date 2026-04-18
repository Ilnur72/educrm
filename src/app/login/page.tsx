"use client";
import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail]       = useState("");
  const [parol, setParol]       = useState("");
  const [xato, setXato]         = useState("");
  const [yuklanyapti, setYuklanyapti] = useState(false);

  const kirish = async (e: FormEvent) => {
    e.preventDefault();
    setXato("");
    setYuklanyapti(true);

    const res = await signIn("credentials", {
      email,
      password: parol,
      redirect: false,
    });

    setYuklanyapti(false);

    if (res?.error) {
      setXato("Email yoki parol noto'g'ri");
      return;
    }

    const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center mb-3">
            <span className="text-white text-xl font-bold">E</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">EduCRM</h1>
          <p className="text-sm text-gray-400 mt-0.5">O'quv markaz tizimiga kiring</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <form onSubmit={kirish} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@educrm.uz"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Parol
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={parol}
                onChange={(e) => setParol(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
              />
            </div>

            {xato && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-xl">
                <span className="text-red-500 text-xs">✕</span>
                <p className="text-xs text-red-600">{xato}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={yuklanyapti || !email || !parol}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors mt-2"
            >
              {yuklanyapti ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Kirilmoqda...
                </span>
              ) : (
                "Kirish"
              )}
            </button>
          </form>
        </div>

        {/* Hint */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-dashed border-gray-200">
          <p className="text-xs text-gray-400 font-medium mb-2">Test loginlar:</p>
          <div className="space-y-1.5">
            {[
              { email: "admin@educrm.uz",  parol: "admin123",       rol: "Admin" },
              { email: "kamola@educrm.uz", parol: "oqituvchi123",   rol: "O'qituvchi" },
            ].map((h) => (
              <button
                key={h.email}
                onClick={() => { setEmail(h.email); setParol(h.parol); setXato(""); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="text-xs text-gray-500 group-hover:text-gray-700">
                  <span className="font-medium text-gray-700">{h.rol}</span>
                  {" · "}{h.email}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
