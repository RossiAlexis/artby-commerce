import Link from "next/link";
import { signOut } from "@/auth";
import { requireAdminPage } from "@/lib/auth/require-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage("/admin/artworks");

  return (
    <div className="bg-muted min-h-screen">
      <header className="border-border bg-background flex items-center justify-between border-b px-6 py-4">
        <Link href="/admin/artworks" className="font-heading text-lg">
          Admin
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="text-muted-foreground text-xs hover:underline"
          >
            Sign out
          </button>
        </form>
      </header>
      <div className="px-6 py-8 md:px-10">{children}</div>
    </div>
  );
}
