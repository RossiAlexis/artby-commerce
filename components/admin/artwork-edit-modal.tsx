"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  setArtworkFlagsAction,
  updateArtworkAction,
} from "@/app/actions/admin-artworks";
import { ArtworkPhotoGrid } from "@/components/admin/artwork-photo-grid";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AdminArtworkListItem } from "@/lib/db/artworks-admin";

const fieldClass =
  "h-10 rounded-[4px] border border-[#e2d8ce] px-3 text-[14px] text-[#1c1917] outline-none focus:border-primary";

export function ArtworkEditModal({
  artwork,
  open,
  onOpenChange,
}: {
  artwork: AdminArtworkListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [dimensionUnit, setDimensionUnit] = useState<"cm" | "in">(
    artwork.dimensionUnit === "in" ? "in" : "cm",
  );
  const [sold, setSold] = useState(artwork.sold);

  function handleSubmit(formData: FormData) {
    setError(null);
    const weight = String(formData.get("weightKg") ?? "").trim();
    const input = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      width: Number(formData.get("width")),
      height: Number(formData.get("height")),
      dimensionUnit,
      weightKg: weight === "" ? null : Number(weight),
      medium: String(formData.get("medium") ?? ""),
      year: Number(formData.get("year")),
      priceCents: Math.round(Number(formData.get("price")) * 100),
    };

    startTransition(async () => {
      const result = await updateArtworkAction(artwork.id, input);
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (sold !== artwork.sold) {
        await setArtworkFlagsAction(artwork.id, { sold });
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[85vh] w-full max-w-[680px] flex-col gap-0 overflow-hidden rounded-[8px] p-0 sm:max-w-[680px]"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#e2d8ce] px-8">
          <h2 className="text-[18px] font-semibold text-[#1c1917]">
            Editar obra
          </h2>
          <DialogClose
            render={
              <button
                type="button"
                className="text-[20px] leading-none text-[#7c756f] hover:text-[#1c1917]"
                aria-label="Cerrar"
              />
            }
          >
            ×
          </DialogClose>
        </div>

        <form
          action={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <ArtworkPhotoGrid
              artworkId={artwork.id}
              photos={artwork.photos}
            />

            <div className="mt-6 flex flex-col gap-1.5">
              <label
                htmlFor="edit-title"
                className="text-[13px] font-medium text-[#1c1917]"
              >
                Título
              </label>
              <input
                id="edit-title"
                name="title"
                defaultValue={artwork.title}
                required
                className={`${fieldClass} w-full max-w-[428px]`}
              />
            </div>

            <div className="mt-6 flex gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="edit-medium"
                  className="text-[13px] font-medium text-[#1c1917]"
                >
                  Técnica
                </label>
                <input
                  id="edit-medium"
                  name="medium"
                  defaultValue={artwork.medium}
                  required
                  className={`${fieldClass} w-[262px]`}
                />
                <p className="text-[11px] text-[#7c756f]">
                  Ej: Acrílico sobre tela, Carbón sobre papel
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="edit-year"
                  className="text-[13px] font-medium text-[#1c1917]"
                >
                  Año
                </label>
                <input
                  id="edit-year"
                  name="year"
                  type="number"
                  defaultValue={artwork.year}
                  required
                  className={`${fieldClass} w-[150px]`}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-1.5">
              <p className="text-[13px] font-medium text-[#1c1917]">
                Dimensiones
              </p>
              <p className="text-[11px] text-[#7c756f]">
                Ancho × alto, en centímetros
              </p>
              <div className="flex items-center gap-3">
                <DimensionField
                  name="width"
                  defaultValue={artwork.width}
                  unitLabel="ancho"
                />
                <span className="text-[16px] text-[#7c756f]">×</span>
                <DimensionField
                  name="height"
                  defaultValue={artwork.height}
                  unitLabel="alto"
                />
                <Select
                  value={dimensionUnit}
                  onValueChange={(value) =>
                    value && setDimensionUnit(value === "in" ? "in" : "cm")
                  }
                >
                  <SelectTrigger className="w-[75px] rounded-[4px] border-[#e2d8ce] bg-white px-3 text-[14px] font-medium text-[#1c1917] data-[size=default]:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="in">in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-1.5">
              <label
                htmlFor="edit-weight"
                className="text-[13px] font-medium text-[#1c1917]"
              >
                Peso
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="edit-weight"
                  name="weightKg"
                  type="number"
                  step="0.1"
                  min="0"
                  defaultValue={artwork.weightKg ?? undefined}
                  className={`${fieldClass} w-[160px]`}
                />
                <span className="flex h-10 w-[52px] items-center justify-center rounded-[4px] border border-[#e2d8ce] bg-[#f5f2ef] text-[13px] text-[#7c756f]">
                  kg
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-1.5">
              <label
                htmlFor="edit-price"
                className="text-[13px] font-medium text-[#1c1917]"
              >
                Precio
              </label>
              <div className="flex h-10 w-[154px] items-center gap-1.5 rounded-[4px] border border-[#e2d8ce] px-3">
                <span className="text-[13px] text-[#7c756f]">
                  {artwork.currency}
                </span>
                <input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={(artwork.priceCents / 100).toFixed(2)}
                  required
                  className="w-full text-[14px] text-[#1c1917] outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-1.5">
              <label
                htmlFor="edit-description"
                className="text-[13px] font-medium text-[#1c1917]"
              >
                Descripción
              </label>
              <p className="text-[11px] text-[#7c756f]">
                La historia de la obra. Se muestra en la ficha pública.
              </p>
              <Textarea
                id="edit-description"
                name="description"
                defaultValue={artwork.description}
                required
                className="min-h-16 w-full max-w-[616px] rounded-[6px] border-[#e0ddd6] text-[13px] text-[#1c1917]"
              />
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#e2d8ce] pt-6">
              <label
                htmlFor="edit-sold"
                className="text-[13px] font-medium text-[#1c1917]"
              >
                Marcar como vendida
              </label>
              <Switch id="edit-sold" checked={sold} onCheckedChange={setSold} />
            </div>
            <p className="mt-2 text-[11px] text-[#7c756f]">
              Usá esto si la obra se vendió fuera del sitio. Las compras
              online se actualizan automáticamente.
            </p>

            {error && (
              <p className="mt-4 text-[13px] text-destructive">{error}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-end gap-6 border-t border-[#e2d8ce] px-8 py-6">
            <DialogClose
              render={
                <button
                  type="button"
                  className="text-[14px] text-[#7c756f] hover:text-[#1c1917]"
                />
              }
            >
              Cancelar
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending}
              className="h-[42px] rounded-[4px] bg-primary px-6 text-[14px] font-medium text-white hover:bg-primary-hover"
            >
              Guardar cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DimensionField({
  name,
  defaultValue,
  unitLabel,
}: {
  name: string;
  defaultValue: number;
  unitLabel: string;
}) {
  return (
    <div className="flex h-10 w-[154px] items-center justify-between rounded-[4px] border border-[#e2d8ce] px-3">
      <input
        name={name}
        type="number"
        step="0.1"
        min="0"
        defaultValue={defaultValue}
        required
        className="w-16 text-[14px] text-[#1c1917] outline-none"
      />
      <span className="text-[12px] text-[#7c756f]">{unitLabel}</span>
    </div>
  );
}
