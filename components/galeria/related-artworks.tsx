import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import type { ArtworkListItem } from "@/lib/db/artworks";
import { formatPrice } from "@/lib/utils";

export function RelatedArtworks({ artworks }: { artworks: ArtworkListItem[] }) {
  if (artworks.length === 0) return null;

  return (
    <section className="mt-16">
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
              <ViewTransition
                name={`artwork-photo-${artwork.id}`}
                share="morph"
                default="none"
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
              </ViewTransition>
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
    </section>
  );
}
