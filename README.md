# Ridelab — ร้านจักรยาน Canyon (โปรเจกต์ฝึก)

Next.js 16 + TypeScript + Tailwind CSS + Supabase

## รันบนเครื่อง

```bash
npm install
npm run dev
```

แล้วเปิด http://localhost:3000 (ต้องมีไฟล์ `.env.local` ที่ใส่ `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)

## โครงสร้างไฟล์ที่สำคัญ

| ไฟล์/โฟลเดอร์ | หน้าที่ |
|---|---|
| `src/app/page.tsx` | หน้าแรก (สไตล์ canyon.com) |
| `src/app/bikes/` | หน้ารวมจักรยาน (กรองตามหมวด) + หน้ารายละเอียด |
| `src/app/cart/` | ตะกร้า + สั่งซื้อ (ไม่มีการจ่ายเงินจริง) |
| `src/app/(auth)/` | login / register / ลืมรหัสผ่าน / ตั้งรหัสใหม่ |
| `src/app/admin/` | Dashboard ยอดขาย + จัดการสต็อก (เฉพาะ admin) |
| `src/lib/mockSales.ts` | **ข้อมูลยอดขายจำลอง** (แก้ตรงนี้ถ้าจะเปลี่ยนตัวเลข) |
| `src/proxy.ts` | ต่ออายุ session login + กันหน้าที่ต้อง login |
| `supabase/migrations/` | SQL ที่ใช้สร้างตาราง (เก็บไว้เป็นประวัติ) |

## ตั้งใครเป็นแอดมิน

สมัครสมาชิกบนเว็บก่อน แล้วรันใน Supabase → SQL Editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'อีเมลของคุณ');
```

## ข้อมูล

- สินค้า / หมวดหมู่ / สต็อก / ผู้ใช้ / คำสั่งซื้อ = ข้อมูลจริงใน Supabase
- ยอดขายใน Dashboard = ข้อมูลจำลอง (`src/lib/mockSales.ts`)
- รูปภาพลิงก์ตรงจาก CDN ของ canyon.com — ใช้เพื่อการศึกษาเท่านั้น ไม่ได้เกี่ยวข้องกับ Canyon Bicycles GmbH
