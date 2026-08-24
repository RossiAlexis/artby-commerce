import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { getSiteSettings } from "@/lib/db/site-settings";

export default async function AdminSiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <div className="flex h-[72px] items-center border-b border-[#e2d8ce] bg-white px-10">
        <h1 className="text-xl font-semibold text-[#1c1917]">Mi sitio</h1>
      </div>
      <div className="px-10 py-10">
        {settings ? (
          <SiteSettingsForm settings={settings} />
        ) : (
          <p className="text-sm text-[#7c756f]">
            No hay configuración del sitio todavía — sembrá la base de datos
            antes de editar esta página.
          </p>
        )}
      </div>
    </div>
  );
}
