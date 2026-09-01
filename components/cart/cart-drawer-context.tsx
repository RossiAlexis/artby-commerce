"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type CartDrawerView = "cart" | "checkout" | "success";

type CartDrawerContextValue = {
  open: boolean;
  view: CartDrawerView;
  setOpen: (open: boolean) => void;
  setView: (view: CartDrawerView) => void;
  openCheckout: () => void;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export function CartDrawerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<CartDrawerView>("cart");

  const value = useMemo<CartDrawerContextValue>(
    () => ({
      open,
      view,
      setOpen,
      setView,
      openCheckout: () => {
        setView("checkout");
        setOpen(true);
      },
    }),
    [open, view],
  );

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const context = useContext(CartDrawerContext);
  if (!context) {
    throw new Error("useCartDrawer must be used within a CartDrawerProvider");
  }
  return context;
}
