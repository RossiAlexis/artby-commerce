"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createArtworkAction,
  setArtworkFlagsAction,
  updateArtworkAction,
  uploadArtworkPhotoAction,
} from "@/app/actions/admin-artworks";
import {
  ArtworkPhotoPicker,
  type PendingPhoto,
} from "@/components/admin/artwork-photo-picker";
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

type Props =
  | {
      mode: "edit";
      artwork: AdminArtworkListItem;
      open: boolean;
      onOpenChange: (open: boolean) => void;
    }
  | {
      mode: "create";
      artwork?: undefined;
      open: boolean;
      onOpenChange: (open: boolean) => void;
    };

export function ArtworkFormModal({ mode, artwork, open, onOpenChange }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [dimensionUnit, setDimensionUnit] = useState<"cm" | "in">(
    artwork?.dimensionUnit === "in" ? "in" : "cm",
  );
  const [sold, setSold] = useState(artwork?.sold ?? false);
  const [visible, setVisible] = useState(artwork?.visible ?? true);
  const [featured, setFeatured] = useState(artwork?.featured ?? false);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);

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
      if (mode === "edit") {
        const result = await updateArtworkAction(artwork.id, input);
        if (!result.success) {
          setError(result.error);
          return;
        }
        if (
          sold !== artwork.sold ||
          visible !== artwork.visible ||
          featured !== artwork.featured
        ) {
          await setArtworkFlagsAction(artwork.id, { sold, visible, featured });
        }
        onOpenChange(false);
        router.refresh();
        return;
      }

      const result = await createArtworkAction(input);
      if (!result.success) {
        setError(result.error);
        return;
      }

      if (sold || !visible || featured) {
        await setArtworkFlagsAction(result.id, { sold, visible, featured });
      }

      let photoError: string | null = null;
      for (const photo of pendingPhotos) {
        const photoFormData = new FormData();
        photoFormData.set("file", photo.file);
        const uploadResult = await uploadArtworkPhotoAction(
          result.id,
          photoFormData,
        );
        if (!uploadResult.success) {
          photoError = `La obra se creó, pero una foto no se pudo subir: ${uploadResult.error}`;
          break;
        }
      }

      pendingPhotos.forEach((photo) => URL.revokeObjectURL(photo.url));
      router.refresh();

      // The Artwork is already saved either way — but if a photo failed to
      // upload, keep the modal open so the error above is actually seen
      // instead of closing over it.
      if (photoError) {
        setError(photoError);
        return;
      }
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="fixed inset-0 z-50 flex h-full max-h-full w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none p-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-[680px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[8px]"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#e2d8ce] px-8">
          <h2 className="text-[18px] font-semibold text-[#1c1917]">
            {mode === "create" ? "Agregar nueva obra" : "Editar obra"}
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
            {mode === "edit" ? (
              <ArtworkPhotoGrid
                artworkId={artwork.id}
                photos={artwork.photos}
              />
            ) : (
              <ArtworkPhotoPicker
                photos={pendingPhotos}
                onChange={setPendingPhotos}
              />
            )}

            <div className="mt-6 flex flex-col gap-1.5">
              <label
                htmlFor="form-title"
                className="text-[13px] font-medium text-[#1c1917]"
              >
                Título
              </label>
              <input
                id="form-title"
                name="title"
                defaultValue={artwork?.title}
                placeholder={
                  mode === "create" ? "Ej: Atardecer en High Park" : undefined
                }
                required
                className={`${fieldClass} w-full max-w-[428px]`}
              />
            </div>

            <div className="mt-6 flex gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="form-medium"
                  className="text-[13px] font-medium text-[#1c1917]"
                >
                  Técnica
                </label>
                <input
                  id="form-medium"
                  name="medium"
                  defaultValue={artwork?.medium}
                  placeholder={
                    mode === "create" ? "Ej: Acrílico sobre tela" : undefined
                  }
                  required
                  className={`${fieldClass} w-[262px]`}
                />
                <p className="text-[11px] text-[#7c756f]">
                  Ej: Acrílico sobre tela, Carbón sobre papel
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="form-year"
                  className="text-[13px] font-medium text-[#1c1917]"
                >
                  Año
                </label>
                <input
                  id="form-year"
                  name="year"
                  type="number"
                  defaultValue={artwork?.year}
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
                  defaultValue={artwork?.width}
                  unitLabel="ancho"
                />
                <span className="text-[16px] text-[#7c756f]">×</span>
                <DimensionField
                  name="height"
                  defaultValue={artwork?.height}
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
                htmlFor="form-weight"
                className="text-[13px] font-medium text-[#1c1917]"
              >
                Peso
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="form-weight"
                  name="weightKg"
                  type="number"
                  step="0.1"
                  min="0"
                  defaultValue={artwork?.weightKg ?? undefined}
                  className={`${fieldClass} w-[160px]`}
                />
                <span className="flex h-10 w-[52px] items-center justify-center rounded-[4px] border border-[#e2d8ce] bg-[#f5f2ef] text-[13px] text-[#7c756f]">
                  kg
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-1.5">
              <label
                htmlFor="form-price"
                className="text-[13px] font-medium text-[#1c1917]"
              >
                Precio
              </label>
              <div className="flex h-10 w-[154px] items-center gap-1.5 rounded-[4px] border border-[#e2d8ce] px-3">
                <span className="text-[13px] text-[#7c756f]">
                  {artwork?.currency ?? "USD"}
                </span>
                <input
                  id="form-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={
                    artwork ? (artwork.priceCents / 100).toFixed(2) : undefined
                  }
                  placeholder={mode === "create" ? "0.00" : undefined}
                  required
                  className="w-full text-[14px] text-[#1c1917] outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-1.5">
              <label
                htmlFor="form-description"
                className="text-[13px] font-medium text-[#1c1917]"
              >
                Descripción
              </label>
              <p className="text-[11px] text-[#7c756f]">
                La historia de la obra. Se muestra en la ficha pública.
              </p>
              <Textarea
                id="form-description"
                name="description"
                defaultValue={artwork?.description}
                placeholder={
                  mode === "create"
                    ? "Contá la historia detrás de la obra: qué la inspiró, dónde nació, qué la hace única."
                    : undefined
                }
                required
                className="min-h-16 w-full max-w-[616px] rounded-[6px] border-[#e0ddd6] text-[13px] text-[#1c1917]"
              />
            </div>

            <div className="mt-6 flex flex-col gap-5 border-t border-[#e2d8ce] pt-6">
              <ToggleRow
                id="form-sold"
                label="Marcar como vendida"
                hint="Usá esto si la obra se vendió fuera del sitio. Las compras online se actualizan automáticamente."
                checked={sold}
                onCheckedChange={setSold}
              />
              <ToggleRow
                id="form-visible"
                label="Visible en el sitio"
                hint="Ocultala del sitio público sin eliminarla."
                checked={visible}
                onCheckedChange={setVisible}
              />
              <ToggleRow
                id="form-featured"
                label="Destacada"
                hint="Aparece entre las últimas 4 obras destacadas de la portada."
                checked={featured}
                onCheckedChange={setFeatured}
              />
            </div>

            {error && (
              <p className="text-destructive mt-4 text-[13px]">{error}</p>
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
              className="bg-primary hover:bg-primary-hover h-[42px] rounded-[8px] px-6 text-[14px] font-medium text-white"
            >
              {mode === "create" ? "Guardar obra" : "Guardar cambios"}
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
  defaultValue?: number;
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

function ToggleRow({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="text-[13px] font-medium text-[#1c1917]">
          {label}
        </label>
        <p className="text-[11px] text-[#7c756f]">{hint}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
