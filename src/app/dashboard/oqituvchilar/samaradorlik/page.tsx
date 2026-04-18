"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";

type GuruhStat = {
  id: string; nom: string; kursNom: string;
  talabaSoni: number; maxTalaba: number;
  davomatFoiz: number | null; tolovFoiz: number | null;
};

type OqituvchiStat = {
  id: string; ism: string; email: string;
  mutaxassislik: string[];
  guruhSoni: number; jamiTalabalar: number;
  davomatFoiz: number | null; tolovFoiz: number | null;
  guruhlar: GuruhStat[];
};

function FoizBar({ foiz }: { foiz: number | null }) {
  if (foiz === null) return <span className="text-gray-300 text-xs">—</span>;
  const colors = {
    green: "bg-green-500",
    amber: "bg-amber-400",
    red:   "bg-red-400",
    blue:  "bg-blue-500",
  };
  const color = foiz >= 80 ? colors.green : foiz >= 60 ? colors.amber : colors.red;
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${foiz}%` }} />
      </div>
      <span className={`text-xs font-medium w-9 text-right ${
        foiz >= 80 ? "text-green-600" : foiz >= 60 ? "text-amber-600" : "text-red-500"
      }`}>{foiz}%</span>
    </div>
  );
}

function Rang({ foiz }: { foiz: number | null }) {
  if (foiz === null) return <span className="text-gray-300 text-xs">—</span>;
  if (foiz >= 80) return <span className="text-green-600 font-semibold text-xs">{foiz}%</span>;
  if (foiz >= 60) return <span className="text-amber-600 font-semibold text-xs">{foiz}%</span>;
  return <span className="text-red-500 font-semibold text-xs">{foiz}%</span>;
}

export default function SamaradorlikPage() {
  const [data, setData] = useState<OqituvchiStat[]>([]);
  const [yuklanyapti, setYuklanyapti] = useState(true);
  const [ochiq, setOchiq] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/oqituvchilar/samaradorlik")
      .then((r) => r.json())
      .then((d) => { setData(d); setYuklanyapti(false); })
      .catch(() => setYuklanyapti(false));
  }, []);

  const ball = (o: OqituvchiStat) =>
    Math.round((o.davomatFoiz ?? 0) * 0.6 + (o.tolovFoiz ?? 0) * 0.4);

  return (
    <div>
      <Topbar title="O'qituvchi samaradorligi" />

      <div className="p-6 space-y-5">
        {/* Yig'ma stat kartalar */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardBody>
              <p className="text-xs text-gray-500">Jami o'qituvchilar</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{data.length}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-gray-500">O'rtacha davomat</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {data.length
                  ? Math.round(data.reduce((s, o) => s + (o.davomatFoiz ?? 0), 0) / data.length)
                  : "—"}%
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-gray-500">O'rtacha to'lov</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {data.length
                  ? Math.round(data.reduce((s, o) => s + (o.tolovFoiz ?? 0), 0) / data.length)
                  : "—"}%
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Asosiy jadval */}
        <Card>
          <CardHeader>
            <CardTitle>Hisobot — joriy oy</CardTitle>
            <span className="text-xs text-gray-400">
              Davomat: so'nggi 30 kun · To'lov: joriy oy
            </span>
          </CardHeader>

          {yuklanyapti ? (
            <CardBody>
              <p className="text-sm text-gray-400 text-center py-8">Yuklanmoqda...</p>
            </CardBody>
          ) : data.length === 0 ? (
            <CardBody>
              <p className="text-sm text-gray-400 text-center py-8">O'qituvchilar topilmadi</p>
            </CardBody>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>#</Th>
                  <Th>O'qituvchi</Th>
                  <Th>Guruhlar</Th>
                  <Th>Talabalar</Th>
                  <Th>Davomat (30 kun)</Th>
                  <Th>To'lov foizi</Th>
                  <Th>Ball</Th>
                  <Th></Th>
                </tr>
              </Thead>
              <Tbody>
                {data.map((o, i) => (
                  <>
                    <Tr
                      key={o.id}
                      onClick={() => setOchiq(ochiq === o.id ? null : o.id)}
                      className="cursor-pointer"
                    >
                      <Td className="text-gray-400 text-xs font-mono">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : String(i + 1).padStart(2, "0")}
                      </Td>
                      <Td>
                        <div>
                          <p className="font-medium text-gray-900">{o.ism}</p>
                          {o.mutaxassislik.length > 0 && (
                            <p className="text-xs text-gray-400">{o.mutaxassislik.join(", ")}</p>
                          )}
                        </div>
                      </Td>
                      <Td className="font-medium">{o.guruhSoni}</Td>
                      <Td className="font-medium">{o.jamiTalabalar}</Td>
                      <Td><FoizBar foiz={o.davomatFoiz} rang="green" /></Td>
                      <Td><FoizBar foiz={o.tolovFoiz} rang="blue" /></Td>
                      <Td>
                        <span className={`text-sm font-bold ${
                          ball(o) >= 75 ? "text-green-600" :
                          ball(o) >= 55 ? "text-amber-500" : "text-red-500"
                        }`}>
                          {ball(o)}
                        </span>
                      </Td>
                      <Td className="text-gray-400 text-xs">
                        {ochiq === o.id ? "▲" : "▼"}
                      </Td>
                    </Tr>

                    {/* Guruhlar breakdown */}
                    {ochiq === o.id && (
                      <tr key={`${o.id}-detail`} className="bg-gray-50">
                        <td colSpan={8} className="px-6 py-3">
                          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                            Guruhlar bo'yicha batafsil
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            {o.guruhlar.length === 0 ? (
                              <p className="text-xs text-gray-400">Guruh yo'q</p>
                            ) : (
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-gray-400">
                                    <th className="text-left font-medium pb-1 pr-4">Guruh</th>
                                    <th className="text-left font-medium pb-1 pr-4">Kurs</th>
                                    <th className="text-left font-medium pb-1 pr-4">Talabalar</th>
                                    <th className="text-left font-medium pb-1 pr-4">Davomat</th>
                                    <th className="text-left font-medium pb-1">To'lov</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {o.guruhlar.map((g) => (
                                    <tr key={g.id} className="border-t border-gray-100">
                                      <td className="py-1.5 pr-4 font-medium text-gray-800">{g.nom}</td>
                                      <td className="py-1.5 pr-4 text-gray-500">{g.kursNom}</td>
                                      <td className="py-1.5 pr-4">
                                        {g.talabaSoni}/{g.maxTalaba}
                                        <span className="text-gray-400 ml-1">
                                          ({Math.round((g.talabaSoni / g.maxTalaba) * 100)}%)
                                        </span>
                                      </td>
                                      <td className="py-1.5 pr-4">
                                        <Rang foiz={g.davomatFoiz} />
                                      </td>
                                      <td className="py-1.5">
                                        <Rang foiz={g.tolovFoiz} />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </Tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
