import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function Section({ title, href, linkLabel = 'Виж всички', children, eyebrow }: { title: string; href?: string; linkLabel?: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto mt-12 max-w-[1440px] px-4 md:mt-16 md:px-6">
      <div className="mb-4 flex items-end justify-between gap-4 md:mb-6">
        <div>
          {eyebrow && <div className="mb-1 text-xs font-bold uppercase tracking-wider text-secondary">{eyebrow}</div>}
          <h2 className="text-xl font-extrabold tracking-tight md:text-2xl">{title}</h2>
        </div>
        {href && <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">{linkLabel}<ArrowRight className="h-4 w-4" /></Link>}
      </div>
      {children}
    </section>
  );
}

export function Rail({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 lg:grid-cols-5 [&>*]:w-[46%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-[31%] md:[&>*]:w-auto md:[&>*:nth-child(n+5)]:hidden lg:[&>*:nth-child(5)]:block">
      {children}
    </div>
  );
}
