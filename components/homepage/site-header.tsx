import Link from "next/link";
import { getCurrentCart } from "@/app/actions/cart";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getSiteSettings } from "@/lib/db/site-settings";
import { MobileNav } from "@/components/homepage/mobile-nav";

const NAV_LINKS = [
  { href: "/galeria", label: "Galería" },
  { href: "#", label: "Sobre Vero" },
  { href: "/contacto", label: "Contacto" },
];

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
      <div className="flex items-center gap-7 border-b border-[#d3d3d3] bg-white px-14 py-[1.125rem]">
        <Link
          href="/"
          className="text-foreground font-serif text-xl leading-[1.375rem] font-semibold md:text-2xl"
        >
          Art by Vero Miller
        </Link>
        <nav className="text-foreground hidden flex-1 items-center justify-end gap-7 text-[0.8125rem] md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <CartDrawer cart={cart} />
          <span className="text-foreground text-[0.6875rem] whitespace-nowrap">
            USD &nbsp;·&nbsp; ES · EN
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3 md:hidden">
          <span className="text-foreground text-[0.6875rem] whitespace-nowrap">
            ES · EN
          </span>
          <MobileNav cart={cart} links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
