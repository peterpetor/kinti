/**
 * personalize.ts — a kezdőlapi „Személyre szabott irányítópult" TISZTA logikája.
 *
 * Két gyors kérdés (mióta vagy kint? + mi a fő kihívásod?) → determinisztikus,
 * KURÁLT ajánló-lista a meglévő modulokból. A válaszok KIZÁRÓLAG kliensoldalon
 * (localStorage) élnek — a szerver nem tud a felhasználóról (privacy-elv).
 *
 * Ez a modul környezet-független (nincs window): a komponens adja a jeleket,
 * itt csak a döntés él → unit-tesztelhető. A guide-slugokat a teszt validálja
 * a guides.ts ellen (ide szándékosan NEM importáljuk a 81 cikkes bankot —
 * kliens-bundle-méret).
 */

import { countryLocative } from "./countries";

export type PersonalizeStage = "planning" | "fresh" | "settled";
export type PersonalizeFocus = "munka" | "papirmunka" | "penzugy" | "szakember" | "nyelv";

export interface PersonalizeProfile {
  v: 1;
  stage: PersonalizeStage;
  focus: PersonalizeFocus;
}

export const PERSONALIZE_KEY = "kinti.personalize";
export const PERSONALIZE_DISMISS_KEY = "kinti.personalize.dismissed";

export const STAGE_OPTIONS: readonly { id: PersonalizeStage; emoji: string; label: string }[] = [
  { id: "planning", emoji: "🧳", label: "Még csak tervezem a kiköltözést" },
  { id: "fresh", emoji: "🌱", label: "Frissen érkeztem (1 éven belül)" },
  { id: "settled", emoji: "🏡", label: "Régóta kint élek" },
] as const;

export const FOCUS_OPTIONS: readonly { id: PersonalizeFocus; emoji: string; label: string }[] = [
  { id: "munka", emoji: "💼", label: "Munkakeresés" },
  { id: "papirmunka", emoji: "📋", label: "Papírmunka, hivatalok" },
  { id: "penzugy", emoji: "💰", label: "Pénzügyek" },
  { id: "szakember", emoji: "🔧", label: "Magyar szakember, közösség" },
  { id: "nyelv", emoji: "🗣️", label: "Nyelvtanulás" },
] as const;

const STAGE_IDS = new Set(STAGE_OPTIONS.map((o) => o.id));
const FOCUS_IDS = new Set(FOCUS_OPTIONS.map((o) => o.id));

/** Biztonságos profil-parse a localStorage nyers értékéből (rossz adat → null). */
export function parsePersonalizeProfile(raw: string | null): PersonalizeProfile | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<PersonalizeProfile>;
    if (
      p &&
      p.v === 1 &&
      typeof p.stage === "string" && STAGE_IDS.has(p.stage as PersonalizeStage) &&
      typeof p.focus === "string" && FOCUS_IDS.has(p.focus as PersonalizeFocus)
    ) {
      return { v: 1, stage: p.stage as PersonalizeStage, focus: p.focus as PersonalizeFocus };
    }
  } catch {
    /* sérült érték → nincs profil */
  }
  return null;
}

export interface PersonalItem {
  emoji: string;
  title: string;
  desc: string;
  href: string;
}

/**
 * Tudásbázis-slugok témánként, országonként — a tesztek a guides.ts GUIDES
 * bankja ellen validálják mindet (elgépelés/kivezetés build előtt bukik).
 */
export const PERSONALIZE_GUIDE_SLUGS: Record<string, Record<string, string>> = {
  bejelentkezes: {
    CH: "bejelentkezes-letelepedes",
    AT: "at-bejelentkezes",
    DE: "de-bejelentkezes",
    NL: "nl-bejelentkezes",
  },
  egeszsegbiztositas: {
    CH: "egeszsegbiztositas-krankenkasse",
    AT: "at-egeszsegbiztositas",
    DE: "de-egeszsegbiztositas",
    NL: "nl-egeszsegbiztositas",
  },
  bankszamla: {
    CH: "bankszamla",
    AT: "at-bankszamla",
    DE: "de-bankszamla",
    NL: "nl-bankszamla",
  },
  munkavallalas: {
    CH: "munkavallalas",
    AT: "at-munkavallalas",
    DE: "de-munkavallalas",
    NL: "nl-munkavallalas",
  },
};

function guideItem(topic: keyof typeof PERSONALIZE_GUIDE_SLUGS, country: string, emoji: string, title: string, desc: string): PersonalItem {
  const slugs = PERSONALIZE_GUIDE_SLUGS[topic];
  const slug = slugs[country] ?? slugs.CH;
  return { emoji, title, desc, href: `/tudasbazis/${slug}` };
}

const MAX_ITEMS = 4;

/**
 * A rád-hangolt gyorslinkek: a fókusz adja a törzset, az életszakasz hangolja
 * (tervező → Kiköltözési teendőlista elöl; friss → bejelentkezés-cikk elöl; régóta
 * kint → Kinti Pass a végén). Href-dedup + max 4 elem. Minden cél MEGLÉVŐ
 * modul — a lista kurált, nem generált (ai-content-accuracy elv).
 */
