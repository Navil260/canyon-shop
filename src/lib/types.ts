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
  customization: Customization | null;
};

export type ProductSize = {
  product_id: string;
  size: string;
  sort: number;
  stock: number;
};

export type CustomOption = {
  id: string;
  name: string;
  price: number;
  note?: string;
  group?: string;
  swatch?: string;
  render?: string; // id of this colour's layer in Canyon's image renderer
  accents?: { name: string; render: string; swatch?: string }[]; // logos & bar tape variants
  image?: string; // product photo of this part
  choiceRenders?: Record<string, string>; // render layer per sub-choice (e.g. stem length)
  choice?: { label: string; values: string[]; default: string };
};

export type CustomStep = {
  key: string;
  title: string;
  heading: string;
  description: string;
  default: string;
  view?: string; // close-up camera for this step, e.g. cockpit
  options: CustomOption[];
};

export type Customization = {
  steps: CustomStep[];
  preview?: string; // render path template with {stepKey} placeholders, e.g. {colour}, {wheels}
};

// What the customer picked: step key -> option (+ sub-choice like stem length)
export type BuildSelection = Record<string, { option: string; choice?: string }>;
export type BuildLine = { step: string; value: string; price: number };
