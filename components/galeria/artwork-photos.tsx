"use client";

import Image from "next/image";
import { useState, ViewTransition } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ArtworkDetail } from "@/lib/db/artworks";

type ArtworkPhoto = NonNullable<ArtworkDetail>["photos"][number];

export function ArtworkPhotos({
  artworkId,
  photos,
  title,
}: {
  artworkId: number;
  photos: ArtworkPhoto[];
  title: string;
}) {
  const [selectedId, setSelectedId] = useState(String(photos[0]?.id));
  const heroPhoto =
    photos.find((photo) => String(photo.id) === selectedId) ?? photos[0];

  return (
    <div>
      <ViewTransition
        name={`artwork-photo-${artworkId}`}
        share="morph"
        enter="none"
      >
        <div className="bg-muted relative aspect-square w-full overflow-hidden">
          {heroPhoto && (
            <Image
              src={heroPhoto.url}
              alt={title}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          )}
        </div>
      </ViewTransition>
      {photos.length > 1 && (
        <ToggleGroup
          value={[selectedId]}
          onValueChange={([value]) => value && setSelectedId(value)}
          className="mt-4 grid w-full grid-cols-4 gap-4"
        >
          {photos.map((photo) => (
            <ToggleGroupItem
              key={photo.id}
              value={String(photo.id)}
              aria-label={`${title} — foto ${photo.position + 1}`}
              className="bg-muted ring-foreground/10 data-pressed:ring-foreground relative aspect-square h-auto w-full min-w-0 overflow-hidden rounded-none p-0 ring-1"
            >
              <Image
                src={photo.url}
                alt=""
                fill
                className="object-cover"
                sizes="25vw"
              />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
    </div>
  );
}
