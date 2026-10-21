'use client';

import { Check, ShoppingBasket } from 'lucide-react';
import { useCart, type CartLine } from '@/components/cart/cart-store';
import { Button } from '@/components/ui/button';
import { QuantityStepper } from './quantity-stepper';
import { cn } from '@/lib/cn';

export type CartLineInput = Omit<CartLine, 'qty'>;

/** Compact control for cards and lists: "Добави" turns into a stepper once the item is in the cart. */
export function AddToCart({ line, canOrder, size = 'md', full }: { line: CartLineInput; canOrder: boolean; size?: 'sm' | 'md'; full?: boolean }) {
  const qty = useCart((s) => s.lines.find((l) => l.productId === line.productId)?.qty ?? 0);
  const setQty = useCart((s) => s.setQty);
  if (!canOrder) return null;
  if (qty > 0) {
    return (
      <div className={cn('flex items-center gap-2', full && 'w-full justify-between')}>
        <QuantityStepper value={qty} rule={line.rule} onChange={(q) => setQty(line, q)} size={size} label={line.name} />
        <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><Check className="h-3.5 w-3.5" />В количката</span>
      </div>
    );
  }
  return (
    <Button size={size === 'sm' ? 'sm' : 'md'} className={cn(full && 'w-full')} onClick={() => setQty(line, line.rule.min)} aria-label={`Добави ${line.name}`}>
      <ShoppingBasket className="h-4 w-4" aria-hidden />
      Добави{line.rule.min > 1 ? ` ${line.rule.min}` : ''}
    </Button>
  );
}
