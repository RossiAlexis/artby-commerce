"use client";

import { useState, useTransition } from "react";
import { contactAction } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
            <Label
              htmlFor="name"
              className="text-foreground text-[0.8125rem] font-medium"
            >
              Nombre
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              disabled={isPending}
              placeholder="Tu nombre"
              className="h-11 rounded-sm border-[#e2d8ce] bg-white px-3.5 text-[0.8125rem] text-[#7c756f]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="email"
              className="text-foreground text-[0.8125rem] font-medium"
            >
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              disabled={isPending}
              placeholder="tuemail@email.com"
              className="h-11 rounded-sm border-[#e2d8ce] bg-white px-3.5 text-[0.8125rem] text-[#7c756f]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="message"
              className="text-foreground text-[0.8125rem] font-medium"
            >
              Mensaje
            </Label>
            <Textarea
              id="message"
              name="message"
              required
              disabled={isPending}
              placeholder="Contame en qué te puedo ayudar…"
              rows={5}
              className="h-[7.5rem] resize-none rounded-sm border-[#e2d8ce] bg-white px-3.5 py-3 text-[0.8125rem] text-[#7c756f]"
            />
          </div>
          {error && <p className="text-destructive text-xs">{error}</p>}
          <Button
            type="submit"
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 h-12 w-full rounded-md px-8 text-sm font-medium text-white lg:w-fit"
          >
            {isPending ? "Enviando…" : "Enviar mensaje"}
          </Button>
        </form>
      )}
    </div>
  );
}
