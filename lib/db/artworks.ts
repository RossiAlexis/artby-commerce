"use server";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { artworkPhotos, artworks } from "./schema";
import { resolveArtworksFilter } from "./artworks-filter";
import { resolvePage, resolvePageSize } from "./artworks-pagination";

export async function getFeaturedArtworks(limit = 4) {
  return db.query.artworks.findMany({
    where: and(eq(artworks.featured, true), eq(artworks.visible, true)),
    orderBy: desc(artworks.featuredAt),
    limit,
    with: {
      photos: {
        where: eq(artworkPhotos.position, 0),
        limit: 1,
      },
    },
  });
}

export async function getArtworks(
  filter: string,
  {
    page: rawPage,
    pageSize: rawPageSize,
  }: { page?: number; pageSize?: number } = {},
) {
  const resolvedFilter = resolveArtworksFilter(filter);
  const page = resolvePage(rawPage);
  const pageSize = resolvePageSize(rawPageSize);

  const conditions = [eq(artworks.visible, true)];
  if (resolvedFilter === "available") conditions.push(eq(artworks.sold, false));
  if (resolvedFilter === "sold") conditions.push(eq(artworks.sold, true));

  const items = await db.query.artworks.findMany({
    where: and(...conditions),
    orderBy: desc(artworks.id),
    limit: pageSize + 1,
    offset: (page - 1) * pageSize,
    with: {
      photos: {
        where: eq(artworkPhotos.position, 0),
        limit: 1,
      },
    },
  });

  return {
    artworks: items.slice(0, pageSize),
    hasMore: items.length > pageSize,
  };
}

export type ArtworkListItem = Awaited<
  ReturnType<typeof getArtworks>
>["artworks"][number];

export async function getArtworkById(id: number) {
  return db.query.artworks.findFirst({
    where: and(eq(artworks.id, id), eq(artworks.visible, true)),
    with: {
      photos: {
        orderBy: asc(artworkPhotos.position),
      },
    },
  });
}

export type ArtworkDetail = Awaited<ReturnType<typeof getArtworkById>>;
