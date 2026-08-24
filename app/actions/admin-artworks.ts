"use server";
import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import z from "zod";
import { requireAdminAction } from "@/lib/auth/require-admin";
import {
  ArtworkPhotoLimitError,
  ArtworkReferencedByOrderError,
} from "@/lib/db/artwork-errors";
import {
  addArtworkPhoto,
  createArtwork,
  deleteArtwork,
  deleteArtworkPhoto,
  reorderArtworkPhotos,
  setArtworkFlags,
  updateArtwork,
} from "@/lib/db/artworks-admin";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const artworkFieldsSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  width: z.coerce.number().positive(),
  height: z.coerce.number().positive(),
  dimensionUnit: z.enum(["cm", "in"]),
  weightKg: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? null : Number(value)),
    z.number().positive().nullable(),
  ),
  medium: z.string().trim().min(1),
  year: z.coerce.number().int().min(1000).max(3000),
  priceCents: z.coerce.number().int().positive(),
});

export type ArtworkFormInput = z.infer<typeof artworkFieldsSchema>;

export type ArtworkFormResult =
  { success: true; id: number } | { success: false; error: string };

export async function createArtworkAction(
  input: ArtworkFormInput,
): Promise<ArtworkFormResult> {
  await requireAdminAction();
  const parsed = artworkFieldsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please fill in all fields correctly." };
  }

  const artwork = await createArtwork(parsed.data);
  revalidatePath("/admin/artworks");
  return { success: true, id: artwork.id };
}

export async function updateArtworkAction(
  id: number,
  input: ArtworkFormInput,
): Promise<ArtworkFormResult> {
  await requireAdminAction();
  const parsed = artworkFieldsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please fill in all fields correctly." };
  }

  const artwork = await updateArtwork(id, parsed.data);
  revalidatePath("/admin/artworks");
  revalidatePath(`/admin/artworks/${id}`);
  return { success: true, id: artwork.id };
}

const flagsSchema = z
  .object({
    sold: z.boolean(),
    visible: z.boolean(),
    featured: z.boolean(),
  })
  .partial();

export async function setArtworkFlagsAction(
  id: number,
  flags: z.infer<typeof flagsSchema>,
) {
  await requireAdminAction();
  const parsed = flagsSchema.parse(flags);
  const artwork = await setArtworkFlags(id, parsed);
  revalidatePath("/admin/artworks");
  revalidatePath(`/admin/artworks/${id}`);
  return artwork;
}

export type DeleteArtworkResult =
  | { success: true }
  | { success: false; error: string; blockedByOrder: boolean };

export async function deleteArtworkAction(
  id: number,
): Promise<DeleteArtworkResult> {
  await requireAdminAction();
  try {
    await deleteArtwork(id);
  } catch (error) {
    if (error instanceof ArtworkReferencedByOrderError) {
      return { success: false, error: error.message, blockedByOrder: true };
    }
    throw error;
  }

  revalidatePath("/admin/artworks");
  return { success: true };
}

export async function reorderArtworkPhotosAction(
  artworkId: number,
  orderedPhotoIds: number[],
) {
  await requireAdminAction();
  await reorderArtworkPhotos(artworkId, orderedPhotoIds);
  revalidatePath(`/admin/artworks/${artworkId}`);
}

export type UploadArtworkPhotoResult =
  | { success: true; photo: { id: number; url: string; position: number } }
  | { success: false; error: string };

export async function uploadArtworkPhotoAction(
  artworkId: number,
  formData: FormData,
): Promise<UploadArtworkPhotoResult> {
  await requireAdminAction();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "No file was given." };
  }
  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    return { success: false, error: "Photos must be JPEG, PNG, or WebP." };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { success: false, error: "Photos must be under 10 MB." };
  }

  const blob = await put(`artworks/${artworkId}/${crypto.randomUUID()}`, file, {
    access: "public",
    oidcToken: process.env.VERCEL_OIDC_TOKEN,
    storeId: process.env.BLOB_STORE_ID,
  });

  try {
    const photo = await addArtworkPhoto(artworkId, blob.url);
    revalidatePath(`/admin/artworks/${artworkId}`);
    return { success: true, photo };
  } catch (error) {
    await del(blob.url, {
      oidcToken: process.env.VERCEL_OIDC_TOKEN,
      storeId: process.env.BLOB_STORE_ID,
    });
    if (error instanceof ArtworkPhotoLimitError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
}

export async function deleteArtworkPhotoAction(
  artworkId: number,
  photoId: number,
) {
  await requireAdminAction();
  const deleted = await deleteArtworkPhoto(photoId);
  if (deleted) {
    await del(deleted.url, {
      oidcToken: process.env.VERCEL_OIDC_TOKEN,
      storeId: process.env.BLOB_STORE_ID,
    });
  }
  revalidatePath(`/admin/artworks/${artworkId}`);
}
