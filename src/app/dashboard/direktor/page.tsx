"use client";
import { useState, useEffect } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatSum } from "@/lib/utils";

type Filial = {
  id: string;
  nom: string;
  manzil: string | null;
  telefon: string | null;
  faol: boolean;
  _count: { talabalar: number; guruhlar: number; userlar: number };
};

type FilialStat = {
  talabalar: number;
  guruhlar: number;
  yangiLidlar: number;
  daromad: number;
  xarajat: number;
  foyda: number;
};

type FilialWithStat = Filial & { stat: FilialStat | null };

export default function DirektorPage() {
  const [filiallar, setFiliallar] = useState<FilialWithStat[]>([]);
  const [yuklanyapti, setYuklanyapti] = useState(true);

  useEffect(() => {
    fetch("/api/filiallar")
      .then((r) => r.json())
      .then(async (data: Filial[]) => {
        const withStats = await Promise.all(
          data.map(async (f) => {
            const stat = await fetch(`/api/filiallar/${f.id}/statistika`)
              .then((r) => r.json())
              .catch(() => null);
            return { ...f, stat };
          })
        );
        setFiliallar(withStats);
        setYuklanyapti(false);
      })
      .catch(() => setYuklanyapti(false));
  }, []);

  const jami = filiallar.reduce(
    (acc, f) => ({
      talabalar:  acc.talabalar  + (f.stat?.talabalar  ?? 0),
      daromad:    acc.daromad    + (f.stat?.daromad    ?? 0),
      xarajat:    acc.xarajat    + (f.stat?.xarajat    ?? 0),
      foyda:      acc.foyda      + (f.stat?.foyda      ?? 0),
    }),
    { talabalar: 0, daromad: 0, xarajat: 0, foyda: 0 }
  );

  return (
    <div>
      <Topbar title="Umumiy ko'rinish" />

      <div className="p-6 space-y-6">
        {/* Umumiy statistika */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SumCard label="Jami talabalar" value={String(jami.talabalar)} color="text-gray-900" />
          <SumCard label="Bu oy daromad"  value={formatSum(jami.daromad)} color="text-green-600" />
          <SumCard label="Bu oy xarajat"  value={formatSum(jami.xarajat)} color="text-red-500" />
          <SumCard label="Bu oy foyda"    value={formatSum(jami.foyda)}   color={jami.foyda >= 0 ? "text-green-600" : "text-red-500"} />
        </div>

        {/* Filiallar ro'yxati */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Filiallar bo&apos;yicha</h2>
          {yuklanyapti ? (
            <div className="text-center text-gray-400 py-10">Yuklanmoqda...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filiallar.filter((f) => f.faol).map((f) => (
                <FilialCard key={f.id} filial={f} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilialCard({ filial }: { filial: FilialWithStat }) {
  const s = filial.stat;
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">{filial.nom}</h3>
            {filial.manzil && (
              <p className="text-xs text-gray-400 mt-0.5">{filial.manzil}</p>
            )}
          </div>
          <Badge variant={filial.faol ? "green" : "red"}>
            {filial.faol ? "Faol" : "Yopiq"}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <MiniStat label="Talabalar" value={s?.talabalar ?? 0} />
          <MiniStat label="Guruhlar"  value={s?.guruhlar  ?? 0} />
          <MiniStat label="Yangi lid" value={s?.yangiLidlar ?? 0} />
        </div>

        <div className="border-t border-gray-100 pt-3 grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-gray-400">Daromad</p>
            <p className="text-sm font-semibold text-green-600">{formatSum(s?.daromad ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Xarajat</p>
            <p className="text-sm font-semibold text-red-500">{formatSum(s?.xarajat ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Foyda</p>
            <p className={`text-sm font-semibold ${(s?.foyda ?? 0) >= 0 ? "text-green-600" : "text-red-500"}`}>
              {formatSum(s?.foyda ?? 0)}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function SumCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-center">
      <p className="text-base font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}
