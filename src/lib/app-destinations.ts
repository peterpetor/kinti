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
  { href: "/nemet-oneletrajz", title: "Német önéletrajz készítő", subtitle: "Ingyenes Lebenslauf PDF magyar → német szakmanévvel", icon: "document",
    keywords: "onéletrajz oneletrajz cv lebenslauf nemet pdf allas munka jelentkezes bewerbung szakma forditas" },
  { href: "/keresek", title: "Keresek", subtitle: "Igény-hirdetés — jelentkezzenek rád a szakik", icon: "search",
    keywords: "keresek igeny hirdetes keres kerdes szukseg" },
  { href: "/berkalkulator", title: "Bérkalkulátor", subtitle: "Nettó fizetés becslése", icon: "sliders",
    keywords: "fizetes ber netto brutto kalkulator szamologep jovedelem berkalkulator adolevonas" },
  { href: "/mennyi-marad", title: "Mennyi marad?", subtitle: "Kiköltözési tervező — nettó + megélhetés + megtakarítás", icon: "trending",
    keywords: "megelhetes koltseg kikoltozes koltsegvetes mennyi marad megtakaritas rezsi kaja budget tervezo kalkulator kijovok" },
  { href: "/iranytu", title: "Iránytű", subtitle: "Mennyit keresnek mások — közösségi bér-benchmark", icon: "compass",
    keywords: "mennyit keresnek atlagber osszehasonlitas statisztika median berstatisztika iranytu benchmark" },
  { href: "/arfolyam", title: "Hazautalás / Árfolyam", subtitle: "CHF/EUR → HUF + utalási díjak", icon: "send",
    keywords: "utalas penzkuldes hazautalas forint huf arfolyam wise revolut valuta atvaltas chf eur" },
  { href: "/utalas", title: "Utalás-asszisztens", subtitle: "Banki utalás lépésről lépésre", icon: "document",
    keywords: "banki utalas iban sepa atutalas overweisung utalasi megbizas" },
  { href: "/hatarido", title: "Határidő-asszisztens", subtitle: "Emlékeztetők a fontos határidőkre", icon: "clock",
    keywords: "hatarido emlekezteto krankenkasse adobevallas felmondas naptar teendo" },
  { href: "/profil/kinti-pass", title: "Kinti Pass", subtitle: "Digitális kedvezménykártya az elfogadóhelyekhez", icon: "star",
    keywords: "kinti pass kedvezmeny kedvezmenykartya kartya kupon husegkartya torzsvasarlo elfogadohely akcio" },
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
  { href: "/tudasbazis", title: "Tudásbázis", subtitle: "Útmutatók a kinti élethez: ügyintézés, adózás, család, egészségügy", icon: "bookmark",
    keywords: "utmutato guide tudasbazis wiki cikk segitseg hogyan tudnivalo kindergeld adobevallas krankenkasse zorgverzekering bsn anmeldung quellensteuer csaladi potlek ugyintezes adozas egeszsegugy" },
  { href: "/allampolgarsag", title: "Állampolgársági teszt", subtitle: "Honosítási felkészítő kvíz", icon: "flag",
    keywords: "allampolgarsag honositas einburgerung teszt vizsga staatsburgerschaft inburgering" },
  { href: "/kikoltozes", title: "Kiköltözési terv", subtitle: "Személyre szabott checklist", icon: "check",
    keywords: "kikoltozes koltozes checklist teendok kikoltozesi terv kivandorlas" },
  { href: "/szolgaltato-valto", title: "Szolgáltatóváltás", subtitle: "Felmondás-segéd (telefon, internet, biztosítás)", icon: "sliders",
    keywords: "szolgaltato valtas felmondas telefon internet biztositas aram gaz kundigung" },
  { href: "/pro", title: "Kinti PRO", subtitle: "Prémium funkciók", icon: "star",
    keywords: "pro elofizetes premium kinti pro upgrade" },
  { href: "/bussen", title: "Gyorshajtás-bírság becslő", subtitle: "Mennyi büntetés jár a gyorshajtásért?", icon: "car",
    keywords: "gyorshajtas birsag buntetes trafipax radar villogtak bussen boete sebesseg tullepes ordnungswidrigkeit" },
  { href: "/segitseg", title: "Segítség (GYIK)", subtitle: "Hogyan használd a kinti-t — gyakori kérdések", icon: "question",
    keywords: "segitseg gyik faq kerdes hasznalat sugo help hogyan mukodik" },
  { href: "/allasok/szakmai-szotar", title: "Szakmai szótár", subtitle: "Munkahelyi szakszavak leckékben", icon: "sparkles",
    keywords: "szakmai szotar szakszavak nemet szavak kifejezes munkaszo tanulas lecke" },
  { href: "/ranglista", title: "Közösségi ranglista", subtitle: "Kvíz-pontok és helyezések", icon: "trending",
    keywords: "ranglista toplista helyezes pontok verseny kviz eredmeny" },
  { href: "/ertesitesek", title: "Értesítések", subtitle: "Push-riasztások és üzenetek", icon: "bell",
    keywords: "ertesites push riasztas uzenet radar beallitas" },
  { href: "/sajatjaim", title: "Saját posztjaim", subtitle: "Beküldött hirdetéseid, eseményeid kezelése", icon: "user",
    keywords: "sajat posztjaim bekuldott hirdetesem esemenyem kezeles szerkesztes" },
];

