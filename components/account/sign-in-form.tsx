"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

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
            htmlFor="password"
            className="text-foreground text-[0.8125rem] font-medium"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            disabled={isPending}
            placeholder="Tu contraseña"
            className="focus-visible:border-ring h-11 w-full rounded-sm border border-[#e2d8ce] bg-white px-3.5 text-[0.8125rem] text-[#7c756f] outline-none disabled:opacity-50"
          />
        </div>
        {error && <p className="text-destructive text-xs">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 w-full rounded-md px-8 py-3.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Ingresando…" : "Ingresar"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#e2d8ce]" />
        <span className="text-[0.75rem] text-[#7c756f]">o</span>
        <div className="h-px flex-1 bg-[#e2d8ce]" />
      </div>

      <button
        type="button"
        disabled={isPending}
        onClick={() => signIn("google", { redirectTo: callbackUrl })}
        className="w-full rounded-md border border-[#e2d8ce] bg-white px-8 py-3.5 text-sm font-medium text-[#1c1917] hover:bg-[#f5f2ef] disabled:opacity-50"
      >
        Continuar con Google
      </button>

      <p className="text-center text-[0.8125rem] text-[#7c756f]">
        ¿No tenés cuenta?{" "}
        <Link href="/cuenta/registro" className="text-primary font-medium">
          Creá una
        </Link>
      </p>
    </div>
  );
}
