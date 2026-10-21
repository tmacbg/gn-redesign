import type { QuantityRule } from './types';

export type QuantityIssue = 'below-minimum' | 'not-multiple' | 'not-integer';

export function validateQuantity(qty: number, rule: QuantityRule): QuantityIssue | null {
  if (!Number.isInteger(qty) || qty < 0) return 'not-integer';
  if (qty === 0) return null; // zero means "remove"
  if (qty < rule.min) return 'below-minimum';
  if ((qty - rule.min) % rule.step !== 0) return 'not-multiple';
  return null;
}

/** Snap any requested quantity to the nearest valid one at or above it (0 stays 0). */
export function normalizeQuantity(qty: number, rule: QuantityRule): number {
  if (!Number.isFinite(qty) || qty <= 0) return 0;
  const q = Math.ceil(qty);
  if (q <= rule.min) return rule.min;
  return rule.min + Math.ceil((q - rule.min) / rule.step) * rule.step;
}

export function increment(qty: number, rule: QuantityRule): number {
  return qty < rule.min ? rule.min : qty + rule.step;
}

export function decrement(qty: number, rule: QuantityRule): number {
  const next = qty - rule.step;
  return next < rule.min ? 0 : next;
}
