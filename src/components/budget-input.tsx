'use client';

interface BudgetInputProps {
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
  minLimit?: number;
  maxLimit?: number;
}

export function BudgetInput({ value, onChange, minLimit = 2000, maxLimit = 200000 }: BudgetInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>ご予算の目安 (ペア合計)</span>
        <span>
          ¥{value.min.toLocaleString()} – ¥{value.max.toLocaleString()}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-slate-600">
          最低
          <input
            type="number"
            min={minLimit}
            max={value.max}
            value={value.min}
            onChange={(event) =>
              onChange({
                min: Number(event.target.value),
                max: value.max,
              })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:ring-brand"
          />
        </label>
        <label className="text-sm text-slate-600">
          最高
          <input
            type="number"
            min={value.min}
            max={maxLimit}
            value={value.max}
            onChange={(event) =>
              onChange({
                min: value.min,
                max: Number(event.target.value),
              })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:ring-brand"
          />
        </label>
      </div>
    </div>
  );
}
