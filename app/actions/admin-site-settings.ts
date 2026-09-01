"use server";
import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import z from "zod";
import { requireAdminAction } from "@/lib/auth/require-admin";
import { getSiteSettings, updateSiteSettings } from "@/lib/db/site-settings";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const siteSettingsFieldsSchema = z.object({
  announcementBar: z.string().trim(),
  heroTagline: z.string().trim().min(1),
  aboutTitle: z.string().trim().min(1),
  aboutDescription: z.string().trim().min(1),
  postPurchaseMessage: z.string().trim(),
  instagramUrl: z.string().trim(),
  contactEmail: z.string().trim(),
});

export type SiteSettingsFormInput = z.infer<typeof siteSettingsFieldsSchema>;

export type SiteSettingsFormResult =
  { success: true } | { success: false; error: string };

export async function updateSiteSettingsAction(
  input: SiteSettingsFormInput,
): Promise<SiteSettingsFormResult> {
  await requireAdminAction();
  const parsed = siteSettingsFieldsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please fill in all fields correctly." };
  }

  const { data } = parsed;
  await updateSiteSettings({
    announcementBar: data.announcementBar || null,
    heroTagline: data.heroTagline,
    aboutTitle: data.aboutTitle,
    aboutDescription: data.aboutDescription,
    postPurchaseMessage: data.postPurchaseMessage || null,
    // Only "instagram" and "email" are surfaced in the admin form today, so
    // saving replaces the whole map with just these two known keys.
    socialLinks: data.instagramUrl ? { instagram: data.instagramUrl } : {},
    contactInfo: data.contactEmail ? { email: data.contactEmail } : {},
  });

  revalidatePath("/admin/site-settings");
  revalidatePath("/");
  return { success: true };
}

export type SiteSettingsImageField = "cover" | "about";

export type UploadSiteSettingsImageResult =
  { success: true; url: string } | { success: false; error: string };

export async function uploadSiteSettingsImageAction(
  field: SiteSettingsImageField,
  formData: FormData,
): Promise<UploadSiteSettingsImageResult> {
  await requireAdminAction();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "No file was given." };
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { success: false, error: "Images must be JPEG, PNG, or WebP." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { success: false, error: "Images must be under 10 MB." };
  }

  const current = await getSiteSettings();
  const columnKey = field === "cover" ? "coverImageUrl" : "aboutImageUrl";

  const blob = await put(
    `site-settings/${field}/${crypto.randomUUID()}`,
    file,
    {
      access: "public",
      oidcToken: process.env.VERCEL_OIDC_TOKEN,
      storeId: process.env.BLOB_STORE_ID,
    },
  );

  await updateSiteSettings({ [columnKey]: blob.url });

  const previousUrl = current?.[columnKey];
  if (previousUrl) {
    await del(previousUrl, {
      oidcToken: process.env.VERCEL_OIDC_TOKEN,
      storeId: process.env.BLOB_STORE_ID,
    });
  }

  revalidatePath("/admin/site-settings");
  revalidatePath("/");
  return { success: true, url: blob.url };
}
