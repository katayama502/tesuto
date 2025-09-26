import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { productFilterSchema } from '@/src/lib/validation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const parsed = productFilterSchema.parse({
      query: searchParams.get('query') ?? undefined,
      genderLabel: (searchParams.get('genderLabel') as 'mens' | 'womens' | 'unisex' | null) ?? undefined,
    });
    const where = {
      active: true,
      ...(parsed.query
        ? {
            OR: [
              { name: { contains: parsed.query, mode: 'insensitive' as const } },
              { brand: { contains: parsed.query, mode: 'insensitive' as const } },
              { tags: { has: parsed.query.toLowerCase() } },
            ],
          }
        : {}),
      ...(parsed.genderLabel ? { genderLabel: parsed.genderLabel } : {}),
    };
    const products = await prisma.product.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      take: 60,
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Product query error', error);
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
  }
}
