# Guest checkout is all-or-nothing across the whole Cart

Issue #9 asks for checkout to be "transactional: it only succeeds for Artworks whose Reservation is still valid." A Cart can cover several Artworks (ADR-0003), and by the time a Customer clicks "Finalizar compra," one of those Reservations may have expired in the seconds since the Cart drawer last loaded. We had to choose between two readings of "succeeds for Artworks whose Reservation is still valid":

1. **Partial checkout** — complete an Order covering only the still-valid Artworks, silently dropping the expired one(s).
2. **All-or-nothing** — if any single Artwork's Reservation has expired, the whole checkout fails and nothing is created; the Customer sees an error and has to revisit their Cart.

We chose all-or-nothing. A Customer who set out to buy three specific Artworks together did not consent to buying two of them at whatever the final total happens to be — silently shrinking their Order changes what they're agreeing to pay for without a chance to reconsider. This is also what "one atomic operation" in the issue most naturally means, and it keeps `checkoutCart` a single DB transaction: one bulk conditional `UPDATE ... RETURNING` (mirroring the concurrency guard in `lib/db/cart.ts`) checks every covered Artwork at once, and if the returned row count doesn't match the Cart's item count, the transaction throws and rolls back everything, including Artworks whose Reservation was still valid.

Consequence: a Customer whose Cart partially expired mid-checkout gets no Order at all and must remove the stale item(s) and retry — there's no server-side "continue with just the valid items" fallback. Revisit if this friction turns out to matter in practice (e.g. multi-item Carts sitting open near the 15-minute Reservation boundary are common enough to warrant a partial-checkout path with explicit Customer confirmation).
