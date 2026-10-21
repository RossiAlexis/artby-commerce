"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import {
  updateShopSettingsAction,
  type ShopSettingsInput,
} from "@/app/actions/admin-shop-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  SHIPPING_ORIGINS,
  normalizeInstagramHandle,
} from "@/lib/shop-settings";
import { cn } from "@/lib/utils";

export function ShopSettingsForm({ initial }: { initial: ShopSettingsInput }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [notificationEmail, setNotificationEmail] = useState(
    initial.notificationEmail,
  );
  const [shippingOrigin, setShippingOrigin] = useState(initial.shippingOrigin);
  const [editingOrigin, setEditingOrigin] = useState(false);
  const [shippingInsuranceIncluded, setShippingInsuranceIncluded] = useState(
    initial.shippingInsuranceIncluded,
  );
  const [freeShippingOver500, setFreeShippingOver500] = useState(
    initial.freeShippingOver500,
  );
  const [instagramHandle, setInstagramHandle] = useState(
    initial.instagramHandle,
  );
  const [primaryLanguage, setPrimaryLanguage] = useState(
    initial.primaryLanguage,
  );

  const originOptions = useMemo(() => {
    const presets: string[] = [...SHIPPING_ORIGINS];
    if (shippingOrigin && !presets.includes(shippingOrigin)) {
      presets.unshift(shippingOrigin);
    }
    return presets;
  }, [shippingOrigin]);

  const instagramValid = Boolean(normalizeInstagramHandle(instagramHandle));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    const input: ShopSettingsInput = {
      notificationEmail,
      shippingOrigin,
      shippingInsuranceIncluded,
      freeShippingOver500,
      instagramHandle,
      primaryLanguage,
    };

    startTransition(async () => {
      const result = await updateShopSettingsAction(input);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSaved(true);
      setEditingOrigin(false);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      <section className="flex max-w-[508px] flex-col gap-6">
        <SectionHeading>Cuenta</SectionHeading>
        <Field
          id="notificationEmail"
          label="Email de contacto"
          hint="Recibís aquí los avisos de nuevos pedidos y consultas de compradores"
        >
          <Input
            id="notificationEmail"
            type="email"
            value={notificationEmail}
            onChange={(event) => setNotificationEmail(event.target.value)}
            placeholder="vero@artbyveromiller.com"
            className="h-[42px] rounded-[6px] border-[#e2d8ce] bg-white px-[13px] text-sm text-[#1c1917]"
          />
        </Field>
      </section>

      <section className="flex max-w-[508px] flex-col gap-6">
        <SectionHeading>Envíos</SectionHeading>
        <Field
          id="shippingOrigin"
          label="País de origen"
          hint="Desde donde se despachan las obras — afecta el cálculo de envío internacional"
        >
          {editingOrigin ? (
            <Input
              id="shippingOrigin"
              value={shippingOrigin}
              onChange={(event) => setShippingOrigin(event.target.value)}
              className="h-[42px] rounded-[6px] border-[#d8d1ca] bg-[#f5f2ef] px-[13px] text-sm text-[#1c1917]"
            />
          ) : (
            <Select
              value={shippingOrigin}
              onValueChange={(value) => value && setShippingOrigin(value)}
            >
              <SelectTrigger
                id="shippingOrigin"
                className="h-[42px] w-full rounded-[6px] border-[#d8d1ca] bg-[#f5f2ef] px-[13px] text-sm text-[#1c1917] data-[size=default]:h-[42px]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {originOptions.map((origin) => (
                  <SelectItem key={origin} value={origin}>
                    {origin}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <button
            type="button"
            onClick={() => setEditingOrigin((current) => !current)}
            className="text-primary w-fit text-xs font-medium"
          >
            {editingOrigin ? "Listo" : "Editar →"}
          </button>
        </Field>
        <ToggleRow
          id="shippingInsurance"
          label="Seguro de envío incluido"
          hint="Cubre pérdida o daño durante el tránsito. El costo se suma al precio de envío"
          checked={shippingInsuranceIncluded}
          onCheckedChange={setShippingInsuranceIncluded}
        />
        <ToggleRow
          id="freeShipping"
          label="Envío gratuito para compras mayores a USD 500"
          hint="Incentivo para compradores de obras de mayor valor"
          checked={freeShippingOver500}
          onCheckedChange={setFreeShippingOver500}
        />
      </section>

      <section className="flex max-w-[508px] flex-col gap-6">
        <SectionHeading>Pagos</SectionHeading>
        <Field
          id="stripeAccount"
          label="Stripe"
          hint="Los pagos de los compradores llegan a tu cuenta de Stripe de forma automática"
        >
          <a
            id="stripeAccount"
            href="https://dashboard.stripe.com/"
            target="_blank"
            rel="noreferrer"
            className="border-primary text-primary inline-flex h-8 w-fit items-center rounded-[6px] border px-[7.5px] text-[13px] font-medium"
          >
            Gestionar cuenta →
          </a>
        </Field>
      </section>

      <section className="flex max-w-[508px] flex-col gap-6">
        <SectionHeading>Redes sociales</SectionHeading>
        <Field
          id="instagramHandle"
          label="Handle de Instagram"
          hint='Enlaza la sección de Instagram en el home y el botón "Seguir en Instagram"'
        >
          <div className="relative">
            <Input
              id="instagramHandle"
              value={instagramHandle}
              onChange={(event) => setInstagramHandle(event.target.value)}
              placeholder="@artbyveromiller"
              className="h-[42px] rounded-[6px] border-[#e2d8ce] bg-white px-[13px] pr-12 text-sm text-[#1c1917]"
            />
            {instagramValid && (
              <span
                aria-hidden
                className="absolute top-[6.5px] right-[7px] flex size-[29px] items-center justify-center rounded-[6px] bg-[#e6f0e9] text-[13px] font-medium text-[#7a8c7e]"
              >
                ✓
              </span>
            )}
          </div>
        </Field>
      </section>

      <section className="flex max-w-[508px] flex-col gap-6">
        <SectionHeading>Idioma</SectionHeading>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[13px] font-medium text-[#1c1917]">
              Idioma principal
            </p>
            <p className="text-[12px] text-[#7c756f]">
              Los visitantes pueden cambiarlo en el sitio con el toggle ES/EN.
            </p>
          </div>
          <div
            role="radiogroup"
            aria-label="Idioma principal"
            className="flex shrink-0 overflow-hidden rounded-[6px] border border-[#e0ddd6] bg-white"
          >
            {(["es", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={primaryLanguage === code}
                onClick={() => setPrimaryLanguage(code)}
                className={cn(
                  "px-3.5 py-1.5 text-[13px] font-medium",
                  primaryLanguage === code
                    ? "bg-[#1c1917] text-white"
                    : "text-[#57514b]",
                )}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex items-center justify-end gap-4">
        {saved && (
          <p className="text-[12px] text-[#7a8c7e]">Cambios guardados.</p>
        )}
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-primary-hover h-auto w-[168px] rounded-[4px] px-[19px] py-[14px] text-sm text-white"
        >
          {isPending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-primary text-[11px] font-semibold tracking-[1.2px] uppercase">
        {children}
      </p>
      <div className="bg-border h-px w-full" />
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label htmlFor={id} className="text-[13px] font-medium text-[#1c1917]">
          {label}
        </Label>
        <p className="text-[12px] text-[#7c756f]">{hint}</p>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor={id} className="text-[13px] font-medium text-[#1c1917]">
          {label}
        </Label>
        <p className="text-[12px] text-[#7c756f]">{hint}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-0.5 data-checked:bg-[#1c1917] data-unchecked:bg-[#d6d3d1]"
      />
    </div>
  );
}
