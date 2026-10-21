'use client';

import { Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { decrement, increment, normalizeQuantity } from '@/domain/quantity';
import type { QuantityRule } from '@/domain/types';
import { cn } from '@/lib/cn';

export function QuantityStepper({ value, rule, onChange, size = 'md', label }: { value: number; rule: QuantityRule; onChange(q: number): void; size?: 'sm' | 'md'; label: string }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const q = normalizeQuantity(Number(draft.replace(',', '.')), rule);
    setDraft(String(q));
    if (q !== value) onChange(q);
  };
  const h = size === 'sm' ? 'h-9' : 'h-11';
  return (
    <div className={cn('inline-flex items-stretch overflow-hidden rounded border border-border bg-surface', h)}>
      <button type="button" aria-label={`Намали ${label}`} onClick={() => onChange(decrement(value, rule))} className="grid w-9 place-items-center text-fg-muted hover:bg-surface-muted hover:text-fg sm:w-10">
        <Minus className="h-4 w-4" />
      </button>
      <input
        inputMode="numeric"
        aria-label={`Количество ${label}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ''))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); commit(); }
          if (e.key === 'ArrowUp') { e.preventDefault(); onChange(increment(value, rule)); }
          if (e.key === 'ArrowDown') { e.preventDefault(); onChange(decrement(value, rule)); }
        }}
        className="w-11 border-x border-border bg-transparent text-center text-sm font-semibold tabular-nums outline-none focus:bg-primary-soft"
      />
      <button type="button" aria-label={`Увеличи ${label}`} onClick={() => onChange(increment(value, rule))} className="grid w-9 place-items-center text-fg-muted hover:bg-surface-muted hover:text-fg sm:w-10">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
