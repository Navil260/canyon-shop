import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[200px_1fr]">
      <aside>
        <p className="font-display text-2xl font-bold uppercase">Admin</p>
        <p className="truncate text-xs text-muted">{admin.email}</p>
        <nav className="mt-6 flex gap-2 text-sm font-medium lg:flex-col">
          <Link href="/admin" className="rounded-lg px-3 py-2 hover:bg-mist">📊 Dashboard</Link>
          <Link href="/admin/inventory" className="rounded-lg px-3 py-2 hover:bg-mist">📦 สต็อกสินค้า</Link>
          <Link href="/" className="rounded-lg px-3 py-2 text-muted hover:bg-mist">← กลับหน้าร้าน</Link>
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
