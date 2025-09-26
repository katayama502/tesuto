import { PairType, Product } from '@prisma/client';
import { prisma } from './prisma';
import { formatCurrency, unique } from './utils';

export type MatchRequestInput = {
  pairType: PairType;
  styleTags: string[];
  sizesA: string[];
  sizesB: string[];
  budgetMin: number;
  budgetMax: number;
  occasion?: string | null;
  userId?: string | null;
};

export type MatchComputation = {
  productA: Product;
  productB: Product;
  totalPrice: number;
  score: number;
  reason: string;
};

type ScoreContext = {
  styleScore: number;
  collectionBoost: number;
  sizeAvailability: number;
  budgetScore: number;
  stockOk: boolean;
};

const TAG_POOL = ['minimal', 'street', 'formal', 'sporty', 'colorful', 'monotone', 'vintage', 'tech'];
const OCCASION_LABELS: Record<string, string> = {
  wedding: 'セレモニー',
  date: 'デート',
  casual: 'カジュアル',
  business: 'ビジネス',
};

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dot = vecA.reduce((sum, value, index) => sum + value * vecB[index], 0);
  const magA = Math.sqrt(vecA.reduce((sum, value) => sum + value * value, 0));
  const magB = Math.sqrt(vecB.reduce((sum, value) => sum + value * value, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

export function styleSimilarity(productTags: string[], requestTags: string[]): number {
  const universe = unique([...TAG_POOL, ...productTags, ...requestTags]);
  const productVector = universe.map((tag) => (productTags.includes(tag) ? 1 : 0));
  const requestVector = universe.map((tag) => (requestTags.includes(tag) ? 1 : 0));
  const similarity = cosineSimilarity(productVector, requestVector);
  if (requestTags.length === 0) {
    return similarity * 0.6 + 0.4;
  }
  return similarity;
}

export function budgetFit(total: number, min: number, max: number): number {
  if (total >= min && total <= max) return 1;
  if (total < min) {
    const tolerance = min * 0.4;
    if (tolerance === 0) return 0;
    const diff = min - total;
    return Math.max(0, 1 - diff / tolerance);
  }
  const tolerance = max * 0.4;
  if (tolerance === 0) return 0;
  const diff = total - max;
  return Math.max(0, 1 - diff / tolerance);
}

function getPairFilter(pairType: PairType) {
  switch (pairType) {
    case PairType.MM:
      return (product: Product) => product.genderLabel === 'mens' || product.genderLabel === 'unisex';
    case PairType.WW:
      return (product: Product) => product.genderLabel === 'womens' || product.genderLabel === 'unisex';
    case PairType.UNISEX:
      return (product: Product) => product.genderLabel === 'unisex';
    case PairType.CUSTOM:
    default:
      return () => true;
  }
}

function computeScore(
  productA: Product,
  productB: Product,
  input: MatchRequestInput,
): ScoreContext & { finalScore: number } {
  const styleUnion = unique([...productA.tags, ...productB.tags]);
  const styleScore = styleSimilarity(styleUnion, input.styleTags);
  const collectionBoost = productA.collection && productA.collection === productB.collection ? 0.1 : 0;
  const sizeAvailability =
    (input.sizesA.length === 0 || input.sizesA.some((size) => productA.sizes.includes(size))) &&
    (input.sizesB.length === 0 || input.sizesB.some((size) => productB.sizes.includes(size)))
      ? 1
      : 0;
  const total = productA.price + productB.price;
  const budgetScore = budgetFit(total, input.budgetMin, input.budgetMax);
  const stockOk = productA.stock > 0 && productB.stock > 0;
  const baseScore =
    0.5 * styleScore + 0.15 * collectionBoost + 0.2 * sizeAvailability + 0.15 * budgetScore;
  const finalScore = stockOk && sizeAvailability > 0 ? baseScore : 0;

  return { styleScore, collectionBoost, sizeAvailability, budgetScore, stockOk, finalScore };
}

function buildReason(
  productA: Product,
  productB: Product,
  totalPrice: number,
  ctx: ScoreContext,
  input: MatchRequestInput,
) {
  const parts: string[] = [];
  if (ctx.collectionBoost > 0) {
    parts.push('同コレクション');
  }
  const tagList = unique([...input.styleTags, ...productA.tags, ...productB.tags])
    .slice(0, 4)
    .join('/');
  const styleLabel = ctx.styleScore >= 0.7 ? 'スタイル一致' : ctx.styleScore >= 0.4 ? 'スタイル近似' : 'スタイルミックス';
  parts.push(`${styleLabel}（${tagList || 'バランス'}）`);
  parts.push(`合計${formatCurrency(totalPrice)}`);
  parts.push(ctx.stockOk ? '在庫あり' : '在庫調整中');
  if (input.occasion) {
    const label = OCCASION_LABELS[input.occasion] ?? input.occasion;
    parts.push(`${label}にも◎`);
  }
  return parts.join('、');
}

export async function matchBundles(input: MatchRequestInput) {
  const filter = getPairFilter(input.pairType);
  const candidates = await prisma.product.findMany({ where: { active: true } });
  const filtered = candidates.filter(filter);

  const map = new Map<string, MatchComputation & { matchRequestData: { productAId: string; productBId: string } }>();

  for (const productA of filtered) {
    for (const productB of filtered) {
      if (productA.id === productB.id) continue;
      const key = [productA.id, productB.id].sort().join(':');
      const totalPrice = productA.price + productB.price;
      const ctx = computeScore(productA, productB, input);
      if (ctx.finalScore <= 0) continue;
      const reason = buildReason(productA, productB, totalPrice, ctx, input);
      const existing = map.get(key);
      if (!existing || existing.score < ctx.finalScore) {
        map.set(key, {
          productA,
          productB,
          totalPrice,
          score: Number(ctx.finalScore.toFixed(4)),
          reason,
          matchRequestData: { productAId: productA.id, productBId: productB.id },
        });
      }
    }
  }

  const results = Array.from(map.values())
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.totalPrice !== b.totalPrice) return a.totalPrice - b.totalPrice;
      return a.productA.name.localeCompare(b.productA.name, 'ja');
    })
    .slice(0, 12);

  const matchRequest = await prisma.matchRequest.create({
    data: {
      pairType: input.pairType,
      styleTags: input.styleTags,
      sizesA: input.sizesA,
      sizesB: input.sizesB,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      occasion: input.occasion,
      userId: input.userId ?? undefined,
      bundles: {
        create: results.map((result) => ({
          productAId: result.matchRequestData.productAId,
          productBId: result.matchRequestData.productBId,
          totalPrice: result.totalPrice,
          score: result.score,
          reason: result.reason,
        })),
      },
    },
    include: {
      bundles: {
        include: {
          productA: true,
          productB: true,
        },
        orderBy: [
          { score: 'desc' },
          { totalPrice: 'asc' },
          { productA: { name: 'asc' } },
        ],
        take: 12,
      },
    },
  });

  return matchRequest.bundles;
}
