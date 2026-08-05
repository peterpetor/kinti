"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Icon, SegmentedControl, type IconName } from "@/components/ui";
import { cn } from "@/lib/cn";
import { HOUSING_DISCLAIMER, HOUSING_SAFETY_TIPS } from "@/lib/housing";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, getCountry } from "@/lib/countries";
import { isFeatureAvailable } from "@/lib/feature-availability";
import type { HousingListing } from "@/lib/repo-housing";
import { HousingFeed } from "./housing-feed";

/** aria-rejtett magasság-tartó helyőrző a lazy chunkokhoz (CLS-védelem). */
function box(cls: string) {
  const Placeholder = () => <div className={cls} aria-hidden />;
  return Placeholder;
}

// A Lakbér-kalkulátor TELJES lánca (RentCostCalculator + RentCompare +
// lib/rent-cost adat, ~1000 sor kliens-kód) CSAK a Kalkulátor-fülön kell —
// az alapfül (Börze) látogatója sosem látja. Lazy chunk: fül-váltáskor
// (vagy ?tab=kalkulator mély-linknél mount után) töltődik be. A memória-
// szabály (interaktív eszköz teljes adata a kliensen = valós UX-igény)
// TELJESÜL: az adat a kalkulátor chunkjában marad, csak nem a Börze-fül
// kezdeti bundle-jét terheli.
/**
 * ⚠️ SAJÁT `<Suspense>` HATÁR MINDEN `ssr: false`-HOZ. A bailout különben a
 * legközelebbi határig kúszik fel — itt a route-szintűig —, és a teljes lap
 * kliens-renderre esik. A `loading:` erre NEM elég (mérve).
 */
function hatarral<P extends object>(C: React.ComponentType<P>, Fallback: () => JSX.Element) {
  const Wrapped = (props: P) => (
    <Suspense fallback={<Fallback />}>
      <C {...props} />
    </Suspense>
  );
  Wrapped.displayName = "Hatarral";
  return Wrapped;
}

const RentCostCalculatorLazy = hatarral(
  dynamic(
  () => import("@/components/views/rent-cost-calculator").then((m) => m.RentCostCalculator),
  { ssr: false },
),
  box("min-h-[420px]"),
);

// Link-out szekció a feed ALATT; minden linkje rel=...nofollow (nem SEO-cél)
// → az ssr:false biztonságos, a hajtás alatti helye miatt vizuálisan ingyenes.
const HousingSourcesSectionLazy = hatarral(
  dynamic(
  () => import("@/components/views/housing-sources-section").then((m) => m.HousingSourcesSection),
  { ssr: false },
),
  box("min-h-[180px]"),
);

export type PiacterTab = "borze" | "kalkulator" | "koltoztetes";

const TABS: { id: PiacterTab; label: string; icon: IconName }[] = [
  { id: "borze", label: "Börze", icon: "house" },
  { id: "kalkulator", label: "Lakbér-kalkulátor", icon: "sliders" },
  { id: "koltoztetes", label: "Költöztetés", icon: "truck" },
];

/**
 * Kurált költözés-tippek — a Költöztetés-fül lenyitható tanács-doboza.
 *
 * ⚠️ EZ KORÁBBAN EGY LAPOS TÖMB VOLT, benne a „Sok NÉMET és SVÁJCI városban…
 * Halteverbot" és a „Svájcba vagy Svájcból… vámkezelés" ponttal — ORSZÁGTÓL
 * FÜGGETLENÜL. Az angol felhasználó tehát a „PIACTÉR · ANGLIA" fejléc alatt
 * svájci-német tanácsot kapott. (Ez az app legdrágább hibaosztálya: a
 * hallgatólagos ország-default. A fix MINDIG TÁBLA — így egy 7. ország
 * felvételekor a hiányzó sor azonnal látszik, nem némán CH-t örököl.)
 */
const MOVING_TIPS_KOZOS: string[] = [
  "Foglalj időben: hónap végére és hétvégére a költöztetők hetekkel előre betelnek.",
  "Kérj írásos, fix árat több cégtől — az órabéres elszámolás könnyen elszalad.",
  "Kérdezz rá a szállítmány-biztosításra: enélkül a sérült bútor a te károd.",
];

/**
 * Ország-specifikus tipp: a teherautó helyfoglalása. Mindenhol létezik, de más
 * a neve és MÁS HATÓSÁG adja — ez a tipp actionable része.
 */
