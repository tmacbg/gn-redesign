import { Phone, Truck, User } from 'lucide-react';
import Link from 'next/link';
import { getCatalog } from '@/commerce/catalog';
import type { CategoryNode } from '@/domain/types';
import { categoryUrl } from '@/lib/urls';
import type { Viewer } from '@/server/viewer';
import { CartButton } from '@/components/cart/cart-button';
import { CategoryMenu, type MenuNode } from './category-menu';
import { CutoffCountdown } from './cutoff-countdown';
import { Logo } from './logo';
import { SearchBox } from './search-box';

const toMenu = (n: CategoryNode): MenuNode => ({ id: n.id, name: n.name.bg, href: categoryUrl(n), children: n.children.map(toMenu) });

export async function Header({ viewer }: { viewer: Viewer }) {
  const tree = (await getCatalog()).tree;
  const quick = tree.filter((n) => [456, 93, 101, 87, 113, 147, 180, 344].includes(n.id));
  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="hidden border-b border-border bg-primary text-xs text-primary-fg md:block">
        <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-between px-6">
          <CutoffCountdown />
          <div className="flex items-center gap-5 text-white/85">
            <span className="inline-flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" />Доставка до магазини в Европа</span>
            <a href="tel:+359888402639" className="inline-flex items-center gap-1.5 hover:text-white"><Phone className="h-3.5 w-3.5" />+359 888 402 639</a>
          </div>
        </div>
      </div>
      <div className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 md:h-20 md:gap-6 md:px-6">
          <Logo className="shrink-0" />
          <SearchBox className="hidden flex-1 md:block md:max-w-2xl" />
          <nav className="ml-auto flex items-center gap-1" aria-label="Профил и количка">
            <Link href="/bg/barza-porachka" className="hidden h-11 items-center rounded px-3 text-sm font-semibold hover:bg-surface-muted xl:inline-flex">Бърза поръчка</Link>
            <Link href="/bg/vhod" className="inline-flex h-11 items-center gap-2 rounded px-3 text-sm font-semibold hover:bg-surface-muted">
              <User className="h-5 w-5" aria-hidden />
              <span className="hidden max-w-40 truncate lg:inline">{viewer.name ?? 'Вход'}</span>
            </Link>
            <CartButton />
          </nav>
        </div>
        <div className="px-4 pb-3 md:hidden"><SearchBox /></div>
      </div>
      <div className="hidden border-b border-border md:block">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-6 py-2">
          <CategoryMenu tree={tree.map(toMenu)} />
          <ul className="flex min-w-0 items-center gap-1 overflow-x-auto">
            {quick.map((n) => (
              <li key={n.id}>
                <Link href={categoryUrl(n)} className={`block whitespace-nowrap rounded px-3 py-2 text-sm font-medium hover:bg-surface-muted ${n.id === 456 ? 'text-warning' : 'text-fg-muted hover:text-fg'}`}>{n.id === 456 ? 'Топ промоции' : n.name.bg}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
