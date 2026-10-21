import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';

// Merchant logo (themes/metromarket/assets/img/aximage/logo-new2.png, 220×63, opaque white background).
// Replace with the vector original when available for sharper rendering on high-DPI screens.
export function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/bg" className={cn('block shrink-0', inverted && 'w-fit rounded-md bg-white p-2', className)} aria-label="GN Invest LTD — Вкус от България, начало">
      <Image src="/brand/logo.png" alt="GN Invest LTD — Вкус от България" width={220} height={63} priority={!inverted} className="h-10 w-auto md:h-12" />
    </Link>
  );
}
