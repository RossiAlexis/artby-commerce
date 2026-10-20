import Link from "next/link";
import { auth } from "@/auth";
import { getCurrentCart } from "@/app/actions/cart";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { LanguageMarker } from "@/components/homepage/language-marker";
import { MobileNav } from "@/components/homepage/mobile-nav";
import { SiteNav } from "@/components/homepage/site-nav";
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
  const primaryLanguage = settings?.primaryLanguage === "en" ? "en" : "es";

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
          className="text-foreground font-serif text-xl leading-[1.375rem] font-medium italic md:text-2xl"
        >
          Art by Vero Miller
        </Link>
        <nav className="text-foreground hidden flex-1 items-center justify-end gap-7 text-[0.8125rem] md:flex">
          <SiteNav links={links} linkClassName="nav-link" />
        </nav>
        <div className="flex items-center gap-4">
          <CartDrawer
            cart={cart}
            shipping={
              settings
                ? {
                    shippingOrigin: settings.shippingOrigin,
                    shippingInsuranceIncluded:
                      settings.shippingInsuranceIncluded,
                    freeShippingOver500: settings.freeShippingOver500,
                  }
                : null
            }
          />
          <LanguageMarker primaryLanguage={primaryLanguage} />
          <MobileNav links={links} primaryLanguage={primaryLanguage} />
        </div>
      </div>
    </header>
  );
}
