"use client";

import { GripVertical, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  deleteArtworkPhotoAction,
  reorderArtworkPhotosAction,
  uploadArtworkPhotoAction,
} from "@/app/actions/admin-artworks";
import { Button } from "@/components/ui/button";
import { MAX_ARTWORK_PHOTOS as MAX_PHOTOS } from "@/lib/db/artwork-constants";

type Photo = { id: number; url: string; position: number };

export function ArtworkPhotos({
  artworkId,
  photos: initialPhotos,
}: {
  artworkId: number;
  photos: Photo[];
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragIdRef = useRef<number | null>(null);

  const atLimit = photos.length >= MAX_PHOTOS;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setError(null);
    setIsUploading(true);
    startTransition(async () => {
      for (const file of files) {
        if (photos.length >= MAX_PHOTOS) {
          setError(`An Artwork can have at most ${MAX_PHOTOS} photos.`);
          break;
        }
        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadArtworkPhotoAction(artworkId, formData);
        if (!result.success) {
          setError(result.error);
          break;
        }
        setPhotos((current) => [...current, result.photo]);
      }
      setIsUploading(false);
      router.refresh();
    });
  }

  function handleDelete(photoId: number) {
    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
    startTransition(async () => {
      await deleteArtworkPhotoAction(artworkId, photoId);
      router.refresh();
    });
  }

  function persistOrder(ordered: Photo[]) {
    startTransition(async () => {
      await reorderArtworkPhotosAction(
        artworkId,
        ordered.map((photo) => photo.id),
      );
      router.refresh();
    });
  }

  function handleDrop(targetId: number) {
    const draggedId = dragIdRef.current;
    dragIdRef.current = null;
    if (draggedId === null || draggedId === targetId) return;

    const current = [...photos];
    const fromIndex = current.findIndex((photo) => photo.id === draggedId);
    const toIndex = current.findIndex((photo) => photo.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    setPhotos(current);
    persistOrder(current);
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">
          Photos ({photos.length}/{MAX_PHOTOS})
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={atLimit || isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? "Uploading…" : "Upload photo"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {error && <p className="text-destructive mt-2 text-xs">{error}</p>}
      {photos.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {photos.map((photo) => (
            <li
              key={photo.id}
              draggable
              onDragStart={() => {
                dragIdRef.current = photo.id;
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(photo.id)}
              className="border-border bg-background flex items-center gap-3 border p-2"
            >
              <GripVertical
                className="text-muted-foreground size-4 shrink-0 cursor-grab"
                aria-hidden
              />
              {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview of an already-uploaded Blob URL, not worth next/image's optimization pipeline */}
              <img
                src={photo.url}
                alt=""
                className="size-12 shrink-0 object-cover"
              />
              <span className="text-muted-foreground truncate text-xs">
                {photo.url}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="ml-auto"
                onClick={() => handleDelete(photo.id)}
                aria-label="Remove photo"
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-3 text-xs">No photos yet.</p>
      )}
    </div>
  );
}
