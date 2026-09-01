"use client";

import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { checkoutAction } from "@/app/actions/checkout";
import { removeFromCartAction } from "@/app/actions/cart";
import { useCartDrawer } from "@/components/cart/cart-drawer-context";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BottomSheetContent } from "@/components/ui/bottom-sheet-content";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-is-mobile";
import type { Cart } from "@/lib/db/cart";
import { cn, formatPrice } from "@/lib/utils";

const PAYMENT_METHODS = ["Visa", "MC", "Amex", "Apple Pay", "Google Pay"];

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.1195 3.52083C9.42283 2.88167 10.0761 2.4375 10.8333 2.4375H15.1667C15.9228 2.4375 16.5761 2.88167 16.8805 3.52083C17.6204 3.52733 18.1978 3.56092 18.7135 3.76242C19.3291 4.00321 19.8644 4.41243 20.2583 4.94325C20.6559 5.47733 20.8422 6.16417 21.099 7.10775L21.1391 7.25508L21.7783 9.60267C22.2044 9.81769 22.578 10.1239 22.8724 10.4997C23.5463 11.3631 23.6654 12.3912 23.5462 13.5698C23.4292 14.7138 23.0696 16.1547 22.6189 17.9584L22.5897 18.0722C22.3047 19.2129 22.0729 20.1392 21.7988 20.8618C21.5107 21.6158 21.1467 22.2332 20.5454 22.7023C19.9452 23.1714 19.2573 23.374 18.4567 23.4715C17.6887 23.5625 16.7342 23.5625 15.5588 23.5625H10.4412C9.26575 23.5625 8.31025 23.5625 7.54325 23.4704C6.74158 23.3751 6.05475 23.1714 5.4535 22.7013C4.85333 22.2333 4.48933 21.6158 4.20117 20.8618C3.926 20.1392 3.69525 19.2129 3.41033 18.0722L3.38108 17.9584C2.93042 16.1547 2.56967 14.7138 2.45375 13.5709C2.33458 12.3901 2.45375 11.3631 3.1265 10.4997C3.43308 10.1075 3.80033 9.81717 4.22067 9.60267L4.85983 7.25508L4.901 7.10775C5.15775 6.16417 5.34408 5.47733 5.74167 4.94217C6.13571 4.41175 6.67105 4.00291 7.2865 3.76242C7.80217 3.56092 8.3785 3.52625 9.1195 3.52083ZM9.12058 5.14908C8.40342 5.15667 8.11633 5.18375 7.878 5.27692C7.54646 5.40657 7.25813 5.62695 7.046 5.91283C6.85533 6.16958 6.74267 6.52817 6.4285 7.68408L6.045 9.08808C7.1695 8.9375 8.62117 8.9375 10.4238 8.9375H15.5751C17.3788 8.9375 18.8305 8.9375 19.9539 9.08808L19.5715 7.683C19.2562 6.52708 19.1447 6.1685 18.954 5.91175C18.7419 5.62587 18.4535 5.40549 18.122 5.27583C17.8837 5.18267 17.5955 5.15558 16.8783 5.148C16.7244 5.47155 16.4818 5.74484 16.1789 5.93619C15.876 6.12754 15.525 6.22913 15.1667 6.22917H10.8333C10.475 6.22913 10.124 6.12754 9.8211 5.93619C9.51815 5.74484 9.27564 5.47155 9.12167 5.148M10.8333 4.0625C10.7615 4.0625 10.6926 4.09103 10.6418 4.14182C10.591 4.19262 10.5625 4.2615 10.5625 4.33333C10.5625 4.40516 10.591 4.47405 10.6418 4.52484C10.6926 4.57563 10.7615 4.60417 10.8333 4.60417H15.1667C15.2385 4.60417 15.3074 4.57563 15.3582 4.52484C15.409 4.47405 15.4375 4.40516 15.4375 4.33333C15.4375 4.2615 15.409 4.19262 15.3582 4.14182C15.3074 4.09103 15.2385 4.0625 15.1667 4.0625H10.8333ZM6.175 10.7098C5.18917 10.8528 4.71142 11.1128 4.40917 11.5007C4.10583 11.8874 3.97042 12.4128 4.07117 13.4052C4.17408 14.4192 4.5045 15.7452 4.97467 17.6302C5.27583 18.8305 5.48383 19.6625 5.72217 20.2843C5.94967 20.8845 6.17392 21.2019 6.45558 21.4218C6.73617 21.6407 7.098 21.7804 7.73717 21.8573C8.398 21.9364 9.25383 21.9375 10.4932 21.9375H15.509C16.7472 21.9375 17.6052 21.9364 18.265 21.8573C18.9042 21.7815 19.266 21.6407 19.5466 21.4218C19.8282 21.2019 20.0514 20.8845 20.2811 20.2843C20.5173 19.6625 20.7263 18.8305 21.0264 17.6302C21.4977 15.7452 21.8281 14.4192 21.9299 13.4052C22.0317 12.4128 21.8952 11.8863 21.593 11.4996C21.2907 11.1128 20.813 10.8528 19.8261 10.7098C18.8186 10.5647 17.4514 10.5625 15.509 10.5625H10.4932C8.55075 10.5625 7.18358 10.5647 6.17608 10.7098"
        fill="currentColor"
      />
    </svg>
  );
}

