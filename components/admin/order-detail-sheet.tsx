"use client";

import { useState } from "react";
import { OrderDetailSections } from "@/components/admin/order-detail-content";
import { OrderStatusAction } from "@/components/admin/order-status-action";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { BottomSheetContent } from "@/components/ui/bottom-sheet-content";
import { Sheet, SheetTitle } from "@/components/ui/sheet";
import type { AdminOrderListItem } from "@/lib/db/orders-admin";
import { formatDate, formatPrice } from "@/lib/utils";

export function OrderDetailSheet({ orders }: { orders: AdminOrderListItem[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = orders.find((order) => order.id === selectedId) ?? null;

  return (
    <>
      <div className="flex flex-col gap-3 sm:hidden">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-lg border border-[#e2d8ce] bg-white p-4"
          >
            <button
              type="button"
              onClick={() => setSelectedId(order.id)}
              className="flex w-full flex-col gap-1 text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[15px] font-semibold text-[#1c1917]">
                  {`#${String(order.id).padStart(3, "0")} · ${order.items
                    .map((item) => item.artwork.title)
                    .join(", ")}`}
                </p>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-[13px] text-[#7c756f]">
                {order.customerName}
              </p>
              <p className="text-[13px] text-[#7c756f]">
                {formatPrice(order.totalCents, order.currency)} ·{" "}
                {formatDate(order.createdAt, { dateStyle: "medium" })}
              </p>
            </button>
            {!order.archived && (
              <OrderStatusAction
                orderId={order.id}
                status={order.status}
                className={
                  order.status === "delivered"
                    ? "mt-3 p-0 text-[13px]"
                    : "mt-3 w-full py-3 text-[15px]"
                }
              />
            )}
          </div>
        ))}
      </div>

      <Sheet
        open={selected != null}
        onOpenChange={(open) => !open && setSelectedId(null)}
      >
        <BottomSheetContent>
          {selected && (
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pt-3 pb-5">
              <SheetTitle className="text-base font-semibold text-[#1c1917]">
                Pedido #{selected.id}
              </SheetTitle>
              <p className="text-xs text-[#57514b]">
                {selected.items.map((item) => item.artwork.title).join(", ")} ·{" "}
                {formatPrice(selected.totalCents, selected.currency)} ·{" "}
                {formatDate(selected.createdAt, { dateStyle: "medium" })}
              </p>
              <div className="h-px w-full shrink-0 bg-[#e2d8ce]" />
              <OrderDetailSections order={selected} variant="flat" />
            </div>
          )}
        </BottomSheetContent>
      </Sheet>
    </>
  );
}
