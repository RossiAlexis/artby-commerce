import Link from "next/link";
import { ArtworkCard } from "@/components/admin/artwork-card";
import { getAdminArtworks } from "@/lib/db/artworks-admin";
import { artworksFilterSchema, type ArtworksFilter } from "@/lib/db/artworks-filter";
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
      <div className="flex h-[72px] items-center justify-between border-b border-[#e2d8ce] bg-white px-10">
        <h1 className="text-xl font-semibold text-[#1c1917]">Mis obras</h1>
        {filter !== "sold" && (
          <Link
            href="/admin/artworks/new"
            className="rounded-[4px] bg-primary px-[26px] py-[11px] text-sm font-medium text-white hover:bg-primary-hover"
          >
            + Agregar obra
          </Link>
        )}
      </div>
      <div className="flex items-center gap-8 px-10 pt-6">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={
              tab.value === "all"
                ? "/admin/artworks"
                : `/admin/artworks?status=${tab.value}`
            }
            className={cn(
              "border-b-2 pb-2.5 text-sm",
              filter === tab.value
                ? "border-primary font-medium text-primary"
                : "border-transparent text-[#7c756f]",
            )}
          >
            {tab.label} ({counts[tab.value]})
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-[25px] px-10 py-9 sm:grid-cols-2 xl:grid-cols-3">
        {visibleArtworks.map((artwork) => (
          <ArtworkCard key={artwork.id} artwork={artwork} />
        ))}
        {filter !== "sold" && (
          <Link
            href="/admin/artworks/new"
            className="flex h-[310px] flex-col items-center justify-center rounded-lg border-[1.5px] border-dashed border-[#e2d8ce] bg-white text-primary hover:bg-[#f5f2ef]"
          >
            <span className="text-3xl leading-none">+</span>
            <span className="mt-2 text-sm text-[#7c756f]">Agregar obra</span>
          </Link>
        )}
        {visibleArtworks.length === 0 && (
          <p className="col-span-full text-sm text-[#7c756f]">
            No hay obras en esta categoría.
          </p>
        )}
      </div>
    </div>
  );
}
