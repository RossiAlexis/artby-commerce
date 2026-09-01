"use client";

import { useState, useTransition } from "react";
import { addToCartAction } from "@/app/actions/cart";
import { useCartDrawer } from "@/components/cart/cart-drawer-context";
import { Button } from "@/components/ui/button";

export function BuyNowButton({
  artworkId,
  disabled = false,
  inCart = false,
}: {
  artworkId: number;
  disabled?: boolean;
  inCart?: boolean;
}) {
  const { openCheckout } = useCartDrawer();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      setError(null);
      if (!inCart) {
        const result = await addToCartAction(artworkId);
        if (!result.success) {
          setError(result.error);
          return;
        }
      }
      openCheckout();
    });
  }

  return (
    <div className="w-full space-y-2">
      <Button
        onClick={handleClick}
        disabled={disabled || isPending}
        className="h-[42px] w-full"
      >
        {isPending ? "Procesando…" : "Comprar"}
      </Button>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
