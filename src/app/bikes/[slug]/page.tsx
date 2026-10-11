import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/ProductCard";
import { bikeImage, stockStatus, usd } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AddToCart } from "./AddToCart";

export default async function BikePage({ params }: PageProps<"/bikes/[slug]">) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*, categories(name)").eq("slug", slug).single();
  if (!data) notFound();
  const product = data as Product & { categories: { name: string } };

  const { data: relatedData } = await supabase
    .from("products")
    .select("*")
    .eq("family", product.family)
    .neq("id", product.id)
    .eq("is_active", true)
    .limit(4);
  const related = (relatedData ?? []) as Product[];
  const status = stockStatus(product.stock, product.low_stock_threshold);
  const onSale = product.original_price_usd && product.original_price_usd > product.price_usd;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <p className="text-sm text-muted">
        <Link href="/bikes" className="hover:underline">จักรยาน</Link> /{" "}
        <Link href={`/bikes?category=${product.category_slug}`} className="hover:underline">{product.categories.name}</Link> /{" "}
        {product.name}
      </p>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex items-center rounded-2xl bg-mist p-6 sm:p-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bikeImage(product.image_id, 1400)} alt={product.name} className="w-full" />
        </div>

        <div className="lg:pt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
            {product.family} · {product.subcategory}
          </p>
          <h1 className="mt-2 font-display text-5xl font-extrabold uppercase leading-none">{product.name}</h1>
          <p className="mt-5 text-2xl">
            <span className={onSale ? "font-bold text-accent" : "font-bold"}>{usd(product.price_usd)}</span>
            {onSale && <span className="ml-3 text-lg text-muted line-through">{usd(product.original_price_usd!)}</span>}
          </p>
          <p className="mt-4 flex items-center gap-2 text-sm">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</span>
            {product.stock > 0 && <span className="text-muted">เหลือ {product.stock} คัน</span>}
          </p>

          <div className="mt-8">
            <AddToCart product={product} />
          </div>

          <dl className="mt-10 divide-y divide-line border-y border-line text-sm">
            {[
              ["หมวดหมู่", product.categories.name],
              ["ประเภท", product.subcategory],
              ["ซีรีส์", product.family],
              ["การจัดส่ง", "ส่งฟรีทั่วประเทศ (จำลอง)"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-3">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl font-bold uppercase">รุ่นอื่นในซีรีส์ {product.family}</h2>
          <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
