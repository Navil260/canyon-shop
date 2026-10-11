"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Bucket } from "@/lib/mockSales";
import { usd } from "@/lib/format";

const TABS = [
  { key: "day", label: "รายวัน", hint: "30 วันล่าสุด" },
  { key: "week", label: "รายสัปดาห์", hint: "12 สัปดาห์ล่าสุด" },
  { key: "month", label: "รายเดือน", hint: "12 เดือนล่าสุด" },
  { key: "year", label: "รายปี", hint: "3 ปีล่าสุด" },
] as const;

type Key = (typeof TABS)[number]["key"];
const SERIES = "#2a78d6";

const compact = (v: number) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`);

export function SalesChart({ series }: { series: Record<Key, Bucket[]> }) {
  const [tab, setTab] = useState<Key>("day");
  const [showTable, setShowTable] = useState(false);
  const data = series[tab];
  const hint = TABS.find((t) => t.key === tab)!.hint;

  return (
    <section className="rounded-2xl border border-line p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">ยอดขาย (US$)</h2>
          <p className="text-xs text-muted">{hint}</p>
        </div>
        <div className="flex flex-wrap gap-1 rounded-full bg-mist p-1 text-sm">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-3 py-1.5 ${tab === t.key ? "bg-white font-semibold shadow-sm" : "text-muted"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {showTable ? (
        <div className="mt-4 max-h-72 overflow-auto text-sm">
          <table className="w-full">
            <thead className="sticky top-0 bg-white text-left text-muted">
              <tr><th className="py-1.5">ช่วงเวลา</th><th className="text-right">ออเดอร์</th><th className="text-right">ยอดขาย</th></tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.label} className="border-t border-line">
                  <td className="py-1.5">{r.label}</td>
                  <td className="text-right tabular-nums">{r.orders}</td>
                  <td className="text-right tabular-nums">{usd(r.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap={2}>
              <CartesianGrid vertical={false} stroke="#ececec" />
              <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "#d4d4d4" }} tick={{ fontSize: 11, fill: "#6b6b6b" }} minTickGap={12} />
              <YAxis tickFormatter={compact} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6b6b6b" }} width={44} />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                formatter={(value) => [usd(Number(value)), "ยอดขาย"]}
                labelFormatter={(label, payload) => `${label} · ${payload?.[0]?.payload?.orders ?? 0} ออเดอร์`}
                contentStyle={{ borderRadius: 10, border: "1px solid #e3e3e3", fontSize: 13 }}
              />
              <Bar dataKey="revenue" fill={SERIES} radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <button onClick={() => setShowTable((v) => !v)} className="mt-3 text-xs text-muted underline">
        {showTable ? "แสดงเป็นกราฟ" : "แสดงเป็นตาราง"}
      </button>
    </section>
  );
}
