'use client';

import { ArrowUpDown, Check, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { cn } from '@/lib/cn';

export interface Facet { id: number; name: string; count: number }
const SORTS = [{ v: '', l: 'Препоръчани' }, { v: 'new', l: 'Най-нови' }, { v: 'name', l: 'Име А–Я' }];

function useHref() {
  const path = usePathname();
  const sp = useSearchParams();
  return (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    next.delete('page');
    for (const [k, v] of Object.entries(patch)) (v ? next.set(k, v) : next.delete(k));
    const qs = next.toString();
    return qs ? `${path}?${qs}` : path;
  };
}

export function BrandFacet({ brands, active }: { brands: Facet[]; active: number | null }) {
  const href = useHref();
  return (
    <ul className="space-y-0.5">
      {brands.map((b) => {
        const on = b.id === active;
        return (
          <li key={b.id}>
            <Link href={href({ brand: on ? null : String(b.id) })} scroll={false} className={cn('flex items-center gap-2.5 rounded px-2 py-1.5 text-sm', on ? 'bg-primary-soft font-semibold text-primary' : 'text-fg-muted hover:bg-surface-muted hover:text-fg')}>
              <span className={cn('grid h-4.5 w-4.5 shrink-0 place-items-center rounded-sm border', on ? 'border-primary bg-primary text-white' : 'border-border-strong')}>{on && <Check className="h-3 w-3" />}</span>
              <span className="flex-1 truncate">{b.name}</span>
              <span className="text-xs tabular-nums text-fg-subtle">{b.count}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function ListingToolbar({ total, brands, activeBrand, sort, view }: { total: number; brands: Facet[]; activeBrand: number | null; sort: string; view: string }) {
  const href = useHref();
  const [sheet, setSheet] = useState<null | 'filter' | 'sort'>(null);
  const reduce = useReducedMotion();
  return (
    <>
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <p className="mr-auto text-sm text-fg-muted"><b className="text-fg tabular-nums">{total}</b> продукта</p>
        <button type="button" onClick={() => setSheet('filter')} className="inline-flex h-10 items-center gap-1.5 rounded border border-border bg-surface px-3 text-sm font-semibold lg:hidden">
          <SlidersHorizontal className="h-4 w-4" />Филтри{activeBrand && <span className="h-2 w-2 rounded-full bg-primary" />}
        </button>
        <button type="button" onClick={() => setSheet('sort')} className="inline-flex h-10 items-center gap-1.5 rounded border border-border bg-surface px-3 text-sm font-semibold md:hidden"><ArrowUpDown className="h-4 w-4" />Подреди</button>
        <div className="hidden items-center gap-1 md:flex" role="group" aria-label="Подреждане">
          {SORTS.map((s) => (
            <Link key={s.v} href={href({ sort: s.v || null })} scroll={false} aria-current={sort === s.v ? 'true' : undefined}
              className={cn('rounded px-3 py-2 text-sm font-medium', sort === s.v ? 'bg-fg text-white' : 'text-fg-muted hover:bg-surface-muted')}>{s.l}</Link>
          ))}
        </div>
        <div className="flex overflow-hidden rounded border border-border" role="group" aria-label="Изглед">
          <Link href={href({ view: null })} scroll={false} aria-label="Мрежа" aria-current={view !== 'list' ? 'true' : undefined} className={cn('grid h-10 w-10 place-items-center', view !== 'list' ? 'bg-primary-soft text-primary' : 'text-fg-subtle')}><LayoutGrid className="h-4 w-4" /></Link>
          <Link href={href({ view: 'list' })} scroll={false} aria-label="Списък за поръчка" aria-current={view === 'list' ? 'true' : undefined} className={cn('grid h-10 w-10 place-items-center border-l border-border', view === 'list' ? 'bg-primary-soft text-primary' : 'text-fg-subtle')}><List className="h-4 w-4" /></Link>
        </div>
      </div>

      <AnimatePresence>
        {sheet && (
          <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label={sheet === 'filter' ? 'Филтри' : 'Подреждане'}>
            <motion.div className="absolute inset-0 bg-fg/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(null)} />
            <motion.div initial={reduce ? { opacity: 0 } : { y: '100%' }} animate={reduce ? { opacity: 1 } : { y: 0 }} exit={reduce ? { opacity: 0 } : { y: '100%' }} transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.28 }}
              className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-3">
              <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-border-strong" />
              <header className="flex items-center justify-between px-5 py-3">
                <h2 className="text-lg font-bold">{sheet === 'filter' ? 'Филтри' : 'Подреди по'}</h2>
                <button type="button" onClick={() => setSheet(null)} className="grid h-10 w-10 place-items-center rounded hover:bg-surface-muted" aria-label="Затвори"><X className="h-5 w-5" /></button>
              </header>
              <div className="overflow-y-auto px-3 pb-4" onClick={(e) => (e.target as HTMLElement).closest('a') && setSheet(null)}>
                {sheet === 'filter' ? (
                  <>
                    <h3 className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-fg-subtle">Марка</h3>
                    <BrandFacet brands={brands} active={activeBrand} />
                  </>
                ) : (
                  <ul>{SORTS.map((s) => (
                    <li key={s.v}><Link href={href({ sort: s.v || null })} scroll={false} className={cn('flex items-center justify-between rounded px-3 py-3 text-base', sort === s.v ? 'font-semibold text-primary' : '')}>{s.l}{sort === s.v && <Check className="h-5 w-5" />}</Link></li>
                  ))}</ul>
                )}
              </div>
              {sheet === 'filter' && (
                <div className="flex gap-2 border-t border-border p-4">
                  <Link href={href({ brand: null })} scroll={false} onClick={() => setSheet(null)} className="flex h-12 flex-1 items-center justify-center rounded border border-border font-semibold">Изчисти</Link>
                  <button type="button" onClick={() => setSheet(null)} className="h-12 flex-[2] rounded bg-primary font-semibold text-primary-fg">Покажи {total} продукта</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
