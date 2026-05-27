import { TabBar } from "@/components/ui";
import { GlobalSosButton } from "@/components/views/global-sos-button";

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
      </div>
      <GlobalSosButton />
      <TabBar />
    </>
  );
}
