"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { scrollToHashSection } from "@/lib/scroll-to-hash-section";
import { cn } from "@/lib/utils";

type NavLinkItem = { href: string; label: string };

export function SiteNav({
  links,
  linkClassName,
  activeLinkClassName,
  onNavigate,
}: {
  links: NavLinkItem[];
  linkClassName?: string;
  activeLinkClassName?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [aboutInView, setAboutInView] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;

    const target = document.getElementById("sobre-vero");
    if (!target) return;

    // Treat the section as "active" once it crosses the middle of the
    // viewport, so the header highlight tracks scroll position like a
    // typical scroll-spy nav.
    const observer = new IntersectionObserver(
      ([entry]) => setAboutInView(entry.isIntersecting),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [pathname]);

  function isActive(href: string) {
    if (href === "/#sobre-vero") return pathname === "/" && aboutInView;
    const path = href.split("?")[0];
    return path !== "/" && (pathname === path || pathname.startsWith(`${path}/`));
  }

  return (
    <>
      {links.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.label}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(linkClassName, active && activeLinkClassName)}
            onClick={(event) => {
              if (link.href === "/#sobre-vero" && pathname === "/") {
                event.preventDefault();
                scrollToHashSection("sobre-vero");
              }
              onNavigate?.();
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
