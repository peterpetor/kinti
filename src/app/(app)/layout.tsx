import { TabBar, ToastHost, ConfirmHost } from "@/components/ui";
import { CountryGate } from "@/components/country-gate";
import { CountryBanner } from "@/components/country-banner";
import { ScrollRestorer } from "@/components/page-transition";
import { AppMain } from "@/components/app-main";
import { UsageTracker } from "@/components/usage-tracker";
import { GlobalSearchOverlayLazy } from "@/components/global-search-lazy";

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
          még működnek. A nav-rezerv padding immerzív lecke-nézetben elmarad. */}
      <AppMain>{children}</AppMain>
      <TabBar />
      {/* Globális toast-sín (lib/toast.ts) — vágólap-másolás és egyéb rövid
          megerősítések egységes helye, a TabBar fölött. */}
      <ToastHost />
      {/* Natív-stílusú megerősítő-dialógus (lib/confirm.ts) — a nyers böngésző-
          confirm() helyett, egységes megjelenéssel és haptikával. */}
      <ConfirmHost />
      {/* Tab-szintű scroll-pozíció megőrzés (natív tab-bar viselkedés). */}
      <ScrollRestorer />
      {/* Privacy-first oldal-használat mérés (aggregált, azonosító nélkül). */}
      <UsageTracker />
      {/* Mindenkereső (command palette) — bármely oldalról: Ctrl/⌘+K, „/",
          vagy a fejléc keresés-gombja (kinti:open-global-search esemény).
          LAZY: külön chunk, a kezdő render után töltődik (first-load spórolás). */}
      <GlobalSearchOverlayLazy />
      {/* Őszinte „Hamarosan" sáv, ha nem-CH ország van kiválasztva. */}
      <CountryBanner />
      {/* Belépés előtti ország-választó (csak ha még nincs választott ország). */}
      <CountryGate />
    </>
  );
}
