"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getArtworks, type ArtworkListItem } from "@/lib/db/artworks";
import { formatPrice } from "@/lib/utils";

const FILTERS = [
  { value: "all", label: "Todas" },
  { value: "available", label: "Disponibles" },
  { value: "sold", label: "Vendidas" },
] as const;

export function Gallery({
  filter,
  initialArtworks,
  initialHasMore,
}: {
  filter: string;
  initialArtworks: ArtworkListItem[];
  initialHasMore: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [artworks, setArtworks] = useState(initialArtworks);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  function handleFilterChange(nextFilter: string) {
    const params = new URLSearchParams();
    params.set("status", nextFilter);
    router.push(`${pathname}?${params}`);
  }

  function handleLoadMore() {
    startTransition(async () => {
      const nextPage = page + 1;
      const result = await getArtworks(filter, { page: nextPage });
      setArtworks((current) => [...current, ...result.artworks]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    });
  }

  return (
    <div>
      <Tabs
        value={filter}
        onValueChange={handleFilterChange}
        className="border-border border-b"
      >
        <TabsList>
          {FILTERS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
        {artworks.map((artwork) => {
          const heroPhoto = artwork.photos[0];
          return (
            <article key={artwork.id} className="bg-card">
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
            </article>
          );
        })}
      </div>
      {hasMore && (
        <div className="flex justify-center py-8">
          <Button onClick={handleLoadMore} disabled={isPending}>
            Cargar más
          </Button>
        </div>
      )}
    </div>
  );
}
