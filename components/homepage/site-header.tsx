import { ShoppingBag } from "lucide-react";

export function SiteHeader() {
  return (
    <header>
      <div className="bg-foreground text-background py-2 text-center text-xs">
        Envío internacional incluido en todas las obras
      </div>
      <div className="border-border flex items-center justify-between border-b px-6 py-4 md:px-10">
        <span className="font-serif text-lg">Art by Vero Miller</span>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <a href="#" className="nav-link">
            Galería
          </a>
          <a href="#" className="nav-link">
            Sobre Vero
          </a>
          <a href="#" className="nav-link">
            Contacto
          </a>
        </nav>
        <div className="text-muted-foreground flex items-center gap-4 text-xs">
          <ShoppingBag className="size-4" aria-hidden />
          <span>USD</span>
          <span>·</span>
          <span>ES · EN</span>
        </div>
      </div>
    </header>
  );
}
