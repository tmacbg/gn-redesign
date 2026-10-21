'use client';

import { ShoppingBasket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from './cart-store';

export function CartButton() {
  const count = useCart((s) => s.lines.length);
  const setOpen = useCart((s) => s.setOpen);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <button type="button" onClick={() => setOpen(true)} className="relative inline-flex h-11 items-center gap-2 rounded px-3 text-sm font-semibold hover:bg-surface-muted" aria-label={`Количка, ${mounted ? count : 0} продукта`}>
      <ShoppingBasket className="h-5 w-5" aria-hidden />
      <span className="hidden lg:inline">Количка</span>
      {mounted && count > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-2xs font-bold text-fg tabular-nums">{count}</span>}
    </button>
  );
}
