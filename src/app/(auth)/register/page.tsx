"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "../actions";
import { AuthCard, FormMessage } from "@/components/AuthCard";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(signUp, undefined);
  return (
    <AuthCard title="สมัครสมาชิก" subtitle="สร้างบัญชีเพื่อสั่งซื้อและดูประวัติคำสั่งซื้อ">
      <form action={action} className="space-y-4">
        <FormMessage state={state} />
        <div>
          <label className="label" htmlFor="fullName">ชื่อ-นามสกุล</label>
          <input className="input" id="fullName" name="fullName" required autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="email">อีเมล</label>
          <input className="input" id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">รหัสผ่าน (อย่างน้อย 8 ตัว)</label>
          <input className="input" id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        </div>
        <div>
          <label className="label" htmlFor="confirm">ยืนยันรหัสผ่าน</label>
          <input className="input" id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
        </div>
        <button className="btn-dark w-full" disabled={pending}>{pending ? "กำลังสมัคร…" : "สมัครสมาชิก"}</button>
        <p className="text-center text-sm text-muted">
          มีบัญชีอยู่แล้ว? <Link href="/login" className="font-semibold text-ink underline">เข้าสู่ระบบ</Link>
        </p>
      </form>
    </AuthCard>
  );
}
