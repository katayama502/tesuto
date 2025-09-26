'use client';

import Image from 'next/image';
import { useCart } from './shopping-cart-provider';
import { formatCurrency } from '@/src/lib/utils';

export function CartPanel() {
  const { items, clear } = useCart();
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return (
    <section className="mt-8 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">カート（デモ）</h2>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-slate-500 underline hover:text-slate-700"
          disabled={items.length === 0}
        >
          クリア
        </button>
      </header>
      {items.length === 0 ? (
        <p className="text-sm text-slate-600">まだカートは空です。マッチ結果から「2点をカートへ」を選ぶとこちらに表示されます。</p>
      ) : (
        <div className="space-y-4">
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-slate-100">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <Image src="/images/placeholder.svg" alt={item.name} fill className="object-cover" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500">{formatCurrency(item.price)}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
            <span>合計</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <button className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            チェックアウト（デモ）
          </button>
        </div>
      )}
    </section>
  );
}
