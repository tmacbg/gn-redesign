import { describe, expect, it } from 'vitest';
import { formatMoney, lineTotal, roundCents } from './money';
import { decrement, increment, normalizeQuantity, validateQuantity } from './quantity';
import { parsePackInfo } from './pack';
import { nextCutoff, timeUntilCutoff } from './cutoff';

describe('money', () => {
  it('formats EUR for bg-BG', () => {
    expect(formatMoney({ amount: 1234.5, currency: 'EUR' })).toMatch(/1\s?234,50\s?€/);
  });
  it('rounds half up per item', () => {
    expect(roundCents(0.845)).toBe(0.85);
    expect(roundCents(0.843632)).toBe(0.84);
    expect(lineTotal({ amount: 0.843632, currency: 'EUR' }, 10)).toEqual({ amount: 8.4, currency: 'EUR' });
  });
});

describe('quantity rules', () => {
  const moq10 = { min: 10, step: 1 };
  const carton = { min: 12, step: 12 };
  it('validates minimum and multiples', () => {
    expect(validateQuantity(0, moq10)).toBeNull();
    expect(validateQuantity(9, moq10)).toBe('below-minimum');
    expect(validateQuantity(10, moq10)).toBeNull();
    expect(validateQuantity(18, carton)).toBe('not-multiple');
    expect(validateQuantity(24, carton)).toBeNull();
    expect(validateQuantity(2.5, moq10)).toBe('not-integer');
  });
  it('normalizes up to a valid quantity', () => {
    expect(normalizeQuantity(3, moq10)).toBe(10);
    expect(normalizeQuantity(13, carton)).toBe(24);
    expect(normalizeQuantity(-1, carton)).toBe(0);
  });
  it('steps through valid quantities', () => {
    expect(increment(0, carton)).toBe(12);
    expect(increment(12, carton)).toBe(24);
    expect(decrement(12, carton)).toBe(0);
    expect(decrement(11, moq10)).toBe(10);
  });
});

describe('parsePackInfo', () => {
  it('parses the merchant description convention', () => {
    const html = '<p>Цената е за: 1 бр. / 650 гр.</p>\r\n<p>Транспортна опаковка: Кашон</p>\r\n<p>Минималното количество за поръчка е: 10 бр.</p>\r\n<p>Продукта е с превод от производителя на: Немски, Френски, Нидерландски език</p>';
    expect(parsePackInfo(html)).toEqual({ priceBasis: '1 бр. / 650 гр', transportPackage: 'Кашон', labelLanguages: ['Немски', 'Френски', 'Нидерландски'] });
  });
  it('parses run-together text', () => {
    expect(parsePackInfo(' Цената е за: 1 кг. Транспортна опаковка: Кашон Минималното количество за поръчка е: 1 кг.').transportPackage).toBe('Кашон');
  });
  it('returns nulls when the convention is absent', () => {
    expect(parsePackInfo('<p>Вкусен хляб</p>')).toEqual({ priceBasis: null, transportPackage: null, labelLanguages: [] });
  });
});

describe('weekly cut-off (Saturday 13:00 Europe/Sofia)', () => {
  it('finds this Saturday from a Wednesday', () => {
    // Wed 2026-10-21 09:00 Sofia (UTC+3) = 06:00Z
    expect(nextCutoff(new Date('2026-10-21T06:00:00Z')).toISOString()).toBe('2026-10-24T10:00:00.000Z');
  });
  it('rolls to next week after Saturday 13:00', () => {
    expect(nextCutoff(new Date('2026-10-24T10:00:01Z')).toISOString()).toBe('2026-10-31T11:00:00.000Z'); // after DST ends: UTC+2
  });
  it('reports remaining time', () => {
    const t = timeUntilCutoff(new Date('2026-10-24T08:30:00Z'));
    expect([t.days, t.hours, t.minutes]).toEqual([0, 1, 30]);
  });
});
