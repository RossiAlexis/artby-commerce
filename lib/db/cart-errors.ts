export class ArtworkUnavailableError extends Error {
  constructor(message = "This artwork is no longer available.") {
    super(message);
    this.name = "ArtworkUnavailableError";
  }
}
