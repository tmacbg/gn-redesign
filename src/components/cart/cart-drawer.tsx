'use client';

import { ShoppingBasket, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';
import { formatMoney, lineTotal } from '@/domain/money';
import { QuantityStepper } from '@/components/product/quantity-stepper';
import { buttonClass } from '@/components/ui/button';
import { storePolicy } from '@/lib/store-policy';
import { useCart } from './cart-store';

export function CartSummaryTotals() {
  const lines = useCart((s) => s.lines);
  const priced = lines.filter((l) => l.unitPrice != null);
  const subtotal = priced.reduce((s, l) => s + lineTotal({ amount: l.unitPrice!, currency: 'EUR' }, l.qty).amount, 0);
  return (
    <dl className="space-y-1 text-sm">
      <div className="flex justify-between"><dt className="text-fg-muted">Сума (без ДДС)</dt><dd className="font-bold tabular-nums">{formatMoney({ amount: subtotal, currency: 'EUR' })}</dd></div>
      <div className="flex justify-between text-xs text-fg-subtle"><dt>Доставка</dt><dd>{storePolicy.carrier.label}</dd></div>
      <div className="flex justify-between text-xs text-fg-subtle"><dt>Плащане</dt><dd>{storePolicy.payment.label}</dd></div>
    </dl>
  );
}

export function CartDrawer() {
  const { lines, open, setOpen, setQty, remove } = useCart();
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, setOpen]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Количка">
          <motion.div className="absolute inset-0 bg-fg/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside
            initial={reduce ? { opacity: 0 } : { x: '100%' }} animate={reduce ? { opacity: 1 } : { x: 0 }} exit={reduce ? { opacity: 0 } : { x: '100%' }}
            transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.28 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-3">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-bold">Количка <span className="text-fg-subtle">({lines.length})</span></h2>
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded hover:bg-surface-muted" aria-label="Затвори"><X className="h-5 w-5" /></button>
            </header>
            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary"><ShoppingBasket className="h-7 w-7" /></span>
                <p className="font-semibold">Количката е празна</p>
                <p className="text-sm text-fg-muted">Добавете продукти от каталога или използвайте Бърза поръчка.</p>
                <Link href="/bg/barza-porachka" onClick={() => setOpen(false)} className={buttonClass('secondary', 'md', 'mt-2')}>Бърза поръчка</Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
                  {lines.map((l) => (
                    <li key={l.productId} className="flex gap-3 py-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-border bg-white">
                        {l.image && <Image src={l.image} alt="" fill sizes="64px" className="object-contain p-1" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link href={l.href} onClick={() => setOpen(false)} className="line-clamp-2 text-sm font-semibold hover:text-primary">{l.name}</Link>
                        <div className="mt-0.5 text-xs text-fg-subtle">{[l.basis && `за ${l.basis}`, l.pack, l.rule.min > 1 && `мин. ${l.rule.min}`].filter(Boolean).join(' · ')}</div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <QuantityStepper value={l.qty} rule={l.rule} onChange={(q) => setQty(l, q)} size="sm" label={l.name} />
                          {l.unitPrice != null && <span className="text-sm font-bold tabular-nums">{formatMoney(lineTotal({ amount: l.unitPrice, currency: 'EUR' }, l.qty))}</span>}
                        </div>
                      </div>
                      <button type="button" onClick={() => remove(l.productId)} className="self-start p-1 text-fg-subtle hover:text-danger" aria-label={`Премахни ${l.name}`}><Trash2 className="h-4 w-4" /></button>
                    </li>
                  ))}
                </ul>
                <footer className="space-y-3 border-t border-border p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
                  <CartSummaryTotals />
                  <Link href="/bg/kolichka" onClick={() => setOpen(false)} className={buttonClass('primary', 'lg', 'w-full')}>Към количката</Link>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
