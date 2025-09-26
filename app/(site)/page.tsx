import { PairForm } from '@/src/components/pair-form';

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-gradient-to-br from-brand/10 via-white to-brand/5 p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
          ペア診断（LGBTQ+フレンドリー）
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-700">
          あなたに合う“おそろい”を、偏見なく提案します。予算やサイズ、スタイルを選ぶだけで、お互いが心地よいセットをレコメンド。
        </p>
      </section>
      <PairForm />
    </div>
  );
}
