import { AboutArtist } from "@/components/homepage/about-artist";
import { FeaturedArtworks } from "@/components/homepage/featured-artworks";
import { HeroSection } from "@/components/homepage/hero-section";
import { ScrollToHash } from "@/components/homepage/scroll-to-hash";
import { SiteFooter } from "@/components/homepage/site-footer";
import { SiteHeader } from "@/components/homepage/site-header";
import { VipListSection } from "@/components/homepage/vip-list-section";
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
    <main className="flex min-h-full flex-1 flex-col">
      <ScrollToHash />
      <SiteHeader />
      <div className="flex-1">
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
        <VipListSection />
      </div>
      <SiteFooter />
    </main>
  );
}
