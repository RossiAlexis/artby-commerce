export class ReservationExpiredError extends Error {
  constructor(
    message = "One or more Artworks in this Cart are no longer reserved.",
  ) {
    super(message);
    this.name = "ReservationExpiredError";
  }
}

export class EmptyCartError extends Error {
  constructor(message = "This Cart has no Artworks to check out.") {
    super(message);
    this.name = "EmptyCartError";
  }
}
