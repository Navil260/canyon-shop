import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/mockSales";
import { bikeImage, stockStatus, usd } from "@/lib/format";
import type { Product } from "@/lib/types";
import { SalesChart } from "./SalesChart";

export default async function AdminDashboard() {
  const { kpis, series, byCategory } = getDashboardData();

  // Inventory numbers are REAL (from Supabase)
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").order("stock");
  const products = (data ?? []) as Product[];
  const outOfStock = products.filter((p) => p.stock === 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.low_stock_threshold);
  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const maxCat = Math.max(...byCategory.map((c) => c.revenue));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-display text-4xl font-extrabold uppercase">Dashboard</h1>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          ยอดขายเป็นข้อมูลจำลอง (mock) · สต็อกเป็นข้อมูลจริง
        </span>
      </div>

      {/* Sales KPIs */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((k) => {
          const change = k.previous.revenue ? ((k.current.revenue - k.previous.revenue) / k.previous.revenue) * 100 : 0;
          const up = change >= 0;
          return (
            <div key={k.key} className="rounded-2xl border border-line p-5">
              <p className="text-sm text-muted">ยอดขาย{k.label}</p>
              <p className="mt-1 font-display text-3xl font-bold tabular-nums">{usd(k.current.revenue)}</p>
              <p className="mt-1 text-sm text-muted">{k.current.orders.toLocaleString()} ออเดอร์</p>
              <p className="mt-3 text-xs">
                <span className={up ? "font-semibold text-emerald-700" : "font-semibold text-red-700"}>
                  {up ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
                </span>{" "}
                <span className="text-muted">{k.compare}</span>
              </p>
            </div>
          );
        })}
      </div>

      <SalesChart series={series} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales by category (mock) */}
        <section className="rounded-2xl border border-line p-5">
          <h2 className="font-semibold">ยอดขายตามหมวดหมู่</h2>
          <p className="text-xs text-muted">เดือนนี้</p>
          <ul className="mt-5 space-y-4">
            {byCategory.map((c) => (
              <li key={c.name}>
                <div className="flex justify-between text-sm">
                  <span>{c.name}</span>
                  <span className="tabular-nums">{usd(c.revenue)}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-mist">
                  <div className="h-2 rounded-full bg-[#2a78d6]" style={{ width: `${(c.revenue / maxCat) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Inventory health (real) */}
        <section className="rounded-2xl border border-line p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">สต็อกสินค้า</h2>
            <Link href="/admin/inventory" className="text-xs underline">จัดการสต็อก →</Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Stat label="รวมทั้งหมด" value={`${totalUnits} คัน`} />
            <Stat label="ใกล้หมด" value={lowStock.length} tone="text-amber-700" />
            <Stat label="หมดแล้ว" value={outOfStock.length} tone="text-red-700" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase text-muted">ต้องสั่งเพิ่ม</p>
          <ul className="mt-2 divide-y divide-line">
            {[...outOfStock, ...lowStock].slice(0, 6).map((p) => {
              const s = stockStatus(p.stock, p.low_stock_threshold);
              return (
                <li key={p.id} className="flex items-center gap-3 py-2 text-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bikeImage(p.image_id, 120)} alt="" className="h-8 w-12 rounded bg-mist object-contain" />
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.tone}`}>
                    {s.label} · {p.stock}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-xl bg-mist p-3">
      <p className={`font-display text-2xl font-bold ${tone}`}>{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
