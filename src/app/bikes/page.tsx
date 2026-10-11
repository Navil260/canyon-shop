import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/ProductCard";
import type { Category, Product } from "@/lib/types";

const SORTS: Record<string, { label: string; column: keyof Product; ascending: boolean }> = {
  "price-asc": { label: "ราคาต่ำ → สูง", column: "price_usd", ascending: true },
  "price-desc": { label: "ราคาสูง → ต่ำ", column: "price_usd", ascending: false },
  name: { label: "ชื่อ A → Z", column: "name", ascending: true },
};

export default async function BikesPage({ searchParams }: PageProps<"/bikes">) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const sub = typeof params.sub === "string" ? params.sub : undefined;
  const sortKey = typeof params.sort === "string" && params.sort in SORTS ? params.sort : "price-asc";
  const sort = SORTS[sortKey];

  const supabase = await createClient();
  let query = supabase.from("products").select("*").eq("is_active", true).order(sort.column, { ascending: sort.ascending });
  if (category) query = query.eq("category_slug", category);

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("sort"),
    query,
  ]);
  const cats = (categories ?? []) as Category[];
  const inCategory = (products ?? []) as Product[];
  const subcategories = [...new Set(inCategory.map((p) => p.subcategory))];
  const shown = sub ? inCategory.filter((p) => p.subcategory === sub) : inCategory;
  const current = cats.find((c) => c.slug === category);

  const href = (next: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const merged = { category, sub, sort: sortKey, ...next };
    Object.entries(merged).forEach(([k, v]) => v && q.set(k, v));
    return `/bikes?${q}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-sm text-muted">
        <Link href="/" className="hover:underline">หน้าแรก</Link> / {current ? current.name : "จักรยานทั้งหมด"}
      </p>
      <h1 className="mt-2 font-display text-5xl font-extrabold uppercase sm:text-6xl">
        {current ? `${current.name} Bikes` : "All Bikes"}
      </h1>
      {current && <p className="mt-1 text-muted">{current.tagline}</p>}

      {/* Category tabs */}
      <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
        <Tab href={href({ category: undefined, sub: undefined })} active={!category}>ทั้งหมด</Tab>
        {cats.map((c) => (
          <Tab key={c.slug} href={href({ category: c.slug, sub: undefined })} active={category === c.slug}>
            {c.name}
          </Tab>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-y border-line py-3">
        <div className="flex flex-wrap gap-2 text-sm">
          {category &&
            subcategories.map((s) => (
              <Link
                key={s}
                href={href({ sub: sub === s ? undefined : s })}
                className={`rounded-full border px-3 py-1 ${sub === s ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}
              >
                {s}
              </Link>
            ))}
          <span className="self-center text-muted">{shown.length} รุ่น</span>
        </div>
        <div className="flex gap-3 text-sm">
          {Object.entries(SORTS).map(([key, s]) => (
            <Link key={key} href={href({ sort: key })} className={key === sortKey ? "font-semibold underline" : "text-muted hover:text-ink"}>
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {shown.length === 0 && <p className="py-20 text-center text-muted">ไม่พบสินค้าในหมวดนี้</p>}
    </div>
  );
}

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold ${active ? "bg-ink text-white" : "bg-mist hover:bg-line"}`}
    >
      {children}
    </Link>
  );
}
