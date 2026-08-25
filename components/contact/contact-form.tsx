"use client";

import { useState, useTransition } from "react";
import { contactAction } from "@/app/actions/contact";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await contactAction({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        message: String(formData.get("message") ?? ""),
      });

      if (result.success) {
        setSent(true);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex w-full max-w-[35rem] flex-col gap-3.5">
      <h1 className="text-foreground font-serif text-[2.125rem] font-medium">
        Contacto
      </h1>
      <p className="text-[0.875rem] text-[#7c756f]">
        ¿Te interesa una obra, una comisión o simplemente querés saludar?
        Escribime, respondo personalmente :)
      </p>

      {sent ? (
        <p className="text-foreground text-sm font-medium">
          ¡Gracias por tu mensaje! Te responderé personalmente a la brevedad.
        </p>
      ) : (
        <form action={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="text-foreground text-[0.8125rem] font-medium"
            >
              Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              disabled={isPending}
              placeholder="Tu nombre"
              className="focus-visible:border-ring h-11 w-full rounded-sm border border-[#e2d8ce] bg-white px-3.5 text-[0.8125rem] text-[#7c756f] outline-none disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-foreground text-[0.8125rem] font-medium"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={isPending}
              placeholder="tuemail@email.com"
              className="focus-visible:border-ring h-11 w-full rounded-sm border border-[#e2d8ce] bg-white px-3.5 text-[0.8125rem] text-[#7c756f] outline-none disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="message"
              className="text-foreground text-[0.8125rem] font-medium"
            >
              Mensaje
            </label>
            <textarea
              id="message"
              name="message"
              required
              disabled={isPending}
              placeholder="Contame en qué te puedo ayudar…"
              rows={5}
              className="focus-visible:border-ring h-[7.5rem] w-full resize-none rounded-sm border border-[#e2d8ce] bg-white px-3.5 py-3 text-[0.8125rem] text-[#7c756f] outline-none disabled:opacity-50"
            />
          </div>
          {error && <p className="text-destructive text-xs">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 w-full rounded-md px-8 py-3.5 text-sm font-medium text-white disabled:opacity-50 lg:w-fit"
          >
            {isPending ? "Enviando…" : "Enviar mensaje"}
          </button>
        </form>
      )}
    </div>
  );
}
