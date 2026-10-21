'use client';

import { AlertCircle, ShoppingBasket, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatMoney, lineTotal } from '@/domain/money';
import { CartSummaryTotals } from '@/components/cart/cart-drawer';
import { useCart } from '@/components/cart/cart-store';
import { QuantityStepper } from '@/components/product/quantity-stepper';
import { CutoffCountdown } from '@/components/site/cutoff-countdown';
import { buttonClass } from '@/components/ui/button';

export function CartView() {
  const { lines, setQty, remove, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-64 animate-pulse rounded-lg bg-surface" />;
  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface py-16 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary"><ShoppingBasket className="h-7 w-7" /></span>
        <p className="text-lg font-bold">Количката е празна</p>
        <div className="flex gap-2"><Link href="/bg/kategorii" className={buttonClass('primary')}>Към каталога</Link><Link href="/bg/barza-porachka" className={buttonClass('secondary')}>Бърза поръчка</Link></div>
      </div>
    );
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 text-sm">
          <span className="font-semibold">{lines.length} продукта</span>
          <button type="button" onClick={clear} className="text-fg-subtle hover:text-danger">Изчисти количката</button>
        </div>
        <ul className="divide-y divide-border">
          {lines.map((l) => (
            <li key={l.productId} className="grid grid-cols-[64px_1fr_auto] gap-3 p-4 sm:grid-cols-[80px_1fr_auto_auto] sm:items-center sm:gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded border border-border bg-white sm:h-20 sm:w-20">{l.image && <Image src={l.image} alt="" fill sizes="80px" className="object-contain p-1" />}</div>
              <div className="min-w-0">
                <Link href={l.href} className="line-clamp-2 font-semibold hover:text-primary">{l.name}</Link>
                <div className="mt-0.5 text-xs text-fg-subtle">Реф. {l.reference}{l.basis && ` · за ${l.basis}`}{l.pack && ` · ${l.pack}`}</div>
                {l.unitPrice != null && <div className="mt-1 text-xs text-fg-muted">{formatMoney({ amount: l.unitPrice, currency: 'EUR' })} / бр. без ДДС</div>}
              </div>
              <button type="button" onClick={() => remove(l.productId)} className="self-start p-1 text-fg-subtle hover:text-danger sm:order-last sm:self-center" aria-label={`Премахни ${l.name}`}><Trash2 className="h-4 w-4" /></button>
              <div className="col-span-3 flex items-center justify-between gap-3 sm:col-span-1 sm:justify-end">
                <QuantityStepper value={l.qty} rule={l.rule} onChange={(q) => setQty(l, q)} label={l.name} />
                {l.unitPrice != null && <span className="w-24 text-right font-bold tabular-nums">{formatMoney(lineTotal({ amount: l.unitPrice, currency: 'EUR' }, l.qty))}</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <aside className="h-fit space-y-4 rounded-lg border border-border bg-surface p-5 lg:sticky lg:top-48">
        <h2 className="text-lg font-bold">Обобщение</h2>
        <CartSummaryTotals />
        <p className="flex gap-2 rounded bg-primary-soft p-3 text-xs text-primary"><AlertCircle className="h-4 w-4 shrink-0" />Всички цени са без ДДС. Цените и количествата се проверяват отново от сървъра преди потвърждаване.</p>
        <div className="text-xs text-fg-muted"><CutoffCountdown compact /></div>
        <button type="button" disabled className={buttonClass('primary', 'lg', 'hidden w-full lg:flex')}>Към поръчка (етап 4)</button>
      </aside>
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-surface p-3 lg:hidden">
        <button type="button" disabled className={buttonClass('primary', 'lg', 'w-full')}>Към поръчка (етап 4)</button>
      </div>
    </div>
  );
}
