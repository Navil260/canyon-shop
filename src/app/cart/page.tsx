"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { createClient } from "@/lib/supabase/client";
import { bikeImage, usd } from "@/lib/format";

export default function CartPage() {
  const { items, total, setQuantity, remove, clear } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  async function checkout() {
    setError(null);
    setPlacing(true);
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.push("/login?next=/cart");
      return;
    }
    const { data: orderId, error } = await supabase.rpc("place_order", {
      items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
    });
    setPlacing(false);
    if (error) {
      setError(error.message);
      return;
    }
    clear();
    router.push(`/account?order=${orderId}`);
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-5xl font-extrabold uppercase">ตะกร้าว่าง</h1>
        <p className="mt-3 text-muted">ยังไม่มีสินค้าในตะกร้า</p>
        <Link href="/bikes" className="btn-dark mt-8">เลือกซื้อจักรยาน</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-5xl font-extrabold uppercase">ตะกร้าสินค้า</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 py-5">
              <Link href={`/bikes/${item.slug}`} className="w-32 shrink-0 rounded-lg bg-mist p-2 sm:w-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bikeImage(item.imageId, 400)} alt={item.name} className="w-full" />
              </Link>
              <div className="flex flex-1 flex-col">
                <Link href={`/bikes/${item.slug}`} className="font-display text-xl font-bold uppercase">{item.name}</Link>
                <p className="text-sm text-muted">{usd(item.priceUsd)} / คัน</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-line">
                    <button className="px-3 py-1" onClick={() => setQuantity(item.productId, item.quantity - 1)} aria-label="ลดจำนวน">−</button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button className="px-3 py-1" onClick={() => setQuantity(item.productId, item.quantity + 1)} aria-label="เพิ่มจำนวน">+</button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{usd(item.priceUsd * item.quantity)}</p>
                    <button className="text-xs text-muted underline" onClick={() => remove(item.productId)}>ลบ</button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl bg-mist p-6">
          <h2 className="font-display text-2xl font-bold uppercase">สรุปคำสั่งซื้อ</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>ยอดสินค้า</span><span>{usd(total)}</span></div>
            <div className="flex justify-between"><span>ค่าจัดส่ง</span><span>ฟรี</span></div>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-bold">
            <span>รวม</span><span>{usd(total)}</span>
          </div>
          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="btn-dark mt-6 w-full" onClick={checkout} disabled={placing}>
            {placing ? "กำลังสั่งซื้อ…" : "ยืนยันคำสั่งซื้อ"}
          </button>
          <p className="mt-3 text-center text-xs text-muted">ระบบจำลอง: ไม่มีการตัดเงินจริง</p>
        </aside>
      </div>
    </div>
  );
}
