import Link from "next/link";
import { getCurrentCart } from "@/app/actions/cart";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { LanguageMarker } from "@/components/homepage/language-marker";
import { MobileNav } from "@/components/homepage/mobile-nav";
import { SiteNav } from "@/components/homepage/site-nav";
import { getSiteSettings } from "@/lib/db/site-settings";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/galeria", label: "Galería" },
  { href: "/#sobre-vero", label: "Sobre Vero" },
  { href: "/contacto", label: "Contacto" },
];

export async function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [cart, settings] = await Promise.all([
    getCurrentCart(),
    getSiteSettings(),
  ]);

  const primaryLanguage = settings?.primaryLanguage === "en" ? "en" : "es";

  return (
    <header className={cn(overlay && "relative z-30")}>
      {settings?.announcementBar && (
        <>
          <div className="bg-foreground flex h-9 items-center justify-center text-center text-xs text-white">
            {settings.announcementBar}
          </div>
          <div className="bg-border h-px w-full" />
        </>
      )}
      <div
        className={cn(
          "flex items-center justify-between gap-7 px-14 py-[1.125rem]",
          overlay
            ? "absolute inset-x-0 top-full bg-transparent"
            : "border-b border-[#d3d3d3] bg-white",
        )}
      >
        <Link
          href="/"
          className="text-foreground font-serif text-xl leading-[1.375rem] font-medium italic md:text-2xl"
        >
          Art by Vero Miller
        </Link>
        <nav className="text-foreground hidden flex-1 items-center justify-end gap-7 text-[0.8125rem] md:flex">
          <SiteNav links={NAV_LINKS} linkClassName="nav-link" />
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
          <MobileNav links={NAV_LINKS} primaryLanguage={primaryLanguage} />
        </div>
      </div>
    </header>
  );
}
