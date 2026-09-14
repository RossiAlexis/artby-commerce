"use client";

import { useEffect } from "react";

/**
 * next/link's native hash scroll can miss the target when arriving via a
 * client-side transition from another route (the section isn't in the DOM
 * yet when Next attempts the scroll). This re-attempts the scroll after
 * mount as a fallback so "Sobre Vero" reliably lands on its section.
 */
export function ScrollToHash() {
  useEffect(() => {
    const { hash } = window.location;
    if (!hash) return;

    const target = document.getElementById(hash.slice(1));
    target?.scrollIntoView({ block: "start" });
  }, []);

  return null;
}
