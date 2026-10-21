import { describe, expect, it } from 'vitest';
import { buildQuery } from './client';
import { categoryDTO, collection, productDTO } from './dto';
import { cleanLabel, isListable, mapCategory, mapProduct } from './mappers';
import { toSearchDoc } from './sync';
import { CatalogEngine } from '../engine';
import type { CatalogData } from '../catalog-data';
import { translitBg } from '@/domain/translit';

const lang = (bg: string, en = bg) => [{ id: '2', value: bg }, { id: '3', value: en }, { id: '4', value: bg }];

// Shape mirrors a real /api/products?display=full item (product 11721), trimmed.
const rawProduct = {
  id: 11721, active: '1', reference: '55622263', ean13: '', minimal_quantity: '10', price: '0.843632', wholesale_price: '0.500000', weight: '0.650000',
  id_manufacturer: '551', manufacturer_name: 'ВКУС ОТ БЪЛГАРИЯ', id_category_default: '331', id_default_image: '10609', on_sale: '1',
  available_for_order: '1', show_price: '1', visibility: 'both', date_add: '2021-03-13 07:24:04', date_upd: '2026-08-18 10:29:58',
  name: lang('Хляб България 650гр/10 броя в кашон', 'Bread Bulgaria 650g/10 pcs.per carton'),
  link_rewrite: lang('khlyab-blgariya-650gr10-brv-kashon'),
  description_short: lang('<p>Цената е за: 1 бр. / 650 гр.</p><p>Транспортна опаковка: Кашон</p><p>Минималното количество за поръчка е: 10 бр.</p>'),
  meta_title: lang(''), meta_description: lang(''),
  associations: { categories: [{ id: '2' }, { id: '331' }, { id: '456' }], images: [{ id: '10609' }, { id: '10615' }], stock_availables: [{ id: '8499' }] },
};

describe('webservice client', () => {
  it('keeps PrestaShop brackets and pipes literal', () => {
    expect(buildQuery({ display: '[id,name]', 'filter[id]': '[1|2]', limit: '0,500' }))
      .toBe('output_format=JSON&display=[id,name]&filter[id]=[1|2]&limit=0,500');
  });
  it('encodes unsafe characters', () => {
    expect(buildQuery({ 'filter[date_upd]': '[2026-10-01 00:00:00,2026-10-02 00:00:00]' })).toContain('2026-10-01%2000%3A00%3A00');
  });
});

describe('DTO parsing and mapping', () => {
  const dto = productDTO.parse(rawProduct);
  it('strips the cost price', () => {
    expect('wholesale_price' in dto).toBe(false);
  });
  it('maps to the domain product', () => {
    const p = mapProduct(dto, 'https://shop.test/');
    expect(p).toMatchObject({
      id: 11721, reference: '55622263', ean13: null, slug: 'khlyab-blgariya-650gr10-brv-kashon', categoryId: 331,
      categoryIds: [331, 456], brand: { id: 551, name: 'ВКУС ОТ БЪЛГАРИЯ' }, quantity: { min: 10, step: 1 }, basePriceExcl: 0.843632,
      pack: { priceBasis: '1 бр. / 650 гр', transportPackage: 'Кашон' }, metaTitle: null,
    });
    expect(p.images.map((i) => i.medium)).toEqual([
      'https://shop.test/10609-home_default/khlyab-blgariya-650gr10-brv-kashon.jpg',
      'https://shop.test/10615-home_default/khlyab-blgariya-650gr10-brv-kashon.jpg',
    ]);
  });
  it('treats inactive or hidden products as not listable', () => {
    expect(isListable(dto)).toBe(true);
    expect(isListable(productDTO.parse({ ...rawProduct, active: '0' }))).toBe(false);
    expect(isListable(productDTO.parse({ ...rawProduct, visibility: 'none' }))).toBe(false);
  });
  it('parses an empty collection ("[]" → {})', () => {
    expect(collection('categories', categoryDTO).parse({})).toEqual([]);
  });
  it('cleans legacy icon glyphs from category names', () => {
    expect(cleanLabel('Замразени  продукти')).toBe('Замразени продукти');
    const c = mapCategory(categoryDTO.parse({ id: 107, id_parent: '2', active: '1', level_depth: '2', position: '3', name: lang('Замразени продукти'), link_rewrite: lang('zamrazeni-produkti') }));
    expect(c).toMatchObject({ id: 107, parentId: 2, depth: 1, name: { bg: 'Замразени продукти' } });
  });
});

