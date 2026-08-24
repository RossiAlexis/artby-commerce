// Deliberately unbuilt: photo upload to Vercel Blob and drag-reordering
// (issue #11) are being implemented separately. This is just a slot marking
// where that UI attaches, plus a read-only list of whatever photo rows
// already exist so an edit isn't a total blind spot in the meantime.
export function ArtworkPhotosPlaceholder({
  photos,
}: {
  photos: { id: number; url: string; position: number }[];
}) {
  return (
    <div className="border-border mt-8 max-w-lg border border-dashed p-4">
      <p className="text-xs font-medium">Photos ({photos.length}/5)</p>
      <p className="text-muted-foreground mt-1 text-xs">
        Upload and drag-to-reorder aren&apos;t wired up here yet — this is a
        placeholder slot for that UI.
      </p>
      {photos.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1">
          {photos.map((photo) => (
            <li key={photo.id} className="truncate text-xs">
              {photo.position}. {photo.url}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
