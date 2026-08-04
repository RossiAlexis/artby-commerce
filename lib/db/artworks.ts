"use server";
import { and, desc, eq, SQL } from "drizzle-orm";
import { db } from "./client";
import { artworkPhotos, artworks } from "./schema";
import z from "zod";

const filterSchema = z.enum(["all", "available", "sold"]);

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

export async function getArtworks(filter: string) {
  const parsedFilter = filterSchema.safeParse(filter);

  let query: SQL<unknown> | undefined = undefined;
  if (parsedFilter.error) {
    console.log("despues vemos");
  } else {
    query =
      parsedFilter.data === "all"
        ? undefined
        : parsedFilter.data === "available"
          ? and(eq(artworks.visible, true), eq(artworks.sold, false))
          : and(eq(artworks.visible, true), eq(artworks.sold, true));
  }
  const artWorks = db.query.artworks.findMany({
    where: query,
    orderBy: desc(artworks.featuredAt),
    with: {
      photos: {
        where: eq(artworkPhotos.position, 0),
        limit: 1,
      },
    },
  });

  return artWorks;
}
