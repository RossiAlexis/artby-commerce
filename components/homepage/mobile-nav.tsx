"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger aria-label="Abrir menú" className="flex items-center md:hidden">
        <Menu className="size-6" aria-hidden />
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Menú</SheetTitle>
        </SheetHeader>
        <nav className="text-foreground flex flex-col gap-4 px-4 text-sm">
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
      </SheetContent>
    </Sheet>
  );
}
