import { Search } from 'lucide-react';
import { cn } from '@/lib/cn';

export function SearchBox({ defaultValue, className, autoFocus }: { defaultValue?: string; className?: string; autoFocus?: boolean }) {
  return (
    <form action="/bg/tarsene" role="search" className={cn('relative', className)}>
      <label htmlFor="q" className="sr-only">Търсене на продукти</label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-fg-subtle" aria-hidden />
      <input id="q" name="q" type="search" defaultValue={defaultValue} autoFocus={autoFocus} enterKeyHint="search" autoComplete="off"
        placeholder="Търсете продукт, марка или референция…"
        className="h-11 w-full rounded border border-border bg-surface-muted pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-fg-subtle focus:border-primary focus:bg-surface" />
    </form>
  );
}
