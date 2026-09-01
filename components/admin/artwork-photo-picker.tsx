"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { PhotoTile } from "@/components/admin/artwork-photo-tile";
import { MAX_ARTWORK_PHOTOS as MAX_PHOTOS } from "@/lib/db/artwork-constants";

export type PendingPhoto = { key: string; file: File; url: string };

/**
 * Photo picker for an Artwork that doesn't exist yet — Blob uploads need an
 * artworkId (see `uploadArtworkPhotoAction`), so files are only staged as
 * local object URLs here. The parent uploads them once the Artwork row
 * exists (see `ArtworkFormModal`'s create submit handler).
 */
export function ArtworkPhotoPicker({
  photos,
  onChange,
}: {
  photos: PendingPhoto[];
  onChange: (photos: PendingPhoto[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragKeyRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const atLimit = photos.length >= MAX_PHOTOS;
  const [cover, ...rest] = photos;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const room = MAX_PHOTOS - photos.length;
    const accepted = files.slice(0, room);
    setError(
      files.length > room
        ? `Una obra puede tener hasta ${MAX_PHOTOS} fotos.`
        : null,
    );
    const staged = accepted.map((file) => ({
      key: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
    }));
    onChange([...photos, ...staged]);
  }

  function handleDelete(key: string) {
    const photo = photos.find((p) => p.key === key);
    if (photo) URL.revokeObjectURL(photo.url);
    onChange(photos.filter((p) => p.key !== key));
  }

  function handleDrop(targetKey: string) {
    const draggedKey = dragKeyRef.current;
    dragKeyRef.current = null;
    if (draggedKey === null || draggedKey === targetKey) return;

    const current = [...photos];
    const fromIndex = current.findIndex((photo) => photo.key === draggedKey);
    const toIndex = current.findIndex((photo) => photo.key === targetKey);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    onChange(current);
  }

  return (
    <div>
      <p className="text-[13px] font-medium text-[#1c1917]">
        Imagen de la obra
      </p>
      <p className="mt-1 text-[11px] text-[#7c756f]">
        JPG o PNG. Mínimo 600 × 600 px. La primera foto es la portada — mantené
        presionado para reordenar.
      </p>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {cover ? (
          <PhotoTile
            photo={cover}
            size={144}
            isCover
            onDragStart={() => {
              dragKeyRef.current = cover.key;
            }}
            onDrop={() => handleDrop(cover.key)}
            onDelete={() => handleDelete(cover.key)}
          />
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-primary flex h-36 w-full flex-col items-center justify-center gap-1.5 rounded-[6px] border border-dashed border-[#e2d8ce] bg-white hover:bg-[#f5f2ef]"
          >
            <Upload className="size-5" />
            <span className="text-[13px] font-medium">Subir imagen</span>
            <span className="text-[11px] text-[#7c756f]">
              o arrastrá el archivo acá
            </span>
          </button>
        )}
        {cover && (
          <div className="flex flex-wrap gap-2.5">
            {rest.map((photo) => (
              <PhotoTile
                key={photo.key}
                photo={photo}
                size={70}
                onDragStart={() => {
                  dragKeyRef.current = photo.key;
                }}
                onDrop={() => handleDrop(photo.key)}
                onDelete={() => handleDelete(photo.key)}
              />
            ))}
            {!atLimit && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex size-[70px] shrink-0 items-center justify-center rounded-[6px] bg-[#f5f2ef] text-[#7c756f] hover:bg-[#efe9e2]"
                aria-label="Subir foto"
              >
                <Upload className="size-5" />
              </button>
            )}
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="text-destructive mt-2 text-[11px]">{error}</p>}
    </div>
  );
}
