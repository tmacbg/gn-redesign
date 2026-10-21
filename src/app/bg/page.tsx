import { ArrowRight, BadgeCheck, CalendarClock, Package, RotateCcw, Truck } from 'lucide-react';
import Link from 'next/link';
import { getCatalog, listProducts } from '@/commerce/catalog';
import { ProductCard } from '@/components/product/product-card';
import { CutoffCountdown } from '@/components/site/cutoff-countdown';
import { Rail, Section } from '@/components/site/section';
import { ArtPicture } from '@/components/ui/art-picture';
import { buttonClass } from '@/components/ui/button';
import { categoryVisual, featuredCategoryIds, srcSet } from '@/lib/assets';
import { categoryUrl } from '@/lib/urls';
import { getViewer, priceFor } from '@/server/viewer';

export default async function HomePage() {
  const [viewer, catalog] = await Promise.all([getViewer(), getCatalog()]);
  const cats = featuredCategoryIds.map((id) => catalog.category(id)).filter((c) => c != null);
  const [newest, meat, dairy, reorder] = await Promise.all([
    listProducts(catalog, { sort: 'new', perPage: 10 }),
    listProducts(catalog, { categoryId: 93, perPage: 10 }),
    listProducts(catalog, { categoryId: 101, perPage: 10 }),
    listProducts(catalog, { categoryId: 180, perPage: 5 }),
  ]).then((r) => r.map((x) => x.items));
  const brands = catalog.brands().slice(0, 18);

  return (
    <>
      {/* Hero — Higgsfield art-directed: 9:16 mobile, 4:3 tablet, 21:9 desktop */}
      <section className="relative isolate overflow-hidden bg-[#efe9df]">
        <ArtPicture
          sources={[
            { name: 'hero-mobile', widths: [640, 1080], media: '(max-width: 767px)' },
            { name: 'hero-tablet', widths: [1024, 1600], media: '(max-width: 1023px)' },
            { name: 'hero-desktop', widths: [1280, 1920, 2560] },
          ]}
          fallback={{ name: 'hero-desktop', width: 1920 }} width={1920} height={823} sizes="100vw" priority alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[50%_100%] md:object-right"
        />
        <div className="absolute inset-x-0 top-0 -z-10 h-[62%] bg-gradient-to-b from-[#efe9df] via-[#efe9df]/85 to-transparent md:hidden" />
        <div className="mx-auto flex min-h-[640px] max-w-[1440px] flex-col px-5 pb-6 pt-8 md:min-h-[520px] md:justify-center md:px-6 md:pb-10 lg:min-h-[560px]">
          <div className="flex max-w-xl flex-1 flex-col md:flex-none">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-primary shadow-1 backdrop-blur">
              <BadgeCheck className="h-3.5 w-3.5" /> Търговия на едро · само за фирми
            </span>
            <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.1] tracking-tight text-fg md:text-4xl lg:text-[3.25rem]">
              Вкусът на България <span className="text-primary">за рафтовете на Европа</span>
            </h1>
            <p className="mt-3 max-w-md text-sm text-fg-muted sm:text-base md:mt-4 md:text-lg">Над 10&nbsp;000 продукта от български производители — колбаси, сирена, консерви, напитки и още. Поръчвате до събота, доставяме до вашия магазин.</p>
            <div className="mt-auto flex flex-col gap-2.5 pt-6 sm:flex-row sm:flex-wrap sm:gap-3 md:mt-6 md:pt-0">
              <Link href="/bg/kategorii" className={buttonClass('primary', 'lg')}>Разгледай каталога <ArrowRight className="h-4 w-4" /></Link>
              {viewer.isCustomer
                ? <Link href="/bg/barza-porachka" className={buttonClass('secondary', 'lg')}>Бърза поръчка</Link>
                : <Link href="/bg/vhod" className={buttonClass('secondary', 'lg')}>Вход за клиенти</Link>}
            </div>
          </div>
        </div>
      </section>

      {/* Service strip */}
      <section className="border-b border-border bg-surface">
        <ul className="mx-auto grid max-w-[1440px] grid-cols-2 gap-px px-4 py-4 text-sm md:grid-cols-4 md:px-6">
          {[
            { icon: CalendarClock, t: 'Седмичен цикъл', d: <CutoffCountdown compact /> },
            { icon: Truck, t: 'Доставка в Европа', d: 'До вашия магазин' },
            { icon: Package, t: 'Опаковки на едро', d: 'Кашон, минимални количества' },
            { icon: BadgeCheck, t: '400+ марки', d: 'Български производители' },
          ].map(({ icon: Icon, t, d }) => (
            <li key={t} className="flex items-start gap-3 p-2">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"><Icon className="h-5 w-5" /></span>
              <span><b className="block text-fg">{t}</b><span className="text-xs text-fg-muted">{d}</span></span>
            </li>
          ))}
        </ul>
      </section>

      {viewer.isCustomer && (
        <Section title="Поръчай отново" eyebrow="От последните ви поръчки (демо)" href="/bg/barza-porachka" linkLabel="Бърза поръчка">
          <Rail>{reorder!.map((p) => <ProductCard key={p.id} product={p} price={priceFor(p, viewer)} />)}</Rail>
        </Section>
      )}

      <Section title="Категории" href="/bg/kategorii">
        <ul className="grid grid-cols-3 gap-2.5 sm:gap-3 md:grid-cols-4 lg:grid-cols-6">
          {cats.map((c) => (
            <li key={c.id}>
              <Link href={categoryUrl(c)} className="group block overflow-hidden rounded-md border border-border bg-surface transition-shadow hover:shadow-2">
                <div className="aspect-[4/3] overflow-hidden bg-surface-muted">
                  <picture>
                    <source type="image/avif" srcSet={srcSet(categoryVisual[c.id]!, [480, 800], 'avif')} sizes="(min-width:1024px) 16vw, 33vw" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/assets/higgsfield/${categoryVisual[c.id]}-480.webp`} alt="" width={480} height={362} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
                  </picture>
                </div>
                <div className="px-2.5 py-2 text-center text-xs font-semibold leading-tight sm:text-sm">{c.name.bg}</div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Campaigns */}
      <section className="mx-auto mt-12 grid max-w-[1440px] gap-3 px-4 md:mt-16 md:grid-cols-2 md:px-6">
        <CampaignBanner name="campaign-weekly-promo" href="/bg/456-top-promocii" eyebrow="Седмични оферти" title="Топ промоции на седмицата" cta="Към промоциите" tone="amber" />
        <CampaignBanner name="campaign-wholesale" href="/bg/barza-porachka" eyebrow="За магазини" title="Поръчвайте по-бързо с Бърза поръчка" cta="Започни" tone="green" />
      </section>

      <Section title="Нови продукти" eyebrow="Наскоро добавени" href="/bg/tarsene?sort=new">
        <Rail>{newest!.map((p, i) => <ProductCard key={p.id} product={p} price={priceFor(p, viewer)} priority={i < 2} />)}</Rail>
      </Section>

      <Section title="Месни продукти" href={categoryUrl(catalog.category(93)!)}>
        <Rail>{meat!.map((p) => <ProductCard key={p.id} product={p} price={priceFor(p, viewer)} />)}</Rail>
      </Section>

      <section className="mx-auto mt-12 max-w-[1440px] px-4 md:mt-16 md:px-6">
        <CampaignBanner name="campaign-new-arrivals" href="/bg/344-bio-produkti" eyebrow="Нова селекция" title="Био продукти от български стопанства" cta="Разгледай" tone="green" wide />
      </section>

      <Section title="Млечни продукти" href={categoryUrl(catalog.category(101)!)}>
        <Rail>{dairy!.map((p) => <ProductCard key={p.id} product={p} price={priceFor(p, viewer)} />)}</Rail>
      </Section>

      <Section title="Марки" eyebrow="Български производители">
        <ul className="flex flex-wrap gap-2">
          {brands.map((b) => (
            <li key={b.id}><Link href={`/bg/tarsene?brand=${b.id}`} className="block rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-fg-muted hover:border-primary hover:text-primary">{b.name}</Link></li>
          ))}
        </ul>
      </Section>

      <Section title="Как работи" eyebrow="Поръчка на едро">
        <ol className="grid gap-3 md:grid-cols-3">
          {[
            { n: 1, t: 'Влезте в профила си', d: 'Профилите се създават само от служител на GN. Цените са видими след вход и са без ДДС.' },
            { n: 2, t: 'Добавете продукти', d: 'От каталога или чрез Бърза поръчка по име и референция. Минималните количества се спазват автоматично.' },
            { n: 3, t: 'Поръчайте до събота 13:00', d: 'Плащане по банков път. Доставка с транспортна фирма до вашия магазин през следващата седмица.' },
          ].map((s) => (
            <li key={s.n} className="rounded-md border border-border bg-surface p-5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-fg">{s.n}</span>
              <h3 className="mt-3 font-bold">{s.t}</h3>
              <p className="mt-1 text-sm text-fg-muted">{s.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex items-center gap-2 text-sm text-fg-muted"><RotateCcw className="h-4 w-4" />Повторете минала поръчка с един клик от профила си.</div>
      </Section>
    </>
  );
}

function CampaignBanner({ name, href, eyebrow, title, cta, tone, wide }: { name: string; href: string; eyebrow: string; title: string; cta: string; tone: 'amber' | 'green'; wide?: boolean }) {
  return (
    <Link href={href} className={`group relative isolate block overflow-hidden rounded-lg ${wide ? 'min-h-[200px] md:min-h-[260px]' : 'min-h-[200px] md:min-h-[240px]'}`}>
      <ArtPicture sources={[{ name, widths: [960, 1600, 2400] }]} fallback={{ name, width: 960 }} width={960} height={411} alt=""
        sizes={wide ? '100vw' : '(min-width:768px) 50vw, 100vw'} className="absolute inset-0 -z-10 h-full w-full object-cover object-right transition-transform duration-700 ease-out group-hover:scale-[1.02]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f6f1e8] via-[#f6f1e8]/80 to-transparent md:via-[#f6f1e8]/40" />
      <div className="flex h-full max-w-[62%] flex-col justify-center p-5 sm:p-6 lg:max-w-[50%] lg:p-8">
        <span className={`text-xs font-bold uppercase tracking-wider ${tone === 'amber' ? 'text-warning' : 'text-primary'}`}>{eyebrow}</span>
        <h2 className="mt-2 text-lg font-extrabold leading-tight tracking-tight sm:text-xl lg:text-2xl">{title}</h2>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">{cta}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
      </div>
    </Link>
  );
}
