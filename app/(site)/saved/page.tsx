import { redirect } from 'next/navigation';
import { auth } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import { PairCard } from '@/src/components/pair-card';
import { CartPanel } from '@/src/components/cart-panel';
import { getIsAuthEnabled } from '@/src/lib/env';

export default async function SavedPage() {
  const authEnabled = getIsAuthEnabled();
  if (!authEnabled) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">保存リスト</h1>
        <p className="text-sm text-slate-600">
          デモ用のゲストモードでは保存機能は無効です。ログイン機能を有効化すると、マッチ結果をあとで見返せます。
        </p>
        <CartPanel />
      </div>
    );
  }
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }
  const saved = await prisma.savedBundle.findMany({
    where: { userId: session.user.id },
    include: {
      bundle: {
        include: {
          productA: true,
          productB: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">保存リスト</h1>
        <p className="text-sm text-slate-600">気に入った組み合わせはここからいつでも確認できます。</p>
      </header>
      {saved.length === 0 ? (
        <p className="text-sm text-slate-600">まだ保存されたペアはありません。マッチ結果から「保存」ボタンを押してみましょう。</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {saved.map((item) => (
            <PairCard key={item.id} bundle={item.bundle} />
          ))}
        </div>
      )}
      <div id="cart">
        <CartPanel />
      </div>
    </div>
  );
}
