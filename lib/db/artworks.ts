"use server"
import { and, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { artworkPhotos, artworks } from "./schema";

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
