/**
 * Merchant-confirmed commercial rules (GN Invest LTD, 2026-10-21).
 * Checkout (Phase 4) must enforce the same rules server-side through PrestaShop.
 */
export const storePolicy = {
  /** Only bank transfer is accepted (PrestaShop ps_wirepayment). */
  payment: { label: 'Банков превод', module: 'ps_wirepayment' },
  /** Single carrier, PrestaShop id_carrier 19. */
  carrier: { label: 'Транспортна фирма', id: 19 },
  /** All customers buy VAT-exclusive; no VAT line is shown or added. */
  pricesExcludeVat: true,
  /** Prices are visible to logged-in customers only. */
  guestsSeePrices: false,
  /** Accounts are created by GN staff only; there is no public sign-up. */
  publicRegistration: false,
} as const;
