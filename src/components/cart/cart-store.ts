'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { normalizeQuantity } from '@/domain/quantity';
import type { QuantityRule } from '@/domain/types';

/**
 * MOCKUP cart kept in the browser. In Phase 4 the cart lives in PrestaShop (via gnheadless)
 * and this store only mirrors the server response.
 */
export interface CartLine {
  productId: number;
  name: string;
  image: string | null;
  href: string;
  reference: string;
  rule: QuantityRule;
  basis: string | null;
  pack: string | null;
  qty: number;
  /** Display-only demo price; real totals are always recalculated server-side. */
  unitPrice: number | null;
}

interface CartState {
  lines: CartLine[];
  open: boolean;
  setOpen(open: boolean): void;
  setQty(line: Omit<CartLine, 'qty'>, qty: number): void;
  remove(productId: number): void;
  clear(): void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      setOpen: (open) => set({ open }),
      setQty: (line, qty) =>
        set((s) => {
          const q = normalizeQuantity(qty, line.rule);
          const rest = s.lines.filter((l) => l.productId !== line.productId);
          if (q === 0) return { lines: rest };
          const existing = s.lines.find((l) => l.productId === line.productId);
          return { lines: existing ? s.lines.map((l) => (l.productId === line.productId ? { ...l, ...line, qty: q } : l)) : [...s.lines, { ...line, qty: q }] };
        }),
      remove: (productId) => set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'gn-mock-cart', storage: createJSONStorage(() => localStorage), partialize: (s) => ({ lines: s.lines }) },
  ),
);

export const useCartCount = () => useCart((s) => s.lines.length);
