'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';

const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_DISABLED !== 'true';

type Props = {
  bundleId: string;
};

export function SaveBundleButton({ bundleId }: Props) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleClick = async () => {
    if (!AUTH_ENABLED) {
      setStatus('error');
      return;
    }
    setStatus('saving');
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundleId }),
      });
      if (!response.ok) {
        throw new Error('Failed');
      }
      setStatus('saved');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const label = !AUTH_ENABLED
    ? 'ログインで保存'
    : status === 'saving'
    ? '保存中...'
    : status === 'saved'
    ? '保存しました'
    : '保存';

  return (
    <button
      disabled={!AUTH_ENABLED || status === 'saving' || status === 'saved'}
      onClick={handleClick}
      className="flex items-center gap-1 rounded-full border border-brand px-3 py-1 text-xs font-semibold text-brand hover:bg-brand/10 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
      type="button"
    >
      <Bookmark className="h-4 w-4" />
      {label}
    </button>
  );
}