const MOVING_TIPS_ORSZAG: Record<string, string[]> = {
  CH: [
    "A teherautóhoz ideiglenes megállási tilalmat (Halteverbot) kell kérni a várostól/községtől — intézd el pár nappal előre.",
  ],
  AT: [
    "A teherautóhoz Halteverbotszonét kell igényelni a városnál (Bécsben a kerületi Magistratisches Bezirksamtnál) — pár nappal előre.",
  ],
  DE: [
    "A teherautóhoz Halteverbotszonét kell igényelni a városnál (Straßenverkehrsbehörde), vagy a költöztető cég intézi — pár nappal előre.",
  ],
  NL: [
    "A teherautó vagy a bútorlift utcai helyfoglalásához a gemeenténél kell engedélyt kérni — nézd meg a saját városod oldalán.",
  ],
  GB: [
    "A teherautó elé parkolóhely-felfüggesztést (parking bay suspension) a helyi councilnál kell kérni — általában több munkanappal előre, díj ellenében.",
  ],
  ES: [
    "A teherautó elé a helyfoglalást (reserva de estacionamiento) az ayuntamientónál kell kérni — a szabályok városonként eltérnek.",
  ],
};

/** Az adott ország tippjei. A hiányzó ország-sor NEM örököl csendben CH-t. */
function movingTips(country: string): string[] {
  return [...MOVING_TIPS_KOZOS, ...(MOVING_TIPS_ORSZAG[country] ?? [])];
}

/**
 * A közigazgatási egység „-onként" alakja a lábjegyzethez.
 *
 * ⚠️ TÁBLA, NEM TOLDALÉKOLÁS. A `regionWord(country) + "onként"` magyartalan
 * alakokat adna („provinciaonként", „régioonként") — a magánhangzó-harmónia
 * miatt ezt nem lehet ragasztással megoldani.
 */
const REGIO_ONKENT: Record<string, string> = {
  CH: "kantononként",
  AT: "tartományonként",
  DE: "tartományonként",
  NL: "provinciánként",
  GB: "régiónként",
  ES: "régiónként",
};

/** A Költöztetés-fül gyorslinkjei — mind MEGLÉVŐ funkcióra mutat
 *  (csoportos ajánlatkérés, Keresek-tábla, Szaknévsor), új backend nincs. */
const MOVING_LINKS: { href: string; icon: IconName; title: string; subtitle: string }[] = [
  {
    href: "/szaknevsor/ajanlatkeres?cat=futas",
    icon: "send",
    title: "Kérj árajánlatot költöztetőktől",
    subtitle: "Egy űrlap — a környéked magyar fuvarozói keresnek meg téged.",
  },
  {
    href: "/keresek",
    icon: "box",
    title: "Írd ki a Keresek-táblára",
    subtitle: "Add fel „Költöztetés / fuvar” kategóriában, mit keresel — a vállalkozók jelentkeznek.",
  },
  {
    href: "/szaknevsor?cat=futas",
    icon: "truck",
    title: "Magyar fuvarozók a Szaknévsorban",
    subtitle: "Böngéssz a fuvarozás-kategóriában, és hívd őket közvetlenül.",
  },
];

/**
 * A Piactér fülei. A fül-váltás kliensoldali (nincs újratöltés); a ?tab= a
 * címsorban szinkronban marad (megosztható / vissza-gombbal járható), a
 * kezdő fület a szerver adja (searchParams). A Börze a teljes korábbi
 * /szallas-borze; a Költöztetés a meglévő lead-motorokat csatornázó hub.
 */
