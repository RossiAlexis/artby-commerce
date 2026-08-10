"use client";

import { useState, useTransition } from "react";
import { addToCartAction } from "@/app/actions/cart";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  artworkId,
  disabled = false,
}: {
  artworkId: number;
  disabled?: boolean;
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

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={disabled || isPending}>
        {isPending ? "Añadiendo…" : "Añadir al carrito"}
      </Button>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
