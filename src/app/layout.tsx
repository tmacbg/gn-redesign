import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import '@/styles/globals.css';

const sans = Manrope({ subsets: ['latin', 'cyrillic'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'GN Склад — български храни и стоки на едро', template: '%s | GN Склад' },
  description: 'GN Ltd, основен доставчик на български храни и стоки в Европа.',
};

export const viewport: Viewport = {
  themeColor: '#176B4D',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
