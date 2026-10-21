import type { Money } from './types';

const formatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(money: Money, locale = 'bg-BG'): string {
  const key = `${locale}:${money.currency}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, { style: 'currency', currency: money.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    formatters.set(key, f);
  }
  return f.format(money.amount);
}

/** Half-up rounding to cents, matching PS_PRICE_ROUND_MODE=2 with per-item rounding. */
export function roundCents(amount: number): number {
  return Math.sign(amount) * Math.round((Math.abs(amount) + Number.EPSILON) * 100) / 100;
}

export function lineTotal(unit: Money, quantity: number): Money {
  return { amount: roundCents(roundCents(unit.amount) * quantity), currency: unit.currency };
}
