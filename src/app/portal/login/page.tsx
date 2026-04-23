"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PortalLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("+998");
  const [parol, setParol] = useState("");
  const [showParol, setShowParol] = useState(false);
  const [xato, setXato] = useState("");
  const [yuklanyapti, setYuklanyapti] = useState(false);

  const kirish = async (e: React.FormEvent) => {
    e.preventDefault();
    setXato("");
    setYuklanyapti(true);

    const res = await signIn("student", {
      login,
      password: parol,
      redirect: false,
    });

    setYuklanyapti(false);

    if (res?.ok) {
      router.push("/portal");
    } else {
      setXato("Login yoki parol noto'g'ri");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">E</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">EduCRM</h1>
          <p className="text-sm text-gray-500 mt-1">O'quvchi kabineti</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Kirish</h2>

          <form onSubmit={kirish} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Login</label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="+998901234567"
                autoComplete="username"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Parol</label>
              <div className="relative">
                <input
                  type={showParol ? "text" : "password"}
                  value={parol}
                  onChange={(e) => setParol(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowParol((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showParol ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {xato && (
              <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
                {xato}
              </div>
            )}

            <button
              type="submit"
              disabled={yuklanyapti || login.length < 5 || !parol}
              className="w-full py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {yuklanyapti ? "Kirilmoqda..." : "Kirish"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Login va parolni o'quv markaz administratoridan oling
        </p>
      </div>
    </div>
  );
}
