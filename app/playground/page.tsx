import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { getFeaturedArtworks } from "@/lib/db/artworks";

function formatPrice(priceCents: number, currency: string) {
  return `${currency} ${Math.round(priceCents / 100).toLocaleString("en-US")}`;
}

export default async function PlaygroundPage() {
  const artworks = await getFeaturedArtworks(1);

  return (
    <main className="space-y-16 px-6 py-10 md:px-10">
      <div>
        <h1 className="font-serif text-2xl">Shadcn playground</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Side-by-side comparison of the artwork card as it exists today
          (hand-styled) versus the same data rendered with shadcn&apos;s{" "}
          <code>Card</code> component, so we can decide which look to keep
          going forward.
        </p>
      </div>

      <div className="flex gap-14">
        <h2 className="w-[282px] text-sm tracking-wide uppercase">
          Current style (hand-styled article)
        </h2>
        <h2 className="w-[282px] text-sm tracking-wide uppercase">
          Shadcn <code>Card</code>
        </h2>
      </div>

      {artworks.map((artwork) => {
        const heroPhoto = artwork.photos[0];
        return (
          <div key={artwork.id} className="flex gap-14">
            <article className="bg-card max-h-[356px] w-[282px]">
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
              <div className="space-y-1 py-3">
                <p className="text-sm">{artwork.title}</p>
                <p className="text-muted-foreground text-sm">
                  {formatPrice(artwork.priceCents, artwork.currency)}
                </p>
              </div>
            </article>

            <Card className="max-h-[356px] w-[282px]">
              {heroPhoto && (
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={heroPhoto.url}
                    alt={artwork.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 25vw, 50vw"
                  />
                </div>
              )}
              <CardContent className="space-y-1">
                <CardTitle>{artwork.title}</CardTitle>
                <CardDescription>
                  {formatPrice(artwork.priceCents, artwork.currency)}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </main>
  );
}