export function PiacterTabs({
  initialTab,
  listings,
  isPro,
  signedIn,
}: {
  initialTab: PiacterTab;
  listings: HousingListing[];
  isPro: boolean;
  signedIn: boolean;
}) {
  const [tab, setTab] = useState<PiacterTab>(initialTab);
  // ⚠️ A költözés-tippek ORSZÁG-FÜGGŐK (Halteverbot vs. council suspension vs.
  // ayuntamiento), és a vám csak EU-n kívülre igaz. Enélkül az angol
  // felhasználó svájci tanácsot kapott a saját ország-fejléce alatt.
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const countryName = getCountry(country)?.name ?? "Az ország";
  const regioSzo = REGIO_ONKENT[country] ?? "régiónként";

  const switchTab = (t: PiacterTab) => {
    setTab(t);
    try {
      const url = t === "borze" ? window.location.pathname : `${window.location.pathname}?tab=${t}`;
      window.history.replaceState(null, "", url);
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      <SegmentedControl
        options={TABS}
        value={tab}
        onChange={switchTab}
        ariaLabel="Piactér-nézetek"
      />

      {tab === "borze" && (
        <div className="space-y-4">
          <p className="text-[13px] leading-snug text-ink-muted">
            Kiadó szobák és albérletek a kinti magyar közösségtől — vagy add fel, mit keresel.
            A hirdetők közvetlenül egymással egyeznek meg.
          </p>
          {/* Jogi tájékoztató (safe harbor) — halvány, de mindig látható. */}
          <div className="rounded-card border border-line bg-surface-alt/60 p-3">
            <p className="text-[11px] leading-relaxed text-ink-faint">{HOUSING_DISCLAIMER}</p>
          </div>
          {/* Kaució-csalás elleni tippek — a lakhatási hirdetés a leggyakoribb
              csalás-terep; lenyitható, hogy ne nyomja el a listát, de mindig ott van. */}
          <details className="group rounded-card border border-star/30 bg-star/5 p-3">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[12.5px] font-extrabold text-ink [&::-webkit-details-marker]:hidden">
              <Icon name="alert" size={14} strokeWidth={2.2} className="shrink-0 text-star-ink" /> Így ismerd fel a kaució-csalást
              <Icon name="chevD" size={14} strokeWidth={2.4} className="ml-auto shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-2 space-y-1.5">
              {HOUSING_SAFETY_TIPS.map((tip) => (
                <li key={tip} className="flex gap-1.5 text-[11.5px] leading-snug text-ink-muted">
                  <span className="shrink-0" aria-hidden>•</span> {tip}
                </li>
              ))}
            </ul>
          </details>
          <HousingFeed listings={listings} isPro={isPro} signedIn={signedIn} />
          {/* Link-out a fő portálokra — a börze így sosem „üres" (jogtiszta:
              csak kilinkelünk, idegen hirdetést nem tárolunk/mutatunk —
              részletek a lib/housing-sources fejlécében). */}
          <HousingSourcesSectionLazy />
        </div>
      )}

      {tab === "kalkulator" && (
        <div className="space-y-4">
          <p className="text-[13px] leading-snug text-ink-muted">
            Mielőtt aláírod a bérleti szerződést: kaució, rezsi és az év végi elszámolás
            várható költségei — országra szabva.
          </p>
          <RentCostCalculatorLazy />
        </div>
      )}

      {tab === "koltoztetes" && (
        <div className="space-y-4">
          <p className="text-[13px] leading-snug text-ink-muted">
            Költözöl? Itt kérhetsz segítséget: magyar költöztetők adnak árajánlatot,
            vagy kiírhatod a Keresek-táblára, mire van szükséged.
          </p>

          {MOVING_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-primary-ink"><Icon name={l.icon} size={17} strokeWidth={2.1} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">{l.title}</span>
                <span className="block text-[11.5px] leading-snug text-ink-muted">{l.subtitle}</span>
              </span>
              <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-ink-faint" />
            </Link>
          ))}

          {/* Kurált tanácsok — lenyitható, hogy ne nyomja el a cselekvés-kártyákat. */}
          <details className="group rounded-card border border-line bg-surface-alt/60 p-3">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[12.5px] font-extrabold text-ink [&::-webkit-details-marker]:hidden">
              <Icon name="lightbulb" size={14} strokeWidth={2.2} className="shrink-0 text-primary-ink" /> Költözés okosan — a legfontosabb tudnivalók
              <Icon name="chevD" size={14} strokeWidth={2.4} className="ml-auto shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-2 space-y-1.5">
              {movingTips(country).map((tip) => (
                <li key={tip} className="flex gap-1.5 text-[11.5px] leading-snug text-ink-muted">
                  <span className="shrink-0" aria-hidden>•</span> {tip}
                </li>
              ))}
              {/* ⚠️ Vám CSAK ott, ahol tényleg van vámhatár Magyarország felé.
                  A döntést a projekt SAJÁT táblája adja (isFeatureAvailable
                  „vam" = CH + GB), nem külön feltevés — így nem csúszhat el
                  attól, amit a vám-kalauz maga állít. */}
              {isFeatureAvailable("vam", country) && (
                <li className="flex gap-1.5 text-[11.5px] leading-snug text-ink-muted">
                  <span className="shrink-0" aria-hidden>•</span>
                  <span>
                    {countryName} EU-n kívül van, ezért a holmid vámkezelést igényelhet —{" "}
                    <Link href="/tudasbazis/vam" className="font-bold text-primary-ink underline">nézd meg a vám-kalauzt</Link>.
                  </span>
                </li>
              )}
            </ul>
            <p className="mt-2 text-[10.5px] leading-snug text-ink-faint">
              A tippek tájékoztató jellegűek, nem minősülnek jogi tanácsadásnak — a pontos
              szabályok városonként és {regioSzo} eltérhetnek.
            </p>
          </details>
        </div>
      )}
    </div>
  );
}
