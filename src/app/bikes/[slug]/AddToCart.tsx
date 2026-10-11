"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import type { Product } from "@/lib/types";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  if (product.stock === 0) {
    return <button className="btn-dark w-full" disabled>สินค้าหมด</button>;
  }

  return (
    <div className="space-y-3">
      <button
        className="btn-dark w-full"
        onClick={() => {
          add({ productId: product.id, slug: product.slug, name: product.name, priceUsd: product.price_usd, imageId: product.image_id });
          setAdded(true);
        }}
      >
        เพิ่มลงตะกร้า
      </button>
      {added && (
        <p className="text-center text-sm">
          เพิ่มแล้ว ✓ <Link href="/cart" className="font-semibold underline">ไปที่ตะกร้า</Link>
        </p>
      )}
    </div>
  );
}
