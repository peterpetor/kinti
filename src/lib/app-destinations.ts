/**
 * app-destinations.ts — a globális kereső „command palette" rétege.
 *
 * A fejléc-kereső eddig csak vállalkozást + eseményt talált; aki „vízum",
 * „bérkalkulátor" vagy „hazautalás" szót írt, semmit nem kapott — pedig ezek
 * létező eszközök. Ez a kurált lista teszi a keresőt navigációs paranccsá: az
 * app-eszközök/oldalak magyar kulcsszavakra (szinonimákkal) is előkerülnek.
 *
 * Kliens-oldalon, azonnal fut (nincs hálózat), a szerveres cég/esemény-kereséssel
 * PÁRHUZAMOSAN. A találat-illesztés ugyanazt az ékezet-érzéketlen fold-logikát
 * használja, mint a /api/search (lib/sql-fold), így „vizum"/„vízum", „berkalk"/
 * „bérkalk" egyaránt talál. Ország-tudatos: a nem-elérhető eszközöket (pl. a
 * CH-only vám-kalkulátor más országban) NEM listázza (isFeatureAvailable) —
 * nincs zsákutca.
 */
import type { IconName } from "@/components/ui/icons";
import { foldSearchText, tokenizeFolded } from "./sql-fold";
import { isFeatureAvailable } from "./feature-availability";

export interface AppDestination {
  href: string;
  title: string;
  /** Rövid alcím a találati sorhoz (mi ez az eszköz). */
  subtitle: string;
  /** HU kulcsszavak/szinonimák a foldolt kereséshez (a title is beleszámít). */
  keywords: string;
  icon: IconName;
  /** Opcionális feature-kulcs; ha adott, csak az elérhető országban jelenik meg. */
  feature?: string;
}

/**
 * Kurált cél-lista. A `keywords` szándékosan bőséges és köznyelvi (ahogy a
 * felhasználó gépel), nem a hivatalos elnevezés. Új eszköz felvételekor ide egy sor.
 */
