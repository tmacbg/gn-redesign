import { Keyboard, Lock } from 'lucide-react';
import Link from 'next/link';
import { buttonClass } from '@/components/ui/button';
import { getViewer } from '@/server/viewer';
import { QuickOrder } from './quick-order';

export const metadata = { title: 'Бърза поръчка', robots: { index: false } };

export default async function QuickOrderPage() {
  const viewer = await getViewer();
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Бърза поръчка</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-fg-muted"><Keyboard className="h-4 w-4" />Търсете по име или референция, въведете количества (↑/↓, Enter) и добавете всички наведнъж.</p>
      </div>
      {viewer.canOrder ? <QuickOrder /> : (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface py-14 text-center">
          <Lock className="h-8 w-8 text-fg-subtle" />
          {viewer.isLoggedIn ? (
            <>
              <p className="font-semibold">Поръчките за вашия профил са временно ограничени</p>
              <a href="tel:+359888402639" className={buttonClass('primary')}>Свържете се с GN</a>
            </>
          ) : (
            <>
              <p className="font-semibold">Бързата поръчка е достъпна за клиенти с профил</p>
              <Link href="/bg/vhod" className={buttonClass('primary')}>Вход</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
