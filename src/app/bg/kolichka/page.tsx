import { CartView } from './cart-view';

export const metadata = { title: 'Количка', robots: { index: false } };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-6 md:px-6 lg:pb-6">
      <h1 className="mb-5 text-2xl font-extrabold tracking-tight md:text-3xl">Количка</h1>
      <CartView />
    </div>
  );
}
