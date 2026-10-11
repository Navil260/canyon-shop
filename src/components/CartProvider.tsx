"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { BuildLine, BuildSelection } from "@/lib/types";

export type CartItem = {
  lineId: string; // product + size + build, so different builds are separate lines
  productId: string;
  slug: string;
  name: string;
  size: string;
  priceUsd: number; // display only; the database recalculates at checkout
  imageId: string;
  imageUrl?: string; // custom builds: render in the chosen colour
  quantity: number;
  build?: BuildSelection;
  buildLines?: BuildLine[];
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "quantity" | "lineId">) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "cart-v2"; // v2: items carry size + build

function lineIdFor(item: Omit<CartItem, "quantity" | "lineId">) {
  return [item.productId, item.size, item.build ? JSON.stringify(item.build) : ""].join("|");
}

// The cart lives in the browser (localStorage) until the customer checks out.
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from storage
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  const value: CartContextValue = {
    items,
    count: items.reduce((sum, i) => sum + i.quantity, 0),
    total: items.reduce((sum, i) => sum + i.quantity * i.priceUsd, 0),
    add: (item) =>
      setItems((prev) => {
        const lineId = lineIdFor(item);
        if (prev.some((i) => i.lineId === lineId)) {
          return prev.map((i) => (i.lineId === lineId ? { ...i, quantity: i.quantity + 1 } : i));
        }
        return [...prev, { ...item, lineId, quantity: 1 }];
      }),
    setQuantity: (lineId, quantity) =>
      setItems((prev) => prev.map((i) => (i.lineId === lineId ? { ...i, quantity: Math.max(1, quantity) } : i))),
    remove: (lineId) => setItems((prev) => prev.filter((i) => i.lineId !== lineId)),
    clear: () => setItems([]),
  };

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
