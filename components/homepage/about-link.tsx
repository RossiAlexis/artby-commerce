"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentPropsWithoutRef } from "react";
import { scrollToHashSection } from "@/lib/scroll-to-hash-section";

export function AboutLink(
  props: Omit<ComponentPropsWithoutRef<typeof Link>, "href">,
) {
  const pathname = usePathname();

  return (
    <Link
      href="/#sobre-vero"
      {...props}
      onClick={(event) => {
        if (pathname === "/") {
          event.preventDefault();
          scrollToHashSection("sobre-vero");
        }
        props.onClick?.(event);
      }}
    />
  );
}
