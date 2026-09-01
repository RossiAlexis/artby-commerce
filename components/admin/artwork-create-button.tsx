"use client";

import { useState } from "react";
import { ArtworkFormModal } from "@/components/admin/artwork-form-modal";

export function ArtworkCreateButton({
  variant,
}: {
  variant: "header" | "tile";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "header" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-primary hover:bg-primary-hover rounded-[8px] px-[26px] py-[11px] text-sm font-medium text-white"
        >
          + Agregar obra
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-primary flex h-[310px] flex-col items-center justify-center rounded-lg border-[1.5px] border-dashed border-[#e2d8ce] bg-white hover:bg-[#f5f2ef]"
        >
          <span className="text-3xl leading-none">+</span>
          <span className="mt-2 text-sm text-[#7c756f]">Agregar obra</span>
        </button>
      )}
      <ArtworkFormModal mode="create" open={open} onOpenChange={setOpen} />
    </>
  );
}
