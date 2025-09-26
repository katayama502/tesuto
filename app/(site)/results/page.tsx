import { PairType } from '@prisma/client';
import { notFound } from 'next/navigation';
import { matchBundles } from '@/src/lib/match';
import { matchInputSchema } from '@/src/lib/validation';
import { PairCard } from '@/src/components/pair-card';
import { auth } from '@/src/lib/auth';

function toArray(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseSearch(searchParams: Record<string, string | string[] | undefined>) {
  const pairTypeValue = searchParams.pairType;
  if (!pairTypeValue) return null;
  const pairType = (Array.isArray(pairTypeValue) ? pairTypeValue[0] : pairTypeValue) as PairType;
  const budgetMin = Number(Array.isArray(searchParams.budgetMin) ? searchParams.budgetMin[0] : searchParams.budgetMin);
  const budgetMax = Number(Array.isArray(searchParams.budgetMax) ? searchParams.budgetMax[0] : searchParams.budgetMax);
  if (Number.isNaN(budgetMin) || Number.isNaN(budgetMax)) {
    return null;
  }
  const styleTags = toArray(searchParams.styleTags);
  const sizesA = toArray(searchParams.sizesA);
  const sizesB = toArray(searchParams.sizesB);
  const occasion = Array.isArray(searchParams.occasion) ? searchParams.occasion[0] : searchParams.occasion;
  const parsed = matchInputSchema.safeParse({
    pairType,
    budgetMin,
    budgetMax,
    styleTags,
    sizesA,
    sizesB,
    occasion: occasion ?? undefined,
  });
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const matchInput = parseSearch(searchParams);
  if (!matchInput) {
    notFound();
  }
  const session = await auth();
  const bundles = await matchBundles({
    ...matchInput,
    userId: session?.user?.id,
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">マッチ結果</h1>
        <p className="mt-2 text-sm text-slate-600">
          選択した条件に基づき、偏見のないアルゴリズムでペアを提案しました。スコアはスタイル・在庫・サイズ・予算のバランスを示します。
        </p>
      </header>
      {bundles.length === 0 ? (
        <p className="text-sm text-slate-600">
          条件に一致するペアが見つかりませんでした。スタイルタグや予算を少し広げてお試しください。
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {bundles.map((bundle) => (
            <PairCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      )}
    </div>
  );
}
