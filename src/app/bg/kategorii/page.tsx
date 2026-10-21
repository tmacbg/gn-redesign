import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getCatalog } from '@/commerce/catalog';
import { categoryVisual } from '@/lib/assets';
import { categoryUrl } from '@/lib/urls';

export const metadata = { title: 'Категории' };

export default async function CategoriesPage() {
  const tree = (await getCatalog()).tree;
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Категории</h1>
      <ul className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {tree.map((c) => (
          <li key={c.id} className="overflow-hidden rounded-md border border-border bg-surface">
            <Link href={categoryUrl(c)} className="flex items-center gap-3 p-3 hover:bg-surface-muted">
              {categoryVisual[c.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/assets/higgsfield/${categoryVisual[c.id]}-480.webp`} alt="" width={64} height={48} loading="lazy" className="h-12 w-16 shrink-0 rounded object-cover" />
              ) : <span className="grid h-12 w-16 shrink-0 place-items-center rounded bg-primary-soft text-lg font-extrabold text-primary">{c.name.bg[0]}</span>}
              <span className="flex-1 font-bold">{c.id === 456 ? 'Топ промоции' : c.name.bg}</span>
              <ChevronRight className="h-5 w-5 text-fg-subtle" />
            </Link>
            {c.children.length > 0 && c.id !== 456 && (
              <ul className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2.5">
                {c.children.slice(0, 8).map((s) => <li key={s.id}><Link href={categoryUrl(s)} className="block rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-fg-muted hover:text-primary">{s.name.bg}</Link></li>)}
                {c.children.length > 8 && <li className="px-1 py-1 text-xs text-fg-subtle">+{c.children.length - 8}</li>}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
