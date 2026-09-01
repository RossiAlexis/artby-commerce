"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-sidebar-nav";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AdminMobileNav({
  onSignOut,
}: {
  onSignOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger aria-label="Abrir menú">
        <Menu className="size-6 text-[#fdf9f4]" aria-hidden />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Menú</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col px-4">
          {ADMIN_NAV_ITEMS.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-foreground border-b border-[#eee] py-3 text-sm"
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                className="text-muted-foreground border-b border-[#eee] py-3 text-sm"
              >
                {item.label}
              </span>
            ),
          )}
        </nav>
        <form action={onSignOut} className="px-4 py-3">
          <button
            type="submit"
            className="text-muted-foreground hover:text-foreground text-sm hover:underline"
          >
            Cerrar sesión
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