export function buildPersonalizedItems(
  country: string,
  stage: PersonalizeStage,
  focus: PersonalizeFocus,
): PersonalItem[] {
  const inCountry = countryLocative(country); // pl. „Ausztriában"

  const byFocus: Record<PersonalizeFocus, PersonalItem[]> = {
    munka: [
      { emoji: "💼", title: `Állások ${inCountry}`, desc: "Magyar nyelvű hirdetések + heti válogatás", href: "/allasok" },
      // A német CV a német nyelvterületre való — NL-ben nem ajánljuk.
      ...(country === "NL" ? [] : [{ emoji: "📄", title: "Német önéletrajz-készítő", desc: "DIN-szabványos PDF magyarul kitöltve, ingyen", href: "/nemet-oneletrajz" }]),
      { emoji: "🧮", title: "Bérkalkulátor", desc: "Bruttó → nettó: mennyit ér az ajánlat?", href: "/berkalkulator" },
      guideItem("munkavallalas", country, "📖", "Munkavállalás — a tudnivalók", "Szerződés, próbaidő, jogaid — hivatalos forrásból"),
    ],
    papirmunka: [
      guideItem("bejelentkezes", country, "🏛️", "Bejelentkezés lépésről lépésre", "Az első és legfontosabb hivatali kör"),
      { emoji: "🔗", title: "Ügyintézés — hivatalos linkek", desc: "A fontos hivatalok egy helyen, magyar magyarázattal", href: "/ugyintezes" },
      guideItem("egeszsegbiztositas", country, "🏥", "Egészségbiztosítás", "Kötelező kör — így nem fizetsz rá"),
      { emoji: "⏰", title: "Határidő-asszisztens", desc: "Push-emlékeztető, hogy ne csússz le semmiről", href: "/hatarido" },
    ],
    penzugy: [
      { emoji: "💶", title: "Mennyi marad? — tervező", desc: "Bér és megélhetés együtt, a te számaiddal", href: "/berkalkulator" },
      { emoji: "💱", title: "Árfolyam + hazautalás", desc: "Melyik szolgáltatóval jár a legtöbb forint?", href: "/utalas" },
      guideItem("bankszamla", country, "🏦", "Bankszámlanyitás", "Mi kell hozzá, mire figyelj — hivatalos forrásból"),
      { emoji: "🧭", title: "Iránytű — árak és bérek", desc: "Mennyibe kerül az élet nálatok? Közösségi adatok", href: "/iranytu" },
    ],
    szakember: [
      { emoji: "🔧", title: "Magyar Szaknévsor", desc: "Magyar szakemberek és szolgáltatók a környékeden", href: "/szaknevsor" },
      { emoji: "📣", title: "Keresek — add fel, mit keresel", desc: "Fordítsd meg: a szakik jelentkeznek nálad", href: "/keresek" },
      { emoji: "💳", title: "Kinti Pass — kedvezmények", desc: "Mutasd fel a kártyát magyar helyeken", href: "/profil/kinti-pass" },
    ],
    nyelv: [
      { emoji: "🗣️", title: "Nyelvlecke — teljesen ingyenes", desc: "Napi gyakorlás kiejtéssel, mind a 4 országra", href: "/nyelvlecke" },
      { emoji: "🎯", title: "Napi kvíz + napi szó", desc: "5 kérdés naponta — tartsd a sorozatod", href: "/kviz" },
      { emoji: "📚", title: "Szakmai szótár", desc: "A szakmád kifejezései helyi nyelven, kiejtéssel", href: "/allasok/szakmai-szotar" },
    ],
  };

  let items = [...byFocus[focus]];

  if (stage === "planning") {
    items.unshift({ emoji: "✈️", title: "Kiköltözési teendőlista", desc: "Lépésről-lépésre teendők az indulásig", href: "/tudasbazis/kikoltozes" });
    // Tervezőnek a „mennyiből jövök ki kint?" az első pénz-kérdés — fókusztól függetlenül.
    if (focus !== "penzugy") {
      items.splice(2, 0, { emoji: "💶", title: "Mennyi marad? — tervező", desc: "Kinti bér és megélhetés még indulás előtt", href: "/berkalkulator" });
    }
  } else if (stage === "fresh") {
    items.unshift(guideItem("bejelentkezes", country, "🏛️", "Bejelentkezés lépésről lépésre", "Az első hetek legfontosabb hivatali köre"));
  } else {
    // Régóta kint: a napi-visszatérős értékek kerülnek előrébb a lista végén.
    items.push({ emoji: "💳", title: "Kinti Pass — kedvezmények", desc: "Mutasd fel a kártyát magyar helyeken", href: "/profil/kinti-pass" });
  }

  // Href-dedup (az első előfordulás nyer — a stage-hangolás elsőbbsége) + plafon.
  const seen = new Set<string>();
  items = items.filter((it) => {
    if (seen.has(it.href)) return false;
    seen.add(it.href);
    return true;
  });
  return items.slice(0, MAX_ITEMS);
}
