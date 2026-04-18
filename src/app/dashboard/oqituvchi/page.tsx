"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardBody } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatSum } from "@/lib/utils";

type Guruh = {
  id: string;
  nom: string;
  vaqt: string;
  xona: string | null;
  kunlar: string[];
  kurs: { nom: string; narxi: number };
  _count: { talabalar: number };
  darslar: { sana: string }[];
};

type IshHaq = {
  id: string;
  summa: number;
  oy: number;
  yil: number;
  tolanganMi: boolean;
  izoh: string | null;
};

type IshHaqiInfo = {
  ishHaqiTuri: string;
  foiz: number | null;
  soatlik: number | null;
  ishHaqlar: IshHaq[];
};

const OY_NOMLARI = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];

export default function OqituvchiKabinetPage() {
  const { data: session } = useSession();
  const [guruhlar, setGuruhlar] = useState<Guruh[]>([]);
  const [ishHaqi, setIshHaqi]   = useState<IshHaqiInfo | null>(null);
  const [tab, setTab]           = useState<"guruhlar" | "ishhaqi">("guruhlar");

  useEffect(() => {
    fetch("/api/oqituvchi/guruhlar")
      .then((r) => r.json())
      .then((d) => setGuruhlar(d.guruhlar ?? []))
      .catch(() => {});

    fetch("/api/oqituvchi/ish-haqi")
      .then((r) => r.json())
      .then(setIshHaqi)
      .catch(() => {});
  }, []);

  const hozir        = new Date();
  const bugunKun     = ["Ya","Du","Se","Ch","Pa","Ju","Sha"][hozir.getDay()];
  const bugungilar   = guruhlar.filter((g) => g.kunlar.includes(bugunKun));
  const jamiTalaba   = guruhlar.reduce((s, g) => s + g._count.talabalar, 0);
  const oxirgiIshHaq = ishHaqi?.ishHaqlar[0];

  return (
    <div>
      <Topbar title={`Salom, ${session?.user.name ?? "O'qituvchi"}`} />

      <div className="p-6 space-y-5">
        {/* Stat kartalar */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardBody>
              <p className="text-xs text-gray-500">Mening guruhlarim</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{guruhlar.length}</p>
              <p className="text-xs text-gray-400 mt-1">faol guruh</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-gray-500">Jami o'quvchilar</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{jamiTalaba}</p>
              <p className="text-xs text-gray-400 mt-1">barcha guruhlar bo'yicha</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-gray-500">
                {oxirgiIshHaq ? `${OY_NOMLARI[oxirgiIshHaq.oy - 1]} ish haqi` : "Ish haqi"}
              </p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {oxirgiIshHaq ? formatSum(oxirgiIshHaq.summa) : "—"}
              </p>
              {oxirgiIshHaq && (
                <Badge variant={oxirgiIshHaq.tolanganMi ? "green" : "amber"}>
                  {oxirgiIshHaq.tolanganMi ? "To'langan" : "Kutilmoqda"}
                </Badge>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Bugungi darslar */}
        {bugungilar.length > 0 && (
          <div className="bg-brand-50 border border-brand-200 rounded-2xl px-5 py-4">
            <p className="font-semibold text-brand-800 mb-3">
              Bugun {bugungilar.length} ta dars bor
            </p>
            <div className="flex flex-wrap gap-2">
              {bugungilar.map((g) => (
                <Link
                  key={g.id}
                  href={`/dashboard/guruhlar/${g.id}`}
                  className="bg-white border border-brand-200 rounded-xl px-3 py-2 hover:border-brand-400 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800">{g.nom}</p>
                  <p className="text-xs text-gray-400">
                    {g.vaqt}{g.xona ? ` · ${g.xona}` : ""}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <Card>
          <div className="border-b border-gray-100 px-4">
            <div className="flex gap-1">
              {(["guruhlar", "ishhaqi"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    tab === t
                      ? "border-brand-600 text-brand-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t === "guruhlar" ? `Guruhlarim (${guruhlar.length})` : "Ish haqi tarixi"}
                </button>
              ))}
            </div>
          </div>

          {tab === "guruhlar" ? (
            guruhlar.length === 0 ? (
              <CardBody>
                <p className="text-sm text-gray-400 text-center py-8">Hali guruh biriktirilmagan</p>
              </CardBody>
            ) : (
              <Table>
                <Thead>
                  <tr>
                    <Th>Guruh</Th>
                    <Th>Kurs</Th>
                    <Th>Kunlar</Th>
                    <Th>Vaqt</Th>
                    <Th>Xona</Th>
                    <Th>O'quvchilar</Th>
                    <Th>Oxirgi dars</Th>
                    <Th></Th>
                  </tr>
                </Thead>
                <Tbody>
                  {guruhlar.map((g) => (
                    <Tr key={g.id}>
                      <Td className="font-medium">{g.nom}</Td>
                      <Td className="text-gray-500">{g.kurs.nom}</Td>
                      <Td className="text-xs text-gray-500">{g.kunlar.join(", ")}</Td>
                      <Td className="font-mono text-xs">{g.vaqt}</Td>
                      <Td>{g.xona ?? "—"}</Td>
                      <Td className="font-medium">{g._count.talabalar}</Td>
                      <Td className="text-xs text-gray-400">
                        {g.darslar[0]
                          ? new Date(g.darslar[0].sana).toLocaleDateString("uz-UZ")
                          : "—"}
                      </Td>
                      <Td>
                        <Link
                          href={`/dashboard/guruhlar/${g.id}`}
                          className="text-xs text-brand-600 hover:underline font-medium"
                        >
                          Batafsil
                        </Link>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )
          ) : (
            !ishHaqi?.ishHaqlar.length ? (
              <CardBody>
                <p className="text-sm text-gray-400 text-center py-8">Ish haqi tarixi yo'q</p>
              </CardBody>
            ) : (
              <Table>
                <Thead>
                  <tr>
                    <Th>Oy</Th>
                    <Th>Summa</Th>
                    <Th>Holat</Th>
                    <Th>Izoh</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {ishHaqi.ishHaqlar.map((ih: IshHaq) => (
                    <Tr key={ih.id}>
                      <Td className="font-medium">{OY_NOMLARI[ih.oy - 1]} {ih.yil}</Td>
                      <Td className="font-semibold">{formatSum(ih.summa)}</Td>
                      <Td>
                        <Badge variant={ih.tolanganMi ? "green" : "amber"}>
                          {ih.tolanganMi ? "To'langan" : "Kutilmoqda"}
                        </Badge>
                      </Td>
                      <Td className="text-gray-400 text-sm">{ih.izoh ?? "—"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )
          )}
        </Card>
      </div>
    </div>
  );
}
