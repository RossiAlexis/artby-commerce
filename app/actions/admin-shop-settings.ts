"use server";
import { revalidatePath } from "next/cache";
import z from "zod";
import { requireAdminAction } from "@/lib/auth/require-admin";
import { getSiteSettings, updateSiteSettings } from "@/lib/db/site-settings";
import {
  instagramHandleFromUrl,
  instagramUrlFromHandle,
  normalizeInstagramHandle,
} from "@/lib/shop-settings";

const shopSettingsSchema = z.object({
  notificationEmail: z.string().trim(),
  shippingOrigin: z.string().trim().min(1).max(80),
  shippingInsuranceIncluded: z.boolean(),
  freeShippingOver500: z.boolean(),
  instagramHandle: z.string().trim(),
  primaryLanguage: z.enum(["es", "en"]),
});

export type ShopSettingsInput = z.infer<typeof shopSettingsSchema>;

export type ShopSettingsResult =
  { success: true } | { success: false; error: string };

export async function updateShopSettingsAction(
  input: ShopSettingsInput,
): Promise<ShopSettingsResult> {
  await requireAdminAction();
  const parsed = shopSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Revisá los campos e intentá de nuevo." };
  }

  const email = parsed.data.notificationEmail;
  if (email && !z.email().safeParse(email).success) {
    return { success: false, error: "El email de contacto no es válido." };
  }

  const handle = normalizeInstagramHandle(parsed.data.instagramHandle);
  if (handle === null) {
    return { success: false, error: "El handle de Instagram no es válido." };
  }

  const current = await getSiteSettings();
  if (!current) {
    return {
      success: false,
      error: "No hay configuración del sitio todavía.",
    };
  }

  const socialLinks = { ...current.socialLinks };
  if (handle) {
    socialLinks.instagram = instagramUrlFromHandle(handle);
  } else if (instagramHandleFromUrl(current.socialLinks.instagram)) {
    delete socialLinks.instagram;
  }

  await updateSiteSettings({
    notificationEmail: email || null,
    shippingOrigin: parsed.data.shippingOrigin,
    shippingInsuranceIncluded: parsed.data.shippingInsuranceIncluded,
    freeShippingOver500: parsed.data.freeShippingOver500,
    primaryLanguage: parsed.data.primaryLanguage,
    socialLinks,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/contacto");
  return { success: true };
}
