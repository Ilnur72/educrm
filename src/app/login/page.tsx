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
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8">
            <span className="text-3xl font-bold">E</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            O'quv markazingizni<br />
            professional boshqaring
          </h1>
          
          <p className="text-lg text-white/80 mb-8 max-w-md">
            EduCRM - talabalar, kurslar, to'lovlar va hisobotlarni bitta tizimda oson boshqarish imkoniyati.
          </p>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span className="text-white/90">Talabalar va guruhlarni boshqarish</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <path d="M2 10h20"/>
                </svg>
              </div>
              <span className="text-white/90">To'lovlar va qarzdorlarni kuzatish</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18"/>
                  <path d="m19 9-5 5-4-4-3 3"/>
                </svg>
              </div>
              <span className="text-white/90">Batafsil hisobotlar va statistika</span>
            </div>
          </div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-soft-lg">
              <span className="text-white text-2xl font-bold">E</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">EduCRM</h1>
            <p className="text-muted-foreground mt-1">O'quv markaz tizimi</p>
          </div>

          <div className="text-center mb-8 hidden lg:block">
            <h2 className="text-2xl font-bold text-foreground">Xush kelibsiz!</h2>
            <p className="text-muted-foreground mt-2">Tizimga kirish uchun ma'lumotlaringizni kiriting</p>
          </div>

          <div className="bg-card rounded-3xl border border-border p-8 shadow-soft-lg">
            <form onSubmit={kirish} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email manzil</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
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
                    className="w-full pl-12 pr-4 py-3 text-sm border-2 border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Parol</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={parol}
                    onChange={(e) => setParol(e.target.value)}
                    placeholder="Parolingizni kiriting"
                    className="w-full pl-12 pr-4 py-3 text-sm border-2 border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {xato && (
                <div className="flex items-center gap-3 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <div className="p-1 bg-destructive/20 rounded-full">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-destructive">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <p className="text-sm text-destructive font-medium">{xato}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={yuklanyapti || !email || !parol}
                className="w-full py-3.5 px-4 gradient-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg"
              >
                {yuklanyapti ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Kirilmoqda...
                  </span>
                ) : "Kirish"}
              </button>
            </form>
          </div>

          {/* Demo accounts */}
          <div className="mt-6 p-5 bg-card rounded-2xl border border-dashed border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Test loginlar</p>
            <div className="space-y-2">
              {[
                { email: "admin@educrm.uz",  parol: "admin123",      rol: "Admin", icon: "shield" },
                { email: "kamola@educrm.uz", parol: "oqituvchi123",  rol: "O'qituvchi", icon: "user" },
              ].map((h) => (
                <button
                  key={h.email}
                  onClick={() => { setEmail(h.email); setParol(h.parol); setXato(""); }}
                  className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl hover:bg-accent transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {h.icon === "shield" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{h.rol}</span>
                    <p className="text-xs text-muted-foreground">{h.email}</p>
                  </div>
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