/**
 * A kereső ÜRES állapotának gyorsműveletei — kurált, ország-tudatos válogatás
 * a leggyakoribb célokból („mit nyitnak meg legtöbbször"). A sorrend szándékos.
 */
const QUICK_ACTION_HREFS = [
  "/szaknevsor", "/allasok", "/berkalkulator", "/arfolyam", "/hatarido", "/kviz",
] as const;

export function quickActions(country: string | null | undefined): AppDestination[] {
  const byHref = new Map(APP_DESTINATIONS.map((d) => [d.href, d]));
  const out: AppDestination[] = [];
  for (const href of QUICK_ACTION_HREFS) {
    const d = byHref.get(href);
    if (!d) continue;
    if (d.feature && !isFeatureAvailable(d.feature, country)) continue;
    out.push(d);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Találat-kiemelés: a cím mely szakaszai illeszkednek a kereső-tokenekre.
// Fold-tudatos (ékezet-érzéketlen): a „Bérkalkulátor" címben a „berkalk" needle
// szakaszát is megtalálja. A ß→ss expanzió miatt index-térképpel dolgozunk.
// ---------------------------------------------------------------------------

export interface TitleSegment { text: string; hit: boolean; }

/**
 * A címet illeszkedő/nem-illeszkedő szakaszokra bontja a foldolt tokenek szerint
 * (a kereső ezt szedi <mark>-szerű kiemelésre). Átfedő találatok összeolvadnak.
 * Token nélkül egyetlen, kiemelés-mentes szakasz.
 */
export function highlightTitle(title: string, tokens: string[]): TitleSegment[] {
  if (tokens.length === 0 || title.length === 0) return [{ text: title, hit: false }];

  // Foldolt szöveg + foldolt-index → eredeti-index térkép (ß→ss: mindkét „s" a ß-re mutat).
  let folded = "";
  const map: number[] = [];
  for (let i = 0; i < title.length; i++) {
    const f = foldSearchText(title[i]);
    for (let k = 0; k < f.length; k++) { folded += f[k]; map.push(i); }
  }

  // Minden token minden előfordulása → eredeti [start, end) sávok.
  const hits: Array<[number, number]> = [];
  for (const t of tokens) {
    if (!t) continue;
    let from = 0;
    for (;;) {
      const at = folded.indexOf(t, from);
      if (at === -1) break;
      hits.push([map[at], map[at + t.length - 1] + 1]);
      from = at + 1;
    }
  }
  if (hits.length === 0) return [{ text: title, hit: false }];

  // Átfedő/érintkező sávok összeolvasztása.
  hits.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [hits[0]];
  for (const [s, e] of hits.slice(1)) {
    const last = merged[merged.length - 1];
    if (s <= last[1]) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }

  const out: TitleSegment[] = [];
  let cursor = 0;
  for (const [s, e] of merged) {
    if (s > cursor) out.push({ text: title.slice(cursor, s), hit: false });
    out.push({ text: title.slice(s, e), hit: true });
    cursor = e;
  }
  if (cursor < title.length) out.push({ text: title.slice(cursor), hit: false });
  return out;
}

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
