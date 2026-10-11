import type { ReactNode } from "react";
import { bannerImage } from "@/lib/format";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-7rem)] lg:grid-cols-2">
      <div
        className="hidden bg-cover bg-center lg:block"
        style={{ backgroundImage: `url(${bannerImage("2026_BRA_Product_Ultimate_Web_Homepage_01_3840x2160_ALL_xh7sej", 1400)})` }}
      />
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-4xl font-bold uppercase">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function FormMessage({ state }: { state?: { error?: string; message?: string } }) {
  if (state?.error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>;
  if (state?.message) return <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{state.message}</p>;
  return null;
}
