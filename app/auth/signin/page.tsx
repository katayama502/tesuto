import { Metadata } from 'next';
import { getIsAuthEnabled } from '@/src/lib/env';

export const metadata: Metadata = {
  title: 'ログイン | ペア診断',
};

export default function SignInPage() {
  const enabled = getIsAuthEnabled();
  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">メールでログイン</h1>
      {!enabled ? (
        <p className="text-sm text-slate-600">
          現在このデモではログイン機能が無効化されています。保存リストはご利用いただけません。
        </p>
      ) : (
        <form action="/api/auth/signin/email" method="post" className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            メールアドレス
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:ring-brand"
            />
          </label>
          <p className="text-xs text-slate-500">
            入力いただいたメール宛にログインリンクをお送りします。迷惑メールフォルダもご確認ください。
          </p>
          <button
            type="submit"
            className="w-full rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            ログインリンクを送信
          </button>
        </form>
      )}
    </div>
  );
}
