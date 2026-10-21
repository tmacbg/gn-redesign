import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  const all = [{ name: 'Начало', href: '/bg' }, ...items];
  const json = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: all.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.href })) };
  return (
    <nav aria-label="Навигационна пътека" className="text-xs text-fg-subtle">
      <ol className="flex flex-wrap items-center gap-1">
        {all.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}
            {c.href && i < all.length - 1 ? <Link href={c.href} className="hover:text-primary">{c.name}</Link> : <span aria-current="page" className="text-fg-muted">{c.name}</span>}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
    </nav>
  );
}
