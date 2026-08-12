import Link from "next/link";
import { getCurrentCart } from "@/app/actions/cart";
import { CartDrawer } from "@/components/cart/cart-drawer";

export async function SiteHeader() {
  const cart = await getCurrentCart();

  return (
    <header>
      <div className="bg-foreground flex h-9 items-center justify-center text-center text-xs text-white">
        Envío internacional incluido en todas las obras
      </div>
      <div className="bg-border h-px w-full" />
      <div className="flex items-center gap-7 border-b border-[#d3d3d3] bg-white px-14 py-[1.125rem]">
        <Link
          href="/"
          className="text-foreground font-serif text-2xl leading-[1.375rem] font-semibold"
        >
          Art by Vero Miller
        </Link>
        <nav className="text-foreground hidden flex-1 items-center justify-end gap-7 text-[0.8125rem] md:flex">
          <Link href="/galeria" className="nav-link">
            Galería
          </Link>
          <a href="#" className="nav-link">
            Sobre Vero
          </a>
          <a href="#" className="nav-link">
            Contacto
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <CartDrawer cart={cart} />
          <span className="text-foreground text-[0.6875rem] whitespace-nowrap">
            USD &nbsp;·&nbsp; ES · EN
          </span>
        </div>
      </div>
    </header>
  );
}
