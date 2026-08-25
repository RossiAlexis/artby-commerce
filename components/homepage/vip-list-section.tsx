"use client";

import { useState, useTransition } from "react";
import { subscribeAction } from "@/app/actions/subscribe";

export function VipListSection() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await subscribeAction({
        email: String(formData.get("email") ?? ""),
      });

      if (result.success) {
        setSubscribed(true);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <section className="bg-foreground flex flex-col items-center px-6 py-20 md:px-10">
      <div className="flex w-full max-w-[35rem] flex-col items-center gap-5 text-center">
        <p className="text-muted-ink-light text-xs font-medium tracking-wide uppercase">
          Coleccionistas
        </p>
        <h2 className="font-serif text-5xl leading-[2.75rem] font-semibold text-white">
          Acceso anticipado <br />a obras nuevas
        </h2>
        <p className="text-muted-ink-inverse flex-wrap text-[1rem] leading-[1.5rem]">
          Sumate a la lista VIP y sé el primero en ver cada obra <br />
          <span className="flex-nowrap">antes del lanzamiento. </span>
        </p>
        {subscribed ? (
          <p className="text-sm font-medium text-white">
            ¡Listo! Te avisaremos cuando haya obras nuevas.
          </p>
        ) : (
          <form
            action={handleSubmit}
            className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <input
              type="email"
              name="email"
              required
              disabled={isPending}
              placeholder="Tu email"
              className="placeholder:text-muted-ink-inverse h-12 w-full rounded-lg bg-[#333] px-4 text-sm text-white focus:outline-none disabled:opacity-50 sm:w-[21.25rem]"
            />
            <button
              type="submit"
              disabled={isPending}
              className="text-foreground h-12 w-full rounded-lg bg-white px-6 text-sm font-medium disabled:opacity-50 sm:w-[10.5rem]"
            >
              {isPending ? "Sumando…" : "Sumarme"}
            </button>
          </form>
        )}
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>
    </section>
  );
}
