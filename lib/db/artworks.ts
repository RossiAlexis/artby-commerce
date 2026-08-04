"use server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { artworkPhotos, artworks } from "./schema";
import z from "zod";

const filterSchema = z.enum(["all", "available", "sold"]);
const DEFAULT_PAGE_SIZE = 12;

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
  { page = 1, pageSize = DEFAULT_PAGE_SIZE }: { page?: number; pageSize?: number } = {},
) {
  const resolvedFilter = filterSchema.safeParse(filter).data ?? "available";

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

export type ArtworkListItem = Awaited<ReturnType<typeof getArtworks>>["artworks"][number];
