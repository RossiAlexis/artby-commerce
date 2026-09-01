"use client";

import { useState } from "react";
import { OrderDetailSections } from "@/components/admin/order-detail-content";
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
          <button
            key={order.id}
            type="button"
            onClick={() => setSelectedId(order.id)}
            className="flex flex-col gap-1 rounded-lg bg-white p-4 text-left"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[15px] font-semibold text-[#1c1917]">
                {order.customerName}
              </p>
              <p className="text-[13px] font-medium whitespace-nowrap text-[#1c1917]">
                {formatPrice(order.totalCents, order.currency)}
              </p>
            </div>
            <p className="text-[13px] text-[#7c756f]">{order.customerEmail}</p>
            <p className="text-[13px] text-[#7c756f]">
              {order.items.map((item) => item.artwork.title).join(", ")}
            </p>
            <p className="text-[13px] text-[#7c756f]">
              {formatDate(order.createdAt, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </button>
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
