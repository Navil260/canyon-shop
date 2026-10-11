import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { usd } from "@/lib/format";

type OrderRow = {
  id: string;
  total_usd: number;
  status: string;
  created_at: string;
  order_items: { quantity: number; unit_price_usd: number; products: { name: string } }[];
};

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const { order, passwordUpdated } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, total_usd, status, created_at, order_items(quantity, unit_price_usd, products(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as unknown as OrderRow[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-5xl font-extrabold uppercase">บัญชีของฉัน</h1>
      <p className="mt-2 text-muted">{user.fullName} · {user.email}</p>

      {order && <p className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">สั่งซื้อสำเร็จ! ขอบคุณที่อุดหนุน 🎉</p>}
      {passwordUpdated && <p className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">เปลี่ยนรหัสผ่านเรียบร้อยแล้ว</p>}

      <h2 className="mt-12 font-display text-3xl font-bold uppercase">ประวัติคำสั่งซื้อ</h2>
      {orders.length === 0 ? (
        <p className="mt-4 text-muted">ยังไม่มีคำสั่งซื้อ</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="rounded-2xl border border-line p-5">
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="font-mono text-muted">#{o.id.slice(0, 8).toUpperCase()}</span>
                <span className="text-muted">{new Date(o.created_at).toLocaleString("th-TH")}</span>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {o.order_items.map((i, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{i.products.name} × {i.quantity}</span>
                    <span>{usd(i.unit_price_usd * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-line pt-3 font-semibold">
                <span className="rounded-full bg-mist px-2.5 py-0.5 text-xs uppercase">{o.status}</span>
                <span>{usd(o.total_usd)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
