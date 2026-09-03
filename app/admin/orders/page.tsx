import Link from "next/link";
import { OrderDetailSheet } from "@/components/admin/order-detail-sheet";
import { OrderStatusAction } from "@/components/admin/order-status-action";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAdminOrderCounts, getAdminOrders } from "@/lib/db/orders-admin";
import { resolveOrdersFilter } from "@/lib/db/orders-filter";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminOrdersPage(props: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const filter = resolveOrdersFilter(searchParams?.status);
  const [orders, counts] = await Promise.all([
    getAdminOrders(filter),
    getAdminOrderCounts(),
  ]);

  return (
    <div>
      <div className="flex h-[72px] items-center justify-between border-b border-[#e2d8ce] bg-white px-10">
        <h1 className="text-xl font-semibold text-[#1c1917]">Pedidos</h1>
      </div>
      <Tabs value={filter} className="border-b border-[#e2d8ce] bg-white px-10">
        <TabsList variant="line">
          <TabsTrigger
            value="active"
            render={<Link href="?status=active" />}
            nativeButton={false}
            className="data-active:text-primary after:bg-primary"
          >
            {`Activos (${counts.active})`}
          </TabsTrigger>
          <TabsTrigger
            value="archived"
            render={<Link href="?status=archived" />}
            nativeButton={false}
            className="data-active:text-primary after:bg-primary"
          >
            Archivados
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="px-10 py-9">
        {orders.length === 0 ? (
          <p className="text-sm text-[#7c756f]">
            {filter === "archived"
              ? "Todavía no hay pedidos archivados."
              : "Todavía no hay pedidos activos."}
          </p>
        ) : (
          <>
            {/* Table, from sm up. */}
            <div className="hidden overflow-hidden rounded-lg bg-white sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Pedido</TableHead>
                    <TableHead>Obra</TableHead>
                    <TableHead>Comprador</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-primary font-medium hover:underline"
                        >
                          #{String(order.id).padStart(3, "0")}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[240px] whitespace-normal">
                        {order.items
                          .map((item) => item.artwork.title)
                          .join(", ")}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-[#1c1917]">
                          {order.customerName}
                        </div>
                        <div className="text-[#7c756f]">
                          {order.customerEmail}
                        </div>
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
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        {order.archived ? (
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-primary hover:underline"
                          >
                            Ver detalle
                          </Link>
                        ) : (
                          <OrderStatusAction
                            orderId={order.id}
                            status={order.status}
                            className="px-4 py-1.5 text-[13px]"
                          />
                        )}
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
