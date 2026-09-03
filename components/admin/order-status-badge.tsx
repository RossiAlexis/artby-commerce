import type { OrderStatus } from "@/lib/db/orders-admin";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<OrderStatus, string> = {
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
};

// Same pill palette as the admin Artworks "Vendida"/"Disponible" badges —
// Enviado reuses Vendida's tone, Entregado reuses Disponible's.
const STATUS_CLASS: Record<OrderStatus, string> = {
  paid: "bg-[#fcebe3] text-primary",
  shipped: "bg-[#f0ebe3] text-[#57514b]",
  delivered: "bg-[#e6f0e9] text-[#4d5e51]",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] shrink-0 items-center rounded-[4px] px-2 text-[11px] font-medium whitespace-nowrap",
        STATUS_CLASS[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
