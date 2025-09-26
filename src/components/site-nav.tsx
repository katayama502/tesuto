import Link from 'next/link';
import { Suspense } from 'react';
import { AuthStatus } from './auth-status';
import { CartSummary } from './cart-summary';

export function SiteNav() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          ペア診断（LGBTQ+フレンドリー）
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link href="/saved" className="hover:text-slate-900">
            保存リスト
          </Link>
          <Link href="/admin/products" className="hover:text-slate-900">
            管理
          </Link>
          <Suspense fallback={<span className="text-slate-400">…</span>}>
            <AuthStatus />
          </Suspense>
          <CartSummary />
        </nav>
      </div>
    </header>
  );
}
