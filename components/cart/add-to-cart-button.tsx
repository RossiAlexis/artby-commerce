"use client";

import { Check } from "lucide-react";
import { useState, useTransition } from "react";
import { addToCartAction } from "@/app/actions/cart";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  artworkId,
  disabled = false,
  inCart = false,
}: {
  artworkId: number;
  disabled?: boolean;
  inCart?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await addToCartAction(artworkId);
      if (!result.success) setError(result.error);
    });
  }

  if (inCart) {
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <Check className="size-4" aria-hidden />
        Ya está en tu carrito
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={disabled || isPending}>
        {isPending ? "Añadiendo…" : "Añadir al carrito"}
      </Button>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
