"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";

import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import type { DavomatHolat } from "@/types";

type TalabaRow = { id: string; ism: string; familiya: string };
type Guruh = { id: string; nom: string };

const HOLAT_OPTIONS: { value: DavomatHolat; label: string; color: string; short: string }[] = [
  { value: "KELDI",      label: "Keldi",       color: "bg-green-100 text-green-700",  short: "K" },
  { value: "KELMADI",    label: "Kelmadi",     color: "bg-red-100 text-red-700",      short: "X" },
  { value: "KECH_KELDI", label: "Kech keldi",  color: "bg-amber-100 text-amber-700",  short: "KK" },
  { value: "SABABLI",    label: "Sababli",     color: "bg-blue-100 text-blue-700",    short: "S" },
];

function DavomatContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [guruhlar, setGuruhlar] = useState<Guruh[]>([]);
  const [guruhId, setGuruhId] = useState(searchParams.get("guruhId") ?? "");
  const [talabalar, setTalabalar] = useState<TalabaRow[]>([]);
  const [davomatlar, setDavomatlar] = useState<Record<string, DavomatHolat>>({});
  const [baholar, setBaholar]       = useState<Record<string, string>>({});
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
    setBaholar({});
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
        davomatlar: Object.entries(davomatlar).map(([talabaId, holat]) => ({
          talabaId,
          holat,
          baho: baholar[talabaId] ? parseInt(baholar[talabaId]) : null,
        })),
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
              <label className="text-xs font-medium text-gray-600 block mb-1">Sana</label>
              <input
                type="date"
                value={sana}
                onChange={(e) => setSana(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
              />
            </div>
            <div className="flex-1 min-w-48">
              <label className="text-xs font-medium text-gray-600 block mb-1">Dars mavzusi</label>
              <input
                type="text"
                placeholder="Ixtiyoriy..."
                value={mavzu}
                onChange={(e) => setMavzu(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
              />
            </div>
          </CardBody>
        </Card>

        {/* Statistika */}
        {talabalar.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-gray-900">{talabalar.length}</p>
              <p className="text-xs text-gray-500 mt-1">Jami</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-green-700">{keldiCount}</p>
              <p className="text-xs text-green-600 mt-1">Keldi</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-red-600">{kelmadyCount}</p>
              <p className="text-xs text-red-500 mt-1">Kelmadi</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-blue-700">
                {talabalar.length > 0 ? Math.round((keldiCount / talabalar.length) * 100) : 0}%
              </p>
              <p className="text-xs text-blue-600 mt-1">Davomat</p>
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
            <div className="divide-y divide-gray-50">
              {talabalar.map((talaba, i) => {
                const holat = davomatlar[talaba.id] ?? "KELDI";
                const config = HOLAT_OPTIONS.find((h) => h.value === holat)!;
                return (
                  <div key={talaba.id} className="flex items-center gap-4 px-5 py-3">
                    <span className="text-xs text-gray-400 w-6">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {talaba.ism} {talaba.familiya}
                      </p>
                    </div>
                    {/* Tezkor tugmalar */}
                    <div className="flex gap-1.5">
                      {HOLAT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => belgilash(talaba.id, opt.value)}
                          className={cn(
                            "w-10 h-8 rounded-lg text-xs font-medium transition-all",
                            holat === opt.value
                              ? `${opt.color} ring-2 ring-offset-1 ring-current`
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          )}
                          title={opt.label}
                        >
                          {opt.short}
                        </button>
                      ))}
                    </div>
                    {/* Ball (faqat kelganlarda) */}
                    {(holat === "KELDI" || holat === "KECH_KELDI") ? (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Ball"
                        value={baholar[talaba.id] ?? ""}
                        onChange={(e) => setBaholar(prev => ({ ...prev, [talaba.id]: e.target.value }))}
                        className="w-16 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 text-center"
                      />
                    ) : (
                      <div className="w-16" />
                    )}
                    {/* Holat badge */}
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium w-24 text-center", config.color)}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {guruhId && talabalar.length === 0 && (
          <div className="text-center py-16 text-gray-400">Bu guruhda talaba yo'q</div>
        )}

        {!guruhId && (
          <div className="text-center py-16 text-gray-400">Guruhni tanlang</div>
        )}
      </div>
    </div>
  );
}

export default function DavomatPage() {
  return (
    <Suspense>
      <DavomatContent />
    </Suspense>
  );
}
