import { AboutLink } from "@/components/homepage/about-link";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-foreground flex w-full items-center px-6 py-8 md:h-[4.5rem] md:px-10 md:py-0">
      <div className="flex w-full flex-col items-center justify-between gap-4 text-center md:flex-row lg:px-20">
        <span className="font-serif text-2xl leading-[1.3125rem] font-medium text-[#fdf9f4] italic">
          Art by Vero Miller
        </span>
        <nav className="flex items-center justify-center gap-6 text-[0.8125rem] text-[#d6d3d1] md:flex-wrap">
          <Link href="/galeria">Galería</Link>
          <AboutLink>Sobre</AboutLink>
          <Link href="/contacto">Contacto</Link>
        </nav>
        <span className="text-[0.75rem] text-[#a8a29e]">
          © {new Date().getFullYear()} BugStudio
        </span>
      </div>
    </footer>
  );
}
