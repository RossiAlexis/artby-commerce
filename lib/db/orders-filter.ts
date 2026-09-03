import z from "zod";

export const ordersFilterSchema = z.enum(["active", "archived"]);
export type OrdersFilter = z.infer<typeof ordersFilterSchema>;

export function resolveOrdersFilter(value: string | undefined): OrdersFilter {
  return ordersFilterSchema.safeParse(value).data ?? "active";
}
