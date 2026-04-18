"use client";
import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { formatSum } from "@/lib/utils";

const OYLAR = ["Yanvar","Fevral","Mart","Aprel","May","Iyun",
               "Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];

type Qarzdor = {
  id: string;
  ism: string;
  familiya: string;
  telefon: string;
  otaTelefon: string | null;
  otaTelegramId: string | null;
  guruhNom: string;
  kursNom: string;
  narxi: number;
  tolangan: number;
  qoldiq: number;
};

export default function QarzdorlarPage() {
  const now = new Date();
  const [oy,  setOy]  = useState(String(now.getMonth() + 1));
  const [yil, setYil] = useState(String(now.getFullYear()));

  const [qarzdorlar, setQarzdorlar]   = useState<Qarzdor[]>([]);
  const [yuklanyapti, setYuklanyapti] = useState(true);
  const [tanlangan, setTanlangan]     = useState<Set<string>>(new Set());
  const [yuborilmoqda, setYuborilmoqda] = useState(false);
  const [xabarNatija, setXabarNatija]   = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setYuklanyapti(true);
    setTanlangan(new Set());
    setXabarNatija(null);
    const res  = await fetch(`/api/qarzdorlar?oy=${oy}&yil=${yil}`);
    const data = await res.json();
    setQarzdorlar(data.qarzdorlar ?? []);
    setYuklanyapti(false);
  }, [oy, yil]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleTanlash = (id: string) =>
    setTanlangan((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const barchasiniTanla = () => {
    const telegramlilar = qarzdorlar.filter((q) => q.otaTelegramId).map((q) => q.id);
    setTanlangan(
      tanlangan.size === telegramlilar.length ? new Set() : new Set(telegramlilar)
    );
  };

  const xabarYuborish = async (ids: string[]) => {
    if (!ids.length) return;
    setYuborilmoqda(true);
    setXabarNatija(null);
    const res  = await fetch("/api/qarzdorlar/xabar", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ talabaIds: ids, oy: parseInt(oy), yil: parseInt(yil) }),
    });
    const data = await res.json();
    setXabarNatija(`✅ ${data.yuborildi} ta ota-onaga Telegram xabar yuborildi`);
    setYuborilmoqda(false);
    setTanlangan(new Set());
  };

  // Statistika
  const jami        = qarzdorlar.length;
  const jamiQoldiq  = qarzdorlar.reduce((s, q) => s + q.qoldiq, 0);
  const telegramBor = qarzdorlar.filter((q) => q.otaTelegramId).length;
  const telegramYoq = jami - telegramBor;

  const telegramliIds = qarzdorlar.filter((q) => q.otaTelegramId).map((q) => q.id);
  const tanlanganList = [...tanlangan];

  return (
    <div>
      <Topbar
        title="Qarzdorlar"
        actions={
          <div className="flex items-center gap-2">
            <Select value={oy} onChange={(e) => setOy(e.target.value)} className="text-xs py-1 px-2 w-32">
              {OYLAR.map((m, i) => (
                <option key={i + 1} value={String(i + 1)}>{m}</option>
              ))}
            </Select>
            <Select value={yil} onChange={(e) => setYil(e.target.value)} className="text-xs py-1 px-2 w-24">
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </Select>
          </div>
        }
      />

      <div className="p-6 space-y-5">
        {/* Stat kartalar */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardBody>
              <p className="text-xs text-gray-500">Jami qarzdor</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{jami}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-gray-500">Umumiy qarz</p>
              <p className="text-2xl font-semibold text-red-600 mt-1">{formatSum(jamiQoldiq)}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-gray-500">Telegram ulangan</p>
              <p className="text-2xl font-semibold text-green-600 mt-1">{telegramBor}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-gray-500">Telegram yo'q</p>
              <p className="text-2xl font-semibold text-gray-400 mt-1">{telegramYoq}</p>
            </CardBody>
          </Card>
        </div>

        {/* Xabar natijasi */}
        {xabarNatija && (
          <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            {xabarNatija}
          </div>
        )}

        {/* Jadval */}
        <Card>
          <CardHeader>
            <CardTitle>
              {OYLAR[parseInt(oy) - 1]} {yil} — qarzdorlar
              <span className="ml-2 text-gray-400 font-normal">({jami})</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              {telegramliIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={barchasiniTanla}
                >
                  {tanlangan.size === telegramliIds.length ? "Tanlovni bekor" : "Barchasini tanla"}
                </Button>
              )}
              {tanlanganList.length > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => xabarYuborish(tanlanganList)}
                  disabled={yuborilmoqda}
                >
                  {yuborilmoqda
                    ? "Yuborilmoqda..."
                    : `Telegram yuborish (${tanlanganList.length})`}
                </Button>
              )}
            </div>
          </CardHeader>

          {yuklanyapti ? (
            <CardBody>
              <p className="text-sm text-gray-400 text-center py-8">Yuklanmoqda...</p>
            </CardBody>
          ) : qarzdorlar.length === 0 ? (
            <CardBody>
              <p className="text-sm text-gray-400 text-center py-8">
                {OYLAR[parseInt(oy) - 1]} oyida qarzdor talabalar yo'q 🎉
              </p>
            </CardBody>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th></Th>
                  <Th>Talaba</Th>
                  <Th>Guruh / Kurs</Th>
                  <Th>Kurs narxi</Th>
                  <Th>To'langan</Th>
                  <Th>Qoldiq</Th>
                  <Th>Telefon</Th>
                  <Th>Telegram</Th>
                  <Th></Th>
                </tr>
              </Thead>
              <Tbody>
                {qarzdorlar.map((q) => (
                  <Tr key={q.id}>
                    <Td>
                      {q.otaTelegramId && (
                        <input
                          type="checkbox"
                          checked={tanlangan.has(q.id)}
                          onChange={() => toggleTanlash(q.id)}
                          className="w-4 h-4 accent-brand-600 cursor-pointer"
                        />
                      )}
                    </Td>
                    <Td className="font-medium">{q.ism} {q.familiya}</Td>
                    <Td>
                      <p className="text-sm">{q.guruhNom}</p>
                      <p className="text-xs text-gray-400">{q.kursNom}</p>
                    </Td>
                    <Td className="text-gray-500">{formatSum(q.narxi)}</Td>
                    <Td>
                      {q.tolangan > 0
                        ? <span className="text-amber-600">{formatSum(q.tolangan)}</span>
                        : <span className="text-gray-300">—</span>
                      }
                    </Td>
                    <Td>
                      <span className="font-semibold text-red-600">{formatSum(q.qoldiq)}</span>
                    </Td>
                    <Td>
                      <div className="text-xs font-mono">
                        <p>{q.telefon}</p>
                        {q.otaTelefon && (
                          <p className="text-gray-400">{q.otaTelefon}</p>
                        )}
                      </div>
                    </Td>
                    <Td>
                      {q.otaTelegramId
                        ? <Badge variant="green">Ulangan</Badge>
                        : <Badge variant="gray">Yo'q</Badge>
                      }
                    </Td>
                    <Td>
                      {q.otaTelegramId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => xabarYuborish([q.id])}
                          disabled={yuborilmoqda}
                        >
                          📨
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
