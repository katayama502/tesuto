import { getIsAuthEnabled } from '@/src/lib/env';
import { auth } from '@/src/lib/auth';
import Link from 'next/link';
import { SignOutButton } from './sign-out-button';

export async function AuthStatus() {
  const enabled = getIsAuthEnabled();
  if (!enabled) {
    return <span className="text-xs text-slate-400">ゲストモード</span>;
  }
  const session = await auth();
  if (!session?.user?.email) {
    return (
      <Link href="/api/auth/signin" className="text-brand hover:text-brand-dark">
        ログイン
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <span>{session.user.email}</span>
      <SignOutButton />
    </div>
  );
}
