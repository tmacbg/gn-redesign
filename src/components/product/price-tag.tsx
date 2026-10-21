import { Lock } from 'lucide-react';
import Link from 'next/link';
import { formatMoney } from '@/domain/money';
import type { CustomerPrice } from '@/domain/types';
import { cn } from '@/lib/cn';

export function PriceTag({ price, basis, size = 'md', className }: { price: CustomerPrice | null; basis?: string | null; size?: 'md' | 'lg'; className?: string }) {
  if (!price) {
    return (
      <Link href="/bg/vhod" className={cn('inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-primary', className)}>
        <Lock className="h-3.5 w-3.5" aria-hidden />
        Влезте, за да видите цената
      </Link>
    );
  }
  return (
    <div className={className}>
      <div className="flex items-baseline gap-1.5">
        <span className={cn('font-bold tabular-nums text-fg', size === 'lg' ? 'text-3xl' : 'text-lg')}>{formatMoney(price.unitPrice)}</span>
        <span className="text-xs text-fg-subtle">без ДДС</span>
      </div>
      {basis && <div className="text-xs text-fg-muted">за {basis}</div>}
    </div>
  );
}
