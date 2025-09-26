import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { formatCurrency } from '@/src/lib/utils';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) {
    notFound();
  }
  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-slate-100">
        <Image
          src={product.images[0] || '/images/placeholder.svg'}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
        <p className="text-sm text-slate-500">{product.brand ?? 'ブランド'} / {product.genderLabel}</p>
        <p className="text-lg font-semibold text-slate-800">{formatCurrency(product.price)}</p>
        <p className="text-sm text-slate-600">コレクション: {product.collection ?? '指定なし'}</p>
      </div>
      <div>
        <h2 className="text-sm font-semibold text-slate-700">タグ</h2>
        <ul className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
          {product.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-slate-100 px-3 py-1">
              {tag}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-sm font-semibold text-slate-700">対応サイズ</h2>
        <p className="mt-1 text-sm text-slate-600">{product.sizes.join(', ')}</p>
      </div>
      <p className="text-sm text-slate-600">
        在庫: {product.stock > 0 ? `${product.stock} 点` : '在庫なし'} / 状態: {product.active ? '公開中' : '非公開'}
      </p>
    </div>
  );
}
