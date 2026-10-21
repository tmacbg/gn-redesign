'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

const COOKIE = 'gn_demo_view';

export function DemoBar({ isCustomer }: { isCustomer: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const set = (v: 'guest' | 'customer') => {
    document.cookie = `${COOKIE}=${v}; path=/; max-age=31536000; samesite=lax`;
    start(() => router.refresh());
  };
  return (
    <div className="bg-fg text-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 px-4 py-1.5 text-xs">
        <span><b className="mr-1.5 rounded-sm bg-accent px-1.5 py-0.5 text-2xs font-extrabold text-fg">MOCKUP</b><span className="hidden sm:inline">Реални продукти от PrestaShop · цените са демо (базова цена без ДДС)</span><span className="sm:hidden">Демо цени</span></span>
        <div role="group" aria-label="Изглед" className="flex overflow-hidden rounded-sm border border-white/25">
          {(['guest', 'customer'] as const).map((v) => (
            <button key={v} type="button" disabled={pending} onClick={() => set(v)} aria-pressed={(v === 'customer') === isCustomer}
              className={`px-2.5 py-1 font-semibold ${(v === 'customer') === isCustomer ? 'bg-white text-fg' : 'text-white/80 hover:text-white'}`}>
              {v === 'guest' ? 'Гост' : 'Влязъл клиент'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
