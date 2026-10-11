import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { bikeImage, stockStatus, usd } from "@/lib/format";
import type { Category, Product, ProductSize } from "@/lib/types";
import { updateStock } from "./actions";

const FILTERS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "low", label: "ใกล้หมด" },
  { key: "out", label: "หมดแล้ว" },
];

export default async function InventoryPage({ searchParams }: PageProps<"/admin/inventory">) {
  const params = await searchParams;
  const filter = typeof params.filter === "string" ? params.filter : "all";
  const category = typeof params.category === "string" ? params.category : "";

  const supabase = await createClient();
  const [{ data: cats }, { data }, { data: sizeData }] = await Promise.all([
    supabase.from("categories").select("*").order("sort"),
    supabase.from("products").select("*").order("category_slug").order("name"),
    supabase.from("product_sizes").select("*").order("sort"),
  ]);
  const sizesOf = (productId: string) => ((sizeData ?? []) as ProductSize[]).filter((s) => s.product_id === productId);
  const categories = (cats ?? []) as Category[];
  let products = (data ?? []) as Product[];
  if (category) products = products.filter((p) => p.category_slug === category);
  if (filter === "low") products = products.filter((p) => p.stock > 0 && p.stock <= p.low_stock_threshold);
  if (filter === "out") products = products.filter((p) => p.stock === 0);

  const href = (next: Record<string, string>) => {
    const q = new URLSearchParams({ filter, category, ...next });
    return `/admin/inventory?${q}`;
  };

  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold uppercase">สต็อกสินค้า</h1>
      <p className="mt-1 text-sm text-muted">แก้จำนวนคงเหลือแยกตามไซซ์ และจุดแจ้งเตือน “ใกล้หมด” (ใช้กับยอดรวม) แล้วกดบันทึก</p>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {FILTERS.map((f) => (
          <Link key={f.key} href={href({ filter: f.key })} className={`rounded-full px-4 py-1.5 ${filter === f.key ? "bg-ink text-white" : "bg-mist"}`}>
            {f.label}
          </Link>
        ))}
        <span className="mx-2 w-px bg-line" />
        <Link href={href({ category: "" })} className={`rounded-full px-4 py-1.5 ${!category ? "bg-ink text-white" : "bg-mist"}`}>ทุกหมวด</Link>
        {categories.map((c) => (
          <Link key={c.slug} href={href({ category: c.slug })} className={`rounded-full px-4 py-1.5 ${category === c.slug ? "bg-ink text-white" : "bg-mist"}`}>
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-mist text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">สินค้า</th>
              <th className="px-4 py-3">ราคา</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3">คงเหลือแยกไซซ์</th>
              <th className="px-4 py-3">แจ้งเตือนเมื่อ ≤</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => {
              const s = stockStatus(p.stock, p.low_stock_threshold);
              const formId = `f-${p.id}`;
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bikeImage(p.image_id, 120)} alt="" className="h-9 w-14 rounded bg-mist object-contain" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted">{p.subcategory}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{usd(p.price_usd)}</td>
                  <td className="px-4 py-3">
                    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${s.tone}`}>{s.label} · {p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {sizesOf(p.id).map((sz) => (
                        <label key={sz.size} className="text-center text-[11px] text-muted">
                          {sz.size}
                          <input
                            form={formId}
                            name={`size:${sz.size}`}
                            type="number"
                            min={0}
                            defaultValue={sz.stock}
                            className={`input mt-0.5 w-12 px-1 py-1 text-center ${sz.stock === 0 ? "border-red-300 bg-red-50" : ""}`}
                            aria-label={`${p.name} ไซซ์ ${sz.size}`}
                          />
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input form={formId} name="threshold" type="number" min={0} defaultValue={p.low_stock_threshold} className="input w-20 py-1.5" aria-label={`จุดแจ้งเตือน ${p.name}`} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form id={formId} action={updateStock}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="btn-outline px-4 py-1.5">บันทึก</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && <p className="py-10 text-center text-muted">ไม่มีสินค้าในเงื่อนไขนี้</p>}
      </div>
    </div>
  );
}
