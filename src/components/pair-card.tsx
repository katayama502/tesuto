import Image from 'next/image';
import Link from 'next/link';
import { PairBundle, Product } from '@prisma/client';
import { formatCurrency } from '@/src/lib/utils';
import { SaveBundleButton } from './save-bundle-button';
import { AddToCartButton } from './add-to-cart-button';

type BundleWithProducts = PairBundle & {
  productA: Product;
  productB: Product;
};

export function PairCard({ bundle }: { bundle: BundleWithProducts }) {
  const { productA, productB } = bundle;
  const products = [productA, productB];
  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">マッチスコア {Math.round(bundle.score * 100)}%</h3>
        <span className="text-sm text-slate-500">合計 {formatCurrency(bundle.totalPrice)}</span>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {products.map((product) => (
          <div key={product.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-2xl bg-white">
              <Image
                src={product.images[0] || '/images/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <h4 className="text-base font-semibold text-slate-800">{product.name}</h4>
            <p className="text-sm text-slate-500">{product.brand ?? 'ブランド'}</p>
            <p className="mt-2 text-sm text-slate-600">対応サイズ: {product.sizes.join(', ')}</p>
            <p className="text-sm font-semibold text-slate-700">{formatCurrency(product.price)}</p>
            <Link href={`/product/${product.id}`} className="mt-3 inline-flex text-sm text-brand">
              詳細を見る
            </Link>
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-600">{bundle.reason}</p>
      <div className="flex flex-wrap items-center gap-3">
        <AddToCartButton products={products} />
        <SaveBundleButton bundleId={bundle.id} />
      </div>
    </article>
  );
}
