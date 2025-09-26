'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { BudgetInput } from './budget-input';
import { TagToggle } from './tag-toggle';
import { cn } from '@/src/lib/cn';

const pairTypeOptions = [
  { value: 'MM', label: '男性×男性', description: 'メンズ・ユニセックスから提案' },
  { value: 'WW', label: '女性×女性', description: 'ウィメンズ・ユニセックスから提案' },
  { value: 'UNISEX', label: 'ユニセックス同士', description: '全てユニセックスアイテム' },
  { value: 'CUSTOM', label: 'カスタム', description: '性別にとらわれず自由に' },
] as const;

const styleOptions = [
  { value: 'minimal', label: 'ミニマル' },
  { value: 'street', label: 'ストリート' },
  { value: 'formal', label: 'フォーマル' },
  { value: 'sporty', label: 'スポーティー' },
  { value: 'colorful', label: 'カラフル' },
  { value: 'monotone', label: 'モノトーン' },
  { value: 'vintage', label: 'ヴィンテージ' },
  { value: 'tech', label: 'テック' },
];

const occasionOptions = [
  { value: 'wedding', label: 'ウェディング・パーティー' },
  { value: 'date', label: 'デート' },
  { value: 'casual', label: 'カジュアルなお出かけ' },
  { value: 'business', label: 'ビジネスシーン' },
] as const;

const sizeOptions = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '24',
  '26',
  '28',
  '30',
  '32',
  '38',
  '23.0',
  '24.0',
  '25.0',
  '26.0',
  '27.0',
  '28.0',
  'Free',
];

type FormValues = {
  pairType: (typeof pairTypeOptions)[number]['value'];
  budgetMin: number;
  budgetMax: number;
  sizesA: string[];
  sizesB: string[];
  styleTags: string[];
  occasion: (typeof occasionOptions)[number]['value'] | '';
};

export function PairForm() {
  const router = useRouter();
  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      pairType: 'CUSTOM',
      budgetMin: 16000,
      budgetMax: 28000,
      sizesA: [],
      sizesB: [],
      styleTags: ['minimal'],
      occasion: '',
    },
  });
  const [budget, setBudget] = useState({ min: 16000, max: 28000 });
  const selectedStyles = watch('styleTags');

  const toggleStyle = (value: string) => {
    const next = selectedStyles.includes(value)
      ? selectedStyles.filter((item) => item !== value)
      : [...selectedStyles, value];
    setValue('styleTags', next);
  };

  const onSubmit = (values: FormValues) => {
    const params = new URLSearchParams();
    params.set('pairType', values.pairType);
    params.set('budgetMin', String(budget.min));
    params.set('budgetMax', String(budget.max));
    values.sizesA.forEach((size) => params.append('sizesA', size));
    values.sizesB.forEach((size) => params.append('sizesB', size));
    values.styleTags.forEach((tag) => params.append('styleTags', tag));
    if (values.occasion) {
      params.set('occasion', values.occasion);
    }
    router.push(`/results?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">ペアタイプ</h2>
        <p className="text-sm text-slate-600">
          あなたに合う“おそろい”を、偏見なく提案します。組み合わせはいつでも自由に変更できます。
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {pairTypeOptions.map((option) => (
            <label
              key={option.value}
              className={cn(
                'cursor-pointer rounded-2xl border p-4 transition',
                watch('pairType') === option.value
                  ? 'border-brand bg-brand/10 shadow-sm'
                  : 'border-slate-200 hover:border-brand',
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  value={option.value}
                  {...register('pairType')}
                  className="h-4 w-4"
                />
                <div>
                  <p className="font-semibold text-slate-800">{option.label}</p>
                  <p className="text-xs text-slate-500">{option.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">ご予算</h2>
        <BudgetInput
          value={budget}
          onChange={(next) => {
            setBudget(next);
            setValue('budgetMin', next.min);
            setValue('budgetMax', next.max);
          }}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">スタイル</h2>
        <div className="flex flex-wrap gap-2">
          {styleOptions.map((option) => (
            <TagToggle
              key={option.value}
              value={option.value}
              label={option.label}
              selected={selectedStyles.includes(option.value)}
              onToggle={toggleStyle}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">サイズ希望</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-700">パートナーA</p>
            <select
              multiple
              className="mt-1 h-36 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-brand"
              {...register('sizesA')}
            >
              {sizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">パートナーB</p>
            <select
              multiple
              className="mt-1 h-36 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-brand"
              {...register('sizesB')}
            >
              {sizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">シーン</h2>
        <select
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-brand"
          {...register('occasion')}
        >
          <option value="">選択しない</option>
          {occasionOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </section>

      <button
        type="submit"
        className="w-full rounded-full bg-brand px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
      >
        マッチングを見る
      </button>
    </form>
  );
}
