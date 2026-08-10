"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ArtworkPhoto = {
  id: number;
  url: string;
  position: number;
};

export function ArtworkPhotos({
  photos,
  title,
}: {
  photos: ArtworkPhoto[];
  title: string;
}) {
  const [selectedId, setSelectedId] = useState(photos[0]?.id);
  const heroPhoto =
    photos.find((photo) => photo.id === selectedId) ?? photos[0];

  return (
    <div>
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
      {photos.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedId(photo.id)}
              aria-current={photo.id === heroPhoto?.id}
              className={cn(
                "bg-muted relative aspect-square overflow-hidden ring-1",
                photo.id === heroPhoto?.id
                  ? "ring-foreground"
                  : "ring-foreground/10",
              )}
            >
              <Image
                src={photo.url}
                alt={`${title} — foto ${photo.position + 1}`}
                fill
                className="object-cover"
                sizes="25vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
