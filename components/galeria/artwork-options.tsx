import { Checkbox } from "@/components/ui/checkbox";

/**
 * Rendered per the artwork-page design, intentionally inert. CONTEXT.md:
 * the checkbox does not feed the checkout gift option, and the site stays
 * Spanish/USD-only — language and currency stay as dead header copy.
 */
export function ArtworkOptions() {
  return (
    <label className="flex w-fit items-center gap-2.5 text-sm text-[#1C1917]">
      <Checkbox aria-label="Es un regalo" />
      Es un regalo
    </label>
  );
}
