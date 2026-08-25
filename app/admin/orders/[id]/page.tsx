import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/lib/db/orders-admin";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminOrderDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const orderId = Number(id);
  // orders.id is a Postgres `serial` (int4); anything outside its range
  // would otherwise reach the DB and throw instead of yielding a 404.
  const isValidId =
    Number.isInteger(orderId) && orderId > 0 && orderId <= 2147483647;
  if (!isValidId) notFound();

  const order = await getAdminOrderById(orderId);
  if (!order) notFound();

  return (
    <div className="px-6 py-8 md:px-10">
      <Link
        href="/admin/orders"
        className="text-primary mb-6 inline-block text-sm hover:underline"
      >
        ← Pedidos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-heading text-xl text-[#1c1917]">
          Pedido #{order.id}
        </h1>
        <p className="text-lg font-semibold text-[#1c1917]">
          {formatPrice(order.totalCents, order.currency)}
        </p>
      </div>
      <p className="mt-1 text-sm text-[#7c756f]">
        {formatDate(order.createdAt, { dateStyle: "long", timeStyle: "short" })}
      </p>

      <div className="mt-8 rounded-lg bg-white p-6">
        <h2 className="text-sm font-semibold text-[#1c1917]">Cliente</h2>
        <p className="mt-2 text-sm text-[#1c1917]">{order.customerName}</p>
        <p className="text-sm text-[#7c756f]">{order.customerEmail}</p>
      </div>

      <div className="mt-6 rounded-lg bg-white p-6">
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
    </div>
  );
}
