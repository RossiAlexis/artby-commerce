import Link from "next/link";
import { OrderDetailSheet } from "@/components/admin/order-detail-sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminOrders } from "@/lib/db/orders-admin";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div>
      <div className="flex h-[72px] items-center justify-between border-b border-[#e2d8ce] bg-white px-10">
        <h1 className="text-xl font-semibold text-[#1c1917]">Pedidos</h1>
      </div>
      <div className="px-10 py-9">
        {orders.length === 0 ? (
          <p className="text-sm text-[#7c756f]">Todavía no hay pedidos.</p>
        ) : (
          <>
            {/* Table, from sm up. */}
            <div className="hidden overflow-hidden rounded-lg bg-white sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Obra(s)</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium text-[#1c1917]">
                          {order.customerName}
                        </div>
                        <div className="text-[#7c756f]">
                          {order.customerEmail}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[240px] whitespace-normal">
                        {order.items
                          .map((item) => item.artwork.title)
                          .join(", ")}
                      </TableCell>
                      <TableCell>
                        {formatPrice(order.totalCents, order.currency)}
                      </TableCell>
                      <TableCell>
                        {formatDate(order.createdAt, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-primary hover:underline"
                        >
                          Ver detalle
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Stacked cards + detail bottom sheet, below sm. */}
            <OrderDetailSheet orders={orders} />
          </>
        )}
      </div>
    </div>
  );
}
