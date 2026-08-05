import z from "zod";

export const artworksFilterSchema = z.enum(["all", "available", "sold"]);
export type ArtworksFilter = z.infer<typeof artworksFilterSchema>;

export function resolveArtworksFilter(
  value: string | undefined,
): ArtworksFilter {
  return artworksFilterSchema.safeParse(value).data ?? "available";
}
