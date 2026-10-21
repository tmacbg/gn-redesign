import { z } from 'zod';

// Zod schemas for the Webservice JSON shapes we consume. Unknown fields (including
// wholesale_price) are stripped by z.object, so they never reach the domain.

const id = z.coerce.number().int();
const flag = z.union([z.literal('0'), z.literal('1'), z.literal(0), z.literal(1)]).transform((v) => Number(v) === 1);
export const langValues = z.array(z.object({ id: z.coerce.string(), value: z.string().nullable().transform((v) => v ?? '') }));
export type LangValues = z.infer<typeof langValues>;

export const categoryDTO = z.object({
  id, id_parent: id, active: flag, level_depth: z.coerce.number(), position: z.coerce.number().default(0),
  name: langValues, link_rewrite: langValues,
  meta_title: langValues.optional(), meta_description: langValues.optional(), description: langValues.optional(),
});
export type CategoryDTO = z.infer<typeof categoryDTO>;

export const manufacturerDTO = z.object({ id, name: z.string(), active: flag });
export type ManufacturerDTO = z.infer<typeof manufacturerDTO>;

export const productDTO = z.object({
  id,
  active: flag,
  reference: z.string().default(''),
  ean13: z.string().nullable().default(''),
  minimal_quantity: z.coerce.number().int().min(1).catch(1),
  price: z.coerce.number(),
  weight: z.coerce.number().catch(0),
  id_manufacturer: id.catch(0),
  manufacturer_name: z.union([z.string(), z.literal(false), z.null()]).transform((v) => (typeof v === 'string' ? v : '')),
  id_category_default: id,
  id_default_image: z.union([z.coerce.number(), z.string()]).transform((v) => Number(v) || 0),
  on_sale: flag,
  available_for_order: flag,
  show_price: flag,
  visibility: z.enum(['both', 'catalog', 'search', 'none']).catch('both'),
  date_add: z.string(),
  date_upd: z.string(),
  name: langValues,
  link_rewrite: langValues,
  description_short: langValues,
  meta_title: langValues.optional(),
  meta_description: langValues.optional(),
  associations: z
    .object({
      categories: z.array(z.object({ id })).optional(),
      images: z.array(z.object({ id })).optional(),
    })
    .partial()
    .default({}),
});
export type ProductDTO = z.infer<typeof productDTO>;

export const collection = <T extends z.ZodTypeAny>(key: string, item: T) =>
  z.object({ [key]: z.array(item).default([]) }).partial().transform((o) => (o[key] ?? []) as z.infer<T>[]);
