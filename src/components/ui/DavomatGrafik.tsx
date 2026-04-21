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
    <div className="bg-card border border-border rounded-xl shadow-soft-lg px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      <div className="flex items-center gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Keldi</p>
          <p className="font-medium text-foreground">{d.keldi}/{d.jami}</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div>
          <p className="text-xs text-muted-foreground">Foiz</p>
          <p className="font-bold text-xl text-primary">{d.foiz ?? 0}%</p>
        </div>
      </div>
    </div>
  );
}

export function DavomatGrafik({ talabaId }: { talabaId: string }) {
  const [data, setData] = useState<TrendPoint[]>([]);
  const [yuklanyapti, setYuklanyapti] = useState(true);

  useEffect(() => {
    fetch(`/api/talabalar/${talabaId}/davomat-trend`)
      .then((r) => r.json())
      .then((d) => { setData(d); setYuklanyapti(false); })
      .catch(() => setYuklanyapti(false));
  }, [talabaId]);

  if (yuklanyapti) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-muted-foreground">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
            <path d="M3 3v18h18"/>
            <path d="m19 9-5 5-4-4-3 3"/>
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">Davomat ma'lumoti yo'q</p>
      </div>
    );
  }

  // O'rtacha foiz
  const valid = data.filter((d) => d.foiz !== null);
  const ortacha = valid.length > 0
    ? Math.round(valid.reduce((s, d) => s + (d.foiz ?? 0), 0) / valid.length)
    : 0;

  // So'nggi 2 hafta trend
  const trend = valid.length >= 2
    ? (valid[valid.length - 1].foiz ?? 0) - (valid[valid.length - 2].foiz ?? 0)
    : 0;

  const trendConfig = trend >= 0 
    ? { color: "text-emerald-600", bg: "bg-emerald-50", icon: "up" }
    : { color: "text-red-500", bg: "bg-red-50", icon: "down" };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">So'nggi 12 hafta o'rtacha</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-foreground">{ortacha}</p>
            <p className="text-xl font-bold text-muted-foreground">%</p>
          </div>
        </div>
        {valid.length >= 2 && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${trendConfig.bg} ${trendConfig.color}`}>
            {trendConfig.icon === "up" ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                <polyline points="17,6 23,6 23,12"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/>
                <polyline points="17,18 23,18 23,12"/>
              </svg>
            )}
            {Math.abs(trend)}% oxirgi hafta
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="davomatGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
          <XAxis
            dataKey="hafta"
            tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<TooltipMazmun />} />
          <ReferenceLine 
            y={80} 
            stroke="hsl(142 76% 36%)" 
            strokeDasharray="6 4" 
            strokeWidth={1.5}
            label={{ value: "80%", position: "right", fill: "hsl(142 76% 36%)", fontSize: 10 }}
          />
          <Area
            type="monotone"
            dataKey="foiz"
            stroke="hsl(221 83% 53%)"
            strokeWidth={2.5}
            fill="url(#davomatGradient)"
            dot={{ r: 4, fill: "hsl(221 83% 53%)", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "hsl(221 83% 53%)", stroke: "white", strokeWidth: 2 }}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
