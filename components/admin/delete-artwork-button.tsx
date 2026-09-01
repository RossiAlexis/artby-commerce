"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteArtworkAction,
  setArtworkFlagsAction,
} from "@/app/actions/admin-artworks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function DeleteArtworkButton({
  artworkId,
  artworkTitle,
  trigger,
  label = "Eliminar",
}: {
  artworkId: number;
  artworkTitle: string;
  trigger?: React.ReactElement;
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedByOrder, setBlockedByOrder] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteArtworkAction(artworkId);
      if (!result.success) {
        setError(result.error);
        setBlockedByOrder(result.blockedByOrder);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  function handleHideInstead() {
    startTransition(async () => {
      await setArtworkFlagsAction(artworkId, { visible: false });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setError(null);
          setBlockedByOrder(false);
        }
      }}
    >
      <DialogTrigger render={trigger ?? <Button variant="destructive" size="sm" />}>
        {label}
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex w-full max-w-[440px] flex-col items-start gap-3 rounded-[10px] bg-white px-8 pt-7 pb-6 sm:max-w-[440px]"
      >
        <p className="text-[18px] font-semibold text-[#1c1917]">
          ¿Eliminar &ldquo;{artworkTitle}&rdquo;?
        </p>
        <div className="flex flex-col gap-3 text-[13px] text-[#4a4845]">
          <p>
            Esta acción no se puede deshacer. La obra y sus fotos se quitan
            del sitio y del panel.
          </p>
          {blockedByOrder ? (
            <p>
              Esta obra está referenciada por un pedido y no puede
              eliminarse — podés ocultarla en su lugar.
            </p>
          ) : (
            <p>
              Si la obra se vendió, usá &ldquo;Marcar como vendida&rdquo; —
              queda visible como parte de tu trayectoria.
            </p>
          )}
        </div>
        {error && <p className="text-[13px] text-destructive">{error}</p>}
        <div className="flex w-full items-center justify-end gap-3">
          <DialogClose
            render={
              <button
                type="button"
                className="rounded-[6px] border border-[#e0ddd6] px-[18px] py-2.5 text-[14px] font-medium text-[#1c1917] hover:bg-[#f5f2ef]"
              />
            }
          >
            Cancelar
          </DialogClose>
          {blockedByOrder ? (
            <button
              type="button"
              onClick={handleHideInstead}
              disabled={isPending}
              className="rounded-[8px] bg-primary px-[18px] py-2.5 text-[14px] font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              Ocultar en su lugar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-[8px] bg-primary px-[18px] py-2.5 text-[14px] font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              Sí, eliminar
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
