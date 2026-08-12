import { ViewTransition } from "react";

/**
 * Wraps a page's content so hierarchical navigations (list <-> detail)
 * slide directionally. Requires the source/target `<Link>` to carry a
 * matching `transitionTypes={['nav-forward' | 'nav-back']}`; untyped
 * navigations (e.g. lateral related-artwork links) get no slide.
 */
export function DirectionalTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransition
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      update="none"
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
