import { cn } from "@/lib/utils";

export function LanguageMarker({
  primaryLanguage,
  className,
}: {
  primaryLanguage: "es" | "en";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-foreground text-[0.6875rem] whitespace-nowrap",
        className,
      )}
    >
      <span className="hidden md:inline">USD &nbsp;·&nbsp; </span>
      <span
        className={
          primaryLanguage === "es" ? "font-semibold" : "text-[#7c756f]"
        }
      >
        ES
      </span>
      {" · "}
      <span
        className={
          primaryLanguage === "en" ? "font-semibold" : "text-[#7c756f]"
        }
      >
        EN
      </span>
    </span>
  );
}
