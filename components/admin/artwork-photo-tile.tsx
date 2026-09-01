"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PhotoTile({
  photo,
  size,
  isCover = false,
  onDragStart,
  onDrop,
  onDelete,
}: {
  photo: { url: string };
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
      {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of a Blob URL or local object URL, not worth next/image's optimization pipeline */}
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
