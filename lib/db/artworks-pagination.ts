import z from "zod";

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

const pageSchema = z.coerce.number().int().min(1).catch(1);
const pageSizeSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(MAX_PAGE_SIZE)
  .catch(DEFAULT_PAGE_SIZE);

export function resolvePage(value: number | undefined): number {
  return pageSchema.parse(value ?? 1);
}

export function resolvePageSize(value: number | undefined): number {
  return pageSizeSchema.parse(value ?? DEFAULT_PAGE_SIZE);
}
