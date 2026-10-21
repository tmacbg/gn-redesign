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
  /** Prices are visible to every logged-in customer (any group), never to guests. */
  guestsSeePrices: false,
  /** Accounts are created by GN staff only; there is no public sign-up. */
  publicRegistration: false,
  /**
   * Customer groups in use. Every logged-in customer sees prices; only the default group may order. Accounts are moved
   * to the restricted group automatically (e.g. outstanding balance) at any time, so access is
   * re-checked server-side on every price, cart and checkout request, never cached from login.
   */
  groups: { orderingGroupIds: [3], restrictedGroupId: 5 },
} as const;
