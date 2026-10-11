"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { SizePicker } from "@/components/SizePicker";
import type { Product, ProductSize } from "@/lib/types";

export function AddToCart({ product, sizes }: { product: Product; sizes: ProductSize[] }) {
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  if (product.stock === 0) {
    return <button className="btn-dark w-full" disabled>สินค้าหมด</button>;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-semibold">เลือกไซซ์เฟรม</p>
        <SizePicker sizes={sizes} value={size} onChange={(s) => { setSize(s); setAdded(false); }} />
      </div>
      <button
        className="btn-dark w-full"
        disabled={!size}
        onClick={() => {
          if (!size) return;
          add({ productId: product.id, slug: product.slug, name: product.name, size, priceUsd: product.price_usd, imageId: product.image_id });
          setAdded(true);
        }}
      >
        {size ? `เพิ่มลงตะกร้า · ไซซ์ ${size}` : "เลือกไซซ์ก่อน"}
      </button>
      {product.customization && (
        <Link href={`/bikes/${product.slug}/customise`} className="btn-outline w-full">
          ✦ Customise — แต่งสี ล้อ แฮนด์ เบาะ ได้เอง
        </Link>
      )}
      {added && (
        <p className="text-center text-sm">
          เพิ่มแล้ว ✓ <Link href="/cart" className="font-semibold underline">ไปที่ตะกร้า</Link>
        </p>
      )}
    </div>
  );
}