export const APP_DESTINATIONS: readonly AppDestination[] = [
  { href: "/szaknevsor", title: "Szaknévsor", subtitle: "Magyar vállalkozások és szakemberek", icon: "users",
    keywords: "magyar vallalkozas szakember fodrasz orvos ugyved bolt szolgaltato ceg cegek kereso" },
  { href: "/allasok", title: "Állások", subtitle: "Magyaroknak szóló munkalehetőségek", icon: "briefcase",
    keywords: "munka allas melo job karrier munkahely allasok allaskereses" },
  { href: "/esemenyek", title: "Események", subtitle: "Magyar programok a térképen", icon: "calendar",
    keywords: "program rendezveny kozosseg talalkozo buli koncert esemeny esemenyek naptar" },
  { href: "/keresek", title: "Keresek", subtitle: "Igény-hirdetés — jelentkezzenek rád a szakik", icon: "search",
    keywords: "keresek igeny hirdetes keres kerdes szukseg" },
  { href: "/berkalkulator", title: "Bérkalkulátor", subtitle: "Nettó fizetés becslése", icon: "sliders",
    keywords: "fizetes ber netto brutto kalkulator szamologep jovedelem berkalkulator adolevonas" },
  { href: "/iranytu", title: "Iránytű", subtitle: "Mennyit keresnek mások — közösségi bér-benchmark", icon: "compass",
    keywords: "mennyit keresnek atlagber osszehasonlitas statisztika median berstatisztika iranytu benchmark" },
  { href: "/arfolyam", title: "Hazautalás / Árfolyam", subtitle: "CHF/EUR → HUF + utalási díjak", icon: "send",
    keywords: "utalas penzkuldes hazautalas forint huf arfolyam wise revolut valuta atvaltas chf eur" },
  { href: "/utalas", title: "Utalás-asszisztens", subtitle: "Banki utalás lépésről lépésre", icon: "document",
    keywords: "banki utalas iban sepa atutalas overweisung utalasi megbizas" },
  { href: "/hatarido", title: "Határidő-asszisztens", subtitle: "Emlékeztetők a fontos határidőkre", icon: "clock",
    keywords: "hatarido emlekezteto krankenkasse adobevallas felmondas naptar teendo" },
  { href: "/vizum", title: "Engedély-varázsló", subtitle: "Melyik tartózkodási státusz kell neked?", icon: "flag", feature: "vizum",
    keywords: "vizum tartozkodasi engedely letelepedes anmeldung bewilligung permit b c engedely bevandorlas" },
  { href: "/nyelvlecke", title: "Nyelvlecke", subtitle: "Helyi nyelv/dialektus napi adagban", icon: "sparkles", feature: "nyelvlecke",
    keywords: "nemet tanulas nyelv mundart dialektus nyelvlecke schwiizerdutsch hollandtanulas" },
  { href: "/kviz", title: "Napi kvíz", subtitle: "3 kérdés az országodról", icon: "star",
    keywords: "kviz jatek napi kerdes vetelkedo quiz" },
  { href: "/ugyintezes", title: "Ügyintézés", subtitle: "Csekklisták a hivatali ügyekhez", icon: "document",
    keywords: "hivatal ugyintezes papirmunka bejelentkezes regisztracio csekklista teendok" },
  { href: "/hivatalos", title: "Hivatalos linkek", subtitle: "Konzulátus, nagykövetség, hivatalok", icon: "globe",
    keywords: "hivatalos konzulatus nagykovetseg hivatal linkek kepviselet" },
  { href: "/mennyit-koltesz", title: "Mennyit költesz?", subtitle: "Közösségi megélhetési benchmark", icon: "trending",
    keywords: "megelhetes koltseg mennyibe kerul arak kiadas megelhetesi koltsegek" },
  { href: "/lakberles", title: "Lakásbérlés", subtitle: "Kaució, rezsi, tippek", icon: "home",
    keywords: "lakas alberlet lakber berles kaucio ingatlan berleti lakhatas" },
  { href: "/vam", title: "Vám-kalkulátor", subtitle: "Behozatal a svájci határon", icon: "shoppingBag", feature: "vam",
    keywords: "vam behozatal csomag import hatar zoll vamkalkulator" },
  { href: "/iskolarendszer", title: "Iskolarendszer", subtitle: "Hogyan épül fel az oktatás", icon: "bookmark",
    keywords: "iskola oktatas gyerek tanulas iskolarendszer ovoda egyetem" },
  { href: "/kozlekedes", title: "Közlekedés", subtitle: "Bérletek, jegyek, jogosítvány", icon: "car",
    keywords: "kozlekedes jogositvany auto bringa berlet jegy tomegkozlekedes vonat busz" },
  { href: "/repulojegy", title: "Repülőjegy", subtitle: "Olcsó járatok haza", icon: "nav",
    keywords: "repulojegy repjegy repulo utazas haza budapest jarat legitarsasag" },
  { href: "/tudasbazis", title: "Tudásbázis", subtitle: "Útmutatók a kinti élethez", icon: "bookmark",
    keywords: "utmutato guide tudasbazis cikk segitseg hogyan tudnivalo" },
  { href: "/allampolgarsag", title: "Állampolgársági teszt", subtitle: "Honosítási felkészítő kvíz", icon: "flag",
    keywords: "allampolgarsag honositas einburgerung teszt vizsga staatsburgerschaft inburgering" },
  { href: "/kikoltozes", title: "Kiköltözési terv", subtitle: "Személyre szabott checklist", icon: "check",
    keywords: "kikoltozes koltozes checklist teendok kikoltozesi terv kivandorlas" },
  { href: "/szolgaltato-valto", title: "Szolgáltatóváltás", subtitle: "Felmondás-segéd (telefon, internet, biztosítás)", icon: "sliders",
    keywords: "szolgaltato valtas felmondas telefon internet biztositas aram gaz kundigung" },
  { href: "/akciok", title: "Akciók", subtitle: "Boltláncok akciói a térképen", icon: "shoppingBag",
    keywords: "akcio akciok bolt kedvezmeny learazas prospektus szorolap" },
  { href: "/pro", title: "Kinti PRO", subtitle: "Prémium funkciók", icon: "star",
    keywords: "pro elofizetes premium kinti pro upgrade" },
];

interface Scored { d: AppDestination; score: number; }

/**
 * A keresőszóra illeszkedő app-célok, relevancia szerint rangsorolva. MINDEN
 * tokennek illeszkednie kell (AND) a title+kulcsszavak foldolt szövegére;
 * pontszám tokenenként: title-találat=2, kulcsszó-találat=1. Ország-tudatos
 * (feature-gate). Üres/rövid keresésnél üres tömb.
 */
export function searchDestinations(
  query: string,
  country: string | null | undefined,
  limit = 4,
): AppDestination[] {
  const tokens = tokenizeFolded(query);
  if (tokens.length === 0) return [];

  const scored: Scored[] = [];
  for (const d of APP_DESTINATIONS) {
    if (d.feature && !isFeatureAvailable(d.feature, country)) continue;
    const titleF = foldSearchText(d.title);
    const hay = `${titleF} ${foldSearchText(d.keywords)}`;
    if (!tokens.every((t) => hay.includes(t))) continue;
    let score = 0;
    for (const t of tokens) score += titleF.includes(t) ? 2 : 1;
    scored.push({ d, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.d);
}
