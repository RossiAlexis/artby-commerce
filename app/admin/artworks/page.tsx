import Link from "next/link";
import { ArtworkCard } from "@/components/admin/artwork-card";
import { ArtworkCreateButton } from "@/components/admin/artwork-create-button";
import { getAdminArtworks } from "@/lib/db/artworks-admin";
import {
  artworksFilterSchema,
  type ArtworksFilter,
} from "@/lib/db/artworks-filter";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "all", label: "Todas" },
  { value: "available", label: "Disponibles" },
  { value: "sold", label: "Vendidas" },
] as const;

export default async function AdminArtworksPage(props: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const filter: ArtworksFilter =
    artworksFilterSchema.safeParse(searchParams?.status).data ?? "all";

  const artworks = await getAdminArtworks();
  const counts: Record<ArtworksFilter, number> = {
    all: artworks.length,
    available: artworks.filter((artwork) => !artwork.sold).length,
    sold: artworks.filter((artwork) => artwork.sold).length,
  };
  const visibleArtworks =
    filter === "all"
      ? artworks
      : artworks.filter((artwork) =>
          filter === "sold" ? artwork.sold : !artwork.sold,
        );

  return (
    <div>
      <div className="flex h-[72px] items-center justify-between border-b border-[#e2d8ce] bg-white px-5 sm:px-10">
        <h1 className="text-xl font-semibold text-[#1c1917]">Mis obras</h1>
        {filter !== "sold" && <ArtworkCreateButton variant="header" />}
      </div>
      <div className="flex items-center gap-5 px-5 pt-6 sm:gap-8 sm:px-10">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={
              tab.value === "all"
                ? "/admin/artworks"
                : `/admin/artworks?status=${tab.value}`
            }
            className={cn(
              "border-b-2 pb-2.5 text-sm whitespace-nowrap",
              filter === tab.value
                ? "border-primary text-primary font-medium"
                : "border-transparent text-[#7c756f]",
            )}
          >
            {tab.label} ({counts[tab.value]})
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-[25px] px-5 py-9 sm:grid-cols-2 sm:px-10 xl:grid-cols-3">
        {visibleArtworks.map((artwork) => (
          <ArtworkCard key={artwork.id} artwork={artwork} />
        ))}
        {filter !== "sold" && <ArtworkCreateButton variant="tile" />}
        {visibleArtworks.length === 0 && (
          <p className="col-span-full text-sm text-[#7c756f]">
            No hay obras en esta categoría.
          </p>
        )}
      </div>
    </div>
  );
}
