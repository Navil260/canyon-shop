"use client";

import type { ProductSize } from "@/lib/types";

export function SizePicker({
  sizes,
  value,
  onChange,
}: {
  sizes: ProductSize[];
  value: string | null;
  onChange: (size: string) => void;
}) {
  const selected = sizes.find((s) => s.size === value);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => (
          <button
            key={s.size}
            type="button"
            disabled={s.stock === 0}
            onClick={() => onChange(s.size)}
            className={`min-w-14 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
              value === s.size
                ? "border-ink bg-ink text-white"
                : s.stock === 0
                  ? "cursor-not-allowed border-line text-muted line-through"
                  : "border-line hover:border-ink"
            }`}
          >
            {s.size}
          </button>
        ))}
      </div>
      <p className="mt-2 h-5 text-sm text-muted">
        {selected ? (selected.stock <= 2 ? `เหลือเพียง ${selected.stock} คันในไซซ์ ${selected.size}` : `ไซซ์ ${selected.size} มีสินค้า`) : "กรุณาเลือกไซซ์"}
      </p>
    </div>
  );
}
