const IMG_BASE = "https://dma.canyon.com/image/upload";

// Canyon images are served by a Cloudinary-style CDN: we ask it for the size we need.
export function bikeImage(imageId: string, width = 800) {
  return `${IMG_BASE}/w_${width},c_fit/b_rgb:F2F2F2/f_auto/q_auto/${imageId}`;
}

export function bannerImage(imageId: string, width = 1600) {
  return `${IMG_BASE}/w_${width},c_fill/f_auto/q_auto/${imageId}`;
}

// Canyon's layered render of a customised bike. Close-up views (e.g. "_CP_24" cockpit)
// are only served with the exact transformation Canyon uses itself.
export function customRender(path: string, view?: string, width = 1400) {
  return view
    ? `${IMG_BASE}/w_1920/f_avif/${path}${view}`
    : `${IMG_BASE}/w_${width}/f_auto/q_auto/${path}`;
}

export function usd(amount: number) {
  return `US$ ${Math.round(amount).toLocaleString("en-US")}`;
}

export function stockStatus(stock: number, threshold: number) {
  if (stock === 0) return { label: "หมด", tone: "bg-red-100 text-red-700" };
  if (stock <= threshold) return { label: "ใกล้หมด", tone: "bg-amber-100 text-amber-800" };
  return { label: "มีสินค้า", tone: "bg-emerald-100 text-emerald-700" };
}
