type SiteFooterProps = {
  socialLinks: Record<string, string>;
  contactInfo: Record<string, string>;
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-muted-foreground w-full px-6 py-10 md:px-10">
      <div className="flex flex-col items-center justify-between gap-6 px-30 text-center md:flex-row">
        <span className="font-serif text-lg">Art by Vero Miller</span>
        <nav className="flex items-center justify-center gap-6 text-sm md:flex-wrap">
          <a href="#">Galería</a>
          <a href="#">Sobre</a>
          <a href="#">Contacto</a>
          <a href="#">Privacidad</a>
        </nav>
        <span className="text-background/50 text-xs">
          © {new Date().getFullYear()} Art by Vero Miller
        </span>
      </div>
    </footer>
  );
}
