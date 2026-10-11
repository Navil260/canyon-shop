"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const toCount = (v: FormDataEntryValue | null) => Math.max(0, Math.floor(Number(v) || 0));

// Form fields: id, threshold, and one "size:<SIZE>" field per frame size
export async function updateStock(formData: FormData) {
  await requireAdmin(); // never trust the browser: re-check on the server
  const id = String(formData.get("id"));
  const supabase = await createClient();

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("size:")) continue;
    const { error } = await supabase
      .from("product_sizes")
      .update({ stock: toCount(value) })
      .eq("product_id", id)
      .eq("size", key.slice(5));
    if (error) throw new Error(error.message);
  }

  const { error } = await supabase
    .from("products")
    .update({ low_stock_threshold: toCount(formData.get("threshold")) })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}
