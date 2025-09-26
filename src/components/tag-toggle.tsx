'use client';

import { cn } from '@/src/lib/cn';

interface TagToggleProps {
  value: string;
  label: string;
  selected: boolean;
  onToggle: (value: string) => void;
}

export function TagToggle({ value, label, selected, onToggle }: TagToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(value)}
      className={cn(
        'rounded-full border px-4 py-2 text-sm font-medium transition',
        selected
          ? 'border-brand bg-brand text-white shadow-sm'
          : 'border-slate-300 bg-white text-slate-600 hover:border-brand hover:text-brand',
      )}
    >
      {label}
    </button>
  );
}
