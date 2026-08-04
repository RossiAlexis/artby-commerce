import { getArtworks } from "@/lib/db/artworks";
import { Gallery } from "./gallery";

export default async function GaleriaPage(props: {
  searchParams?: Promise<{
    category?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const filter = searchParams?.category || "available";
  const { artworks, hasMore } = await getArtworks(filter);

  return (
    <div className="px-6 py-12 md:px-10">
      <h1 className="font-heading mb-8 text-2xl">Galería</h1>
      <Gallery
        key={filter}
        filter={filter}
        initialArtworks={artworks}
        initialHasMore={hasMore}
      />
    </div>
  );
}
