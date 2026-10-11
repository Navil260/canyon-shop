import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/ProductCard";
import { bannerImage, bikeImage, usd } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("sort"),
    supabase.from("products").select("*").eq("is_active", true).order("price_usd", { ascending: false }),
  ]);
  const cats = (categories ?? []) as Category[];
  const all = (products ?? []) as Product[];
  const featured = all.find((p) => p.slug === "endurace-cf-8-di2-4429") ?? all[0];
  const latest = all.filter((p) => p.stock > 0).slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[78vh] min-h-[520px] overflow-hidden bg-ink text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bannerImage("2026_BRA_IM_World_Champs_Speedmax_Web_Homepage_01_3840x1660__zrah81", 2000)}
          alt="Speedmax"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">The new Speedmax</p>
          <h1 className="mt-2 max-w-3xl font-display text-6xl font-extrabold uppercase leading-[0.9] sm:text-8xl">
            Kona, Rewritten
          </h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/bikes?category=time-trial" className="btn-light">Shop Speedmax</Link>
            <Link href="/bikes" className="btn border border-white text-white hover:bg-white hover:text-ink">
              ดูจักรยานทั้งหมด
            </Link>
          </div>
        </div>
      </section>

      {/* Category picker */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-4xl font-bold uppercase">เลือกสไตล์การปั่นของคุณ</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cats.map((c) => (
            <Link key={c.slug} href={`/bikes?category=${c.slug}`} className="group rounded-2xl bg-mist p-5 transition-colors hover:bg-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bikeImage(c.image_id, 500)} alt={c.name} className="aspect-[16/10] w-full object-contain transition-transform duration-500 group-hover:scale-105" />
              <p className="mt-4 font-display text-2xl font-bold uppercase">{c.name}</p>
              <p className="text-sm text-muted">{c.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Bike of the week + promo tiles */}
      {featured && (
        <section className="mx-auto grid max-w-7xl gap-4 px-4 lg:grid-cols-3">
          <Link href={`/bikes/${featured.slug}`} className="group flex flex-col rounded-2xl bg-mist p-8 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Bike of the week</p>
            <p className="mt-2 font-display text-4xl font-bold uppercase leading-none">{featured.name}</p>
            <p className="mt-2 text-sm">{usd(featured.price_usd)}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bikeImage(featured.image_id, 700)} alt={featured.name} className="mt-auto w-full pt-6 transition-transform duration-500 group-hover:scale-105" />
          </Link>
          <PromoTile
            image="2026_BRA_Innovation-MyCanyon_x_Web_Homepage_02_2400x2400_ALL_ttncsv"
            eyebrow="Aero"
            title="World champion speed"
            href="/bikes?category=road&sub=Aero"
            cta="Shop Aeroad"
          />
          <PromoTile
            image="2026_Launch_VLCS_Endurace_Web_Homepage_02_2400x2400_ALL_mkzn95"
            eyebrow="Endurance"
            title="Comfort that makes you faster"
            href="/bikes?category=road&sub=Endurance"
            cta="Shop Endurace"
          />
        </section>
      )}

      {/* Full-width banner */}
      <section className="relative mt-16 h-[60vh] min-h-[420px] overflow-hidden text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bannerImage("2026_BRA_Product_Ultimate_Web_Homepage_01_3840x2160_ALL_xh7sej", 2000)} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col items-start justify-center px-4">
          <h2 className="font-display text-6xl font-extrabold uppercase sm:text-7xl">Pure Cycling</h2>
          <p className="mt-2 text-lg text-white/85">Ride past the noise. You are free.</p>
          <Link href="/bikes?category=road&sub=Race" className="btn-light mt-6">Shop Ultimate</Link>
        </div>
      </section>

      {/* Product rail */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-4xl font-bold uppercase">พร้อมส่ง</h2>
          <Link href="/bikes" className="text-sm font-semibold underline">ดูทั้งหมด</Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Gear tiles */}
      <section className="mx-auto max-w-7xl px-4">
        <h2 className="font-display text-4xl font-bold uppercase">Level up your ride</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["2026_BRA_Product_Bike_Parts_Web_Homepage_01_3000x2000_ALL_ig0q9r", "Bike parts"],
            ["2026_BRA_Product_ACC_Web_Homepage_01_3000x2000_ALL_gdzj7l", "Accessories"],
            ["2026_BRA_Product-Spare_parts_Bike_Parts_Web_Homepage_01_3000x2000_ALL_m0imuf", "Spare parts"],
          ].map(([img, label]) => (
            <div key={label} className="relative aspect-[3/4] overflow-hidden rounded-2xl text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bannerImage(img, 700)} alt={label} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <p className="absolute bottom-5 left-5 font-display text-3xl font-bold uppercase">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function PromoTile({ image, eyebrow, title, href, cta }: { image: string; eyebrow: string; title: string; href: string; cta: string }) {
  return (
    <Link href={href} className="group relative aspect-square overflow-hidden rounded-2xl text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bannerImage(image, 900)} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
      <div className="absolute bottom-0 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">{eyebrow}</p>
        <p className="mt-1 font-display text-3xl font-bold uppercase leading-tight">{title}</p>
        <span className="btn-light mt-4">{cta}</span>
      </div>
    </Link>
  );
}
