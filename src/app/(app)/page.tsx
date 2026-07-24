import Link from "next/link";
import {
  Icon,
  KintiLogo,
  SectionHeader,
  DropdownMenu,
} from "@/components/ui";
// FENT MARADÓ (eager, first paint fölött): fejléc + hero-zóna.
import { HomeCountryFlag, HomePrimaryActions, HomeChCards } from "@/components/home-country-aware";
import { GlobalSearch } from "@/components/global-search";
import { KintiAssistant } from "@/components/kinti-assistant";
import { HomeGreeting } from "@/components/home-greeting";
import { TrustBar } from "@/components/trust-bar";
// HAJTÁS ALATTI / feltételes komponensek — LAZY chunk (ld. home-lazy.tsx), hogy
// ne terheljék a kezdőlap első bundle-jét (231 kB → mérve kevesebb).
import {
  MyPostsBannerLazy,
  ReviewFollowupCardLazy,
  RelocationReminderBannerLazy,
  PersonalizedHomeLazy,
  OnboardingChecklistLazy,
  DailyStreakLazy,
  HomeWidgetsSectionLazy,
  NearbyBusinessesLazy,
  HomePlatformGridLazy,
  ReferralHomeCardLazy,
  NewsletterCtaCardLazy,
  PwaInstallCardLazy,
} from "@/components/home-lazy";
import { getBusinessesForList, countOpenB2bProjects } from "@/lib/repo";
import { cached } from "@/lib/edge-cache";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function FeedPage() {
  // Karcsú vetület + saját (3 perces) cache a repóban — a /szaknevsor oldallal
  // KÖZÖS kulcson, így a két oldal TTL-enként EGYSZER megy D1-re.
  // A B2B nyitott-projekt szám 5 percig cache-elt (élő badge a rácson,
  // TTL-enként egy skalár-query — nem terheli a főoldal-rendert).
  const [allBusinesses, b2bOpenCount] = await Promise.all([
    getBusinessesForList(),
    cached("home:b2b-open", 300_000, () => countOpenB2bProjects()),
  ]);
  // „A közeledben" — PAYLOAD-DIÉTA: a szerver csak a fallback-kártyákat adja át
  // (3/ország, ≤12 rekord ≈ pár KB). Korábban 200 TELJES rekord ment az RSC-be
  // (~200 KB), miközben a kártya 3-at mutat. GPS-engedély után a kliens a teljes
  // listát a cache-elt /api/businesses/list-ből kéri (jobb "legközelebbi" is:
  // teljes pool a 200-as szelet helyett). A lista featured→rating rendezett, így
  // az országonkénti első 3 = a fallback-nézet top-3-a.
  const nearbyPerCountry = new Map<string, number>();
  const nearby = allBusinesses.filter((b) => {
    if (b.lat == null || b.lng == null) return false;
    const c = b.country ?? "CH";
    const n = (nearbyPerCountry.get(c) ?? 0) + 1;
    nearbyPerCountry.set(c, n);
    return n <= 3;
  });

  return (
    <>
      <div className="space-y-6 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <KintiLogo size={28} />
          <span className="text-[22px] font-extrabold tracking-tight text-ink">Kinti</span>
          <HomeCountryFlag />
        </div>
        <div className="flex-1" />
        <GlobalSearch />
        <DropdownMenu />
      </header>

      {/* Napszak-köszöntés — natív app melegség, fix magasság (CLS-mentes). */}
      <HomeGreeting />

      {/* ── 1. STÁTUSZ-SÁV: kontextuális bannerek (többnyire null-t adnak,
          csak akkor jelennek meg, ha VAN mondanivalójuk — így elöl állhatnak
          anélkül, hogy a hétköznapi nyitóképet terhelnék). ─────────────────── */}
      <MyPostsBannerLazy />
      {/* Hívás-utáni vélemény-kérő (2 óra – 14 nap ablak, cégenként egyszer). */}
      <ReviewFollowupCardLazy />
      <RelocationReminderBannerLazy />

      {/* ── 2. HERO: az asszisztens a nyitó-elem — „mi a kérdésed?" a
          legerősebb belépő (irányít, nem tanácsol). ─────────────────────────── */}
      <KintiAssistant />

      {/* ── 3. FŐ CÉLOK — a 4 nagy cselekvés még az első képernyőn. ────────── */}
      <section className="space-y-3">
        <SectionHeader>Mit szeretnél?</SectionHeader>
        <HomePrimaryActions />
      </section>

      {/* ⚠️ IDEIGLENES KAMPÁNY-ELHELYEZÉS (2026-07-24, piacra lépési terv):
          a "Küldj egy magyart" ajánló-kártya normál helye a 8. szekció volt
          (LENT, a teljes katalógus után) — ez a Főoldal-ív dokumentált,
          szándékos sorrendje (ld. design-system-notes memória). Erre a ~2
          hetes növekedési kampányra IDE hozva előre (a lenti 8. szekcióból
          a hívás KIVÉVE, nincs duplikáció), hogy tényleges megosztás induljon
          a Facebook-csoportokban. HA A KAMPÁNY LEZÁRULT: told vissza ezt a
          hívást a 8. szekcióba (NÖVEKEDÉS blokk, a Hírlevél-kártya elé). */}
      <ReferralHomeCardLazy />

      {/* ── 4. SZEMÉLYES RÉTEG: rád-hangolt ajánló + aktivációs checklist —
          a cselekvő-zóna UTÁN (nem tolja le a fő célokat), de még elöl. ─────── */}
      <PersonalizedHomeLazy />
      <OnboardingChecklistLazy />

      {/* ── 5. NAPI RITMUS: sorozat + testreszabható napi widgetek — a
          visszatérés-motorok egy blokkban. ──────────────────────────────────── */}
      <DailyStreakLazy />
      <HomeWidgetsSectionLazy />

      {/* ── 6. FELFEDEZÉS: a környék + a két nagy belépő-kártya. ───────────── */}
      <section className="space-y-3">
        <SectionHeader
          right={
            <Link href="/szaknevsor" className="text-[13px] font-bold text-primary">
              Mind ›
            </Link>
          }
        >
          A közeledben
        </SectionHeader>
        <NearbyBusinessesLazy businesses={nearby} />
      </section>

      <HomeChCards />

      {/* ── 7. TELJES KATALÓGUS — a 27-csempés modul-térkép a böngészőknek;
          lentebb a helye, mint a cselekvő-zónának (a gyakori célok fent vannak,
          a menü-szűrő és a kereső is odavisz). ──────────────────────────────── */}
      <HomePlatformGridLazy b2bOpenCount={b2bOpenCount} />

      {/* ── 8. NÖVEKEDÉS: hírlevél, telepítés, bizalom. (A meghívó-kártya
          IDEIGLENESEN feljebb költözött — ld. a fenti kampány-jegyzetet.) ──── */}
      <NewsletterCtaCardLazy />
      <PwaInstallCardLazy />
      <TrustBar />
      </div>
    </>
  );
}

