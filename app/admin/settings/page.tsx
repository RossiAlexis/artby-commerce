import { ShopSettingsForm } from "@/components/admin/shop-settings-form";
import { getSiteSettings } from "@/lib/db/site-settings";
import { instagramHandleFromUrl } from "@/lib/shop-settings";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  const primaryLanguage = settings?.primaryLanguage === "en" ? "en" : "es";

  return (
    <div>
      <div className="flex h-[72px] items-center border-b border-[#e2d8ce] bg-white px-10">
        <h1 className="text-xl font-semibold text-[#1c1917]">Ajustes</h1>
      </div>
      <div className="px-10 py-10">
        {settings ? (
          <ShopSettingsForm
            initial={{
              notificationEmail:
                settings.notificationEmail ?? process.env.ADMIN_EMAIL ?? "",
              shippingOrigin: settings.shippingOrigin,
              shippingInsuranceIncluded: settings.shippingInsuranceIncluded,
              freeShippingOver500: settings.freeShippingOver500,
              instagramHandle: instagramHandleFromUrl(
                settings.socialLinks.instagram,
              ),
              primaryLanguage,
            }}
          />
        ) : (
          <p className="text-base text-[#7c756f]">
            No hay configuración del sitio todavía — sembrá la base de datos
            antes de editar esta página.
          </p>
        )}
      </div>
    </div>
  );
}
