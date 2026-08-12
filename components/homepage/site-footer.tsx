export function SiteFooter() {
  return (
    <footer className="bg-foreground w-full px-6 py-10 md:px-10">
      <div className="flex flex-col items-center justify-between gap-6 px-30 text-center md:flex-row">
        <span className="text-muted-ink font-serif text-2xl leading-[1.3125rem] font-medium">
          Art by Vero Miller
        </span>
        <nav className="text-muted-ink flex items-center justify-center gap-6 text-[0.8125rem] md:flex-wrap">
          <a href="#">Galería</a>
          <a href="#">Sobre</a>
          <a href="#">Contacto</a>
          <a href="#">Privacidad</a>
        </nav>
        <span className="text-[0.75rem] text-[#4d4d4d]">
          © {new Date().getFullYear()} Art by Vero Miller
        </span>
      </div>
    </footer>
  );
}
