"use client";

import { useActionState } from "react";
import { updatePassword } from "../actions";
import { AuthCard, FormMessage } from "@/components/AuthCard";

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, undefined);
  return (
    <AuthCard title="ตั้งรหัสผ่านใหม่" subtitle="กรอกรหัสผ่านใหม่ที่ต้องการใช้">
      <form action={action} className="space-y-4">
        <FormMessage state={state} />
        <div>
          <label className="label" htmlFor="password">รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)</label>
          <input className="input" id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        </div>
        <div>
          <label className="label" htmlFor="confirm">ยืนยันรหัสผ่านใหม่</label>
          <input className="input" id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
        </div>
        <button className="btn-dark w-full" disabled={pending}>{pending ? "กำลังบันทึก…" : "บันทึกรหัสผ่านใหม่"}</button>
      </form>
    </AuthCard>
  );
}
