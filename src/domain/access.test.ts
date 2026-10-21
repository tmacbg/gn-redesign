import { describe, expect, it } from 'vitest';
import { accessForGroup, canOrder, canSeePrices } from './access';

describe('customer access by group', () => {
  const ordering = [3];
  it('lets the default group see prices and order', () => {
    expect(accessForGroup(3, ordering)).toBe('customer');
    expect(canSeePrices('customer') && canOrder('customer')).toBe(true);
  });
  it('restricts the blocked group', () => {
    expect(accessForGroup(5, ordering)).toBe('restricted');
  });
  it('fails closed for unknown or missing groups', () => {
    expect(accessForGroup(4, ordering)).toBe('restricted');
    expect(accessForGroup(null, ordering)).toBe('restricted');
    expect(accessForGroup(undefined, ordering)).toBe('restricted');
  });
  it('shows prices to every logged-in customer, never to guests', () => {
    expect(canSeePrices('guest')).toBe(false);
    expect(canSeePrices('restricted')).toBe(true);
  });
  it('lets only the ordering group order', () => {
    expect(canOrder('guest')).toBe(false);
    expect(canOrder('restricted')).toBe(false);
  });
});
