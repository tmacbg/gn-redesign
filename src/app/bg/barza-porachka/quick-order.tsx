'use client';

import { Search, ShoppingBasket } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { formatMoney } from '@/domain/money';
import { useCart } from '@/components/cart/cart-store';
import type { CartLineInput } from '@/components/product/add-to-cart';
import { QuantityStepper } from '@/components/product/quantity-stepper';
import { Button } from '@/components/ui/button';

export interface QuickItem extends CartLineInput { brand: string; ean: string | null }

export function QuickOrder() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<QuickItem[]>([]);
  const [known, setKnown] = useState<Record<number, QuickItem>>({});
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Record<number, number>>({});
  const setQty = useCart((s) => s.setQty);
  const setOpen = useCart((s) => s.setOpen);
  const inCart = useCart((s) => s.lines);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/search?limit=40&q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json() as Promise<{ items: QuickItem[] }>)
        .then(({ items }) => { setResults(items); setKnown((k) => ({ ...k, ...Object.fromEntries(items.map((i) => [i.productId, i])) })); setLoading(false); })
        .catch(() => {});
    }, 200);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);
  const selected = Object.entries(draft).filter(([, n]) => n > 0);
  const addAll = () => {
    for (const [id, n] of selected) { const it = known[Number(id)]; if (it) setQty(it, (inCart.find((l) => l.productId === it.productId)?.qty ?? 0) + n); }
    setDraft({}); setQ(''); searchRef.current?.focus(); setOpen(true);
  };
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="sticky top-[7.5rem] z-20 flex flex-wrap items-center gap-3 rounded-t-lg border-b border-border bg-surface p-3 md:top-[11.5rem]">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
          <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Име, марка, референция или баркод…" aria-label="Търсене в бърза поръчка" autoFocus
            className="h-11 w-full rounded border border-border bg-surface-muted pl-9 pr-3 text-sm outline-none focus:border-primary focus:bg-surface" />
        </div>
        <Button onClick={addAll} disabled={selected.length === 0}><ShoppingBasket className="h-4 w-4" />Добави {selected.length > 0 ? `(${selected.length})` : ''}</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="hidden border-b border-border bg-surface-muted text-left text-xs uppercase tracking-wider text-fg-subtle md:table-header-group">
          <tr><th className="px-3 py-2 font-semibold">Продукт</th><th className="px-3 py-2 font-semibold">Реф.</th><th className="px-3 py-2 font-semibold">Опаковка</th><th className="px-3 py-2 text-right font-semibold">Цена</th><th className="px-3 py-2 text-right font-semibold">Количество</th></tr>
        </thead>
        <tbody className="divide-y divide-border">
          {results.map((i) => {
            const n = draft[i.productId] ?? 0;
            const already = inCart.find((l) => l.productId === i.productId)?.qty;
            return (
              <tr key={i.productId} className={n > 0 ? 'bg-primary-soft/60' : undefined}>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-white">{i.image && <Image src={i.image} alt="" fill sizes="40px" className="object-contain" />}</div>
                    <div className="min-w-0">
                      <div className="line-clamp-2 font-semibold">{i.name}</div>
                      <div className="text-xs text-fg-subtle">{i.brand}{already ? <span className="ml-2 font-semibold text-success">в количката: {already}</span> : null}<span className="md:hidden"> · {i.reference}</span></div>
                    </div>
                  </div>
                </td>
                <td className="hidden px-3 py-2 font-mono text-xs text-fg-muted md:table-cell">{i.reference}</td>
                <td className="hidden px-3 py-2 text-xs text-fg-muted md:table-cell">{[i.pack, i.rule.min > 1 && `мин. ${i.rule.min}`].filter(Boolean).join(' · ')}</td>
                <td className="hidden px-3 py-2 text-right tabular-nums md:table-cell">{i.unitPrice != null ? formatMoney({ amount: i.unitPrice, currency: 'EUR' }) : '—'}</td>
                <td className="px-3 py-2 text-right"><QuantityStepper value={n} rule={i.rule} size="sm" label={i.name} onChange={(v) => setDraft((d) => ({ ...d, [i.productId]: v }))} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!loading && results.length === 0 && <p className="p-8 text-center text-fg-muted">Няма намерени продукти за „{q}“.</p>}
    </div>
  );
}
