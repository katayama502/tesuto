import { NextResponse } from 'next/server';
import { auth } from '@/src/lib/auth';
import { matchBundles } from '@/src/lib/match';
import { matchInputSchema } from '@/src/lib/validation';
import { ZodError } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = matchInputSchema.parse(body);
    const session = await auth();
    const bundles = await matchBundles({
      ...parsed,
      userId: session?.user?.id,
    });
    return NextResponse.json(bundles);
  } catch (error) {
    console.error('Match error', error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
