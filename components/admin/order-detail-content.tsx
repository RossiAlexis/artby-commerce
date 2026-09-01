import type { AdminOrderListItem } from "@/lib/db/orders-admin";
import { formatPrice } from "@/lib/utils";

const flatLabelClass =
  "text-[10px] font-semibold tracking-[1px] text-[#993f17] uppercase";

export function OrderDetailSections({
  order,
  variant = "card",
}: {
  order: AdminOrderListItem;
  /** "card": desktop full-page style (boxed, spaced apart). "flat": mobile bottom sheet style, matching the Figma "Bottom sheet" component pixel-for-pixel. */
  variant?: "card" | "flat";
}) {
  if (variant === "flat") {
    return (
      <>
        <h2 className={flatLabelClass}>Cliente</h2>
        <p className="text-[13px] font-medium text-[#1c1917]">
          {order.customerName}
        </p>
        <p className="text-xs text-[#57514b]">{order.customerEmail}</p>

        <div className="h-px w-full shrink-0 bg-[#e2d8ce]" />

        <h2 className={flatLabelClass}>Envío</h2>
        <p className="text-xs text-[#57514b]">
          {order.shippingAddress}, {order.shippingCity}, {order.shippingCountry}
        </p>
        {order.isGift && (
          <div className="flex flex-col gap-1 border-t border-[#e2d8ce] pt-3">
            <p className="text-[13px] text-[#1c1917]">
              Es un regalo para{" "}
              <span className="font-medium">{order.giftRecipientName}</span>
            </p>
            {order.giftMessage && (
              <p className="text-xs text-[#7c756f]">
                {`"${order.giftMessage}"`}
              </p>
            )}
          </div>
        )}

        <div className="h-px w-full shrink-0 bg-[#e2d8ce]" />

        <h2 className={flatLabelClass}>Obra(s) incluidas</h2>
        <ul className="flex flex-col divide-y divide-[#e2d8ce]">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <span className="text-[13px] text-[#1c1917]">
                {item.artwork.title}
              </span>
              <span className="text-xs text-[#57514b]">
                {formatPrice(item.priceCents, order.currency)}
              </span>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <>
      <div className="rounded-lg bg-white p-6">
        <h2 className="text-sm font-semibold text-[#1c1917]">Cliente</h2>
        <p className="mt-2 text-sm text-[#1c1917]">{order.customerName}</p>
        <p className="text-sm text-[#7c756f]">{order.customerEmail}</p>
      </div>

      <div className="rounded-lg bg-white p-6">
        <h2 className="text-sm font-semibold text-[#1c1917]">Envío</h2>
        <p className="mt-2 text-sm text-[#1c1917]">
          {order.shippingAddress}, {order.shippingCity}, {order.shippingCountry}
        </p>
        {order.isGift && (
          <div className="mt-3 border-t border-[#e2d8ce] pt-3">
            <p className="text-sm text-[#1c1917]">
              Es un regalo para{" "}
              <span className="font-medium">{order.giftRecipientName}</span>
            </p>
            {order.giftMessage && (
              <p className="mt-1 text-sm text-[#7c756f]">
                {`"${order.giftMessage}"`}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg bg-white p-6">
        <h2 className="text-sm font-semibold text-[#1c1917]">
          Obra(s) incluidas
        </h2>
        <ul className="mt-4 divide-y divide-[#e2d8ce]">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
            >
              <span className="text-[#1c1917]">{item.artwork.title}</span>
              <span className="text-[#7c756f]">
                {formatPrice(item.priceCents, order.currency)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
