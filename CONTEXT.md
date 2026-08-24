# Art by Vero Miller — Commerce

An e-commerce site for an independent painter to sell her original paintings directly to customers, plus a private admin area for her to manage listings and curate what the public homepage shows.

## Language

**Artwork**:
A single physical painting listed for sale. Always one-of-a-kind — quantity is always 1. Once purchased, it is marked sold and can no longer be bought again. Has two independent states set by the admin:

- **Sold**: whether it has been purchased. Defaults to shown-as-sold (with a badge) rather than removed.
- **Visibility**: whether it appears on the public site at all, regardless of sold status. The admin can hide or show any Artwork manually, sold or not.

An Artwork can also be temporarily **Reserved** (see Reservation) — purchasable-but-held is a third, transient condition distinct from Sold.

Has up to 5 photos, admin-orderable. First image is the large hero shot; the rest show as smaller thumbnails/carousel below it.
_Avoid_: Paint, painting, piece, product (in code/schema, prefer Artwork consistently)

**Featured**:
A boolean flag the admin sets on an Artwork to mark it for homepage highlighting. The homepage shows the last 4 Artworks marked Featured (most recently flagged first), displayed under the customer-facing label "Obras disponibles" — the underlying mechanism is still Featured, that's just its display copy. Its homepage thumbnail uses the Artwork's first (hero) photo.
_Avoid_: Highlighted (in conversation), pinned

**Cart**:
A Customer's in-progress collection of Artworks intended for purchase. Adding an Artwork to a Cart creates a Reservation on it. A Cart is checked out as a single Order covering every Artwork still validly reserved in it at that moment.
_Avoid_: Bag, basket (match the Spanish UI term "carrito" conceptually, but "Cart" is the canonical English term in code/schema)

**Reservation**:
A 15-minute hold placed on an Artwork when a Customer adds it to their Cart. While active, no other Customer can purchase that Artwork. Expires automatically if not checked out in time, returning the Artwork to Available. Distinct from Sold — a Reservation is provisional and reversible; Sold is final.
_Avoid_: Hold (fine in conversation, but prefer "Reservation" in code/schema), lock

**Order**:
A record created when a Customer completes checkout on a Cart. Covers one or more Artworks (one Order : many Artworks), buyer info, amount, and timestamp. Triggers a confirmation email to the Customer and a notification email to the admin. Visible in a simple admin list/detail view. Final once created — no cancellation/refund flow.
_Avoid_: Purchase, transaction, sale

**Customer**:
A person who buys an Artwork. Can complete an Order as a guest (no account) or optionally create an Account to see past Orders. Distinct from the admin (the artist), who is not a Customer.
_Avoid_: Buyer, user (reserve "user" for generic/technical references only)

**Subscriber**:
An email address submitted through the homepage's "lista VIP" signup, for future outreach about new Artworks. Just a stored email + timestamp — no account, no relation to Customer.
_Avoid_: Lead, contact (contact is reserved for the Contact page's one-off message, which isn't stored at all)

**Site Settings**:
The singleton set of public-homepage content the admin curates, separate from individual Artwork listings: the cover image, a hero tagline, an optional announcement-bar message, the Featured picks, an "about the artist" block (image + title + description), an optional post-purchase message shown on the order-confirmation page, social media links, and contact info.
_Avoid_: Dashboard (reserve "Dashboard"/"Admin" for the private area as a whole, which also includes Artwork catalog management and the Order list — Site Settings is just the homepage-curation part of it)

## Example dialogue

> **Vero**: I sold the big blue Artwork today at the market, can you mark it sold and hide it from the site?
> **Dev**: Sure — I'll flip its Sold state, and since you also want it hidden, I'll set Visibility to hidden too. Just to confirm: that Order was a cash sale outside the site, so there's no Customer or Order record for it — I'll just update the Artwork directly.
> **Vero**: Right. But the "Amanecer" piece I want to keep showing as sold on the site, people like seeing what's sold.
> **Dev**: Got it — Sold but still visible, that's the default. And should I swap it out of the 4 Featured picks since it's gone?
> **Vero**: Yes, feature the new seascape instead.

## Flagged ambiguities

- The Figma design renders an ES/EN language toggle, a USD currency dropdown, and an "Es un regalo" (gift) checkbox on the Artwork page. All three are intentionally non-functional ("dead UI") for this MVP — the site is Spanish/USD-only and gift handling is deferred alongside shipping. Don't treat their presence in the UI as a signal that i18n, multi-currency, or gift logic needs implementing.
- The Instagram feed section and live follower count shown in the Figma homepage design are cut entirely from the MVP (Meta App Review overhead not justified yet) — not a "todo," a deliberate exclusion.
- Shipping is out of scope including address collection — "envío internacional incluido" banner/copy in the design is presentational only; no shipping cost logic, carrier integration, or address form exists yet.
