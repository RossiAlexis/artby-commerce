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
import { cn, formatDimensions, formatPriceParts } from "@/lib/utils";

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
  const price = formatPriceParts(artwork.priceCents, artwork.currency);
  const hasRelatedArtworks = relatedArtworks.length > 0;
  const galleryHref = artwork.sold
    ? "/galeria?status=sold"
    : "/galeria?status=available";
  const galleryLabel = artwork.sold
    ? "Galería - Vendidas"
    : "Galería - Disponibles";

  return (
    <div className={cn("px-5 pt-12", !hasRelatedArtworks && "pb-12")}>
      <Link
        href={galleryHref}
        className="mb-8 inline-flex w-fit items-center gap-4 font-serif text-[1.5rem] leading-tight font-medium md:text-[2rem] md:leading-[3.125rem]"
      >
        <ArrowBack />
        {galleryLabel}
      </Link>
      <div className="grid gap-10 md:grid-cols-2">
        <ArtworkPhotos
          photos={artwork.photos}
          title={artwork.title}
          sold={artwork.sold}
        />
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 border-b border-[#E2D8CE] pb-5">
            <Badge
              variant={artwork.sold ? "default" : "outline"}
              className={cn(
                "h-[1.75rem] w-[6.25rem] rounded-full border-transparent text-[0.6875rem] leading-4 font-medium tracking-wide uppercase",
                artwork.sold
                  ? "bg-primary text-primary-foreground"
                  : "bg-[#E6F0E9] text-[#4D5E51]",
              )}
            >
              {artwork.sold ? "Vendida" : "Disponible"}
            </Badge>
            <h1 className="font-serif text-[2.25rem] leading-[3rem] font-medium md:text-[2.5rem] md:leading-[3.5rem]">
              {artwork.title}
            </h1>
            <p className="font-serif text-[1.125rem] leading-[1.875rem] text-[#7C756F] italic">
              {artwork.medium} · {artwork.width} × {artwork.height}{" "}
              {artwork.dimensionUnit} · {artwork.year}
            </p>
          </div>
          <div className="flex flex-col gap-6 border-b border-[#E2D8CE] pb-5">
            <p
              aria-label={
                price.amount ? `${price.code} ${price.amount}` : price.code
              }
              className={cn(
                "flex w-fit items-baseline gap-[0.25em] font-serif text-[2.5rem] leading-[3.5rem] font-medium lining-nums md:text-[2.75rem] md:leading-[4rem]",
                artwork.sold ? "text-[#7C756F]" : "text-[#1C1917]",
              )}
            >
              <span>{price.code}</span>
              {price.amount ? <span>{price.amount}</span> : null}
            </p>
            <p className="font-sans text-base leading-relaxed whitespace-pre-line text-[#1C1917]">
              {artwork.description}
            </p>
          </div>
          <dl className="flex flex-col gap-5 border-b border-[#E2D8CE] pb-5 font-sans text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#7C756F]">Técnica</dt>
              <dd className="text-[#1C1917]">{artwork.medium}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#7C756F]">Dimensiones</dt>
              <dd className="text-[#1C1917]">
                {formatDimensions(
                  artwork.width,
                  artwork.height,
                  artwork.dimensionUnit,
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#7C756F]">Año</dt>
              <dd className="text-[#1C1917]">{artwork.year}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#7C756F]">Envío</dt>
              <dd className="text-[#1C1917]">
                Incluye envío seguro a todo el mundo
              </dd>
            </div>
          </dl>
          {artwork.sold ? (
            <div className="flex flex-col gap-4">
              <p className="font-serif text-[1.125rem] text-[#7C756F] italic">
                Esta obra ya encontró su hogar.
              </p>
              <Link
                href="/galeria?status=available"
                className="border-primary text-primary hover:bg-primary/5 inline-flex h-14 w-full items-center justify-center rounded-lg border text-base font-medium"
              >
                Ver otras obras disponibles
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <ArtworkOptions />
              <div className="flex flex-col gap-5">
                <BuyNowButton artworkId={artwork.id} inCart={isInCart} />
                <AddToCartButton artworkId={artwork.id} inCart={isInCart} />
              </div>
              <p className="text-center text-xs text-[#7C756F]">
                Pago seguro vía Stripe
              </p>
            </div>
          )}
        </div>
      </div>
      <RelatedArtworks artworks={relatedArtworks} />
    </div>
  );
}
