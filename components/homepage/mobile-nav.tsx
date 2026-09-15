"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { SiteNav } from "@/components/homepage/site-nav";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavLink = { href: string; label: string };

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Abrir menú"
        className="flex items-center md:hidden"
      >
        <Menu className="text-foreground size-6" aria-hidden />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Menú</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col px-4">
          <SiteNav
            links={links}
            linkClassName="text-foreground border-b border-[#eee] py-3 text-sm"
            activeLinkClassName="text-primary font-medium"
            onNavigate={() => setOpen(false)}
          />
        </nav>
        <div className="text-muted-foreground px-4 py-3 text-sm">
          USD &nbsp;·&nbsp; ES · EN
        </div>
      </SheetContent>
    </Sheet>
  );
}
