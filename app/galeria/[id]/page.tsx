import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentCart } from "@/app/actions/cart";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { BuyNowButton } from "@/components/cart/buy-now-button";
import { ArtworkOptions } from "@/components/galeria/artwork-options";
import { ArtworkPhotos } from "@/components/galeria/artwork-photos";
import { RelatedArtworks } from "@/components/galeria/related-artworks";
import { Badge } from "@/components/ui/badge";
import { getArtworkById, getArtworks } from "@/lib/db/artworks";
import { cn, formatPrice } from "@/lib/utils";

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

  const [artwork, relatedResult, cart] = await Promise.all([
    getArtworkById(artworkId),
    getArtworks("available", { pageSize: 5 }),
    getCurrentCart(),
  ]);

  if (!artwork) notFound();

  const relatedArtworks = relatedResult.artworks
    .filter((related) => related.id !== artwork.id)
    .slice(0, 4);

  const isInCart = cart.items.some((item) => item.artworkId === artwork.id);
  const hasRelatedArtworks = relatedArtworks.length > 0;

  return (
    <div className={cn("px-5 pt-12", !hasRelatedArtworks && "pb-12")}>
      <Link
        href="/galeria"
        className="font-heading mb-8 flex items-center gap-4 text-2xl"
      >
        <ArrowBack />
        {"Galería"}
      </Link>
      <div className="grid gap-10 md:grid-cols-2">
        <ArtworkPhotos photos={artwork.photos} title={artwork.title} />
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-[#E2D8CE] pb-5">
            <div className="flex flex-col gap-4">
              <Badge
                variant={artwork.sold ? "secondary" : "outline"}
                className={cn(
                  "h-[28px] w-[100px] rounded-full border-transparent text-[11px] leading-4 font-medium tracking-wide uppercase",
                  artwork.sold
                    ? "bg-[#1C1917] text-[#F3EAE0]"
                    : "bg-[#E6F0E9] text-[#4D5E51]",
                )}
              >
                {artwork.sold ? "Vendida" : "Disponible"}
              </Badge>
              <h1 className="text-[22px] font-semibold">{artwork.title}</h1>
              <span className="font-sans text-[12px] font-normal text-[#7C756F]">
                {artwork.medium} - {artwork.width} x {artwork.height} -{" "}
                {artwork.year}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-10 border-b border-[#E2D8CE] pb-5">
            <p className="text-[22px] font-semibold">
              {formatPrice(artwork.priceCents, artwork.currency)}
            </p>
            <p className="font-sans text-[12px] font-normal whitespace-pre-line">
              {artwork.description}
            </p>
          </div>
          <div className="flex flex-col gap-10 border-b border-[#E2D8CE] pb-5">
            <dl className="flex flex-col gap-8 font-sans text-[12px] font-normal">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Dimensiones</dt>
                <dd className="text-[#1A1A1A]">
                  {artwork.width} × {artwork.height} {artwork.dimensionUnit}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Técnica</dt>
                <dd className="text-[#1A1A1A]">{artwork.medium}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Año</dt>
                <dd className="text-[#1A1A1A]">{artwork.year}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Envío</dt>
                <dd className="text-[#1A1A1A]">
                  Incluye envío seguro a todo el mundo
                </dd>
              </div>
            </dl>
          </div>
          {/* <ArtworkOptions /> */}
          <div className="flex flex-col gap-3">
            <BuyNowButton
              artworkId={artwork.id}
              disabled={artwork.sold}
              inCart={isInCart}
            />
            <AddToCartButton
              artworkId={artwork.id}
              disabled={artwork.sold}
              inCart={isInCart}
            />
          </div>
        </div>
      </div>
      <RelatedArtworks artworks={relatedArtworks} />
    </div>
  );
}
