import { db } from "@/lib/db/client";
import { artworks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function Page() {
  const p = await db
    .update(artworks)
    .set({ sold: true })
    .where(eq(artworks.id, 4));
  console.log(p);
  return <>Genio</>;
}