describe('search document', () => {
  it('never contains prices and includes a Latin transliteration', () => {
    const p = mapProduct(productDTO.parse(rawProduct), 'https://shop.test');
    const doc = toSearchDoc(p, new Map([[331, 'Хляб'], [456, 'Топ промоции']]));
    expect(JSON.stringify(doc)).not.toMatch(/price/i);
    expect(doc.categories).toEqual(['Хляб', 'Топ промоции']);
    expect(doc.translit).toContain('hlyab balgariya');
  });
});

describe('translit', () => {
  it('follows the Bulgarian streamlined system', () => {
    expect(translitBg('Щастливец Шопска Сирене Ябълка Юнак')).toBe('shtastlivets shopska sirene yabalka yunak');
  });
});

describe('CatalogEngine', () => {
  const base = mapProduct(productDTO.parse(rawProduct), 'https://shop.test');
  const data: CatalogData = {
    source: 'prestashop', syncedAt: '2026-10-21T00:00:00Z', newDays: 20, brands: [],
    categories: [
      { id: 180, parentId: 2, depth: 1, position: 1, name: { bg: 'Тестени изделия', en: '' }, slug: 'testeni-izdeliya' },
      { id: 331, parentId: 180, depth: 2, position: 0, name: { bg: 'Хляб', en: '' }, slug: 'khlyab' },
      { id: 456, parentId: 2, depth: 1, position: 2, name: { bg: 'Топ промоции', en: '' }, slug: 'top-promocii' },
    ],
    products: [
      base,
      { ...base, id: 2, reference: '999', name: { bg: 'Добруджански хляб', en: '' }, categoryId: 331, categoryIds: [331], brand: { id: 9, name: 'ДОБРУДЖА' }, dateAdd: '2026-10-15 10:00:00', onSale: false },
    ],
  };
  const engine = new CatalogEngine(data, Date.parse('2026-10-21T00:00:00Z'));
  it('builds the tree under Home', () => {
    expect(engine.tree.map((n) => n.id)).toEqual([180, 456]);
    expect(engine.categoryPath(331).map((c) => c.slug)).toEqual(['testeni-izdeliya', 'khlyab']);
  });
  it('lists through descendants and secondary categories', () => {
    expect(engine.list({ categoryId: 180 }).total).toBe(2);
    expect(engine.list({ categoryId: 456 }).items.map((p) => p.id)).toEqual([11721]);
  });
  it('computes "new" from PS_NB_DAYS_NEW_PRODUCT', () => {
    expect(engine.product(2)?.isNew).toBe(true);
    expect(engine.product(11721)?.isNew).toBe(false);
  });
  it('filters by brand but keeps brand facets from the unfiltered set', () => {
    const r = engine.list({ categoryId: 331, brandId: 9 });
    expect(r.items.map((p) => p.id)).toEqual([2]);
    expect(r.brands.map((b) => b.id).sort((a, b) => a - b)).toEqual([9, 551]);
  });
  it('matches Latin queries against Cyrillic names', () => {
    expect(engine.match('dobrudzhanski')).toEqual([2]);
    expect(engine.match('55622263')).toEqual([11721]);
  });
  it('paginates and clamps the page number', () => {
    const r = engine.list({ perPage: 1, page: 9 });
    expect([r.page, r.pages, r.items.length]).toEqual([2, 2, 1]);
  });
  it('derives the legacy category slug for product URLs', () => {
    expect(engine.product(11721)?.categorySlug).toBe('khlyab');
  });
  it('exposes the base price only through demoPrice', () => {
    expect(engine.product(11721)).not.toHaveProperty('basePriceExcl');
    expect(engine.demoPrice(11721)?.unitPrice.amount).toBe(0.843632);
  });
});
