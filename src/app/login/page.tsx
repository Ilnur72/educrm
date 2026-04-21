"use client";
import { Suspense, useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [parol, setParol] = useState("");
  const [xato, setXato] = useState("");
  const [yuklanyapti, setYuklanyapti] = useState(false);

  const kirish = async (e: FormEvent) => {
    e.preventDefault();
    setXato("");
    setYuklanyapti(true);

    console.log("[v0] Login boshlandi, email:", email);

    try {
      const res = await signIn("credentials", {
        email,
        password: parol,
        redirect: false,
      });

      console.log("[v0] signIn response:", JSON.stringify(res, null, 2));

      setYuklanyapti(false);

      // NextAuth response tekshirish
      if (!res) {
        console.log("[v0] Response null/undefined");
        setXato("Server xatosi yuz berdi");
        return;
      }

      if (res.error) {
        console.log("[v0] Error:", res.error);
        setXato("Email yoki parol noto'g'ri");
        return;
      }

      if (res.ok) {
        console.log("[v0] Login muvaffaqiyatli, redirect qilinmoqda...");
        // Muvaffaqiyatli login - /dashboard ga o'tish
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("[v0] signIn xatosi:", err);
      setYuklanyapti(false);
      setXato("Tarmoq xatosi yuz berdi");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-card border-r border-border flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-glow">
              <span className="text-primary-foreground text-lg font-bold">E</span>
            </div>
            <div>
              <p className="text-xl font-semibold text-foreground">EduCRM</p>
              <p className="text-xs text-muted-foreground">Premium Edition</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground leading-tight text-balance">
              O'quv markazingizni professional darajada boshqaring
            </h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-md leading-relaxed">
              Talabalar, kurslar, to'lovlar va hisobotlarni bir joydan nazorat qiling.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Talabalar", desc: "Boshqaruvi" },
              { label: "Kurslar", desc: "Tashkil etish" },
              { label: "To'lovlar", desc: "Nazorati" },
              { label: "Hisobotlar", desc: "Tahlili" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-muted/30 border border-border rounded-lg p-4"
              >
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} EduCRM. Barcha huquqlar himoyalangan.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex flex-col items-center mb-10 lg:hidden">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-4 shadow-glow">
              <span className="text-primary-foreground text-xl font-bold">E</span>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">EduCRM</h1>
            <p className="text-sm text-muted-foreground mt-1">Premium Edition</p>
          </div>

          <div className="lg:mb-10">
            <h2 className="text-2xl font-semibold text-foreground text-center lg:text-left">
              Tizimga kirish
            </h2>
            <p className="text-sm text-muted-foreground mt-2 text-center lg:text-left">
              Davom etish uchun hisob ma'lumotlaringizni kiriting
            </p>
          </div>

          <form onSubmit={kirish} className="space-y-5 mt-8">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Email manzil
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@educrm.uz"
                  className="w-full pl-11 pr-4 py-3 text-sm border border-input rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Parol
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={parol}
                  onChange={(e) => setParol(e.target.value)}
                  placeholder="Parolingizni kiriting"
                  className="w-full pl-11 pr-4 py-3 text-sm border border-input rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {xato && (
              <div className="flex items-center gap-2 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in">
                <svg
                  className="w-4 h-4 text-destructive flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <p className="text-sm text-destructive">{xato}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={yuklanyapti || !email || !parol}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground text-sm font-medium rounded-lg transition-all duration-200 shadow-sm shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              {yuklanyapti ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Kirilmoqda...
                </span>
              ) : (
                "Tizimga kirish"
              )}
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-8 p-5 bg-card border border-dashed border-border rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Test ma'lumotlari
            </p>
            <div className="space-y-2">
              {[
                { email: "admin@educrm.uz", parol: "admin123", rol: "Administrator" },
                { email: "kamola@educrm.uz", parol: "oqituvchi123", rol: "O'qituvchi" },
              ].map((h) => (
                <button
                  key={h.email}
                  onClick={() => {
                    setEmail(h.email);
                    setParol(h.parol);
                    setXato("");
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {h.rol[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {h.rol}
                      </p>
                      <p className="text-xs text-muted-foreground">{h.email}</p>
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
