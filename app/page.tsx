import { AboutArtist } from "@/components/homepage/about-artist";
import { FeaturedArtworks } from "@/components/homepage/featured-artworks";
import { HeroSection } from "@/components/homepage/hero-section";
import { SiteFooter } from "@/components/homepage/site-footer";
import { SiteHeader } from "@/components/homepage/site-header";
import { getFeaturedArtworks } from "@/lib/db/artworks";
import { getSiteSettings } from "@/lib/db/site-settings";

export default async function Home() {
  const [settings, featuredArtworks] = await Promise.all([
    getSiteSettings(),
    getFeaturedArtworks(),
  ]);

  if (!settings) {
    return null;
  }

  return (
    <main>
      <SiteHeader />
      <HeroSection
        coverImageUrl={settings.coverImageUrl}
        heroTagline={settings.heroTagline}
      />
      <div className="lg:px-30">
        <FeaturedArtworks artworks={featuredArtworks} />
        <AboutArtist
          aboutImageUrl={settings.aboutImageUrl}
          aboutTitle={settings.aboutTitle}
          aboutDescription={settings.aboutDescription}
        />
      </div>
      <SiteFooter />
    </main>
  );
}
