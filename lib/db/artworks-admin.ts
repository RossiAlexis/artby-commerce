"use server";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { artworkPhotos, artworks, orderItems } from "./schema";
import { MAX_ARTWORK_PHOTOS } from "./artwork-constants";
import {
  ArtworkPhotoLimitError,
  ArtworkPhotoMismatchError,
  ArtworkReferencedByOrderError,
} from "./artwork-errors";

export type ArtworkFields = {
  title: string;
  description: string;
  width: number;
  height: number;
  dimensionUnit: string;
  weightKg: number | null;
  medium: string;
  year: number;
  priceCents: number;
};

export type ArtworkFlags = Partial<{
  sold: boolean;
  visible: boolean;
  featured: boolean;
}>;

/**
 * All Artworks regardless of Sold/Visibility, newest first, for the admin
 * catalog list — includes every photo (not just the hero) since the list's
 * edit modal manages the full photo set inline, without a extra fetch.
 */
export async function getAdminArtworks() {
  return db.query.artworks.findMany({
    orderBy: desc(artworks.id),
    with: {
      photos: {
        orderBy: asc(artworkPhotos.position),
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

/**
 * Records a photo already uploaded to Vercel Blob against this Artwork,
 * appending it after the current highest position. Rejects once the
 * Artwork already has `MAX_ARTWORK_PHOTOS` photos — the blob itself must be
 * deleted by the caller in that case, since the row insert never happens.
 */
export async function addArtworkPhoto(artworkId: number, url: string) {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select({ position: artworkPhotos.position })
      .from(artworkPhotos)
      .where(eq(artworkPhotos.artworkId, artworkId));

    if (existing.length >= MAX_ARTWORK_PHOTOS) {
      throw new ArtworkPhotoLimitError();
    }

    const nextPosition =
      existing.length === 0
        ? 0
        : Math.max(...existing.map((photo) => photo.position)) + 1;

    const [photo] = await tx
      .insert(artworkPhotos)
      .values({ artworkId, url, position: nextPosition })
      .returning();
    return photo;
  });
}

/** Removes a single photo row — the caller is responsible for deleting the underlying blob. */
export async function deleteArtworkPhoto(photoId: number) {
  const [deleted] = await db
    .delete(artworkPhotos)
    .where(eq(artworkPhotos.id, photoId))
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
