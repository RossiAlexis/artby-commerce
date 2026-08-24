export class ArtworkReferencedByOrderError extends Error {
  constructor(
    message = "This Artwork is referenced by an Order and can't be deleted — hide it instead.",
  ) {
    super(message);
    this.name = "ArtworkReferencedByOrderError";
  }
}

export class ArtworkPhotoMismatchError extends Error {
  constructor(
    message = "The given photo ids don't match this Artwork's current photos.",
  ) {
    super(message);
    this.name = "ArtworkPhotoMismatchError";
  }
}
