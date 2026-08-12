"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { checkoutAction } from "@/app/actions/checkout";
import { removeFromCartAction } from "@/app/actions/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type View = "cart" | "checkout" | "success";

export function CartDrawer({ cart }: { cart: Cart }) {
  const [isPending, startTransition] = useTransition();
  const [pendingArtworkId, setPendingArtworkId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("cart");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCheckingOut, startCheckout] = useTransition();

  function handleRemove(artworkId: number) {
    setPendingArtworkId(artworkId);
    startTransition(async () => {
      await removeFromCartAction(artworkId);
      setPendingArtworkId(null);
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setView("cart");
      setCheckoutError(null);
    }
  }

  function handleCheckoutSubmit(formData: FormData) {
    setCheckoutError(null);
    startCheckout(async () => {
      const result = await checkoutAction({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
      });
      if (result.success) {
        setView("success");
      } else {
        setCheckoutError(result.error);
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        className="flex items-center gap-1"
        aria-label={`Carrito${cart.items.length > 0 ? ` (${cart.items.length})` : ""}`}
      >
        <Image
          src="/icons/cart-outline.svg"
          alt=""
          width={26}
          height={26}
          aria-hidden
        />
        <span className={cart.items.length === 0 ? "invisible" : undefined}>
          {cart.items.length}
        </span>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {view === "checkout" ? "Finalizar compra" : "Carrito"}
          </SheetTitle>
        </SheetHeader>

        {view === "success" && (
          <div className="flex-1 space-y-2 px-4">
            <p className="text-sm font-medium">¡Gracias por tu compra!</p>
            <p className="text-muted-foreground text-sm">
              Te enviamos un correo de confirmación con el resumen de tu Orden.
            </p>
          </div>
        )}

        {view === "cart" && (
          <div className="flex-1 space-y-4 overflow-y-auto px-4">
            {cart.items.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Tu carrito está vacío.
              </p>
            )}
            {cart.items.length > 0 &&
              cart.items.map((item) => {
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
                      <p className="text-sm font-medium">
                        {item.artwork.title}
                      </p>
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
        )}

        {view === "checkout" && (
          <form
            action={handleCheckoutSubmit}
            className="flex-1 space-y-4 overflow-y-auto px-4"
          >
            <div className="space-y-1">
              <Label htmlFor="checkout-name">Nombre</Label>
              <Input
                id="checkout-name"
                name="name"
                required
                disabled={isCheckingOut}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="checkout-email">Correo electrónico</Label>
              <Input
                id="checkout-email"
                name="email"
                type="email"
                required
                disabled={isCheckingOut}
              />
            </div>
            {checkoutError && (
              <p className="text-destructive text-xs">{checkoutError}</p>
            )}
            <Button type="submit" disabled={isCheckingOut}>
              {isCheckingOut ? "Confirmando…" : "Confirmar compra"}
            </Button>
          </form>
        )}

        {view === "cart" && cart.items.length > 0 && (
          <SheetFooter>
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Total</span>
              <span>{formatPrice(cart.totalCents, "USD")}</span>
            </div>
            <Button onClick={() => setView("checkout")}>
              Finalizar compra
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
