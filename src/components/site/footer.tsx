import { Mail, MapPin, Phone, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './logo';

export function Footer() {
  return (
    <footer className="mt-16 bg-fg pb-20 text-white/80 md:pb-0">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 md:px-6">
        <div className="space-y-4">
          <Logo inverted />
          <p className="text-sm">GN Invest LTD — основен доставчик на български храни и стоки за магазини в Европа.</p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold text-white">Поръчки</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/bg/barza-porachka" className="hover:text-white">Бърза поръчка</Link></li>
            <li><a href="https://youtu.be/doAKBrM9CJk" className="inline-flex items-center gap-1.5 hover:text-white" rel="noopener"><PlayCircle className="h-4 w-4" />Как да поръчам?</a></li>
            <li>Поръчки до събота 13:00</li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold text-white">Информация</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/bg/content/4-about-us" className="hover:text-white">За нас</Link></li>
            <li><Link href="/bg/content/7-ekip" className="hover:text-white">Екип</Link></li>
            <li><span>Общи условия</span></li>
            <li><span>Политика за защита на личните данни</span></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold text-white">Контакти</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />GN Склад, ул. „Иван Братанов“ 2Д, 7800 Попово, България</li>
            <li><a href="tel:+359888402639" className="flex gap-2 hover:text-white"><Phone className="h-4 w-4" />+359 888 402 639</a></li>
            <li><a href="mailto:gn_zaqvki@hranitelnistoki.com" className="flex gap-2 break-all hover:text-white"><Mail className="h-4 w-4" />gn_zaqvki@hranitelnistoki.com</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-2 px-4 py-4 text-xs text-white/50 md:px-6">
          <span>© {new Date().getFullYear()} GN Invest LTD</span>
          <span>Сайтът е предназначен само за онлайн поръчки от Европа.</span>
        </div>
      </div>
    </footer>
  );
}
