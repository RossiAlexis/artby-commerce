export function VipListSection() {
  return (
    <section className="bg-foreground flex flex-col items-center px-6 py-20 md:px-10">
      <div className="flex w-full max-w-[35rem] flex-col items-center gap-5 text-center">
        <p className="text-muted-ink-light text-xs font-medium tracking-wide uppercase">
          Coleccionistas
        </p>
        <h2 className="font-serif text-5xl leading-[2.75rem] font-semibold text-white">
          Acceso anticipado <br />a obras nuevas 
        </h2>
        <p className="text-muted-ink-inverse text-[1rem] leading-[1.5rem] flex-wrap">
          Sumate a la lista VIP y sé el primero en ver cada obra  <br/><span className="flex-nowrap">antes del lanzamiento. </span>
        </p>
        <form className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
          <input
            type="email"
            required
            placeholder="Tu email"
            className="placeholder:text-muted-ink-inverse h-12 w-full rounded-lg bg-[#333] px-4 text-sm text-white focus:outline-none sm:w-[21.25rem]"
          />
          <button
            type="submit"
            className="text-foreground h-12 w-full rounded-lg bg-white px-6 text-sm font-medium sm:w-[10.5rem]"
          >
            Sumarme
          </button>
        </form>
      </div>
    </section>
  );
}
