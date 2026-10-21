'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import type { ViewerStatus } from '@/domain/access';

const COOKIE = 'gn_demo_view';
const OPTIONS: { v: ViewerStatus; label: string; short: string }[] = [
  { v: 'guest', label: 'Гост', short: 'Гост' },
  { v: 'customer', label: 'Влязъл клиент', short: 'Клиент' },
  { v: 'restricted', label: 'Ограничен клиент', short: 'Ограничен' },
];

export function DemoBar({ status }: { status: ViewerStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const set = (v: ViewerStatus) => {
    document.cookie = `${COOKIE}=${v}; path=/; max-age=31536000; samesite=lax`;
    start(() => router.refresh());
  };
  return (
    <div className="bg-fg text-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 px-4 py-1.5 text-xs">
        <span><b className="mr-1.5 rounded-sm bg-accent px-1.5 py-0.5 text-2xs font-extrabold text-fg">MOCKUP</b><span className="hidden sm:inline">Реални продукти от PrestaShop · цените са демо (базова цена без ДДС)</span><span className="sm:hidden">Демо</span></span>
        <div role="group" aria-label="Симулиран изглед" className="flex overflow-hidden rounded-sm border border-white/25">
          {OPTIONS.map(({ v, label, short }) => (
            <button key={v} type="button" disabled={pending} onClick={() => set(v)} aria-pressed={v === status}
              className={`px-2 py-1 font-semibold sm:px-2.5 ${v === status ? 'bg-white text-fg' : 'text-white/80 hover:text-white'}`}>
              <span className="hidden sm:inline">{label}</span><span className="sm:hidden">{short}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
