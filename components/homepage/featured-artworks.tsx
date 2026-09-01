import Image from "next/image";
import Link from "next/link";
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
        <span className="text-muted-ink-light text-[1.125rem] font-medium tracking-wide uppercase">
          Obras disponibles
        </span>
        <Link
          href="/galeria"
          className="text-muted-ink hover:text-foreground text-[0.875rem]"
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
              className="bg-card block"
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
                {artwork.sold && (
                  <span className="absolute top-2 left-2 rounded-full bg-[#1C1917] px-2.5 py-1 text-[10px] leading-4 font-medium tracking-wide text-[#F3EAE0] uppercase">
                    Vendida
                  </span>
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
    </section>
  );
}
