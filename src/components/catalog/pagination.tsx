import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

export function Pagination({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (p: number) => string }) {
  if (pages <= 1) return null;
  const nums = [...new Set([1, page - 1, page, page + 1, pages].filter((n) => n >= 1 && n <= pages))].sort((a, b) => a - b);
  const item = 'grid h-10 min-w-10 place-items-center rounded px-3 text-sm font-semibold';
  return (
    <nav aria-label="Страници" className="mt-8 flex items-center justify-center gap-1">
      {page > 1 ? <Link href={hrefFor(page - 1)} rel="prev" className={cn(item, 'hover:bg-surface-muted')} aria-label="Предишна"><ChevronLeft className="h-4 w-4" /></Link> : <span className={cn(item, 'opacity-30')}><ChevronLeft className="h-4 w-4" /></span>}
      {nums.map((n, i) => (
        <span key={n} className="contents">
          {i > 0 && n - nums[i - 1]! > 1 && <span className="px-1 text-fg-subtle">…</span>}
          <Link href={hrefFor(n)} aria-current={n === page ? 'page' : undefined} className={cn(item, n === page ? 'bg-primary text-primary-fg' : 'hover:bg-surface-muted')}>{n}</Link>
        </span>
      ))}
      {page < pages ? <Link href={hrefFor(page + 1)} rel="next" className={cn(item, 'hover:bg-surface-muted')} aria-label="Следваща"><ChevronRight className="h-4 w-4" /></Link> : <span className={cn(item, 'opacity-30')}><ChevronRight className="h-4 w-4" /></span>}
    </nav>
  );
}

export function pageHref(path: string, params: Record<string, string | undefined>, page: number) {
  const sp = new URLSearchParams(Object.entries({ ...params, page: page > 1 ? String(page) : undefined }).filter((e): e is [string, string] => !!e[1]));
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}
