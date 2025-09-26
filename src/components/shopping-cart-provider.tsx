'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image?: string | null;
};

type CartContextValue = {
  items: CartItem[];
  addItems: (items: CartItem[]) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const CART_KEY = 'pair-shop-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CART_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load cart from storage', error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to persist cart', error);
    }
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addItems: (newItems: CartItem[]) =>
        setItems((prev) => {
          const combined = [...prev];
          for (const item of newItems) {
            if (!combined.find((existing) => existing.productId === item.productId)) {
              combined.push(item);
            }
          }
          return combined;
        }),
      clear: () => setItems([]),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
