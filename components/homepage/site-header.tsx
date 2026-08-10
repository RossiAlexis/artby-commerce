import Link from "next/link";
import { getCurrentCart } from "@/app/actions/cart";
import { CartDrawer } from "@/components/cart/cart-drawer";

export async function SiteHeader() {
  const cart = await getCurrentCart();

  return (
    <header>
      <div className="bg-foreground text-background py-2 text-center text-xs">
        Envío internacional incluido en todas las obras
      </div>
      <div className="border-border flex items-center justify-between border-b px-6 py-4 md:px-10">
        <Link href="/" className="font-serif text-lg">
          Art by Vero Miller
        </Link>
        <nav className="hidden items-end gap-8 text-sm md:flex">
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
        <div className="text-muted-foreground flex items-center gap-4 text-xs">
          <CartDrawer cart={cart} />
          <span>USD</span>
          <span>·</span>
          <span>ES · EN</span>
        </div>
      </div>
    </header>
  );
}
