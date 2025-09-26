'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from './shopping-cart-provider';
import { Product } from '@prisma/client';

interface Props {
  products: Product[];
}

export function AddToCartButton({ products }: Props) {
  const { addItems } = useCart();
  return (
    <button
      type="button"
      onClick={() =>
        addItems(
          products.map((product) => ({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
          })),
        )
      }
      className="flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white hover:bg-brand-dark"
    >
      <ShoppingCart className="h-4 w-4" />2点をカートへ
    </button>
  );
}
