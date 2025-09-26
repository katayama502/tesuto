'use client';

import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCart } from './shopping-cart-provider';

export function CartSummary() {
  const { items } = useCart();
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return (
    <Link href="/saved#cart" className="flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs text-brand-dark">
      <ShoppingBag className="h-4 w-4" />
      <span>{items.length}点 / ¥{total.toLocaleString()}</span>
    </Link>
  );
}
