import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/auth";
import { requireCustomerPage } from "@/lib/auth/require-customer";
import { getOrdersByCustomer } from "@/lib/db/orders";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mi cuenta — Art by Vero Miller",
};

function formatOrderDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default async function CuentaPage() {
  const customerId = await requireCustomerPage("/cuenta");
  const orders = await getOrdersByCustomer(customerId);

  return (
    <div className="flex flex-col gap-8 px-6 py-14 md:px-10 lg:px-30 lg:py-16">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-foreground font-serif text-[2.125rem] font-medium">
            Mis pedidos
          </h1>
          <p className="text-[0.875rem] text-[#7c756f]">
            Acá podés ver el historial de tus compras.
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="text-[0.8125rem] text-[#7c756f] hover:text-foreground hover:underline"
          >
            Cerrar sesión
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <p className="text-[0.875rem] text-[#7c756f]">
          Todavía no realizaste ningún pedido.{" "}
          <Link href="/galeria" className="text-primary font-medium">
            Ver galería
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/cuenta/pedidos/${order.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-[#e2d8ce] bg-white px-5 py-4 hover:bg-[#f5f2ef]"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-foreground text-sm font-medium">
                    Orden #{order.id}
                  </span>
                  <span className="text-[0.8125rem] text-[#7c756f]">
                    {formatOrderDate(order.createdAt)} ·{" "}
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "obra" : "obras"}
                  </span>
                </div>
                <span className="text-foreground text-sm font-medium whitespace-nowrap">
                  {formatPrice(order.totalCents, order.currency)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
