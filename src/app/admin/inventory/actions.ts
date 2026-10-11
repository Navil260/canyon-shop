"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function updateStock(formData: FormData) {
  await requireAdmin(); // never trust the browser: re-check on the server
  const id = String(formData.get("id"));
  const stock = Math.max(0, Math.floor(Number(formData.get("stock"))));
  const threshold = Math.max(0, Math.floor(Number(formData.get("threshold"))));

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ stock, low_stock_threshold: threshold })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}
