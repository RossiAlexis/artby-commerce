import { ArtworkForm } from "@/components/admin/artwork-form";

export default function NewArtworkPage() {
  return (
    <div className="px-6 py-8 md:px-10">
      <h1 className="font-heading mb-6 text-xl">New Artwork</h1>
      <ArtworkForm />
    </div>
  );
}
