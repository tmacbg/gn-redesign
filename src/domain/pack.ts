import type { PackInfo } from './types';

const text = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');

const field = (src: string, label: RegExp) => {
  const m = src.match(label);
  return m?.[1]?.replace(/\s+/g, ' ').trim().replace(/[.,;]$/, '') || null;
};

/**
 * Parses the merchant's description_short convention:
 *   Цената е за: 1 бр. / 650 гр.
 *   Транспортна опаковка: Кашон
 *   Минималното количество за поръчка е: 10 бр.
 *   Продукта е с превод от производителя на: Немски, Френски, Нидерландски език
 * The minimum quantity itself comes from PrestaShop `minimal_quantity`, not from this text.
 */
export function parsePackInfo(descriptionShortHtml: string): PackInfo {
  const src = text(descriptionShortHtml);
  const langs = field(src, /превод от производителя на:\s*([^\n]+)/i);
  return {
    priceBasis: field(src, /Цената е за:\s*([^\n]+?)(?=\s*Транспортна|\n|$)/i),
    transportPackage: field(src, /Транспортна опаковка:\s*([^\n]+?)(?=\s*Минималното|\n|$)/i),
    labelLanguages: langs
      ? langs.replace(/\s*език\s*$/i, '').split(/\s*,\s*/).map((s) => s.trim()).filter(Boolean)
      : [],
  };
}
