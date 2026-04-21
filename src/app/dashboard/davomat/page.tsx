"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import type { DavomatHolat } from "@/types";

type TalabaRow = { id: string; ism: string; familiya: string };
type Guruh = { id: string; nom: string };

const HOLAT_OPTIONS: { value: DavomatHolat; label: string; color: string; short: string; ring: string }[] = [
  { value: "KELDI",      label: "Keldi",       color: "bg-emerald-100 text-emerald-700", ring: "ring-emerald-500", short: "K" },
  { value: "KELMADI",    label: "Kelmadi",     color: "bg-red-100 text-red-700",         ring: "ring-red-500",     short: "X" },
  { value: "KECH_KELDI", label: "Kech keldi",  color: "bg-amber-100 text-amber-700",     ring: "ring-amber-500",   short: "KK" },
  { value: "SABABLI",    label: "Sababli",     color: "bg-blue-100 text-blue-700",       ring: "ring-blue-500",    short: "S" },
];

export default function DavomatPage() {
  const { data: session } = useSession();
  const [guruhlar, setGuruhlar] = useState<Guruh[]>([]);
  const [guruhId, setGuruhId] = useState("");
  const [talabalar, setTalabalar] = useState<TalabaRow[]>([]);
  const [davomatlar, setDavomatlar] = useState<Record<string, DavomatHolat>>({});
  const [sana, setSana] = useState(new Date().toISOString().split("T")[0]);
  const [mavzu, setMavzu] = useState("");
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [saqlandi, setSaqlandi] = useState(false);

  useEffect(() => {
    if (!session) return;
    if (session.user.role === "OQITUVCHI") {
      fetch("/api/oqituvchi/guruhlar")
        .then((r) => r.json())
        .then((d) => setGuruhlar(d.guruhlar ?? []));
    } else {
      fetch("/api/guruhlar?faol=true")
        .then((r) => r.json())
        .then(setGuruhlar);
    }
  }, [session]);

  const fetchTalabalar = useCallback(async () => {
    if (!guruhId) return;
    const res = await fetch(`/api/talabalar?guruhId=${guruhId}&faol=true`);
    const data: TalabaRow[] = await res.json();
    setTalabalar(data);
    // Default: hammasi keldi
    const def: Record<string, DavomatHolat> = {};
    data.forEach((t) => { def[t.id] = "KELDI"; });
    setDavomatlar(def);
    setSaqlandi(false);
  }, [guruhId]);

  useEffect(() => { fetchTalabalar(); }, [fetchTalabalar]);

  const belgilash = (talabaId: string, holat: DavomatHolat) => {
    setDavomatlar((prev) => ({ ...prev, [talabaId]: holat }));
  };

  const saqlash = async () => {
    setSaqlanmoqda(true);
    await fetch("/api/davomat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guruhId,
        sana,
        mavzu,
        davomatlar: Object.entries(davomatlar).map(([talabaId, holat]) => ({ talabaId, holat })),
      }),
    });
    setSaqlanmoqda(false);
    setSaqlandi(true);
  };

  const keldiCount = Object.values(davomatlar).filter((h) => h === "KELDI").length;
  const kelmadyCount = Object.values(davomatlar).filter((h) => h === "KELMADI").length;

  return (
    <div>
      <Topbar
        title="Davomat belgilash"
        actions={
          <Button
            variant="primary"
            onClick={saqlash}
            disabled={!guruhId || talabalar.length === 0 || saqlanmoqda || saqlandi}
          >
            {saqlandi ? "✓ Saqlandi" : saqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Sozlamalar */}
        <Card>
          <CardBody className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-40">
              <Select
                label="Guruh"
                value={guruhId}
                onChange={(e) => { setGuruhId(e.target.value); setSaqlandi(false); }}
              >
                <option value="">Guruhni tanlang...</option>
                {guruhlar.map((g) => (
                  <option key={g.id} value={g.id}>{g.nom}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Sana</label>
              <input
                type="date"
                value={sana}
                onChange={(e) => setSana(e.target.value)}
                className="px-4 py-2.5 text-sm border-2 border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex-1 min-w-48">
              <label className="text-sm font-medium text-foreground block mb-2">Dars mavzusi</label>
              <input
                type="text"
                placeholder="Ixtiyoriy..."
                value={mavzu}
                onChange={(e) => setMavzu(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </CardBody>
        </Card>

        {/* Statistika */}
        {talabalar.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 text-center shadow-soft">
              <p className="text-3xl font-bold text-foreground">{talabalar.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Jami</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-5 text-center shadow-soft">
              <p className="text-3xl font-bold text-emerald-700">{keldiCount}</p>
              <p className="text-sm text-emerald-600 mt-1">Keldi</p>
            </div>
            <div className="bg-red-50 border border-red-200/60 rounded-2xl p-5 text-center shadow-soft">
              <p className="text-3xl font-bold text-red-600">{kelmadyCount}</p>
              <p className="text-sm text-red-500 mt-1">Kelmadi</p>
            </div>
            <div className="bg-blue-50 border border-blue-200/60 rounded-2xl p-5 text-center shadow-soft">
              <p className="text-3xl font-bold text-blue-700">
                {talabalar.length > 0 ? Math.round((keldiCount / talabalar.length) * 100) : 0}%
              </p>
              <p className="text-sm text-blue-600 mt-1">Davomat</p>
            </div>
          </div>
        )}

        {/* Talabalar ro'yxati */}
        {guruhId && talabalar.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Talabalar ({talabalar.length} kishi)</CardTitle>
              <div className="flex gap-2">
                <button
                  className="text-xs text-green-600 hover:text-green-700 underline"
                  onClick={() => {
                    const all: Record<string, DavomatHolat> = {};
                    talabalar.forEach((t) => { all[t.id] = "KELDI"; });
                    setDavomatlar(all);
                  }}
                >
                  Hammasi keldi
                </button>
              </div>
            </CardHeader>
            <div className="divide-y divide-border">
              {talabalar.map((talaba, i) => {
                const holat = davomatlar[talaba.id] ?? "KELDI";
                const config = HOLAT_OPTIONS.find((h) => h.value === holat)!;
                return (
                  <div key={talaba.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                    <span className="text-xs text-muted-foreground font-mono w-6">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {talaba.ism} {talaba.familiya}
                      </p>
                    </div>
                    {/* Tezkor tugmalar */}
                    <div className="flex gap-2">
                      {HOLAT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => belgilash(talaba.id, opt.value)}
                          className={cn(
                            "w-11 h-9 rounded-xl text-xs font-semibold transition-all duration-200",
                            holat === opt.value
                              ? `${opt.color} ring-2 ring-offset-2 ${opt.ring}`
                              : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                          )}
                          title={opt.label}
                        >
                          {opt.short}
                        </button>
                      ))}
                    </div>
                    {/* Holat badge */}
                    <span className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold w-28 text-center", config.color)}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {guruhId && talabalar.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <p className="text-muted-foreground">Bu guruhda talaba yo'q</p>
          </div>
        )}

        {!guruhId && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <path d="m9 16 2 2 4-4"/>
              </svg>
            </div>
            <p className="text-muted-foreground">Guruhni tanlang</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Davomat belgilash uchun avval guruhni tanlang</p>
          </div>
        )}
      </div>
    </div>
  );
}
