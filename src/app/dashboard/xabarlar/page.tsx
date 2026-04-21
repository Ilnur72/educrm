"use client";
import { useState, useEffect } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatSana } from "@/lib/utils";

type Xabar = {
  id: string; matn: string; holat: string; tur: string; createdAt: string;
};

type GuruhOption = { id: string; nom: string; kurs: { nom: string } };

export default function XabarlarPage() {
  const [sarlavha, setSarlavha] = useState("");
  const [matn, setMatn]         = useState("");
  const [kimga, setKimga]       = useState("barchaga");
  const [guruhId, setGuruhId]   = useState("");
  const [qarzdorlar, setQarzdorlar] = useState(false);
  const [yuborilmoqda, setYuborilmoqda] = useState(false);
  const [natija, setNatija]     = useState<{ jami: number; yuborildi: number } | null>(null);

  const [xabarlar, setXabarlar] = useState<Xabar[]>([]);
  const [guruhlar, setGuruhlar] = useState<GuruhOption[]>([]);

  useEffect(() => {
    fetch("/api/xabarlar").then((r) => r.json()).then(setXabarlar).catch(() => {});
    fetch("/api/guruhlar?faol=true").then((r) => r.json()).then(setGuruhlar).catch(() => {});
  }, []);

  const yuborish = async () => {
    if (!matn.trim()) return;
    setYuborilmoqda(true);
    setNatija(null);
    const res = await fetch("/api/xabarlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sarlavha: sarlavha.trim() || undefined,
        matn:     matn.trim(),
        kimga,
        guruhId:  kimga === "guruh" ? guruhId : undefined,
        faqatQarzdorlar: qarzdorlar,
      }),
    });
    const data = await res.json();
    setNatija(data);
    setYuborilmoqda(false);
    if (data.ok) {
      setSarlavha("");
      setMatn("");
      setQarzdorlar(false);
      fetch("/api/xabarlar").then((r) => r.json()).then(setXabarlar).catch(() => {});
    }
  };

  return (
    <div>
      <Topbar title="Xabarlar" />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yangi xabar */}
        <Card>
          <CardHeader><CardTitle>Yangi xabar</CardTitle></CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Sarlavha</label>
              <input
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Xabar sarlavhasi"
                value={sarlavha}
                onChange={(e) => setSarlavha(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Matn *</label>
              <textarea
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
                rows={4}
                placeholder="Xabar matni..."
                value={matn}
                onChange={(e) => setMatn(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Kimga</label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={kimga}
                onChange={(e) => setKimga(e.target.value)}
              >
                <option value="barchaga">Barcha o'quvchilarga</option>
                <option value="guruh">Guruh bo'yicha</option>
              </select>
            </div>

            {kimga === "guruh" && (
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Guruh</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                  value={guruhId}
                  onChange={(e) => setGuruhId(e.target.value)}
                >
                  <option value="">— Tanlang —</option>
                  {guruhlar.map((g) => (
                    <option key={g.id} value={g.id}>{g.kurs.nom} — {g.nom}</option>
                  ))}
                </select>
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-brand-600"
                checked={qarzdorlar}
                onChange={(e) => setQarzdorlar(e.target.checked)}
              />
              <span className="text-sm text-gray-600">Faqat qarzdorlarga</span>
            </label>

            {natija && (
              <div className={`p-3 rounded-lg text-sm ${natija.yuborildi > 0 ? "bg-green-50 text-green-700 border border-green-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                {natija.yuborildi > 0
                  ? `✅ ${natija.yuborildi} ta ota-onaga Telegram xabari yuborildi`
                  : `⚠️ Telegram ulangan ota-ona topilmadi (${natija.jami} ta talaba)`
                }
              </div>
            )}

            <Button
              variant="primary"
              onClick={yuborish}
              disabled={!matn.trim() || yuborilmoqda || (kimga === "guruh" && !guruhId)}
            >
              {yuborilmoqda ? "Yuborilmoqda..." : "Yuborish"}
            </Button>
          </CardBody>
        </Card>

        {/* Xabarlar tarixi */}
        <Card>
          <CardHeader>
            <CardTitle>Xabarlar</CardTitle>
            <span className="text-xs text-gray-400">{xabarlar.length} ta</span>
          </CardHeader>
          {xabarlar.length === 0 ? (
            <CardBody className="flex flex-col items-center justify-center py-16 text-gray-300">
              <span className="text-5xl mb-3">💬</span>
              <p className="text-sm">Xabar yo'q</p>
            </CardBody>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
              {xabarlar.map((x) => (
                <div key={x.id} className="px-4 py-3">
                  <p className="text-sm text-gray-800 line-clamp-2">{x.matn}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      x.holat === "YUBORILDI" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}>
                      {x.holat === "YUBORILDI" ? "Yuborildi" : x.holat}
                    </span>
                    <span className="text-xs text-gray-400">{formatSana(x.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
