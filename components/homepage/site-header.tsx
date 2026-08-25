import Link from "next/link";
import { getCurrentCart } from "@/app/actions/cart";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { MobileNav } from "@/components/homepage/mobile-nav";
import { getSiteSettings } from "@/lib/db/site-settings";

export async function SiteHeader() {
  const [cart, settings] = await Promise.all([
    getCurrentCart(),
    getSiteSettings(),
  ]);

  return (
    <header>
      {settings?.announcementBar && (
        <>
          <div className="bg-foreground flex h-9 items-center justify-center text-center text-xs text-white">
            {settings.announcementBar}
          </div>
          <div className="bg-border h-px w-full" />
        </>
      )}
      <div className="flex items-center justify-between gap-7 border-b border-[#d3d3d3] bg-white px-14 py-[1.125rem]">
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
          <span className="text-foreground hidden text-[0.6875rem] whitespace-nowrap md:inline">
            USD &nbsp;·&nbsp; ES · EN
          </span>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
