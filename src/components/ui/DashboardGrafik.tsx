"use client";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

type GrafikData = { nom: string; daromad: number; talabalar: number };

function formatM(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

export function DashboardGrafik() {
  const [data, setData] = useState<GrafikData[]>([]);
  const [yukl, setYukl] = useState(true);

  useEffect(() => {
    fetch("/api/hisobotlar/grafik")
      .then((r) => r.json())
      .then((d) => { setData(d); setYukl(false); })
      .catch(() => setYukl(false));
  }, []);

  if (yukl) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-64 animate-pulse">
            <div className="h-4 w-32 bg-gray-100 rounded mb-4" />
            <div className="h-48 bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Oylik daromad */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-sm font-semibold text-gray-900 mb-4">Oylik daromad (so'm)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="nom" tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <YAxis tickFormatter={formatM} tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <Tooltip
              formatter={(v: number) => [`${v.toLocaleString()} so'm`, "Daromad"]}
              labelStyle={{ fontSize: 11 }}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <Bar dataKey="daromad" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Talabalar o'sishi */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-sm font-semibold text-gray-900 mb-4">Faol talabalar soni</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="talabalarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="nom" tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
            <Tooltip
              formatter={(v: number) => [`${v} ta`, "Talabalar"]}
              labelStyle={{ fontSize: 11 }}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <Area
              type="monotone"
              dataKey="talabalar"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#talabalarGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
