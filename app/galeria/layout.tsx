import { SiteFooter } from "@/components/homepage/site-footer";
import { SiteHeader } from "@/components/homepage/site-header";

export default function GaleriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <div className="flex-1 lg:px-30">{children}</div>
      <SiteFooter />
    </div>
  );
}
