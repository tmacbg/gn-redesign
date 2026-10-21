import { Building2, Phone, ShieldCheck } from 'lucide-react';
import { ArtPicture } from '@/components/ui/art-picture';

export const metadata = { title: 'Вход', robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 md:grid-cols-2 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-md rounded-lg border border-border bg-surface p-6 md:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Вход за клиенти</h1>
        <p className="mt-1 text-sm text-fg-muted">Влезте, за да видите вашите цени и да поръчвате.</p>
        <form className="mt-6 space-y-4" aria-describedby="login-note">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Имейл</label>
            <input id="email" type="email" autoComplete="email" required className="h-12 w-full rounded border border-border px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <div className="mb-1.5 flex justify-between"><label htmlFor="password" className="text-sm font-semibold">Парола</label><a className="text-sm text-primary hover:underline" href="#">Забравена парола?</a></div>
            <input id="password" type="password" autoComplete="current-password" required className="h-12 w-full rounded border border-border px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <button type="button" disabled className="h-12 w-full rounded bg-primary font-semibold text-primary-fg disabled:opacity-60">Вход</button>
          <p id="login-note" className="rounded bg-accent-soft p-3 text-xs text-warning">Mockup: входът се свързва с PrestaShop в етап 4. Използвайте превключвателя „Влязъл клиент“ най-горе.</p>
        </form>
        <div className="mt-6 border-t border-border pt-5 text-sm">
          <p className="font-semibold">Нямате профил?</p>
          <p className="mt-1 text-fg-muted">Профилите се създават само от служител на GN. Свържете се с нас, за да получите достъп.</p>
          <a href="tel:+359888402639" className="mt-2 inline-flex items-center gap-2 font-semibold text-primary"><Phone className="h-4 w-4" />+359 888 402 639</a>
        </div>
      </div>
      <div className="relative hidden overflow-hidden rounded-lg md:block">
        <ArtPicture sources={[{ name: 'campaign-wholesale', widths: [960, 1600] }]} fallback={{ name: 'campaign-wholesale', width: 960 }} width={960} height={411} sizes="50vw" alt="" className="absolute inset-0 h-full w-full object-cover object-[80%_50%]" />
        <div className="absolute inset-x-0 bottom-0 space-y-3 bg-gradient-to-t from-fg/85 to-transparent p-8 text-white">
          <p className="flex items-center gap-2"><Building2 className="h-5 w-5" />Цени според вашата клиентска група</p>
          <p className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" />История на поръчките и повторна поръчка</p>
        </div>
      </div>
    </div>
  );
}
