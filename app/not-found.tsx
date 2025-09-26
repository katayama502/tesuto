import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">ページが見つかりません</h1>
      <p className="text-sm text-slate-600">
        入力条件をもう一度確認してください。トップページから再度マッチングをお試しできます。
      </p>
      <Link href="/" className="inline-flex rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
        ホームに戻る
      </Link>
    </div>
  );
}
