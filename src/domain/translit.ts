// Bulgarian Streamlined System (official since 2009). Used so Latin queries like "sirene" find "сирене".
const MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p',
  р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sht', ъ: 'a', ь: 'y', ю: 'yu', я: 'ya',
};

export function translitBg(input: string): string {
  let out = '';
  for (const ch of input.toLocaleLowerCase('bg')) out += MAP[ch] ?? ch;
  return out;
}

/** Lowercase, strip diacritics and transliterate, for accent/script-insensitive matching. */
export function foldForSearch(input: string): string {
  return translitBg(input).normalize('NFKD').replace(/[̀-ͯ]/g, '');
}
