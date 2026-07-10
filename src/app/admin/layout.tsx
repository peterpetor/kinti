import Link from "next/link";
import { getAdminUserId } from "@/lib/admin";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

/**
 * Admin-keret: egy vékony, ragadós felső sáv MINDEN admin oldalon (a `(app)`
 * csoport TabBar-ja/menüje ide nem ér el). Bal oldalt vissza az admin
 * főoldalra, jobbra a Kijelentkezés — hogy az admin mindig ki tudjon lépni.
 *
 * A sáv CSAK adminnak renderelődik: a page-szintű notFound() a layouton BELÜL
 * jelenik meg, így e nélkül a kíváncsi látogató 404-e fölött is ott lenne az
 * admin-chrome (információ-szivárgás). A tartalom-jogosultságot továbbra is az
 * egyes oldalak kényszerítik ki (getAdminUserId → notFound).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminId = await getAdminUserId();
  return (
    <>
      {adminId && (
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface/85 px-5 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-[12px] font-extrabold uppercase tracking-wider text-accent"
          >
            Kinti Admin
          </Link>
          <AdminLogoutButton />
        </div>
      )}
      {children}
    </>
  );
}
