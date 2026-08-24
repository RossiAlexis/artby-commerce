"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  updateSiteSettingsAction,
  type SiteSettingsFormInput,
} from "@/app/actions/admin-site-settings";
import { SiteSettingsImageUpload } from "@/components/admin/site-settings-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSettings } from "@/lib/db/site-settings";

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    const input: SiteSettingsFormInput = {
      announcementBar: String(formData.get("announcementBar") ?? ""),
      heroTagline: String(formData.get("heroTagline") ?? ""),
      aboutTitle: String(formData.get("aboutTitle") ?? ""),
      aboutDescription: String(formData.get("aboutDescription") ?? ""),
      postPurchaseMessage: String(formData.get("postPurchaseMessage") ?? ""),
      instagramUrl: String(formData.get("instagramUrl") ?? ""),
      contactEmail: String(formData.get("contactEmail") ?? ""),
    };

    startTransition(async () => {
      const result = await updateSiteSettingsAction(input);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="flex max-w-[760px] flex-col gap-8">
      <section className="flex flex-col gap-6">
        <SectionHeading>Portada</SectionHeading>
        <Field
          id="announcementBar"
          label="Barra de anuncio"
          hint="Se muestra en la barra superior del sitio. Ideal para promociones o novedades temporales."
        >
          <Input
            id="announcementBar"
            name="announcementBar"
            defaultValue={settings.announcementBar ?? ""}
          />
        </Field>
        <Field
          id="heroTagline"
          label="Tagline del hero"
          hint="Frase principal de la portada. Corta y directa — es lo primero que ve el visitante."
        >
          <Input
            id="heroTagline"
            name="heroTagline"
            defaultValue={settings.heroTagline}
            required
          />
        </Field>
        <Field
          id="coverImage"
          label="Imagen del hero"
          hint="Imagen de fondo de la portada. Recomendado: horizontal, mínimo 1440 × 900 px."
        >
          <SiteSettingsImageUpload
            field="cover"
            imageUrl={settings.coverImageUrl}
            changeLabel="Cambiar imagen"
          />
        </Field>
      </section>

      <section className="flex flex-col gap-6">
        <SectionHeading>Sobre mí</SectionHeading>
        <Field
          id="aboutTitle"
          label="Nombre de la artista"
          hint="Aparece en el sitio, facturas y emails de confirmación de compra."
        >
          <Input
            id="aboutTitle"
            name="aboutTitle"
            defaultValue={settings.aboutTitle}
            required
          />
        </Field>
        <Field
          id="aboutImage"
          label='Foto "Sobre mí"'
          hint='Se muestra en la sección "Sobre mí" del sitio.'
        >
          <SiteSettingsImageUpload
            field="about"
            imageUrl={settings.aboutImageUrl}
            changeLabel="Cambiar foto"
          />
        </Field>
        <Field
          id="aboutDescription"
          label="Bio"
          hint='Texto de la sección "Sobre Vero". Podés actualizarlo cuando quieras.'
        >
          <Textarea
            id="aboutDescription"
            name="aboutDescription"
            defaultValue={settings.aboutDescription}
            rows={5}
            required
          />
        </Field>
      </section>

      <section className="flex flex-col gap-6">
        <SectionHeading>Mensajes</SectionHeading>
        <Field
          id="postPurchaseMessage"
          label="Mensaje post-compra"
          hint="Aparecerá en la página de confirmación de compra, justo después que el cliente pague."
        >
          <Textarea
            id="postPurchaseMessage"
            name="postPurchaseMessage"
            defaultValue={settings.postPurchaseMessage ?? ""}
            rows={3}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-6">
        <SectionHeading>Redes sociales</SectionHeading>
        <Field
          id="instagramUrl"
          label="Instagram"
          hint="Enlace al perfil de Instagram, mostrado en el pie del sitio."
        >
          <Input
            id="instagramUrl"
            name="instagramUrl"
            type="url"
            placeholder="https://instagram.com/artbyveromiller"
            defaultValue={settings.socialLinks.instagram ?? ""}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-6">
        <SectionHeading>Contacto</SectionHeading>
        <Field
          id="contactEmail"
          label="Email de contacto"
          hint="Dirección donde los clientes pueden escribirte, mostrada en el pie del sitio."
        >
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            placeholder="hola@artbyveromiller.com"
            defaultValue={settings.contactInfo.email ?? ""}
          />
        </Field>
      </section>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button
        type="submit"
        disabled={isPending}
        className="w-[168px] self-start bg-primary py-[13px] text-white hover:bg-primary-hover"
      >
        {isPending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-primary text-[11px] font-semibold tracking-[1.2px] uppercase">
        {children}
      </p>
      <div className="h-px w-full bg-[#e2d8ce]" />
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
    <div className="flex flex-col gap-2.5">
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
