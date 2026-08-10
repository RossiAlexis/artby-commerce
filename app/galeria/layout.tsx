import { SiteHeader } from "@/components/homepage/site-header";

export default function GaleriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted flex-1">
      <div style={{ viewTransitionName: "site-header" }}>
        <SiteHeader />
      </div>
      <div className="lg:px-30">{children}</div>
    </div>
  );
}
