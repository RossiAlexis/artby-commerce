"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/artworks", label: "Obras" },
  { href: null, label: "Mi sitio" },
  { href: null, label: "Pedidos" },
  { href: null, label: "Ajustes" },
] as const;

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-5 flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        if (!item.href) {
          return (
            <span
              key={item.label}
              className="rounded-md px-3 py-2 text-sm text-[#fdf9f4]/50"
            >
              {item.label}
            </span>
          );
        }

        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "relative rounded-md px-3 py-2 text-sm text-[#fdf9f4]",
              isActive
                ? "bg-white/[0.08] font-medium"
                : "font-normal hover:bg-white/5",
            )}
          >
            {isActive && (
              <span className="absolute inset-y-0 left-0 my-auto h-[18px] w-[3px] rounded-sm bg-[#c27a5a]" />
            )}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