export function CartDrawer({ cart }: { cart: Cart }) {
  const { open, view, setOpen, setView } = useCartDrawer();
  const [isPending, startTransition] = useTransition();
  const [pendingArtworkId, setPendingArtworkId] = useState<number | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCheckingOut, startCheckout] = useTransition();
  const [isGift, setIsGift] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [originFromRight, setOriginFromRight] = useState<number | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    function updateOrigin() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setOriginFromRight(window.innerWidth - (rect.left + rect.width / 2));
    }
    updateOrigin();
    window.addEventListener("resize", updateOrigin);
    return () => window.removeEventListener("resize", updateOrigin);
  }, []);

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
      setIsGift(false);
    }
  }

  function handleCheckoutSubmit(formData: FormData) {
    setCheckoutError(null);
    startCheckout(async () => {
      const result = await checkoutAction({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        city: String(formData.get("city") ?? ""),
        country: String(formData.get("country") ?? ""),
        address: String(formData.get("address") ?? ""),
        isGift,
        giftRecipientName: String(formData.get("giftRecipientName") ?? ""),
        giftMessage: String(formData.get("giftMessage") ?? ""),
      });
      if (result.success) {
        setView("success");
      } else {
        setCheckoutError(result.error);
      }
    });
  }

  const sheetBody = (
    <>
      <SheetHeader>
        <SheetTitle
          className={cn(
            "text-lg font-semibold text-[#1C1917]",
            (view !== "checkout" || isMobile) && "text-2xl",
          )}
        >
          {view === "checkout"
            ? "Resumen de compra"
            : `Tu carrito${cart.items.length > 0 ? ` (${cart.items.length})` : ""}`}
        </SheetTitle>
      </SheetHeader>

      {view === "success" && (
        <div className="flex-1 space-y-2 px-4 pb-5">
          <p className="text-sm font-medium">¡Gracias por tu compra!</p>
          <p className="text-muted-foreground text-sm">
            Te enviamos un correo de confirmación con el resumen de tu Orden.
          </p>
        </div>
      )}

      {view === "cart" && (
        <div className="flex-1 overflow-y-auto px-4 pb-5">
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
                <div
                  key={item.id}
                  className="flex gap-4 border-b border-[#E2D8CE] py-5 first:pt-0"
                >
                  <div className="bg-muted relative aspect-square size-[100px] shrink-0 overflow-hidden rounded-[8px]">
                    {heroPhoto && (
                      <Image
                        src={heroPhoto.url}
                        alt={item.artwork.title}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-base font-semibold text-[#1C1917]">
                      {item.artwork.title}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {item.artwork.medium} · {item.artwork.width} ×{" "}
                      {item.artwork.height} {item.artwork.dimensionUnit}
                    </p>
                    <p className="text-sm font-semibold text-[#1C1917]">
                      {formatPrice(
                        item.artwork.priceCents,
                        item.artwork.currency,
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="text-muted-foreground size-6 shrink-0 self-start rounded-full border-[#E2D8CE]"
                    aria-label={`Quitar ${item.artwork.title} del carrito`}
                    disabled={isRemoving}
                    onClick={() => handleRemove(item.artwork.id)}
                  >
                    <X className="size-3" aria-hidden />
                  </Button>
                </div>
              );
            })}
          {cart.items.length > 0 && (
            <p className="text-muted-foreground py-5 text-xs">
              Cada obra es única. Al estar en tu carrito, nadie más puede
              comprarla durante 15 minutos.
            </p>
          )}
        </div>
      )}

      {view === "checkout" && (
        <form
          action={handleCheckoutSubmit}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-5"
        >
          <div className="flex flex-col gap-4">
            {cart.items.map((item) => {
              const heroPhoto = item.artwork.photos[0];
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="bg-muted relative aspect-square size-14 shrink-0 overflow-hidden rounded-[8px]">
                    {heroPhoto && (
                      <Image
                        src={heroPhoto.url}
                        alt={item.artwork.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p
                      className={cn(
                        "font-semibold text-[#1C1917]",
                        isMobile ? "text-base" : "text-sm",
                      )}
                    >
                      {item.artwork.title}
                    </p>
                    <p
                      className={cn(
                        "text-[#7C756F]",
                        isMobile ? "text-sm" : "text-xs",
                      )}
                    >
                      {formatPrice(
                        item.artwork.priceCents,
                        item.artwork.currency,
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="h-px w-full shrink-0 bg-[#E2D8CE]" />

          <div className="flex flex-col gap-4">
            <h3
              className={cn(
                "font-semibold text-[#1C1917]",
                isMobile ? "text-lg" : "text-sm",
              )}
            >
              Información de envío
            </h3>
            <div className="space-y-1">
              <Label htmlFor="checkout-name" className="sr-only">
                Nombre completo
              </Label>
              <Input
                id="checkout-name"
                name="name"
                placeholder="Nombre completo"
                required
                disabled={isCheckingOut}
                className="h-10 rounded-[8px] border-[#E2D8CE] bg-white px-3 text-sm placeholder:text-[#7C756F]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="checkout-email" className="sr-only">
                Email
              </Label>
              <Input
                id="checkout-email"
                name="email"
                type="email"
                placeholder="Email"
                required
                disabled={isCheckingOut}
                className="h-10 rounded-[8px] border-[#E2D8CE] bg-white px-3 text-sm placeholder:text-[#7C756F]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="checkout-city" className="sr-only">
                  Ciudad
                </Label>
                <Input
                  id="checkout-city"
                  name="city"
                  placeholder="Ciudad"
                  required
                  disabled={isCheckingOut}
                  className="h-10 rounded-[8px] border-[#E2D8CE] bg-white px-3 text-sm placeholder:text-[#7C756F]"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="checkout-country" className="sr-only">
                  País
                </Label>
                <Input
                  id="checkout-country"
                  name="country"
                  placeholder="País"
                  required
                  disabled={isCheckingOut}
                  className="h-10 rounded-[8px] border-[#E2D8CE] bg-white px-3 text-sm placeholder:text-[#7C756F]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="checkout-address" className="sr-only">
                Dirección
              </Label>
              <Input
                id="checkout-address"
                name="address"
                placeholder="Dirección"
                required
                disabled={isCheckingOut}
                className="h-10 rounded-[8px] border-[#E2D8CE] bg-white px-3 text-sm placeholder:text-[#7C756F]"
              />
            </div>
          </div>

          <label
            className={cn(
              "flex items-center gap-2 text-[#1C1917]",
              isMobile ? "text-base font-medium" : "text-sm",
            )}
          >
            <Checkbox
              checked={isGift}
              onCheckedChange={(checked) => setIsGift(checked === true)}
              disabled={isCheckingOut}
              className={cn(
                "data-checked:border-[#1C1917] data-checked:bg-[#1C1917]",
                isMobile && "size-5",
              )}
            />
            Es un regalo
          </label>

          {isGift && (
            <div className="flex flex-col gap-3 rounded-[8px] bg-[#FCEBE3] p-4">
              <div className="space-y-2">
                <Label
                  htmlFor="checkout-gift-recipient"
                  className="text-sm font-semibold text-[#1C1917]"
                >
                  Para
                </Label>
                <Input
                  id="checkout-gift-recipient"
                  name="giftRecipientName"
                  placeholder="Nombre de quien recibe"
                  required={isGift}
                  disabled={isCheckingOut}
                  className="h-10 rounded-[8px] border-[#E2D8CE] bg-white px-3 text-sm placeholder:text-[#7C756F]"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="checkout-gift-message"
                  className="text-sm font-semibold text-[#1C1917]"
                >
                  Mensaje
                </Label>
                <Textarea
                  id="checkout-gift-message"
                  name="giftMessage"
                  placeholder="Escribí tu dedicatoria"
                  disabled={isCheckingOut}
                  className="h-10 min-h-0 resize-none rounded-[8px] border-[#E2D8CE] bg-white px-3 py-2 text-sm placeholder:text-[#7C756F]"
                />
              </div>
            </div>
          )}

          <div className="h-px w-full shrink-0 bg-[#E2D8CE]" />

          <div
            className={cn(
              "flex items-center justify-between font-semibold text-[#1C1917]",
              isMobile ? "text-2xl" : "text-base",
            )}
          >
            <span>Total</span>
            <span>{formatPrice(cart.totalCents, "USD")}</span>
          </div>

          {checkoutError && (
            <p className="text-destructive text-xs">{checkoutError}</p>
          )}

          <div className="space-y-2">
            <p className="text-xs text-[#7C756F]">Métodos de pago aceptados</p>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method}
                  className="rounded-full bg-[#F0EBE3] px-3 py-1.5 text-xs text-[#7C756F]"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isCheckingOut}
            className="h-16 w-full"
          >
            {isCheckingOut ? "Confirmando…" : "Confirmar compra"}
          </Button>

          <div className="space-y-1 text-xs">
            <p className="text-[#4D5E51]">
              ✓ Certificado de autenticidad · Envío internacional asegurado
            </p>
            <p className="text-[#7C756F]">
              Puede aplicar impuesto de importación en destino, según tu país.
            </p>
          </div>
        </form>
      )}

      {view === "cart" && cart.items.length > 0 && (
        <SheetFooter className="gap-3 pb-5">
          <div className="flex items-center justify-between text-lg font-semibold text-[#1C1917]">
            <span>Total</span>
            <span>{formatPrice(cart.totalCents, "USD")}</span>
          </div>
          <p className="text-muted-foreground text-xs">
            Envío internacional incluido
          </p>
          <Button onClick={() => setView("checkout")} className="h-14 w-full">
            Finalizar compra
          </Button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1 text-sm font-medium text-[#993F17]"
          >
            Seguir explorando
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </SheetFooter>
      )}
    </>
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        ref={triggerRef}
        className="flex items-center gap-1"
        aria-label={`Carrito${cart.items.length > 0 ? ` (${cart.items.length})` : ""}`}
      >
        <CartIcon
          className={cn(
            "size-[26px]",
            open ? "text-[#C27A5A]" : "text-foreground",
          )}
        />
        <span className={cart.items.length === 0 ? "invisible" : undefined}>
          {cart.items.length}
        </span>
      </SheetTrigger>
      {isMobile ? (
        <BottomSheetContent>{sheetBody}</BottomSheetContent>
      ) : (
        <SheetContent
          style={
            originFromRight != null
              ? { transformOrigin: `calc(100% - ${originFromRight}px) 0px` }
              : undefined
          }
          className={cn(
            "!top-24 !bottom-auto !h-auto !max-h-[calc(100vh-6rem)] shadow-[-8px_0px_32px_0px_#0000002E]",
            "origin-top-right data-[side=right]:data-ending-style:translate-x-0 data-[side=right]:data-starting-style:translate-x-0",
            "data-ending-style:scale-0 data-starting-style:scale-0",
          )}
          overlayClassName="!top-24 inset-x-0 bottom-0 bg-[#1C191773] supports-backdrop-filter:backdrop-blur-none"
        >
          {sheetBody}
        </SheetContent>
      )}
    </Sheet>
  );
}
