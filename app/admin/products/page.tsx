import { GenderLabel } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';

const createSchema = z.object({
  name: z.string().min(1),
  brand: z.string().optional(),
  price: z.coerce.number().int().min(0),
  stock: z.coerce.number().int().min(0),
  genderLabel: z.nativeEnum(GenderLabel),
  collection: z.string().optional(),
  tags: z.string().min(1),
  sizes: z.string().min(1),
  images: z.string().min(1),
});

const updateSchema = z.object({
  id: z.string().cuid(),
  price: z.coerce.number().int().min(0),
  stock: z.coerce.number().int().min(0),
  active: z.coerce.boolean(),
});

async function createProduct(formData: FormData) {
  'use server';
  const raw = Object.fromEntries(formData.entries());
  const parsed = createSchema.parse(raw);
  await prisma.product.create({
    data: {
      name: parsed.name,
      brand: parsed.brand || null,
      price: parsed.price,
      stock: parsed.stock,
      genderLabel: parsed.genderLabel,
      collection: parsed.collection || null,
      tags: parsed.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      sizes: parsed.sizes.split(',').map((size) => size.trim()).filter(Boolean),
      images: parsed.images.split(',').map((image) => image.trim()).filter(Boolean),
    },
  });
  revalidatePath('/admin/products');
}

async function updateProduct(formData: FormData) {
  'use server';
  const raw = Object.fromEntries(formData.entries());
  const parsed = updateSchema.parse(raw);
  await prisma.product.update({
    where: { id: parsed.id },
    data: {
      price: parsed.price,
      stock: parsed.stock,
      active: parsed.active,
    },
  });
  revalidatePath('/admin/products');
}

async function importCsv(formData: FormData) {
  'use server';
  const file = formData.get('file');
  if (!(file instanceof File)) {
    throw new Error('CSVファイルを選択してください');
  }
  const text = await file.text();
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, string>>;
  for (const record of records) {
    await prisma.product.upsert({
      where: { name: record.name },
      update: {
        brand: record.brand || null,
        price: Number(record.price ?? 0),
        stock: Number(record.stock ?? 0),
        genderLabel: (record.genderLabel as GenderLabel) ?? GenderLabel.unisex,
        collection: record.collection || null,
        tags: (record.tags ?? '').split(',').map((tag) => tag.trim()).filter(Boolean),
        sizes: (record.sizes ?? '').split(',').map((size) => size.trim()).filter(Boolean),
        images: (record.images ?? '').split(',').map((image) => image.trim()).filter(Boolean),
        active: record.active ? record.active.toLowerCase() === 'true' : true,
      },
      create: {
        name: record.name,
        brand: record.brand || null,
        price: Number(record.price ?? 0),
        stock: Number(record.stock ?? 0),
        genderLabel: (record.genderLabel as GenderLabel) ?? GenderLabel.unisex,
        collection: record.collection || null,
        tags: (record.tags ?? '').split(',').map((tag) => tag.trim()).filter(Boolean),
        sizes: (record.sizes ?? '').split(',').map((size) => size.trim()).filter(Boolean),
        images: (record.images ?? '').split(',').map((image) => image.trim()).filter(Boolean),
        active: record.active ? record.active.toLowerCase() === 'true' : true,
      },
    });
  }
  revalidatePath('/admin/products');
}

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">商品管理</h1>
        <p className="text-sm text-slate-600">
          新しいアイテムの追加や在庫更新、CSVでの一括インポートができます。CSVはUTF-8で、ヘッダーにname,brand,genderLabel,collection,tags,sizes,price,stock,images,activeを含めてください。
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">新規追加</h2>
        <form action={createProduct} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-600">
            商品名
            <input name="name" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:ring-brand" />
          </label>
          <label className="text-sm text-slate-600">
            ブランド
            <input name="brand" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:ring-brand" />
          </label>
          <label className="text-sm text-slate-600">
            価格 (¥)
            <input type="number" name="price" min="0" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:ring-brand" />
          </label>
          <label className="text-sm text-slate-600">
            在庫
            <input type="number" name="stock" min="0" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:ring-brand" />
          </label>
          <label className="text-sm text-slate-600">
            性別ラベル
            <select name="genderLabel" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:ring-brand">
              <option value="mens">mens</option>
              <option value="womens">womens</option>
              <option value="unisex">unisex</option>
            </select>
          </label>
          <label className="text-sm text-slate-600">
            コレクション
            <input name="collection" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:ring-brand" />
          </label>
          <label className="md:col-span-2 text-sm text-slate-600">
            タグ (カンマ区切り)
            <input name="tags" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:ring-brand" />
          </label>
          <label className="md:col-span-2 text-sm text-slate-600">
            サイズ (カンマ区切り)
            <input name="sizes" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:ring-brand" />
          </label>
          <label className="md:col-span-2 text-sm text-slate-600">
            画像URL (カンマ区切り)
            <input name="images" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:ring-brand" />
          </label>
          <button type="submit" className="md:col-span-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            追加する
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">CSVインポート</h2>
        <form action={importCsv} className="mt-4 space-y-3" encType="multipart/form-data">
          <input type="file" name="file" accept=".csv,text/csv" className="text-sm" required />
          <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            CSVを取り込む
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">登録済みアイテム</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <form
              key={product.id}
              action={updateProduct}
              className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                  <p className="text-sm text-slate-500">{product.brand ?? 'ブランド不明'} / {product.genderLabel}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{product.collection ?? 'コレクションなし'}</span>
              </div>
              <input type="hidden" name="id" value={product.id} />
              <label className="text-xs text-slate-600">
                価格 (¥)
                <input
                  type="number"
                  name="price"
                  defaultValue={product.price}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-brand"
                />
              </label>
              <label className="text-xs text-slate-600">
                在庫
                <input
                  type="number"
                  name="stock"
                  defaultValue={product.stock}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-brand"
                />
              </label>
              <input type="hidden" name="active" value="false" />
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input type="checkbox" name="active" defaultChecked={product.active} value="true" />
                公開中
              </label>
              <button type="submit" className="rounded-full bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-dark">
                更新
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
