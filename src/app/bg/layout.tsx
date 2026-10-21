import { CartDrawer } from '@/components/cart/cart-drawer';
import { BottomNav } from '@/components/site/bottom-nav';
import { DemoBar } from '@/components/site/demo-bar';
import { Footer } from '@/components/site/footer';
import { Header } from '@/components/site/header';
import { getViewer } from '@/server/viewer';

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-surface focus:px-4 focus:py-2 focus:shadow-2">Към съдържанието</a>
      <DemoBar isCustomer={viewer.isCustomer} />
      <Header viewer={viewer} />
      <main id="main" className="min-h-[60vh]">{children}</main>
      <Footer />
      <BottomNav />
      <CartDrawer />
    </>
  );
}
