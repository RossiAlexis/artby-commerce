import { notFound } from "next/navigation";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ArtworkOptions } from "@/components/galeria/artwork-options";
import { ArtworkPhotos } from "@/components/galeria/artwork-photos";
import { RelatedArtworks } from "@/components/galeria/related-artworks";
import { Badge } from "@/components/ui/badge";
import { DirectionalTransition } from "@/components/layout/directional-transition";
import { getArtworkById, getArtworks } from "@/lib/db/artworks";
import { formatPrice } from "@/lib/utils";

const ArrowBack = () => (
  <svg
    width="9"
    height="17"
    viewBox="0 0 9 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.99868 15.938L7.95367 17L0.287675 9.21C0.103176 9.0197 0 8.76505 0 8.5C0 8.23495 0.103176 7.9803 0.287675 7.79L7.95367 0L8.99868 1.063L1.68067 8.5L8.99868 15.938Z"
      fill="black"
    />
  </svg>
);

export default async function ArtworkDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const artworkId = Number(id);
  // artworks.id is a Postgres `serial` (int4); anything outside its range
  // would otherwise reach the DB and throw instead of yielding a 404.
  const isValidId =
    Number.isInteger(artworkId) && artworkId > 0 && artworkId <= 2147483647;
  if (!isValidId) notFound();

  const [artwork, relatedResult] = await Promise.all([
    getArtworkById(artworkId),
    getArtworks("available", { pageSize: 5 }),
  ]);

  if (!artwork) notFound();

  const relatedArtworks = relatedResult.artworks
    .filter((related) => related.id !== artwork.id)
    .slice(0, 4);

  return (
    <DirectionalTransition>
      <div className="px-6 py-12 md:px-10">
        <Link
          href="/galeria"
          transitionTypes={["nav-back"]}
          className="font-heading mb-8 flex items-center gap-4 text-2xl"
        >
          <ArrowBack />
          {"Galería"}
        </Link>
        <div className="grid gap-10 md:grid-cols-2">
          <ArtworkPhotos
            artworkId={artwork.id}
            photos={artwork.photos}
            title={artwork.title}
          />
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-serif text-3xl">{artwork.title}</h1>
              <Badge variant={artwork.sold ? "secondary" : "outline"}>
                {artwork.sold ? "Vendida" : "Disponible"}
              </Badge>
            </div>
            <p className="text-lg">
              {formatPrice(artwork.priceCents, artwork.currency)}
            </p>
            <dl className="text-muted-foreground grid grid-cols-2 gap-2 text-sm">
              <dt>Dimensiones</dt>
              <dd>{artwork.dimensions}</dd>
              <dt>Técnica</dt>
              <dd>{artwork.medium}</dd>
              <dt>Año</dt>
              <dd>{artwork.year}</dd>
            </dl>
            <p className="text-sm whitespace-pre-line">{artwork.description}</p>
            <ArtworkOptions />
            <AddToCartButton artworkId={artwork.id} disabled={artwork.sold} />
          </div>
        </div>
        <RelatedArtworks artworks={relatedArtworks} />
      </div>
    </DirectionalTransition>
  );
}
