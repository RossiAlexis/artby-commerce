import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { DirectContactCard } from "@/components/contact/direct-contact-card";
import { SiteFooter } from "@/components/homepage/site-footer";
import { SiteHeader } from "@/components/homepage/site-header";
import { getSiteSettings } from "@/lib/db/site-settings";

export const metadata: Metadata = {
  title: "Contacto — Art by Vero Miller",
};

export default async function ContactoPage() {
  const settings = await getSiteSettings();

  return (
    <main>
      <SiteHeader />
      <div className="flex flex-col gap-12 px-6 py-14 md:px-10 lg:flex-row lg:gap-20 lg:px-30 lg:py-16">
        <ContactForm />
        <div className="lg:pt-[4.375rem]">
          <DirectContactCard
            contactEmail={settings?.contactInfo.email}
            instagramUrl={settings?.socialLinks.instagram}
          />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
