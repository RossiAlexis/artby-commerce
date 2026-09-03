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
                  <>
                    <div className="absolute inset-0 bg-[#D9D9D9B2] backdrop-blur-sm" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-primary rounded-[4px] px-3 py-1.5 text-[11px] font-medium tracking-wide text-white">
                        VENDIDA
                      </span>
                    </div>
                  </>
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
