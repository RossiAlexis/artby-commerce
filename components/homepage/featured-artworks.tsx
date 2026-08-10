import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import type { getFeaturedArtworks } from "@/lib/db/artworks";
import { formatPrice } from "@/lib/utils";

type FeaturedArtwork = Awaited<ReturnType<typeof getFeaturedArtworks>>[number];

export function FeaturedArtworks({
  artworks,
}: {
  artworks: FeaturedArtwork[];
}) {
  return (
    <section className="px-6 py-16 md:px-10">
      <div className="mb-8 flex items-center justify-between">
        <span className="text-muted-foreground text-sm tracking-wide uppercase">
          Obras disponibles
        </span>
        <Link
          href="/galeria"
          transitionTypes={["nav-forward"]}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Ver todas →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {artworks.map((artwork) => {
          const heroPhoto = artwork.photos[0];
          return (
            <Link
              key={artwork.id}
              href={`/galeria/${artwork.id}`}
              transitionTypes={["nav-forward"]}
              className="bg-card block"
            >
              <ViewTransition
                name={`artwork-photo-${artwork.id}`}
                share="morph"
                default="none"
              >
                <div className="bg-muted relative aspect-square overflow-hidden">
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
