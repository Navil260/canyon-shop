import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product, ProductSize } from "@/lib/types";
import { Configurator } from "./Configurator";

export default async function CustomisePage({ params }: PageProps<"/bikes/[slug]/customise">) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("slug", slug).single();
  const product = data as Product | null;
  if (!product?.customization) notFound();

  const { data: sizeData } = await supabase.from("product_sizes").select("*").eq("product_id", product.id).order("sort");
  return <Configurator product={product} sizes={(sizeData ?? []) as ProductSize[]} />;
}
