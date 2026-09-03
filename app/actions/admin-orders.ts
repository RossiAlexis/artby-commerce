"use server";
import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth/require-admin";
import { advanceOrderStatus, archiveOrder } from "@/lib/db/orders-admin";

export async function advanceOrderStatusAction(orderId: number) {
  await requireAdminAction();
  const order = await advanceOrderStatus(orderId);
  if (!order) return { success: false as const, error: "Pedido no encontrado." };
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true as const };
}

export async function archiveOrderAction(orderId: number) {
  await requireAdminAction();
  const order = await archiveOrder(orderId);
  if (!order) return { success: false as const, error: "Pedido no encontrado." };
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true as const };
}
