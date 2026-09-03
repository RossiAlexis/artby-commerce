"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setArtworkFlagsAction } from "@/app/actions/admin-artworks";
import { ArtworkFormModal } from "@/components/admin/artwork-form-modal";
import { DeleteArtworkButton } from "@/components/admin/delete-artwork-button";
import type { AdminArtworkListItem } from "@/lib/db/artworks-admin";
import { cn, formatPrice } from "@/lib/utils";

export function ArtworkCard({ artwork }: { artwork: AdminArtworkListItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const photo = artwork.photos[0];

  function handleToggleSold() {
    startTransition(async () => {
      await setArtworkFlagsAction(artwork.id, { sold: !artwork.sold });
      router.refresh();
    });
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white">
      <div className="relative h-[185px] w-full bg-[#d9d7d5]">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of an already-uploaded Blob URL, not worth next/image's optimization pipeline
          <img src={photo.url} alt="" className="h-full w-full object-cover" />
        )}
        {artwork.sold && (
          <>
            <div className="absolute inset-0 bg-[#D9D9D9B2] backdrop-blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-primary rounded-[4px] px-3 py-1.5 text-[11px] font-medium tracking-wide text-white">
                VENDIDA
              </span>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[15px] font-semibold text-[#1c1917]">
            {artwork.title}
          </p>
          <span
            className={cn(
              "inline-flex h-[22px] shrink-0 items-center rounded-[4px] px-2 text-[11px] font-medium whitespace-nowrap",
              artwork.sold
                ? "bg-[#f0ebe3] text-[#57514b]"
                : "bg-[#e6f0e9] text-[#4d5e51]",
            )}
          >
            {artwork.sold ? "Vendida" : "Disponible"}
          </span>
        </div>
        <p className="text-[13px] text-[#7c756f]">
          {formatPrice(artwork.priceCents, artwork.currency)}
        </p>
        <div className="mt-3 flex items-center gap-1.5 border-t border-[#e2d8ce] pt-3 text-[13px]">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="text-primary hover:underline"
          >
            Editar
          </button>
          <span className="text-[#7c756f]">·</span>
          <button
            type="button"
            onClick={handleToggleSold}
            disabled={isPending}
            className={cn(
              "hover:underline disabled:opacity-50",
              artwork.sold ? "text-[#7c756f]" : "text-primary font-medium",
            )}
          >
            {artwork.sold ? "Marcar como disponible" : "Marcar como vendida"}
          </button>
          <span className="text-[#7c756f]">·</span>
          <DeleteArtworkButton
            artworkId={artwork.id}
            artworkTitle={artwork.title}
            label="Eliminar"
            trigger={
              <button
                type="button"
                className="text-[#7c756f] hover:underline"
              />
            }
          />
        </div>
      </div>
      <ArtworkFormModal
        mode="edit"
        artwork={artwork}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
