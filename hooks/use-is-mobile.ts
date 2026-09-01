"use client";

import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

function subscribe(breakpoint: number, onStoreChange: () => void) {
  const query = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
  query.addEventListener("change", onStoreChange);
  return () => query.removeEventListener("change", onStoreChange);
}

/** Mirrors the `md` breakpoint used across the site to split mobile/desktop layouts. */
export function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(breakpoint, onStoreChange),
    () => window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches,
    () => false,
  );
}
