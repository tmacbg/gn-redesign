'use client';

import { ChevronRight, LayoutGrid, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export interface MenuNode { id: number; name: string; href: string; children: MenuNode[] }

export function CategoryMenu({ tree }: { tree: MenuNode[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => { if (panel.current && !panel.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, [open]);
  const current = tree[active];
  return (
    <div ref={panel} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mega-menu"
        className="inline-flex h-11 items-center gap-2 rounded bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
        {open ? <X className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />} Всички категории
      </button>
      {open && (
        <div id="mega-menu" className="absolute left-0 top-full z-50 mt-2 flex h-[min(70vh,560px)] w-[min(92vw,960px)] overflow-hidden rounded-lg border border-border bg-surface shadow-3">
          <ul className="w-72 shrink-0 overflow-y-auto border-r border-border py-2">
            {tree.map((n, i) => (
              <li key={n.id}>
                <Link href={n.href} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setOpen(false)}
                  className={cn('flex items-center justify-between px-4 py-2 text-sm', i === active ? 'bg-primary-soft font-semibold text-primary' : 'text-fg hover:bg-surface-muted')}>
                  {n.name}{n.children.length > 0 && <ChevronRight className="h-4 w-4 opacity-60" />}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex-1 overflow-y-auto p-6">
            {current && (
              <>
                <Link href={current.href} onClick={() => setOpen(false)} className="text-xl font-bold hover:text-primary">{current.name}</Link>
                <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 lg:grid-cols-3">
                  {current.children.map((c) => (
                    <li key={c.id}>
                      <Link href={c.href} onClick={() => setOpen(false)} className="block rounded px-2 py-1.5 text-sm text-fg-muted hover:bg-surface-muted hover:text-fg">{c.name}</Link>
                      {c.children.length > 0 && (
                        <ul className="mb-1 ml-2 border-l border-border pl-2">
                          {c.children.map((g) => <li key={g.id}><Link href={g.href} onClick={() => setOpen(false)} className="block py-1 text-xs text-fg-subtle hover:text-primary">{g.name}</Link></li>)}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
