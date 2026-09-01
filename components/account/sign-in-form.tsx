"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        redirect: false,
      });

      if (!result || result.error) {
        setError("Correo o contraseña incorrectos.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <div className="flex w-full max-w-[26rem] flex-col gap-3.5">
      <h1 className="text-foreground font-serif text-[2.125rem] font-medium">
        Ingresar
      </h1>
      <p className="text-[0.875rem] text-[#7c756f]">
        Ingresá a tu cuenta para ver el historial de tus pedidos.
      </p>

      <form action={handleSubmit} className="flex flex-col gap-3.5">
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
            htmlFor="password"
            className="text-foreground text-[0.8125rem] font-medium"
          >
            Contraseña
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            disabled={isPending}
            placeholder="Tu contraseña"
            className="h-11 rounded-sm border-[#e2d8ce] bg-white px-3.5 text-[0.8125rem] text-[#7c756f]"
          />
        </div>
        {error && <p className="text-destructive text-xs">{error}</p>}
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 h-12 w-full rounded-md px-8 text-sm font-medium text-white"
        >
          {isPending ? "Ingresando…" : "Ingresar"}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#e2d8ce]" />
        <span className="text-[0.75rem] text-[#7c756f]">o</span>
        <div className="h-px flex-1 bg-[#e2d8ce]" />
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => signIn("google", { redirectTo: callbackUrl })}
        className="h-12 w-full rounded-md border-[#e2d8ce] bg-white px-8 text-sm font-medium text-[#1c1917] hover:bg-[#f5f2ef]"
      >
        Continuar con Google
      </Button>

      <p className="text-center text-[0.8125rem] text-[#7c756f]">
        ¿No tenés cuenta?{" "}
        <Link href="/cuenta/registro" className="text-primary font-medium">
          Creá una
        </Link>
      </p>
    </div>
  );
}
