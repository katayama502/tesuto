import { NextResponse } from 'next/server';
import { auth } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import { getIsAuthEnabled } from '@/src/lib/env';
import { saveBundleSchema } from '@/src/lib/validation';

export async function POST(request: Request) {
  if (!getIsAuthEnabled()) {
    return NextResponse.json({ error: 'Auth is disabled' }, { status: 403 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = saveBundleSchema.parse(body);
    await prisma.savedBundle.upsert({
      where: {
        userId_bundleId: {
          userId: session.user.id,
          bundleId: parsed.bundleId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        bundleId: parsed.bundleId,
      },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Save bundle error', error);
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
}
