import { getArtworks } from "@/lib/db/artworks";
import { TabsDemo } from "./tabsDemo";

export default async function GaleriaPage(props: {
  searchParams?: Promise<{
    category?: string;
  }>;
}) {
  const searchparams = await props.searchParams;
  const query = searchparams?.category || "available";
  const arts = await getArtworks(query);

  console.log(`los art work with filter ${query}`, arts);

  return (
    <>
      <h1>Galeria PAge</h1>
      <TabsDemo selectedTab={query}></TabsDemo>
    </>
  );
}
