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

type XarajatTur = "IJARA" | "KOMMUNAL" | "REKLAMA" | "MAOSH" | "JIHOZLAR" | "BOSHQA";
type Xarajat = { id: string; tur: XarajatTur; summa: number; sana: string; izoh: string | null };
const XARAJAT_TUR_LABEL: Record<XarajatTur, string> = {
  IJARA: "Ijara", KOMMUNAL: "Kommunal", REKLAMA: "Reklama",
  MAOSH: "Maosh", JIHOZLAR: "Jihozlar", BOSHQA: "Boshqa",
};

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
  const [data, setData]           = useState<Hisobot | null>(null);
  const [xarajatlar, setXarajatlar] = useState<Xarajat[]>([]);
  const [yukl, setYukl]           = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setYukl(true);
    Promise.all([
      fetch(`/api/hisobotlar/oylik?oy=${oy}&yil=${yil}`).then((r) => r.json()),
      fetch(`/api/xarajatlar?oy=${oy}&yil=${yil}`).then((r) => r.json()),
    ]).then(([hisobot, xar]) => {
      setData(hisobot);
      setXarajatlar(xar);
      setYukl(false);
    }).catch(() => setYukl(false));
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
              className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:border-brand-400 hover:text-brand-600 transition-colors"
            >
              PDF chiqarish ↓
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
        <div className="flex items-center gap-3 no-print">
          <select
            value={oy}
            onChange={(e) => setOy(parseInt(e.target.value))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{oyNomi(i + 1)}</option>
            ))}
          </select>
          <select
            value={yil}
            onChange={(e) => setYil(parseInt(e.target.value))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500 font-medium">
            {oyNomi(oy)} {yil} hisoboti
          </span>
        </div>

        {yukl ? (
          <p className="text-sm text-gray-400 text-center py-16">Yuklanmoqda...</p>
        ) : !data ? (
          <p className="text-sm text-gray-400 text-center py-16">Ma'lumot topilmadi</p>
        ) : (
          <>
            {/* Asosiy ko'rsatkichlar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardBody>
                  <p className="text-xs text-gray-500">Jami tushum</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatSum(data.jamilTushum)}</p>
                  <p className="text-xs text-gray-400 mt-1">{data.tolovSoni} ta to'lov</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs text-gray-500">Yangi talabalar</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">+{data.yangiTalabalar}</p>
                  <p className="text-xs text-red-400 mt-1">−{data.chiqibKetganlar} chiqib ketdi</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs text-gray-500">Lid → Talaba</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{data.konversiya}%</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {data.yozilganLidlar}/{data.yangiLidlar} lid
                  </p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs text-gray-500">Davomat</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {data.davomatFoiz !== null ? `${data.davomatFoiz}%` : "—"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {data.davomatKeldi}/{data.davomatJami} dars
                  </p>
                </CardBody>
              </Card>
            </div>

            {/* P&L — Daromad / Xarajat / Foyda */}
            {(() => {
              const jamiXarajat = xarajatlar.reduce((s, x) => s + x.summa, 0);
              const foyda = data.jamilTushum - jamiXarajat;
              const turStat = (Object.keys(XARAJAT_TUR_LABEL) as XarajatTur[])
                .map((tur) => ({ tur, summa: xarajatlar.filter((x) => x.tur === tur).reduce((s, x) => s + x.summa, 0) }))
                .filter((t) => t.summa > 0);
              return (
                <Card>
                  <CardHeader><CardTitle>Moliyaviy natija (P&L)</CardTitle></CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-xs text-green-600">Daromad</p>
                        <p className="text-xl font-bold text-green-700 mt-1">{formatSum(data.jamilTushum)}</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-xs text-red-600">Xarajat</p>
                        <p className="text-xl font-bold text-red-600 mt-1">{formatSum(jamiXarajat)}</p>
                      </div>
                      <div className={`rounded-xl p-4 ${foyda >= 0 ? "bg-brand-50" : "bg-amber-50"}`}>
                        <p className={`text-xs ${foyda >= 0 ? "text-brand-600" : "text-amber-600"}`}>Foyda</p>
                        <p className={`text-xl font-bold mt-1 ${foyda >= 0 ? "text-brand-700" : "text-amber-600"}`}>
                          {foyda >= 0 ? "+" : ""}{formatSum(foyda)}
                        </p>
                      </div>
                    </div>
                    {turStat.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500">Xarajat tafsiloti</p>
                        {turStat.map(({ tur, summa }) => (
                          <div key={tur} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                            <span className="text-gray-600">{XARAJAT_TUR_LABEL[tur]}</span>
                            <span className="font-medium text-red-600">{formatSum(summa)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {xarajatlar.length === 0 && (
                      <p className="text-xs text-gray-400 mt-2">
                        Bu oy xarajat kiritilmagan.{" "}
                        <a href="/dashboard/xarajatlar" className="text-brand-600 hover:underline">Xarajatlar →</a>
                      </p>
                    )}
                  </CardBody>
                </Card>
              );
            })()}

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
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">{TOLOV_TUR_LABEL[tur] ?? tur}</span>
                              <span className="text-gray-500">
                                {formatSum(summa)} ({foiz}%)
                              </span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full">
                              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${foiz}%` }} />
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
                          <div className="flex justify-between text-sm mb-1">
                            <span>{MANBA_LABEL[m.manba] ?? m.manba}</span>
                            <span className="text-gray-500">{m._count} ({foiz}%)</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full">
                            <div className="h-full bg-brand-600 rounded-full" style={{ width: `${foiz}%` }} />
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
                        <Td className="text-gray-400 text-xs">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                        </Td>
                        <Td className="font-medium">{t.ism}</Td>
                        <Td className="font-semibold text-green-700">{formatSum(t.summa)}</Td>
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
                          <Td className="font-medium">{g.nom}</Td>
                          <Td className="text-gray-500">{g.kursNom}</Td>
                          <Td className="text-gray-500">{g.oqituvchi ?? "—"}</Td>
                          <Td>
                            <span className="font-medium">{g.talabaSoni}</span>
                            <span className="text-gray-400 text-xs">/{g.maxTalaba}</span>
                          </Td>
                          <Td>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                                <div
                                  className={`h-full rounded-full ${
                                    foiz >= 100 ? "bg-red-400" :
                                    foiz >= 80  ? "bg-amber-400" : "bg-green-400"
                                  }`}
                                  style={{ width: `${Math.min(foiz, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">{foiz}%</span>
                            </div>
                          </Td>
                          <Td className="font-medium text-green-700">
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
