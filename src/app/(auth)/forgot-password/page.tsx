"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "../actions";
import { AuthCard, FormMessage } from "@/components/AuthCard";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  return (
    <AuthCard title="ลืมรหัสผ่าน" subtitle="กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้">
      <form action={action} className="space-y-4">
        <FormMessage state={state} />
        <div>
          <label className="label" htmlFor="email">อีเมล</label>
          <input className="input" id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <button className="btn-dark w-full" disabled={pending}>{pending ? "กำลังส่ง…" : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}</button>
        <p className="text-center text-sm">
          <Link href="/login" className="text-muted underline">กลับไปหน้าเข้าสู่ระบบ</Link>
        </p>
      </form>
    </AuthCard>
  );
}
