"use client";
import { useState, useEffect, useRef } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { oyNomi, formatSum } from "@/lib/utils";

type GuruhStat = {
  id: string; nom: string; kursNom: string;
  oqituvchi: string | null; talabaSoni: number;
  maxTalaba: number; oylikTushum: number;
};

type LidManba = { manba: string; _count: number };

type Hisobot = {
  oy: number; yil: number;
  jamilTushum: number; tolovSoni: number;
  yangiTalabalar: number; chiqibKetganlar: number;
  yangiLidlar: number; yozilganLidlar: number; konversiya: number;
  davomatFoiz: number | null; davomatKeldi: number; davomatJami: number;
  tolovTurlari: Record<string, number>;
  topTolovchilar: { ism: string; summa: number }[];
  guruhlar: GuruhStat[];
  lidManba: LidManba[];
};

const MANBA_LABEL: Record<string, string> = {
  INSTAGRAM: "Instagram", TELEGRAM: "Telegram",
  GOOGLE: "Google", DOST_TAVSIYASI: "Do'st tavsiyasi", BOSHQA: "Boshqa",
};

const TOLOV_TUR_LABEL: Record<string, string> = {
  NAQD: "Naqd", KARTA: "Karta", CLICK: "Click", PAYME: "Payme",
};

export default function HisobotlarPage() {
  const hozir = new Date();
  const [oy,  setOy]  = useState(hozir.getMonth() + 1);
  const [yil, setYil] = useState(hozir.getFullYear());
  const [data, setData]   = useState<Hisobot | null>(null);
  const [yukl, setYukl]   = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setYukl(true);
    fetch(`/api/hisobotlar/oylik?oy=${oy}&yil=${yil}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setYukl(false); })
      .catch(() => setYukl(false));
  }, [oy, yil]);

  const print = () => window.print();

  const jamilLid = data?.lidManba.reduce((s, m) => s + m._count, 0) ?? 0;

  return (
    <>
      {/* Print uchun global stil */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: fixed; top: 0; left: 0; width: 100%; padding: 24px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print">
        <Topbar
          title="Hisobotlar va statistika"
          actions={
            <button
              onClick={print}
              className="px-5 py-2.5 text-sm font-semibold bg-card border-2 border-border rounded-xl hover:border-primary/40 hover:text-primary transition-all duration-200 shadow-soft"
            >
              PDF chiqarish
            </button>
          }
        />
      </div>

      <div className="p-6 space-y-6" id="print-area" ref={printRef}>
        {/* Sarlavha (faqat printda) */}
        <div className="hidden print:block mb-6 border-b pb-4">
          <h1 className="text-xl font-bold text-gray-900">EduCRM — Oylik hisobot</h1>
          <p className="text-sm text-gray-500 mt-1">
            {oyNomi(oy)} {yil} · Chiqarildi: {new Date().toLocaleDateString("uz-UZ")}
          </p>
        </div>

        {/* Oy/yil tanlash */}
        <div className="flex items-center gap-3 flex-wrap no-print">
          <select
            value={oy}
            onChange={(e) => setOy(parseInt(e.target.value))}
            className="px-4 py-2.5 text-sm border-2 border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{oyNomi(i + 1)}</option>
            ))}
          </select>
          <select
            value={yil}
            onChange={(e) => setYil(parseInt(e.target.value))}
            className="px-4 py-2.5 text-sm border-2 border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <div className="px-4 py-2 bg-primary/10 rounded-xl">
            <span className="text-sm font-medium text-primary">{oyNomi(oy)} {yil} hisoboti</span>
          </div>
        </div>

        {yukl ? (
          <p className="text-sm text-gray-400 text-center py-16">Yuklanmoqda...</p>
        ) : !data ? (
          <p className="text-sm text-gray-400 text-center py-16">Ma'lumot topilmadi</p>
        ) : (
          <>
            {/* Asosiy ko'rsatkichlar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
                <p className="text-sm font-medium text-muted-foreground">Jami tushum</p>
                <p className="text-2xl font-bold text-foreground mt-2">{formatSum(data.jamilTushum)}</p>
                <p className="text-sm text-muted-foreground mt-1">{data.tolovSoni} ta to'lov</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-5 shadow-soft">
                <p className="text-sm font-medium text-emerald-600">Yangi talabalar</p>
                <p className="text-2xl font-bold text-emerald-700 mt-2">+{data.yangiTalabalar}</p>
                <p className="text-sm text-red-500 mt-1">−{data.chiqibKetganlar} chiqib ketdi</p>
              </div>
              <div className="bg-violet-50 border border-violet-200/60 rounded-2xl p-5 shadow-soft">
                <p className="text-sm font-medium text-violet-600">Lid → Talaba</p>
                <p className="text-2xl font-bold text-violet-700 mt-2">{data.konversiya}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.yozilganLidlar}/{data.yangiLidlar} lid
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200/60 rounded-2xl p-5 shadow-soft">
                <p className="text-sm font-medium text-blue-600">Davomat</p>
                <p className="text-2xl font-bold text-blue-700 mt-2">
                  {data.davomatFoiz !== null ? `${data.davomatFoiz}%` : "—"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.davomatKeldi}/{data.davomatJami} dars
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* To'lov turlari */}
              <Card>
                <CardHeader><CardTitle>To'lov turlari</CardTitle></CardHeader>
                <CardBody className="space-y-3">
                  {Object.entries(data.tolovTurlari).length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">To'lov yo'q</p>
                  ) : (
                    Object.entries(data.tolovTurlari)
                      .sort((a, b) => b[1] - a[1])
                      .map(([tur, summa]) => {
                        const foiz = data.jamilTushum > 0
                          ? Math.round((summa / data.jamilTushum) * 100) : 0;
                        return (
                          <div key={tur}>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium text-foreground">{TOLOV_TUR_LABEL[tur] ?? tur}</span>
                              <span className="text-muted-foreground">
                                {formatSum(summa)} ({foiz}%)
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${foiz}%` }} />
                            </div>
                          </div>
                        );
                      })
                  )}
                </CardBody>
              </Card>

              {/* Lid manba */}
              <Card>
                <CardHeader>
                  <CardTitle>Lidlar manbasi</CardTitle>
                  <span className="text-xs text-gray-400">{data.yangiLidlar} ta jami</span>
                </CardHeader>
                <CardBody className="space-y-3">
                  {data.lidManba.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Lid yo'q</p>
                  ) : (
                    data.lidManba.map((m) => {
                      const foiz = jamilLid > 0 ? Math.round((m._count / jamilLid) * 100) : 0;
                      return (
                        <div key={m.manba}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-foreground">{MANBA_LABEL[m.manba] ?? m.manba}</span>
                            <span className="text-muted-foreground">{m._count} ({foiz}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${foiz}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Top to'lovchilar */}
            {data.topTolovchilar.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Top to'lovchilar</CardTitle></CardHeader>
                <Table>
                  <Thead>
                    <tr>
                      <Th>#</Th>
                      <Th>Talaba</Th>
                      <Th>Jami to'lov</Th>
                    </tr>
                  </Thead>
                  <Tbody>
                    {data.topTolovchilar.map((t, i) => (
                      <Tr key={i}>
                        <Td>
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                            i === 0 ? "bg-amber-100 text-amber-700" :
                            i === 1 ? "bg-slate-100 text-slate-700" :
                            i === 2 ? "bg-orange-100 text-orange-700" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {i + 1}
                          </span>
                        </Td>
                        <Td className="font-medium text-foreground">{t.ism}</Td>
                        <Td className="font-bold text-emerald-600">{formatSum(t.summa)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Card>
            )}

            {/* Guruhlar holati */}
            <Card>
              <CardHeader>
                <CardTitle>Guruhlar holati</CardTitle>
                <span className="text-xs text-gray-400">{data.guruhlar.length} ta faol guruh</span>
              </CardHeader>
              <Table>
                <Thead>
                  <tr>
                    <Th>Guruh</Th>
                    <Th>Kurs</Th>
                    <Th>O'qituvchi</Th>
                    <Th>Talabalar</Th>
                    <Th>To'lganlik</Th>
                    <Th>Oylik tushum</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {data.guruhlar
                    .sort((a, b) => b.oylikTushum - a.oylikTushum)
                    .map((g) => {
                      const foiz = Math.round((g.talabaSoni / g.maxTalaba) * 100);
                      return (
                        <Tr key={g.id}>
                          <Td className="font-medium text-foreground">{g.nom}</Td>
                          <Td className="text-muted-foreground">{g.kursNom}</Td>
                          <Td className="text-muted-foreground">{g.oqituvchi ?? <span className="text-muted-foreground/50">—</span>}</Td>
                          <Td>
                            <span className="font-semibold text-foreground">{g.talabaSoni}</span>
                            <span className="text-muted-foreground text-sm">/{g.maxTalaba}</span>
                          </Td>
                          <Td>
                            <div className="flex items-center gap-3">
                              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    foiz >= 100 ? "bg-red-400" :
                                    foiz >= 80  ? "bg-amber-400" : "bg-emerald-400"
                                  }`}
                                  style={{ width: `${Math.min(foiz, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-foreground">{foiz}%</span>
                            </div>
                          </Td>
                          <Td className="font-bold text-emerald-600">
                            {formatSum(g.oylikTushum)}
                          </Td>
                        </Tr>
                      );
                    })}
                </Tbody>
              </Table>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
