import { Pool, neonConfig } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { artworkPhotos, artworks, siteSettings } from "../lib/db/schema";

config({ path: ".env.local" });
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema: { artworks, artworkPhotos, siteSettings } });

// Mock image URLs served from public/seed/ until Vercel Blob storage lands.
const ARTWORKS = [
  {
    title: "Primavera en la ciudad",
    description:
      "Flores de cerezo enmarcando la torre, un instante de calma urbana.",
    dimensions: "40x40 cm",
    medium: "Acrílico sobre lienzo",
    year: 2024,
    priceCents: 45_000,
    image: "/seed/art-work-1.png",
  },
  {
    title: "Mirada blanca",
    description:
      "El detalle de la mirada de un caballo blanco, en tonos tierra.",
    dimensions: "30x40 cm",
    medium: "Acrílico sobre lienzo",
    year: 2024,
    priceCents: 45_000,
    image: "/seed/art-work-2.png",
  },
  {
    title: "Sisters",
    description:
      "Dos caballos apoyando sus cabezas, un gesto de cariño silencioso.",
    dimensions: "50x60 cm",
    medium: "Acrílico sobre lienzo",
    year: 2024,
    priceCents: 45_000,
    image: "/seed/art-work-3.png",
  },
  {
    title: "Ojos verdes",
    description: "Retrato de un gato de mirada intensa sobre fondo oscuro.",
    dimensions: "30x40 cm",
    medium: "Acrílico sobre lienzo",
    year: 2024,
    priceCents: 45_000,
    image: "/seed/art-work-4.png",
  },
];

async function main() {
  await db.delete(artworkPhotos);
  await db.delete(artworks);
  await db.delete(siteSettings);

  await db.insert(siteSettings).values({
    coverImageUrl: "/seed/cover.png",
    heroTagline: "Pinturas acrílicas para el lugar que las estaba esperando.",
    aboutImageUrl: "/seed/about-artist-image.png",
    aboutTitle: "Vero Miller",
    aboutDescription:
      "El arte no fue una elección. Es la forma en que aprendí a habitar el mundo.\nPinto, escribo, fotografío, distintas formas de decir lo mismo.\nMe inspira lo cotidiano: lugares, instantes que otros quizás pasan de largo, pero en los que siempre hay un recorte de mis ojos que ve un poco más.\nLa pintura es el pedacito de eso que elegí compartir acá, y me honra que alguien se lo lleve a casa.",
    socialLinks: { instagram: "https://instagram.com/artbyveromiller" },
    contactInfo: { email: "hola@artbyveromiller.com" },
  });

  for (const [index, data] of ARTWORKS.entries()) {
    const [artwork] = await db
      .insert(artworks)
      .values({
        title: data.title,
        description: data.description,
        dimensions: data.dimensions,
        medium: data.medium,
        year: data.year,
        priceCents: data.priceCents,
        featured: true,
        featuredAt: new Date(Date.now() - index * 60_000),
      })
      .returning();

    await db.insert(artworkPhotos).values({
      artworkId: artwork.id,
      url: data.image,
      position: 0,
    });
  }

  console.log(`Seeded site settings + ${ARTWORKS.length} featured artworks`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
