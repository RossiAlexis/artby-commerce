import Image from "next/image";
import Link from "next/link";
import type { ArtworkListItem } from "@/lib/db/artworks";
import { formatPrice } from "@/lib/utils";

export function RelatedArtworks({ artworks }: { artworks: ArtworkListItem[] }) {
  if (artworks.length === 0) return null;

  return (
    <section className="mx-[calc(50%-50vw)] mt-16 w-screen bg-[#FCEBE3] py-10">
      <div className="px-5 md:px-10 lg:px-30">
        <h2 className="font-heading mb-8 text-xl">Otras obras disponibles</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {artworks.map((artwork) => {
            const heroPhoto = artwork.photos[0];
            return (
              <Link
                key={artwork.id}
                href={`/galeria/${artwork.id}`}
                className="bg-card block"
              >
                <div className="bg-muted relative aspect-[282/356] w-full">
                  {heroPhoto && (
                    <Image
                      src={heroPhoto.url}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 25vw, 50vw"
                    />
                  )}
                </div>
                <div className="space-y-1 px-1.5 py-3">
                  <p className="text-sm font-medium">{artwork.title}</p>
                  <p className="text-muted-foreground text-sm font-normal">
                    {formatPrice(artwork.priceCents, artwork.currency)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
