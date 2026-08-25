import Link from "next/link";
import { auth } from "@/auth";
import { getCurrentCart } from "@/app/actions/cart";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { MobileNav } from "@/components/homepage/mobile-nav";
import { getSiteSettings } from "@/lib/db/site-settings";

const NAV_LINKS = [
  { href: "/galeria", label: "Galería" },
  { href: "/#sobre-vero", label: "Sobre Vero" },
  { href: "/contacto", label: "Contacto" },
];

export async function SiteHeader() {
  const [cart, settings, session] = await Promise.all([
    getCurrentCart(),
    getSiteSettings(),
    auth(),
  ]);

  // "Mi cuenta" only makes sense once signed in — otherwise the link sends
  // the Customer to sign in first (see lib/auth/require-customer.ts).
  const accountLink = session?.user?.id
    ? { href: "/cuenta", label: "Mi cuenta" }
    : { href: "/cuenta/ingresar", label: "Ingresar" };
  const links = [...NAV_LINKS, accountLink];

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
          className="text-foreground font-serif text-xl leading-[1.375rem] font-semibold md:text-2xl"
        >
          Art by Vero Miller
        </Link>
        <nav className="text-foreground hidden flex-1 items-center justify-end gap-7 text-[0.8125rem] md:flex">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <CartDrawer cart={cart} />
          <span className="text-foreground hidden text-[0.6875rem] whitespace-nowrap md:inline">
            USD &nbsp;·&nbsp; ES · EN
          </span>
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}
