"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { signUpCustomer } from "@/app/actions/auth";

export function SignUpForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      const result = await signUpCustomer({
        name: name || undefined,
        email,
        password,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      // Sign the Customer in right away rather than sending them back
      // through a second form — smoother UX for the common case.
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!signInResult || signInResult.error) {
        router.push("/cuenta/ingresar");
        return;
      }

      router.push("/cuenta");
      router.refresh();
    });
  }

  return (
    <div className="flex w-full max-w-[26rem] flex-col gap-3.5">
      <h1 className="text-foreground font-serif text-[2.125rem] font-medium">
        Crear cuenta
      </h1>
      <p className="text-[0.875rem] text-[#7c756f]">
        Creá tu cuenta para ver el historial de tus pedidos.
      </p>

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
            disabled={isPending}
            placeholder="Tu nombre (opcional)"
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
            minLength={8}
            disabled={isPending}
            placeholder="Mínimo 8 caracteres"
            className="focus-visible:border-ring h-11 w-full rounded-sm border border-[#e2d8ce] bg-white px-3.5 text-[0.8125rem] text-[#7c756f] outline-none disabled:opacity-50"
          />
        </div>
        {error && <p className="text-destructive text-xs">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 w-full rounded-md px-8 py-3.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center text-[0.8125rem] text-[#7c756f]">
        ¿Ya tenés cuenta?{" "}
        <Link href="/cuenta/ingresar" className="text-primary font-medium">
          Ingresá
        </Link>
      </p>
    </div>
  );
}
