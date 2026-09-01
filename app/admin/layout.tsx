import Link from "next/link";
import { signOut } from "@/auth";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { requireAdminPage } from "@/lib/auth/require-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage("/admin/artworks");

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f2ef] md:flex-row">
      <div className="flex h-14 shrink-0 items-center justify-between bg-[#1c1917] px-5 md:hidden">
        <Link
          href="/admin/artworks"
          className="font-serif text-lg font-medium text-[#fdf9f4]"
        >
          Art by Vero Miller
        </Link>
        <AdminMobileNav onSignOut={handleSignOut} />
      </div>
      <aside className="hidden w-60 shrink-0 flex-col bg-[#1c1917] px-7 py-9 md:flex">
        <Link
          href="/admin/artworks"
          className="font-serif text-xl font-medium text-[#fdf9f4]"
        >
          Art by Vero Miller
        </Link>
        <div className="mt-5 h-px bg-white/10" />
        <AdminSidebarNav />
        <form action={handleSignOut} className="mt-auto">
          <button
            type="submit"
            className="rounded-md px-3 py-2 text-xs text-[#fdf9f4]/50 hover:text-[#fdf9f4] hover:underline"
          >
            Cerrar sesión
          </button>
        </form>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
