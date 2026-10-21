'use client';

import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { timeUntilCutoff } from '@/domain/cutoff';

export function CutoffCountdown({ compact }: { compact?: boolean }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const t = now ? timeUntilCutoff(now) : null;
  const left = t ? (t.days > 0 ? `${t.days} д ${t.hours} ч` : `${t.hours} ч ${t.minutes} мин`) : '…';
  return (
    <span className="inline-flex items-center gap-1.5">
      <Clock className="h-3.5 w-3.5 text-accent" aria-hidden />
      {compact ? <>Поръчки до събота 13:00 · <b className="tabular-nums">{left}</b></> : <>Приемаме поръчки до <b>събота 13:00</b> — остават <b className="tabular-nums">{left}</b></>}
    </span>
  );
}
