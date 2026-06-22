import { TabBar } from "@/components/ui";
import { CountryGate } from "@/components/country-gate";
import { CountryBanner } from "@/components/country-banner";
import { PageTransition, ScrollRestorer } from "@/components/page-transition";
import { UsageTracker } from "@/components/usage-tracker";

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
      <div className="mx-auto min-h-dvh max-w-md overflow-x-clip pb-[calc(env(safe-area-inset-bottom)+9rem)]">
        <PageTransition>{children}</PageTransition>
      </div>
      <TabBar />
      {/* Tab-szintű scroll-pozíció megőrzés (natív tab-bar viselkedés). */}
      <ScrollRestorer />
      {/* Privacy-first oldal-használat mérés (aggregált, azonosító nélkül). */}
      <UsageTracker />
      {/* Őszinte „Hamarosan" sáv, ha nem-CH ország van kiválasztva. */}
      <CountryBanner />
      {/* Belépés előtti ország-választó (csak ha még nincs választott ország). */}
      <CountryGate />
    </>
  );
}
