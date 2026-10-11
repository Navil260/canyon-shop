export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold uppercase tracking-[0.18em]">
            Ride<span className="text-accent">lab</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-white/60">
            ร้านจักรยานจำลอง ทำขึ้นเพื่อฝึกเขียนเว็บ ใช้ข้อมูลรุ่นและรูปภาพจาก canyon.com เพื่อการศึกษาเท่านั้น
          </p>
        </div>
        <div className="text-sm text-white/70">
          <p className="mb-3 font-semibold text-white">หมวดหมู่</p>
          <ul className="space-y-2">
            <li>Road Bikes</li>
            <li>Time Trial / Triathlon</li>
            <li>Gravel Bikes</li>
            <li>Mountain Bikes</li>
          </ul>
        </div>
        <div className="text-sm text-white/70">
          <p className="mb-3 font-semibold text-white">หมายเหตุ</p>
          <p>
            ไม่มีความเกี่ยวข้องกับ Canyon Bicycles GmbH ชื่อและรูปภาพสินค้าเป็นของเจ้าของลิขสิทธิ์
          </p>
        </div>
      </div>
    </footer>
  );
}
