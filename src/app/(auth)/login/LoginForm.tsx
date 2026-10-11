"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "../actions";
import { FormMessage } from "@/components/AuthCard";

export function LoginForm({ next, linkError }: { next: string; linkError: boolean }) {
  const [state, action, pending] = useActionState(signIn, undefined);
  return (
    <form action={action} className="space-y-4">
      {linkError && !state && (
        <FormMessage state={{ error: "ลิงก์ในอีเมลหมดอายุหรือถูกใช้ไปแล้ว กรุณาลองใหม่" }} />
      )}
      <FormMessage state={state} />
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="email">อีเมล</label>
        <input className="input" id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="password">รหัสผ่าน</label>
          <Link href="/forgot-password" className="mb-1.5 text-xs text-muted underline">ลืมรหัสผ่าน?</Link>
        </div>
        <input className="input" id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      <button className="btn-dark w-full" disabled={pending}>{pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}</button>
      <p className="text-center text-sm text-muted">
        ยังไม่มีบัญชี? <Link href="/register" className="font-semibold text-ink underline">สมัครสมาชิก</Link>
      </p>
    </form>
  );
}
