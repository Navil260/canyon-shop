import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { CartLink } from "./CartLink";
import { signOut } from "@/app/(auth)/actions";

const NAV = [
  { href: "/bikes?category=road", label: "Road" },
  { href: "/bikes?category=time-trial", label: "Time Trial" },
  { href: "/bikes?category=gravel", label: "Gravel" },
  { href: "/bikes?category=mountain", label: "Mountain" },
];

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="bg-ink px-4 py-2 text-center text-xs text-white/85">
        โปรเจกต์ฝึกทำเว็บ (Portfolio) · ไม่ใช่เว็บไซต์ทางการของ Canyon Bicycles · ไม่มีการชำระเงินจริง
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="font-display text-2xl font-bold uppercase tracking-[0.18em]">
          Ride<span className="text-accent">lab</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-6 text-sm font-medium md:flex">
          <Link href="/bikes" className="hover:text-accent">จักรยานทั้งหมด</Link>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-accent">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 text-sm md:ml-0">
          {user?.role === "admin" && (
            <Link href="/admin" className="rounded-full bg-mist px-3 py-1.5 font-semibold">
              Admin
            </Link>
          )}
          {user ? (
            <>
              <Link href="/account" className="hidden px-2 hover:text-accent sm:block">
                {user.fullName || user.email}
              </Link>
              <form action={signOut}>
                <button className="px-2 text-muted hover:text-ink">ออกจากระบบ</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="px-2 font-medium hover:text-accent">
              เข้าสู่ระบบ
            </Link>
          )}
          <CartLink />
        </div>
      </div>
      <nav className="flex gap-5 overflow-x-auto border-t border-line px-4 py-2 text-sm font-medium md:hidden">
        <Link href="/bikes" className="shrink-0">ทั้งหมด</Link>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="shrink-0">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
