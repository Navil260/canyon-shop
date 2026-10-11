import Link from "next/link";
import type { Product } from "@/lib/types";
import { bikeImage, usd } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const onSale = product.original_price_usd && product.original_price_usd > product.price_usd;
  return (
    <Link href={`/bikes/${product.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-mist">
        {/* eslint-disable-next-line @next/next/no-img-element -- images are already resized by Canyon's CDN */}
        <img
          src={bikeImage(product.image_id, 700)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {onSale && <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold uppercase text-white">Sale</span>}
          {product.stock === 0 && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold uppercase text-white">Sold out</span>
          )}
        </div>
      </div>
      <div className="mt-3 px-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">{product.subcategory}</p>
        <h3 className="mt-0.5 font-display text-xl font-bold uppercase leading-tight">{product.name}</h3>
        <p className="mt-1 text-sm">
          <span className={onSale ? "font-semibold text-accent" : "font-semibold"}>{usd(product.price_usd)}</span>
          {onSale && <span className="ml-2 text-muted line-through">{usd(product.original_price_usd!)}</span>}
        </p>
      </div>
    </Link>
  );
}
