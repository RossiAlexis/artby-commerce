"use server";
import { revalidatePath } from "next/cache";
import z from "zod";
import { requireAdminAction } from "@/lib/auth/require-admin";
import { ArtworkReferencedByOrderError } from "@/lib/db/artwork-errors";
import {
  createArtwork,
  deleteArtwork,
  reorderArtworkPhotos,
  setArtworkFlags,
  updateArtwork,
} from "@/lib/db/artworks-admin";

const artworkFieldsSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  dimensions: z.string().trim().min(1),
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
