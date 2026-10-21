import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getCatalog, listProducts } from '@/commerce/catalog';
import { toCartLine } from '@/components/product/line';
import { getViewer, priceFor } from '@/server/viewer';

const Query = z.object({
  q: z.string().trim().max(100).default(''),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(req: NextRequest) {
  const parsed = Query.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: 'invalid_query' }, { status: 400 });
  const { q, limit } = parsed.data;
  const [catalog, viewer] = await Promise.all([getCatalog(), getViewer()]);
  const result = await listProducts(catalog, { q: q || undefined, sort: q ? 'relevance' : 'new', perPage: limit });
  return NextResponse.json(
    {
      total: result.total,
      // Prices are included only for an authenticated customer, never for guests.
      items: result.items.map((p) => ({ ...toCartLine(p, priceFor(p, viewer)), brand: p.brand?.name ?? '', ean: p.ean13 })),
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
