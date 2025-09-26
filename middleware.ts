import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getIsAuthEnabled } from '@/src/lib/env';

const protectedPaths = ['/saved', '/admin'];

export async function middleware(request: NextRequest) {
  const enabled = getIsAuthEnabled();
  if (!enabled) {
    return NextResponse.next();
  }
  const requiresAuth = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));
  if (!requiresAuth) {
    return NextResponse.next();
  }
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/saved/:path*', '/admin/:path*'],
};
