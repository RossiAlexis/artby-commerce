"use client";

import { ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { removeFromCartAction } from "@/app/actions/cart";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Cart } from "@/lib/db/cart";
import { formatPrice } from "@/lib/utils";

export function CartDrawer({ cart }: { cart: Cart }) {
  const [isPending, startTransition] = useTransition();
  const [pendingArtworkId, setPendingArtworkId] = useState<number | null>(null);

  function handleRemove(artworkId: number) {
    setPendingArtworkId(artworkId);
    startTransition(async () => {
      await removeFromCartAction(artworkId);
      setPendingArtworkId(null);
    });
  }

  return (
    <Sheet>
      <SheetTrigger
        className="flex items-center gap-1"
        aria-label={`Carrito${cart.items.length > 0 ? ` (${cart.items.length})` : ""}`}
      >
        <ShoppingBag className="size-4" aria-hidden />
        {cart.items.length > 0 && <span>{cart.items.length}</span>}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Carrito</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          {cart.items.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Tu carrito está vacío.
            </p>
          )}
          {cart.items.map((item) => {
            const heroPhoto = item.artwork.photos[0];
            const isRemoving =
              isPending && pendingArtworkId === item.artwork.id;
            return (
              <div key={item.id} className="flex gap-3">
                <div className="bg-muted relative aspect-square size-20 shrink-0 overflow-hidden">
                  {heroPhoto && (
                    <Image
                      src={heroPhoto.url}
                      alt={item.artwork.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{item.artwork.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {item.artwork.medium} · {item.artwork.dimensions}
                  </p>
                  <p className="text-sm">
                    {formatPrice(
                      item.artwork.priceCents,
                      item.artwork.currency,
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Quitar ${item.artwork.title} del carrito`}
                  disabled={isRemoving}
                  onClick={() => handleRemove(item.artwork.id)}
                >
                  <X className="size-4" aria-hidden />
                </Button>
              </div>
            );
          })}
        </div>
        {cart.items.length > 0 && (
          <SheetFooter>
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Total</span>
              <span>{formatPrice(cart.totalCents, "USD")}</span>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
