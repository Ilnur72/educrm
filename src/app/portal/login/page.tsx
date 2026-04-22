"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PortalLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [parol, setParol] = useState("");
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
              <input
                type="password"
                value={parol}
                onChange={(e) => setParol(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                required
              />
            </div>

            {xato && (
              <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
                {xato}
              </div>
            )}

            <button
              type="submit"
              disabled={yuklanyapti || !login || !parol}
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
