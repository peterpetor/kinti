import { TabBar } from "@/components/ui";

/**
 * Az alkalmazás-nézetek közös kerete: mobil-first, középre zárt max-w-md
 * tartalom, alul a lebegő üveg-TabBar (a pb-28 hagy neki helyet).
 * A (app) route-csoport nem jelenik meg az URL-ben.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* overflow-x-clip: semmi ne tudja oldalra tolni az oldalt (pl. görgő
          kategória-sor) — a belső vízszintes görgetők (overflow-x-auto) ettől
          még működnek. */}
      <div className="mx-auto min-h-dvh max-w-md overflow-x-clip pb-28">
        {children}
      </div>
      <TabBar />
    </>
  );
}
