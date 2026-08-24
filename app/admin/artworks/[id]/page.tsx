import { notFound } from "next/navigation";
import { ArtworkForm } from "@/components/admin/artwork-form";
import { ArtworkPhotos } from "@/components/admin/artwork-photos";
import { ArtworkToggles } from "@/components/admin/artwork-toggles";
import { DeleteArtworkButton } from "@/components/admin/delete-artwork-button";
import { getAdminArtworkById } from "@/lib/db/artworks-admin";

export default async function EditArtworkPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const artworkId = Number(id);
  // artworks.id is a Postgres `serial` (int4); anything outside its range
  // would otherwise reach the DB and throw instead of yielding a 404.
  const isValidId =
    Number.isInteger(artworkId) && artworkId > 0 && artworkId <= 2147483647;
  if (!isValidId) notFound();

  const artwork = await getAdminArtworkById(artworkId);
  if (!artwork) notFound();

  return (
    <div className="px-6 py-8 md:px-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-xl">{artwork.title}</h1>
        <DeleteArtworkButton
          artworkId={artwork.id}
          artworkTitle={artwork.title}
        />
      </div>
      <ArtworkToggles
        artworkId={artwork.id}
        sold={artwork.sold}
        visible={artwork.visible}
        featured={artwork.featured}
      />
      <div className="mt-8">
        <ArtworkForm artwork={artwork} />
      </div>
      <div className="mt-8">
        <ArtworkPhotos artworkId={artwork.id} photos={artwork.photos} />
      </div>
    </div>
  );
}
