'use client';

import { Home, LayoutGrid, Search, ShoppingBasket, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/components/cart/cart-store';
import { cn } from '@/lib/cn';

const items = [
  { href: '/bg', label: 'Начало', icon: Home, match: (p: string) => p === '/bg' },
  { href: '/bg/kategorii', label: 'Категории', icon: LayoutGrid, match: (p: string) => p.startsWith('/bg/kategorii') || /^\/bg\/\d+-/.test(p) },
  { href: '/bg/tarsene', label: 'Търсене', icon: Search, match: (p: string) => p.startsWith('/bg/tarsene') },
  { href: '/bg/kolichka', label: 'Количка', icon: ShoppingBasket, match: (p: string) => p.startsWith('/bg/kolichka') },
  { href: '/bg/vhod', label: 'Профил', icon: User, match: (p: string) => p.startsWith('/bg/vhod') || p.startsWith('/bg/profil') },
];

export function BottomNav() {
  const path = usePathname();
  const count = useCart((s) => s.lines.length);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <nav aria-label="Основна навигация" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match(path);
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? 'page' : undefined} className={cn('relative flex h-16 flex-col items-center justify-center gap-1 text-2xs font-semibold', active ? 'text-primary' : 'text-fg-subtle')}>
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />}
                <span className="relative">
                  <Icon className="h-6 w-6" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                  {href === '/bg/kolichka' && mounted && count > 0 && <span className="absolute -right-2.5 -top-1.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-fg">{count}</span>}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
