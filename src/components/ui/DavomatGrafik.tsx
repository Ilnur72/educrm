"use client";
import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

type TrendPoint = {
  hafta: string;
  foiz: number | null;
  keldi: number;
  jami: number;
};

function TooltipMazmun({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as TrendPoint;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-gray-500">{d.keldi}/{d.jami} dars</p>
      <p className="font-bold text-lg" style={{ color: payload[0].fill }}>
        {d.foiz ?? 0}%
      </p>
    </div>
  );
}

export function DavomatGrafik({ talabaId }: { talabaId: string }) {
  const [data, setData]           = useState<TrendPoint[]>([]);
  const [yuklanyapti, setYuklanyapti] = useState(true);

  useEffect(() => {
    fetch(`/api/talabalar/${talabaId}/davomat-trend`)
      .then((r) => r.json())
      .then((d) => { setData(d); setYuklanyapti(false); })
      .catch(() => setYuklanyapti(false));
  }, [talabaId]);

  if (yuklanyapti) {
    return <div className="h-40 flex items-center justify-center text-sm text-gray-400">Yuklanmoqda...</div>;
  }

  if (data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-sm text-gray-400">Davomat ma'lumoti yo'q</div>;
  }

  // O'rtacha foiz
  const valid  = data.filter((d) => d.foiz !== null);
  const ortacha = valid.length > 0
    ? Math.round(valid.reduce((s, d) => s + (d.foiz ?? 0), 0) / valid.length)
    : 0;

  // So'nggi 2 hafta trend
  const trend = valid.length >= 2
    ? (valid[valid.length - 1].foiz ?? 0) - (valid[valid.length - 2].foiz ?? 0)
    : 0;

  const trendRangi = trend >= 0 ? "text-green-600" : "text-red-500";
  const trendBelgi = trend >= 0 ? "↑" : "↓";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400">So'nggi 12 hafta o'rtacha</p>
          <p className="text-2xl font-semibold text-gray-900">{ortacha}%</p>
        </div>
        {valid.length >= 2 && (
          <div className={`text-sm font-medium ${trendRangi}`}>
            {trendBelgi} {Math.abs(trend)}% oxirgi hafta
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="davomatGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="hafta"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<TooltipMazmun />} />
          <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="4 4" strokeWidth={1.5} />
          <Area
            type="monotone"
            dataKey="foiz"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#davomatGradient)"
            dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#6366f1" }}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 mt-1 text-right">— 80% chegara</p>
    </div>
  );
}
