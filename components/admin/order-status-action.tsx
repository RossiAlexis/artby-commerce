"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  advanceOrderStatusAction,
  archiveOrderAction,
} from "@/app/actions/admin-orders";
import type { OrderStatus } from "@/lib/db/orders-admin";
import { cn } from "@/lib/utils";

const VARIANT_CLASS = {
  solid: "bg-primary text-white hover:opacity-90",
  outline: "border border-primary text-primary hover:bg-[#fcebe3]",
  text: "text-[#7c756f] hover:underline",
} as const;

function variantForStatus(status: OrderStatus) {
  if (status === "paid") return "solid";
  if (status === "shipped") return "outline";
  return "text";
}

function labelForStatus(status: OrderStatus) {
  if (status === "paid") return "Marcar como enviado";
  if (status === "shipped") return "Marcar como entregado";
  return "Archivar";
}

/**
 * Advances an Order one step (paid -> shipped -> delivered), or — once
 * delivered — archives it. Same control on the desktop table's Acciones
 * column and the mobile card; callers size it via `className`.
 */
export function OrderStatusAction({
  orderId,
  status,
  className,
}: {
  orderId: number;
  status: OrderStatus;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      if (status === "delivered") {
        await archiveOrderAction(orderId);
      } else {
        await advanceOrderStatusAction(orderId);
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-50",
        VARIANT_CLASS[variantForStatus(status)],
        className,
      )}
    >
      {labelForStatus(status)}
    </button>
  );
}
