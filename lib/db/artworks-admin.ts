"use server";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { artworkPhotos, artworks, orderItems } from "./schema";
import {
  ArtworkPhotoMismatchError,
  ArtworkReferencedByOrderError,
} from "./artwork-errors";

export type ArtworkFields = {
  title: string;
  description: string;
  dimensions: string;
  medium: string;
  year: number;
  priceCents: number;
};

export type ArtworkFlags = Partial<{
  sold: boolean;
  visible: boolean;
  featured: boolean;
}>;

/** All Artworks regardless of Sold/Visibility, newest first, for the admin catalog list. */
export async function getAdminArtworks() {
  return db.query.artworks.findMany({
    orderBy: desc(artworks.id),
    with: {
      photos: {
        where: eq(artworkPhotos.position, 0),
        limit: 1,
      },
    },
  });
}

export type AdminArtworkListItem = Awaited<
  ReturnType<typeof getAdminArtworks>
>[number];

/** A single Artwork regardless of Sold/Visibility, with all photos, for the admin edit form. */
export async function getAdminArtworkById(id: number) {
  return db.query.artworks.findFirst({
    where: eq(artworks.id, id),
    with: {
      photos: {
        orderBy: asc(artworkPhotos.position),
      },
    },
  });
}

export type AdminArtworkDetail = Awaited<
  ReturnType<typeof getAdminArtworkById>
>;

export async function createArtwork(fields: ArtworkFields) {
  const [artwork] = await db.insert(artworks).values(fields).returning();
  return artwork;
}

export async function updateArtwork(id: number, fields: ArtworkFields) {
  const [artwork] = await db
    .update(artworks)
    .set(fields)
    .where(eq(artworks.id, id))
    .returning();
  return artwork;
}

/**
 * Sold/Visibility/Featured are independently settable (see CONTEXT.md).
 * Turning Featured on bumps `featuredAt` so it sorts first among Featured
 * picks, per the homepage's "most recently flagged first" rule.
 */
export async function setArtworkFlags(id: number, flags: ArtworkFlags) {
  const [artwork] = await db
    .update(artworks)
    .set({
      ...flags,
      ...(flags.featured === true ? { featuredAt: new Date() } : {}),
    })
    .where(eq(artworks.id, id))
    .returning();
  return artwork;
}

/**
 * Blocked if any Order references this Artwork (see issue #1 / CONTEXT.md) —
 * hiding it (Visibility) is offered instead in that case.
 */
export async function deleteArtwork(id: number) {
  const [referencingItem] = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .where(eq(orderItems.artworkId, id))
    .limit(1);

  if (referencingItem) {
    throw new ArtworkReferencedByOrderError();
  }

  const [deleted] = await db
    .delete(artworks)
    .where(eq(artworks.id, id))
    .returning();
  return deleted;
}

/** Persists a new photo order — `orderedPhotoIds` must be exactly this Artwork's current photo ids. */
export async function reorderArtworkPhotos(
  artworkId: number,
  orderedPhotoIds: number[],
) {
  await db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: artworkPhotos.id })
      .from(artworkPhotos)
      .where(eq(artworkPhotos.artworkId, artworkId));
    const existingIds = new Set(existing.map((photo) => photo.id));

    const isSameSet =
      existingIds.size === orderedPhotoIds.length &&
      orderedPhotoIds.every((id) => existingIds.has(id));
    if (!isSameSet) {
      throw new ArtworkPhotoMismatchError();
    }

    for (const [position, photoId] of orderedPhotoIds.entries()) {
      await tx
        .update(artworkPhotos)
        .set({ position })
        .where(eq(artworkPhotos.id, photoId));
    }
  });
}
