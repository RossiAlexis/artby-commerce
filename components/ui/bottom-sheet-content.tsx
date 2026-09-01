"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { SheetContent } from "@/components/ui/sheet";

/** iOS-style bottom sheet chrome — rounded top corners + drag handle — shared by every mobile Sheet (Order detail, Cart, Checkout). */
function BottomSheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SheetContent>) {
  return (
    <SheetContent
      side="bottom"
      className={cn(
        "max-h-[85vh] gap-0 overflow-hidden rounded-t-2xl border-t-0 pt-2.5",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className="mx-auto h-1 w-9 shrink-0 rounded-full bg-[#e2d8ce]"
      />
      {children}
    </SheetContent>
  );
}

export { BottomSheetContent };
