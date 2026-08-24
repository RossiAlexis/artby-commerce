import Link from "next/link";
import { ArtworkToggles } from "@/components/admin/artwork-toggles";
import { DeleteArtworkButton } from "@/components/admin/delete-artwork-button";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminArtworks } from "@/lib/db/artworks-admin";
import { formatPrice } from "@/lib/utils";

export default async function AdminArtworksPage() {
  const artworks = await getAdminArtworks();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-xl">Artworks</h1>
        <Link href="/admin/artworks/new" className={buttonVariants()}>
          New Artwork
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {artworks.map((artwork) => (
            <TableRow key={artwork.id}>
              <TableCell>
                <Link
                  href={`/admin/artworks/${artwork.id}`}
                  className="hover:underline"
                >
                  {artwork.title}
                </Link>
              </TableCell>
              <TableCell>{artwork.year}</TableCell>
              <TableCell>
                {formatPrice(artwork.priceCents, artwork.currency)}
              </TableCell>
              <TableCell>
                <ArtworkToggles
                  artworkId={artwork.id}
                  sold={artwork.sold}
                  visible={artwork.visible}
                  featured={artwork.featured}
                />
              </TableCell>
              <TableCell className="text-right">
                <DeleteArtworkButton
                  artworkId={artwork.id}
                  artworkTitle={artwork.title}
                />
              </TableCell>
            </TableRow>
          ))}
          {artworks.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                No artworks yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
