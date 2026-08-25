import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCustomerPage } from "@/lib/auth/require-customer";
import { getOrderById } from "@/lib/db/orders";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Detalle del pedido — Art by Vero Miller",
};

export default async function OrderDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const orderId = Number(id);
  // orders.id is a Postgres `serial` (int4); anything outside its range
  // would otherwise reach the DB and throw instead of yielding a 404.
  const isValidId =
    Number.isInteger(orderId) && orderId > 0 && orderId <= 2147483647;
  if (!isValidId) notFound();

  const customerId = await requireCustomerPage(`/cuenta/pedidos/${id}`);
  const order = await getOrderById(orderId, customerId);
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-8 px-6 py-14 md:px-10 lg:px-30 lg:py-16">
      <div className="flex flex-col gap-1.5">
        <Link href="/cuenta" className="text-[0.8125rem] text-[#7c756f]">
          ← Mis pedidos
        </Link>
        <h1 className="text-foreground font-serif text-[2.125rem] font-medium">
          Orden #{order.id}
        </h1>
        <p className="text-[0.8125rem] text-[#7c756f]">
          {formatDate(order.createdAt, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <ul className="flex flex-col gap-3.5">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-[#e2d8ce] bg-white px-5 py-4"
          >
            <span className="text-foreground text-sm">
              {item.artwork.title}
            </span>
            <span className="text-foreground text-sm font-medium whitespace-nowrap">
              {formatPrice(item.priceCents, order.currency)}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-foreground self-end text-base font-semibold">
        Total: {formatPrice(order.totalCents, order.currency)}
      </p>
    </div>
  );
}
