"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createArtworkAction,
  updateArtworkAction,
  type ArtworkFormInput,
} from "@/app/actions/admin-artworks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AdminArtworkDetail } from "@/lib/db/artworks-admin";

export function ArtworkForm({
  artwork,
}: {
  artwork?: NonNullable<AdminArtworkDetail>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [dimensionUnit, setDimensionUnit] = useState<"cm" | "in">(
    artwork?.dimensionUnit === "in" ? "in" : "cm",
  );

  function handleSubmit(formData: FormData) {
    setError(null);
    const weight = String(formData.get("weightKg") ?? "").trim();
    const input: ArtworkFormInput = {
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
      const result = artwork
        ? await updateArtworkAction(artwork.id, input)
        : await createArtworkAction(input);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(artwork ? "/admin/artworks" : `/admin/artworks/${result.id}`);
    });
  }

  return (
    <form action={handleSubmit} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={artwork?.title} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={artwork?.description}
          required
        />
      </div>
      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="width">Width</Label>
          <Input
            id="width"
            name="width"
            type="number"
            step="0.1"
            min="0"
            defaultValue={artwork?.width}
            required
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="height">Height</Label>
          <Input
            id="height"
            name="height"
            type="number"
            step="0.1"
            min="0"
            defaultValue={artwork?.height}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dimensionUnit">Unit</Label>
          <Select
            value={dimensionUnit}
            onValueChange={(value) =>
              value && setDimensionUnit(value === "in" ? "in" : "cm")
            }
          >
            <SelectTrigger id="dimensionUnit" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cm">cm</SelectItem>
              <SelectItem value="in">in</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="weightKg">Weight (kg)</Label>
        <Input
          id="weightKg"
          name="weightKg"
          type="number"
          step="0.1"
          min="0"
          defaultValue={artwork?.weightKg ?? undefined}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="medium">Medium</Label>
        <Input
          id="medium"
          name="medium"
          placeholder="Acrylic on canvas"
          defaultValue={artwork?.medium}
          required
        />
      </div>
      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            name="year"
            type="number"
            defaultValue={artwork?.year}
            required
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={
              artwork ? (artwork.priceCents / 100).toFixed(2) : undefined
            }
            required
          />
        </div>
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {artwork ? "Save changes" : "Create artwork"}
      </Button>
    </form>
  );
}
