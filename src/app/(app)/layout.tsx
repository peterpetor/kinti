import Link from "next/link";
import { TabBar } from "@/components/ui";

/**
 * Az alkalmazás-nézetek közös kerete: mobil-first, középre zárt max-w-md
 * tartalom, alul a lebegő üveg-TabBar (a pb-28 hagy neki helyet).
 * A (app) route-csoport nem jelenik meg az URL-ben.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mx-auto min-h-dvh max-w-md pb-28">
        {children}

        {/* Diszkrét lábléc a jogi oldalakhoz — a pb-28 fölötti tér végén */}
        <footer className="mt-10 px-5 pb-2 text-center text-[11px] text-ink-faint">
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link href="/impresszum" className="hover:text-ink-muted">Impresszum</Link>
            <Link href="/adatvedelem" className="hover:text-ink-muted">Adatvédelem</Link>
            <Link href="/aszf" className="hover:text-ink-muted">ÁSZF</Link>
            <a href="mailto:abuse@kinti.app" className="hover:text-ink-muted">
              Visszaélés-bejelentés
            </a>
          </nav>
          <p className="mt-2 text-ink-faint">
            Közösségi projekt · {new Date().getFullYear()}
          </p>
        </footer>
      </div>
      <TabBar />
    </>
  );
}
