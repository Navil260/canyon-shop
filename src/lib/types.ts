export type Category = {
  slug: string;
  name: string;
  tagline: string;
  image_id: string;
  sort: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  subcategory: string;
  family: string;
  price_usd: number;
  original_price_usd: number | null;
  image_id: string;
  stock: number;
  low_stock_threshold: number;
  is_active: boolean;
};
