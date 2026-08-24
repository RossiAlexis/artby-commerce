"use client";

import { Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  deleteArtworkPhotoAction,
  reorderArtworkPhotosAction,
  uploadArtworkPhotoAction,
} from "@/app/actions/admin-artworks";
import { MAX_ARTWORK_PHOTOS as MAX_PHOTOS } from "@/lib/db/artwork-constants";
import { cn } from "@/lib/utils";

type Photo = { id: number; url: string; position: number };

export function ArtworkPhotoGrid({
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
  const [cover, ...rest] = photos;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setError(null);
    setIsUploading(true);
    startTransition(async () => {
      for (const file of files) {
        if (photos.length >= MAX_PHOTOS) {
          setError(`Una obra puede tener hasta ${MAX_PHOTOS} fotos.`);
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
    <div>
      <p className="text-[13px] font-medium text-[#1c1917]">
        Imagen de la obra
      </p>
      <p className="mt-1 text-[11px] text-[#7c756f]">
        JPG o PNG. Mínimo 600 × 600 px. La primera foto es la portada —
        arrastrá para reordenar.
      </p>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {cover && (
          <PhotoTile
            photo={cover}
            size={144}
            isCover
            onDragStart={() => {
              dragIdRef.current = cover.id;
            }}
            onDrop={() => handleDrop(cover.id)}
            onDelete={() => handleDelete(cover.id)}
          />
        )}
        <div className="flex flex-wrap gap-2.5">
          {rest.map((photo) => (
            <PhotoTile
              key={photo.id}
              photo={photo}
              size={70}
              onDragStart={() => {
                dragIdRef.current = photo.id;
              }}
              onDrop={() => handleDrop(photo.id)}
              onDelete={() => handleDelete(photo.id)}
            />
          ))}
          {!atLimit && (
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex size-[70px] shrink-0 items-center justify-center rounded-[6px] bg-[#f5f2ef] text-[#7c756f] hover:bg-[#efe9e2] disabled:opacity-50"
              aria-label="Subir foto"
            >
              <Upload className="size-5" />
            </button>
          )}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function PhotoTile({
  photo,
  size,
  isCover = false,
  onDragStart,
  onDrop,
  onDelete,
}: {
  photo: Photo;
  size: number;
  isCover?: boolean;
  onDragStart: () => void;
  onDrop: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className="group relative shrink-0 cursor-grab overflow-hidden rounded-[6px] bg-[#f5f2ef]"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview of an already-uploaded Blob URL, not worth next/image's optimization pipeline */}
      <img src={photo.url} alt="" className="size-full object-cover" />
      {isCover && (
        <span className="absolute bottom-2 left-2 rounded-[4px] bg-[#1c1917] px-2 py-[3px] text-[9px] font-medium tracking-[0.5px] text-white">
          PORTADA
        </span>
      )}
      <button
        type="button"
        onClick={onDelete}
        aria-label="Quitar foto"
        className={cn(
          "absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100",
        )}
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
