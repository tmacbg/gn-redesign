import { Phone, ShieldAlert } from 'lucide-react';

/** Neutral wording on purpose: the reason for the restriction is not shown on screen. */
export function RestrictedNotice() {
  return (
    <div role="status" className="border-b border-warning/30 bg-accent-soft">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm md:px-6">
        <span className="flex items-center gap-2 font-semibold text-fg"><ShieldAlert className="h-4 w-4 text-warning" aria-hidden />Поръчките за вашия профил са временно ограничени. Цените остават видими.</span>
        <a href="tel:+359888402639" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"><Phone className="h-4 w-4" aria-hidden />Свържете се с GN: +359 888 402 639</a>
      </div>
    </div>
  );
}
