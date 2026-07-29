import type { IconName } from "@/components/ui/icons";

/** Kinek releváns egy feladat: család-specifikus, csak EU-s, csak nem-EU-s. */
export type RelocationAudience = "family" | "eu" | "noneu";

export type RoadmapTask = {
  id: string;
  title: string;
  description: string;
  linkHref?: string;
  linkLabel?: string;
  linkIcon?: IconName;
  /** Feltételes feladat — csak a profilhoz illő esetben jelenik meg. Üres = mindenkinek. */
  tags?: RelocationAudience[];
};

export type RoadmapPhase = {
  id: string;
  title: string;
  icon: IconName;
  tasks: RoadmapTask[];
};

/** A személyre szabó wizard válaszai (localStorage: kinti_relocation_profile). */
export interface RelocationProfile {
  family: boolean; // családdal/gyerekkel költözik
  eu: boolean;     // EU/EFTA-állampolgár (szabad mozgás)
}

/** Egy feladat látszik-e az adott profilnál (feltétel-szűrés). */
export function taskVisible(task: RoadmapTask, p: RelocationProfile): boolean {
  if (!task.tags || task.tags.length === 0) return true;
  if (task.tags.includes("family") && !p.family) return false;
  if (task.tags.includes("eu") && !p.eu) return false;
  if (task.tags.includes("noneu") && p.eu) return false;
  return true;
}

export const PHASES_CH: RoadmapPhase[] = [
  {
    id: "phase-1",
    title: "Tervezés (-3 hónap)",
    icon: "map",
    tasks: [
      { id: "cv", title: "Svájci önéletrajz (CV) elkészítése", description: "A svájci munkáltatók specifikus formátumot várnak el.", linkHref: "/tudasbazis", linkLabel: "Tudásbázis", linkIcon: "bookmark" },
      { id: "ber", title: "Bérszint ellenőrzése", description: "Nézd meg a célkantonod átlagos fizetéseit.", linkHref: "/iranytu", linkLabel: "Bérkalkulátor", linkIcon: "trending" },
      { id: "megtakaritas", title: "Megtakarítás kalkuláció", description: "Számolj legalább 3 havi kaucióval és 2 hónapnyi megélhetéssel.", linkHref: "/tudasbazis", linkLabel: "Kiköltözési cikkek", linkIcon: "bookmark" },
      { id: "ch-permit", title: "Munkavállalási / tartózkodási engedély", description: "Nem EU/EFTA-állampolgárként a munkáltatód intézi a B-engedélyt (kvótás, hosszabb átfutás) — kezdd korán. EU/EFTA-soknak elég a helyi bejelentkezés.", tags: ["noneu"], linkHref: "/tudasbazis/vizum", linkLabel: "Engedély-varázsló", linkIcon: "bookmark" },
    ],
  },
  {
    id: "phase-2",
    title: "Érkezés (1. hét)",
    icon: "flag",
    tasks: [
      { id: "kreisburo", title: "Lakcím bejelentés (Kreisbüro)", description: "Az érkezéstől számított 14 napon belül.", linkHref: "/ugyintezes", linkLabel: "Hivatalos ügyek", linkIcon: "bookmark" },
      { id: "sim", title: "Svájci SIM kártya vásárlása", description: "Szinte mindenhez szükséged lesz egy svájci számra.", linkHref: "/szolgaltato-valto", linkLabel: "Szolgáltatók", linkIcon: "phone" },
      { id: "bank", title: "Bankszámlanyitás", description: "A fizetésed fogadásához elengedhetetlen.", linkHref: "/szolgaltato-valto", linkLabel: "Bankszámlák", linkIcon: "globe" },
    ],
  },
  {
    id: "phase-3",
    title: "Berendezkedés (1. hónap)",
    icon: "home",
    tasks: [
      { id: "krankenkasse", title: "Betegbiztosítás (Krankenkasse)", description: "Kötelező megkötni 3 hónapon belül.", linkHref: "/szolgaltato-valto", linkLabel: "Krankenkasse", linkIcon: "heart" },
      { id: "lakas", title: "Albérlet keresés és Kaució", description: "Állandó lakás keresése — nézd meg a kinti magyarok albérlet-börzéjét is.", linkHref: "/piacter", linkLabel: "Albérlet-börze", linkIcon: "key" },
      { id: "ado", title: "Adózás (Quellensteuer)", description: "Külföldiként forrásadót vonnak a fizetésedből.", linkHref: "/szaknevsor", linkLabel: "Könyvelők", linkIcon: "users" },
      { id: "ch-iskola", title: "Iskola / óvoda beíratás", description: "A gyerekeket a lakóhely szerinti köriskolába kell beíratni; az óvoda (Kita/Kindergarten) helyenként várólistás — intézd korán.", tags: ["family"], linkHref: "/tudasbazis/iskolarendszer", linkLabel: "Iskolarendszer", linkIcon: "bookmark" },
      { id: "ch-csaladi", title: "Családi pótlék (Familienzulagen)", description: "Gyerek után járó támogatás — a munkáltatón/kantonon keresztül igényelhető.", tags: ["family"] },
    ],
  },
  {
    id: "phase-4",
    title: "Integráció (3-6 hónap)",
    icon: "users",
    tasks: [
      { id: "kozosseg", title: "Magyar közösség megtalálása", description: "Keress magyar szervezeteket, egyesületeket a Szaknévsorban.", linkHref: "/szaknevsor", linkLabel: "Szaknévsor", linkIcon: "list" },
      { id: "nyelv", title: "Nyelvtanfolyam", description: "A beilleszkedés kulcsa a helyi nyelv.", linkHref: "/tudasbazis", linkLabel: "Nyelvtanulás", linkIcon: "magic" },
    ],
  },
];

/** Ausztria — osztrák valósághoz igazított roadmap (Meldezettel 3 nap, e-card automatikus, Lohnsteuer, Deutschkurs). */
export const PHASES_AT: RoadmapPhase[] = [
  {
    id: "phase-1",
    title: "Tervezés (-3 hónap)",
    icon: "map",
    tasks: [
      { id: "at-cv", title: "Osztrák önéletrajz (Lebenslauf)", description: "Az osztrák munkáltatók fényképes, részletes Lebenslaufot várnak. Töltsd fel a CV-d az állás-profilodhoz.", linkHref: "/allasok/profil", linkLabel: "CV-profil", linkIcon: "user" },
      { id: "at-ber", title: "Bérszint tájékozódás", description: "Nézd meg a szakmád kollektív szerződés (Kollektivvertrag) szerinti minimálbérét, és a hirdetett béreket.", linkHref: "/allasok", linkLabel: "Állások", linkIcon: "briefcase" },
      { id: "at-megtakaritas", title: "Megtakarítás kalkuláció", description: "Számolj kaucióval (jellemzően 3 havi bruttó lakbér), esetleg ingatlanos jutalékkal (Provision) és 2 hónap megélhetéssel.", linkHref: "/utalas", linkLabel: "Árfolyam", linkIcon: "trending" },
      { id: "at-permit", title: "Tartózkodási engedély (nem EU)", description: "Nem EU-állampolgárként Rot-Weiß-Rot Karte / Aufenthaltstitel kell — kezdd korán. EU-soknak elég a Meldezettel + Anmeldebescheinigung.", tags: ["noneu"], linkHref: "/tudasbazis/vizum", linkLabel: "Engedély-varázsló", linkIcon: "bookmark" },
    ],
  },
  {
    id: "phase-2",
    title: "Érkezés (1. hét)",
    icon: "flag",
    tasks: [
      { id: "at-meldezettel", title: "Lakcímbejelentés (Meldezettel)", description: "A beköltözéstől számított 3 NAPON BELÜL kötelező a Meldeamtban/Magistratban! (Szigorúbb, mint Svájcban.)" },
      { id: "at-sim", title: "Osztrák SIM kártya", description: "A1, Magenta vagy Drei — szükséged lesz osztrák számra a hivatali ügyekhez." },
      { id: "at-bank", title: "Bankszámlanyitás", description: "Erste Bank/Sparkasse, Bank Austria vagy BAWAG — a fizetésed fogadásához. A Meldezettel kelleni fog hozzá." },
    ],
  },
  {
    id: "phase-3",
    title: "Berendezkedés (1. hónap)",
    icon: "home",
    tasks: [
      { id: "at-ecard", title: "e-card / egészségbiztosítás", description: "A munkaviszonnyal AUTOMATIKUSAN biztosított leszel (ÖGK). Az e-card már csak FÉNYKÉPPEL készül — magyar állampolgárként a fotódat személyesen kell regisztráltatnod (chipkarte.at/foto), utána postán jön a kártya." },
      { id: "at-lakas", title: "Albérlet és bérleti szerződés", description: "Hauptmietvertrag, Kaution, esetleg Provision. Figyelj a Betriebskostenre (rezsi) a lakbéren felül — és nézd meg a kinti magyarok albérlet-börzéjét is.", linkHref: "/piacter", linkLabel: "Albérlet-börze", linkIcon: "key" },
      { id: "at-ado", title: "Adózás (Lohnsteuer)", description: "A bérből automatikusan vonják a Lohnsteuert és a társadalombiztosítást. Év végén az Arbeitnehmerveranlagás (adóbevallás) gyakran visszatérítést hoz!", linkHref: "/szaknevsor", linkLabel: "Könyvelők", linkIcon: "users" },
      { id: "at-iskola", title: "Iskola / óvoda (Kindergarten)", description: "Gyerek beíratása a lakóhely szerinti iskolába/óvodába.", tags: ["family"], linkHref: "/tudasbazis/iskolarendszer", linkLabel: "Iskolarendszer", linkIcon: "bookmark" },
      { id: "at-familienbeihilfe", title: "Familienbeihilfe (családi pótlék)", description: "Gyerek után járó osztrák családi támogatás — a Finanzamtnál igényelhető (visszamenőleg is).", tags: ["family"], linkHref: "/ugyintezes", linkLabel: "Ügyintézés", linkIcon: "bookmark" },
    ],
  },
  {
    id: "phase-4",
    title: "Integráció (3-6 hónap)",
    icon: "users",
    tasks: [
      { id: "at-kozosseg", title: "Magyar közösség megtalálása", description: "Keresd az osztrák magyar egyesületeket a Szaknévsorban.", linkHref: "/szaknevsor", linkLabel: "Szaknévsor", linkIcon: "list" },
      { id: "at-nyelv", title: "Németkurzus (Deutschkurs)", description: "ÖIF-elismert kurzus a beilleszkedéshez — és gyakorolj a Kinti Osztrák Német leckékkel.", linkHref: "/nyelvlecke", linkLabel: "Osztrák Német", linkIcon: "magic" },
    ],
  },
];

/** Németország — német valósághoz igazított roadmap (Anmeldung 14 nap, GKV-pénztár,
 *  Steuer-ID automatikus, Kindergeld, Deutschkurs). */
export const PHASES_DE: RoadmapPhase[] = [
  {
    id: "phase-1",
    title: "Tervezés (-3 hónap)",
    icon: "map",
    tasks: [
      { id: "de-cv", title: "Német önéletrajz (Lebenslauf)", description: "A német munkáltatók tabellás, gyakran fényképes Lebenslaufot várnak. Töltsd fel a CV-d az állás-profilodhoz.", linkHref: "/allasok/profil", linkLabel: "CV-profil", linkIcon: "user" },
      { id: "de-ber", title: "Bérszint tájékozódás", description: "Nézd meg a szakmád szokásos bruttó éves bérét a célországban.", linkHref: "/iranytu", linkLabel: "Iránytű", linkIcon: "trending" },
      { id: "de-megtakaritas", title: "Megtakarítás kalkuláció", description: "Számolj kaucióval (max 3 havi Kaltmiete), esetleg ingatlanos jutalékkal és 2-3 hónap megélhetéssel.", linkHref: "/piacter?tab=kalkulator", linkLabel: "Lakbér-kalkulátor", linkIcon: "bookmark" },
      { id: "de-permit", title: "Tartózkodási / munkavállalási engedély (nem EU)", description: "Nem EU-állampolgárként Aufenthaltstitel / munkavízum (pl. Blaue Karte EU) kell — kezdd korán. EU-soknak szabad mozgás (Freizügigkeit), nincs engedély.", tags: ["noneu"], linkHref: "/tudasbazis/vizum", linkLabel: "Engedély-varázsló", linkIcon: "bookmark" },
    ],
  },
  {
    id: "phase-2",
    title: "Érkezés (1. hét)",
    icon: "flag",
    tasks: [
      { id: "de-anmeldung", title: "Lakcímbejelentés (Anmeldung)", description: "A beköltözéstől 14 napon belül a Bürgeramtnál. Kell hozzá a Wohnungsgeberbestätigung (főbérlői igazolás). Időpontot foglalj korán!", linkHref: "/ugyintezes", linkLabel: "Ügyintézés", linkIcon: "bookmark" },
      { id: "de-sim", title: "Német SIM kártya", description: "Telekom, Vodafone, O2 vagy olcsóbb (Aldi Talk) — német szám kell a hivatali ügyekhez." },
      { id: "de-bank", title: "Bankszámla (Girokonto)", description: "Sparkasse, Commerzbank, DKB vagy online (N26, ING). Anmeldung + útlevél kell hozzá." },
    ],
  },
  {
    id: "phase-3",
    title: "Berendezkedés (1. hónap)",
    icon: "home",
    tasks: [
      { id: "de-krankenversicherung", title: "Egészségbiztosítás (Krankenkasse)", description: "Kötelező! Válassz törvényes pénztárat (TK, AOK, Barmer). A munkáltató bejelent, a járulékot a bérből vonják.", linkHref: "/ugyintezes", linkLabel: "Ügyintézés", linkIcon: "heart" },
      { id: "de-steuerid", title: "Steuer-ID (adóazonosító)", description: "Az Anmeldung után automatikusan postán jön (~2-3 hét). A munkáltatódnak kell a bérszámfejtéshez." },
      { id: "de-lakas", title: "Állandó lakás és Mietvertrag", description: "Hosszú távú lakás keresése; figyelj a Nebenkostenre (rezsi) a Kaltmieten felül — és nézd meg a kinti magyarok albérlet-börzéjét is.", linkHref: "/piacter", linkLabel: "Albérlet-börze", linkIcon: "key" },
      { id: "de-iskola", title: "Kita / iskola beíratás", description: "Gyerek beíratása óvodába (Kita — gyakran várólistás, intézd korán) vagy iskolába a lakóhely szerint.", tags: ["family"], linkHref: "/tudasbazis/iskolarendszer", linkLabel: "Iskolarendszer", linkIcon: "bookmark" },
      { id: "de-kindergeld", title: "Kindergeld (családi pótlék)", description: "Havi 250 €/gyerek — a Familienkasse-nál igényelhető. Kell a szülő és a gyerek Steuer-ID-je.", tags: ["family"], linkHref: "/ugyintezes", linkLabel: "Ügyintézés", linkIcon: "bookmark" },
    ],
  },
  {
    id: "phase-4",
    title: "Integráció (3-6 hónap)",
    icon: "users",
    tasks: [
      { id: "de-kozosseg", title: "Magyar közösség megtalálása", description: "Keresd a németországi magyar egyesületeket a Szaknévsorban.", linkHref: "/szaknevsor", linkLabel: "Szaknévsor", linkIcon: "list" },
      { id: "de-nyelv", title: "Németkurzus (Deutschkurs)", description: "Integrationskurs / VHS a beilleszkedéshez — és gyakorolj a Kinti Német (Hochdeutsch) leckékkel.", linkHref: "/nyelvlecke", linkLabel: "Német nyelvlecke", linkIcon: "magic" },
    ],
  },
];

/**
 * ⚠️ HOLLANDIA. A sorrend ITT a legfontosabb tudás: a BRP-bejelentkezés adja a
 * BSN-t, és BSN nélkül nincs bér, nincs biztosítás, nincs DigiD. Ezért a BRP az
 * érkezési fázis ELSŐ eleme, és a leírása kimondja, mi múlik rajta.
 */
export const PHASES_NL: RoadmapPhase[] = [
  {
    id: "phase-1",
    title: "Tervezés (-3 hónap)",
    icon: "map",
    tasks: [
      { id: "nl-cv", title: "Holland önéletrajz (CV)", description: "A holland munkáltató holland nyelvű, holland szakma-megnevezésű CV-t vár — a német CV lefordítása nem elég.", linkHref: "/holland-oneletrajz", linkLabel: "Holland CV-készítő", linkIcon: "document" },
      { id: "nl-ber", title: "Bérszint tájékozódás", description: "Nézd meg a szakmád szokásos bruttó bérét, és számold ki a nettót (a vakantiegeld külön jön).", linkHref: "/berkalkulator", linkLabel: "Bérkalkulátor", linkIcon: "trending" },
      { id: "nl-megtakaritas", title: "Megtakarítás kalkuláció", description: "Számolj kaucióval (2023 óta max 2 havi bér) és 2-3 hónap megélhetéssel. A Randstadban a lakás a szűk keresztmetszet.", linkHref: "/piacter?tab=kalkulator", linkLabel: "Lakbér-kalkulátor", linkIcon: "bookmark" },
      { id: "nl-permit", title: "Tartózkodási engedély (nem EU)", description: "Nem EU-állampolgárként MVV / verblijfsvergunning kell az IND-től — kezdd korán. EU-soknak szabad mozgás, nincs engedély.", tags: ["noneu"], linkHref: "/tudasbazis/vizum", linkLabel: "Engedély-varázsló", linkIcon: "bookmark" },
    ],
  },
  {
    id: "phase-2",
    title: "Érkezés (1. hét)",
    icon: "flag",
    tasks: [
      { id: "nl-brp", title: "Bejelentkezés a gemeenténél (BRP) → BSN", description: "⚠️ EZ AZ ELSŐ. A BRP-regisztrációval kapod a BSN-számot, és BSN nélkül nincs bér, nincs egészségbiztosítás, nincs DigiD. Időpontot foglalj még érkezés előtt.", linkHref: "/tudasbazis/nl-bejelentkezes", linkLabel: "Bejelentkezés lépésről lépésre", linkIcon: "bookmark" },
      { id: "nl-sim", title: "Holland SIM kártya", description: "KPN, Vodafone, Odido vagy olcsóbb (Simyo, Lebara) — holland szám kell a hivatali ügyekhez és a bankhoz." },
      { id: "nl-bank", title: "Bankszámla (betaalrekening)", description: "ING, Rabobank, ABN AMRO vagy online (bunq). ⚠️ Jellemzően BSN kell hozzá — ezért megy a BRP előre." },
    ],
  },
  {
    id: "phase-3",
    title: "Berendezkedés (1. hónap)",
    icon: "home",
    tasks: [
      { id: "nl-zorgverzekering", title: "Egészségbiztosítás (zorgverzekering)", description: "⚠️ KÖTELEZŐ, és 4 hónapon belül meg kell kötni — visszamenőleg az érkezéstől fizetsz. Fix havi díj + éves önrész (eigen risico).", linkHref: "/tudasbazis/nl-egeszsegbiztositas", linkLabel: "Egészségbiztosítás", linkIcon: "heart" },
      { id: "nl-digid", title: "DigiD igénylése", description: "A holland online ügyintézés belépője (adó, biztosítás, gemeente). BSN kell hozzá, postán jön az aktiváló kód." },
      { id: "nl-lakas", title: "Állandó lakás és huurcontract", description: "⚠️ Kérdezd meg, engedi-e a bérbeadó a BRP-bejelentkezést — ha nem, a lakás hosszú távon használhatatlan. Nézd meg a magyarok albérlet-börzéjét is.", linkHref: "/piacter", linkLabel: "Albérlet-börze", linkIcon: "key" },
      { id: "nl-toeslagen", title: "Toeslagen (támogatások) igénylése", description: "Jövedelemtől függő támogatások: zorgtoeslag (biztosításra), huurtoeslag (lakbérre). Sokan nem is tudnak róla — érdemes megnézni, jogosult vagy-e." },
      { id: "nl-iskola", title: "Iskola / óvoda beíratás", description: "A gyerek beíratása a lakóhely szerinti basisschoolba; a nyelvet nem beszélő gyerekeknek felzárkóztató osztály (nieuwkomersklas) is van.", tags: ["family"], linkHref: "/tudasbazis/iskolarendszer", linkLabel: "Iskolarendszer", linkIcon: "bookmark" },
      { id: "nl-kinderbijslag", title: "Kinderbijslag (családi pótlék)", description: "Negyedévente fizetett gyerek utáni támogatás — az SVB-nél igényelhető. BSN kell hozzá.", tags: ["family"], linkHref: "/ugyintezes", linkLabel: "Ügyintézés", linkIcon: "bookmark" },
    ],
  },
  {
    id: "phase-4",
    title: "Integráció (3-6 hónap)",
    icon: "users",
    tasks: [
      { id: "nl-kozosseg", title: "Magyar közösség megtalálása", description: "Keresd a hollandiai magyar szervezeteket és szakembereket a Szaknévsorban.", linkHref: "/szaknevsor", linkLabel: "Szaknévsor", linkIcon: "list" },
      { id: "nl-nyelv", title: "Holland nyelvtanulás", description: "A munkahelyen sokszor elég az angol, a hivatalban és a szomszédságban nem — gyakorolj a Kinti holland leckékkel.", linkHref: "/nyelvlecke", linkLabel: "Holland nyelvlecke", linkIcon: "magic" },
    ],
  },
];

/**
 * ⚠️ ANGLIA. A szerkezet ITT tér el a legjobban a kontinentálistól: NINCS
 * lakcímbejelentés (nem létezik ilyen hivatal), ezért nem a bejelentés, hanem a
 * lakcím IGAZOLÁSA a nehézség, és a feladatok párhuzamos szálakon futnak.
 * Brexit óta a munkavállalási jog NEM automatikus — ez a tervezési fázis eleje.
 */
export const PHASES_GB: RoadmapPhase[] = [
  {
    id: "phase-1",
    title: "Tervezés (-3 hónap)",
    icon: "map",
    tasks: [
      { id: "gb-vizum", title: "⚠️ Munkavállalási jog tisztázása", description: "Brexit óta az EU-állampolgárság ÖNMAGÁBAN nem jogosít munkára. Vagy EUSS-státuszod van (2020 vége előtti érkezés), vagy vízum kell — jellemzően szponzor-munkáltatóval.", linkHref: "/tudasbazis/vizum", linkLabel: "Letelepedés-varázsló", linkIcon: "bookmark" },
      { id: "gb-cv", title: "Angol önéletrajz (CV)", description: "A brit CV fotó és születési év NÉLKÜL készül (életkor-diszkrimináció), és „References available on request” zárja.", linkHref: "/angol-oneletrajz", linkLabel: "Angol CV-készítő", linkIcon: "document" },
      { id: "gb-ber", title: "Bérszint ellenőrzése", description: "Nézd meg a szakmád szokásos bérét, és számold ki a nettót (PAYE + National Insurance).", linkHref: "/berkalkulator", linkLabel: "Bérkalkulátor", linkIcon: "trending" },
      { id: "gb-megtakaritas", title: "Megtakarítás kalkuláció", description: "Számolj kaucióval (max 5 heti bér), az első havi bérrel előre, és 2-3 hónap megélhetéssel. ⚠️ Vízumnál az IHS-t is előre kell fizetni.", linkHref: "/piacter?tab=kalkulator", linkLabel: "Lakbér-kalkulátor", linkIcon: "bookmark" },
    ],
  },
  {
    id: "phase-2",
    title: "Érkezés (1. hét)",
    icon: "flag",
    tasks: [
      { id: "gb-nin", title: "National Insurance Number igénylése", description: "A munkához, adóhoz és nyugdíjhoz kell. ⚠️ FONTOS: a NIN megérkezése ELŐTT is dolgozhatsz jogszerűen — csak szólj a munkáltatónak, hogy igényelted.", linkHref: "/ugyintezes", linkLabel: "Ügyintézés", linkIcon: "bookmark" },
      { id: "gb-bank", title: "Bankszámla nyitása", description: "⚠️ 22-es csapdája: a hagyományos bank lakcímigazolást kér, ami frissen érkezőnek nincs. Kerülőút: digitális bank (Monzo, Starling, Revolut) — appból, pár nap alatt." },
      { id: "gb-sim", title: "Brit SIM kártya", description: "EE, O2, Vodafone vagy olcsóbb (Giffgaff, Lebara) — brit szám kell szinte mindenhez." },
    ],
  },
  {
    id: "phase-3",
    title: "Berendezkedés (1. hónap)",
    icon: "home",
    tasks: [
      { id: "gb-gp", title: "Regisztráció háziorvoshoz (GP)", description: "Az NHS kapuja — szinte minden ellátás a GP-nél kezdődik. ⚠️ A rendelő NEM utasíthat el lakcímigazolás vagy okmány hiánya miatt.", linkHref: "/tudasbazis/gb-nhs", linkLabel: "NHS és a GP", linkIcon: "heart" },
      { id: "gb-counciltax", title: "Council tax bejelentés", description: "⚠️ A council taxet a LAKÓ fizeti, nem a tulajdonos. Egyedül élőként 25% kedvezmény, teljes idős hallgatóként jellemzően mentesség — de IGÉNYELNI kell.", linkHref: "/ugyintezes", linkLabel: "Ügyintézés", linkIcon: "bookmark" },
      { id: "gb-lakas", title: "Állandó lakás és tenancy", description: "⚠️ A kaució 30 napon belül állami védelmi sémába (TDP) kell kerüljön, és erről igazolást kell kapnod. Nézd meg a magyarok albérlet-börzéjét is.", linkHref: "/piacter", linkLabel: "Albérlet-börze", linkIcon: "key" },
      { id: "gb-electoral", title: "Feliratkozás a választói névjegyzékre", description: "Nem csak szavazáshoz jó: ez a brit hitel-előélet (credit score) egyik legerősebb eleme, ami lakásbérlésnél és előfizetéseknél is számít." },
      { id: "gb-iskola", title: "Iskola beíratás", description: "⚠️ A helyet NEM az iskolánál, hanem a lakóhely szerinti önkormányzatnál pályázod meg, több iskolát rangsorolva. Év közbeni érkezésnél külön eljárás van.", tags: ["family"], linkHref: "/tudasbazis/iskolarendszer", linkLabel: "Iskolarendszer", linkIcon: "bookmark" },
      { id: "gb-childbenefit", title: "Child Benefit igénylése", description: "Gyerek utáni támogatás a HMRC-nél. ⚠️ Magas jövedelemnél fokozatosan visszaadózzák (High Income Child Benefit Charge).", tags: ["family"], linkHref: "/ugyintezes", linkLabel: "Ügyintézés", linkIcon: "bookmark" },
    ],
  },
  {
    id: "phase-4",
    title: "Integráció (3-6 hónap)",
    icon: "users",
    tasks: [
      { id: "gb-kozosseg", title: "Magyar közösség megtalálása", description: "Keresd az angliai magyar szervezeteket, iskolákat és boltokat a Szaknévsorban.", linkHref: "/szaknevsor", linkLabel: "Szaknévsor", linkIcon: "list" },
      { id: "gb-nyelv", title: "Brit angol finomhangolás", description: "Az iskolai angol jellemzően amerikaias — a Kinti brit leckéi a hivatali szókincsre és a valódi brit szóhasználatra mennek rá.", linkHref: "/nyelvlecke", linkLabel: "Angol nyelvlecke", linkIcon: "magic" },
    ],
  },
];

/**
 * ⚠️ SPANYOLORSZÁG. A roadmap szervező elve NEM a jogi sorrend, hanem az
 * IDŐPONT-KÉNYSZER: majdnem minden hivatalhoz cita previa kell, és az hetekre
 * előre elfogyhat. Ezért az időpontfoglalás a TERVEZÉSI fázisba került — még a
 * költözés előtt el kell kezdeni, nem érkezés után.
 */
export const PHASES_ES: RoadmapPhase[] = [
  {
    id: "phase-1",
    title: "Tervezés (-3 hónap)",
    icon: "map",
    tasks: [
      { id: "es-cita", title: "⚠️ Időpontfoglalás (cita previa) — MÁR MOST", description: "A legtöbb spanyol hivatal csak előzetes időponttal fogad, és nagyvárosban hetekre előre elfogy. Nézd meg a szabad időpontokat, mielőtt dátumot tűzöl ki. Az időpont INGYENES — aki pénzt kér érte, viszonteladó.", linkHref: "/tudasbazis/es-cita-previa", linkLabel: "Cita previa", linkIcon: "bookmark" },
      { id: "es-cv", title: "Spanyol önéletrajz (currículum)", description: "A spanyol CV a némethez áll közel: a fotó és a születési év bevett, sőt elvárás. ⚠️ A szakma-megnevezést a saját nemedben írd ki (Camarero / Camarera).", linkHref: "/spanyol-oneletrajz", linkLabel: "Spanyol CV-készítő", linkIcon: "document" },
      { id: "es-ber", title: "Bérszint ellenőrzése", description: "⚠️ Kérdezd meg, HÁNY PAGÁBAN fizetnek: ugyanaz az éves bér 14 és 12 részletben egészen más havi valóság.", linkHref: "/berkalkulator", linkLabel: "Bérkalkulátor", linkIcon: "trending" },
      { id: "es-megtakaritas", title: "Megtakarítás kalkuláció", description: "Számolj kaucióval (fianza: 1 havi bér), esetleg további garanciával és 2-3 hónap megélhetéssel. Az ügyintézés csúszása is pénzbe kerül.", linkHref: "/piacter?tab=kalkulator", linkLabel: "Lakbér-kalkulátor", linkIcon: "bookmark" },
    ],
  },
  {
    id: "phase-2",
    title: "Érkezés (1. hét)",
    icon: "flag",
    tasks: [
      { id: "es-empadronamiento", title: "Empadronamiento az önkormányzatnál", description: "⚠️ EZ AZ ELSŐ. A lakcím-bejelentésre épül az egészségügyi kártya és az iskolai beiratkozás is. Kérj CERTIFICADO-t, ne csak volantét — a hatósági ügyekhez az kell.", linkHref: "/ugyintezes/es-empadronamiento", linkLabel: "Empadronamiento", linkIcon: "bookmark" },
      { id: "es-ss", title: "Seguridad Social-szám igénylése", description: "A munkába állás feltétele — enélkül a munkáltató nem tud bejelenteni. Jó hír: ONLINE is elintézhető, nem kell hozzá időpont.", linkHref: "/tudasbazis/es-seguridad-social", linkLabel: "Seguridad Social", linkIcon: "bookmark" },
      { id: "es-sim", title: "Spanyol SIM kártya", description: "Movistar, Vodafone, Orange vagy olcsóbb (Digi, Lowi, Pepephone) — spanyol szám kell a hivatali ügyekhez." },
    ],
  },
  {
    id: "phase-3",
    title: "Berendezkedés (1. hónap)",
    icon: "home",
    tasks: [
      { id: "es-nie", title: "NIE + uniós regisztráció (certificado de registro)", description: "3 hónapnál hosszabb tartózkodásnál kötelező. ⚠️ A díjat (modelo 790, 012) a hivatali időpont ELŐTT kell befizetni, és a bizonylatot vinni.", linkHref: "/ugyintezes/es-nie", linkLabel: "NIE és regisztráció", linkIcon: "bookmark" },
      { id: "es-bank", title: "Bankszámla nyitása", description: "NIE-vel bármelyik banknál nyithatsz. ⚠️ Nézd meg a havidíj feltételeit: sok számla csak rendszeres bérjóváírással ingyenes." },
      { id: "es-tarjeta", title: "Egészségügyi kártya (tarjeta sanitaria)", description: "⚠️ Az egészségügy AUTONÓM KÖZÖSSÉGI hatáskör — a kártyát a lakóhelyed szerinti szolgálat adja ki. Kell hozzá empadronamiento + TB-jogosultság.", linkHref: "/ugyintezes/es-egeszsegugyi-kartya", linkLabel: "Egészségügyi kártya", linkIcon: "heart" },
      { id: "es-lakas", title: "Állandó lakás és szerződés", description: "⚠️ Nézd meg a szerződés CÍMÉT: a „vivienda habitual” alá tartozol a bérlővédelmi törvény (LAU) alá, a „temporada” alá NEM. Nézd meg a magyarok albérlet-börzéjét is.", linkHref: "/piacter", linkLabel: "Albérlet-börze", linkIcon: "key" },
      { id: "es-iskola", title: "Iskola beíratás", description: "⚠️ A beiratkozás egy szűk, évente EGYSZERI tavaszi ablakban zajlik — aki lecsúszik, a maradék helyekre kerül. Ehhez időzítsd az empadronamientót.", tags: ["family"], linkHref: "/tudasbazis/iskolarendszer", linkLabel: "Iskolarendszer", linkIcon: "bookmark" },
      { id: "es-csaladi", title: "Gyerek utáni kedvezmények", description: "⚠️ Spanyolországban NINCS alanyi jogon járó havi családi pótlék — a támogatás az adórendszeren keresztül jön, és a közösséged saját kiegészítést is adhat.", tags: ["family"], linkHref: "/tudasbazis/es-adozas", linkLabel: "Adózás", linkIcon: "bookmark" },
    ],
  },
  {
    id: "phase-4",
    title: "Integráció (3-6 hónap)",
    icon: "users",
    tasks: [
      { id: "es-clave", title: "Cl@ve digitális azonosító", description: "Ezzel sok ügyet online intézel — vagyis NEM kell hozzá időpontot kérni. Megéri az elején beszerezni.", linkHref: "/tudasbazis/es-cita-previa", linkLabel: "Ügyintézés online", linkIcon: "bookmark" },
      { id: "es-kozosseg", title: "Magyar közösség megtalálása", description: "Keresd a spanyolországi magyar szervezeteket és szakembereket a Szaknévsorban.", linkHref: "/szaknevsor", linkLabel: "Szaknévsor", linkIcon: "list" },
      { id: "es-nyelv", title: "Spanyol nyelvtanulás", description: "A spanyol kiejtés hat szabályon áll — aki ezeket tudja, hetek alatt érthetően beszél. Gyakorolj a Kinti spanyol leckékkel.", linkHref: "/nyelvlecke", linkLabel: "Spanyol nyelvlecke", linkIcon: "magic" },
    ],
  },
];

/** A választott ország roadmapje (default CH). */
export function getPhases(country: string | null | undefined): RoadmapPhase[] {
  if (country === "AT") return PHASES_AT;
  if (country === "DE") return PHASES_DE;
  // ⚠️ NL/GB/ES ág NÉLKÜL ezek a SVÁJCI listát kapták: „Svájci önéletrajz”,
  // „Kreisbüro”, „Krankenkasse”, „Quellensteuer” és „célkantonod” — user
  // jelentette Hollandiából (2026-07-29). Új ország felvételekor IDE IS írj ágat;
  // a relocation-phases.test.ts minden app-országra kikényszeríti.
  if (country === "NL") return PHASES_NL;
  if (country === "GB") return PHASES_GB;
  if (country === "ES") return PHASES_ES;
  return PHASES_CH;
}

export const TASK_DEADLINES: Record<string, { days: number; hard?: boolean }> = {
  // CH
  cv: { days: -60 },
  ber: { days: -60 },
  megtakaritas: { days: -45 },
  kreisburo: { days: 14, hard: true },
  sim: { days: 7 },
  bank: { days: 7 },
  krankenkasse: { days: 90, hard: true },
  lakas: { days: 30 },
  ado: { days: 60 },
  kozosseg: { days: 90 },
  nyelv: { days: 120 },
  // AT
  "at-cv": { days: -60 },
  "at-ber": { days: -60 },
  "at-megtakaritas": { days: -45 },
  "at-meldezettel": { days: 3, hard: true },
  "at-sim": { days: 7 },
  "at-bank": { days: 7 },
  "at-ecard": { days: 30 },
  "at-lakas": { days: 30 },
  "at-ado": { days: 60 },
  "at-kozosseg": { days: 90 },
  "at-nyelv": { days: 120 },
  // CH/AT feltételes
  "ch-permit": { days: -90 }, "ch-iskola": { days: 30 }, "ch-csaladi": { days: 60 },
  "at-permit": { days: -90 }, "at-iskola": { days: 30 }, "at-familienbeihilfe": { days: 60 },
  // DE
  "de-cv": { days: -60 }, "de-ber": { days: -60 }, "de-megtakaritas": { days: -45 }, "de-permit": { days: -90 },
  "de-anmeldung": { days: 14, hard: true }, "de-sim": { days: 7 }, "de-bank": { days: 7 },
  "de-krankenversicherung": { days: 14, hard: true }, "de-steuerid": { days: 21 }, "de-lakas": { days: 30 },
  "de-iskola": { days: 30 }, "de-kindergeld": { days: 60 }, "de-kozosseg": { days: 90 }, "de-nyelv": { days: 120 },
  // NL — ⚠️ a BRP a kulcs: BSN nélkül nincs bér és nincs biztosítás, ezért
  // a bank és a zorgverzekering IS utána következik.
  "nl-cv": { days: -60 }, "nl-ber": { days: -60 }, "nl-megtakaritas": { days: -45 }, "nl-permit": { days: -90 },
  "nl-brp": { days: 5, hard: true }, "nl-sim": { days: 7 }, "nl-bank": { days: 10 },
  "nl-zorgverzekering": { days: 120, hard: true }, "nl-digid": { days: 21 }, "nl-lakas": { days: 30 },
  "nl-toeslagen": { days: 45 }, "nl-iskola": { days: 30 }, "nl-kinderbijslag": { days: 60 },
  "nl-kozosseg": { days: 90 }, "nl-nyelv": { days: 120 },
  // GB — ⚠️ a vízum/munkavállalási jog a LEGKORÁBBI tétel (Brexit), és nincs
  // lakcímbejelentés, ezért a council tax veszi át a „bejelentkezés” szerepét.
  "gb-vizum": { days: -120, hard: true }, "gb-cv": { days: -60 }, "gb-ber": { days: -60 }, "gb-megtakaritas": { days: -45 },
  "gb-nin": { days: 7 }, "gb-bank": { days: 7 }, "gb-sim": { days: 7 },
  "gb-gp": { days: 21 }, "gb-counciltax": { days: 14, hard: true }, "gb-lakas": { days: 30 },
  "gb-electoral": { days: 45 }, "gb-iskola": { days: 30 }, "gb-childbenefit": { days: 60 },
  "gb-kozosseg": { days: 90 }, "gb-nyelv": { days: 120 },
  // ES — ⚠️ a cita previa a költözés ELŐTT indul (-90), mert az időpont-
  // várakozás maga több hét lehet; a regisztráció határideje 3 hónap.
  "es-cita": { days: -90, hard: true }, "es-cv": { days: -60 }, "es-ber": { days: -60 }, "es-megtakaritas": { days: -45 },
  "es-empadronamiento": { days: 7 }, "es-ss": { days: 10 }, "es-sim": { days: 7 },
  "es-nie": { days: 90, hard: true }, "es-bank": { days: 21 }, "es-tarjeta": { days: 30 },
  "es-lakas": { days: 30 }, "es-iskola": { days: 30 }, "es-csaladi": { days: 60 },
  "es-clave": { days: 60 }, "es-kozosseg": { days: 90 }, "es-nyelv": { days: 120 },
};

export function parseYMD(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

export function startOfDay(d: Date): number {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r.getTime();
}

export function daysFromToday(target: Date): number {
  return Math.round((startOfDay(target) - startOfDay(new Date())) / 86_400_000);
}

export function taskDeadline(taskId: string, moveDateObj: Date | null): { date: Date; days: number; hard: boolean } | null {
  const def = TASK_DEADLINES[taskId];
  if (!def || !moveDateObj) return null;
  const date = new Date(moveDateObj);
  date.setDate(date.getDate() + def.days);
  return { date, days: daysFromToday(date), hard: !!def.hard };
}

/**
 * Természetes nyelvű címke a költözés dátumához KÉPESTI eltolásra (idővonal-nézet).
 * A nyers T-eltolás (TASK_DEADLINES[id].days) → olvasható magyar mondat.
 * Szándékosan NEM „T-30” jelölés (érthetőség a szintaxis-tipp helyett).
 */
export function moveOffsetLabel(offsetDays: number): string {
  if (offsetDays === 0) return "A költözés napján";
  if (offsetDays < 0) return `${Math.abs(offsetDays)} nappal a költözés előtt`;
  return `${offsetDays} nappal a költözés után`;
}

/** Az idővonal-nézet szakaszába sorolás a költözéshez képesti eltolás alapján. */
export function moveBucket(offsetDays: number): { id: string; title: string } {
  if (offsetDays < 0) return { id: "before", title: "A költözés előtt" };
  if (offsetDays <= 7) return { id: "arrival", title: "Az érkezés hete" };
  if (offsetDays <= 30) return { id: "first-month", title: "Az első hónap" };
  if (offsetDays <= 90) return { id: "settle", title: "1–3 hónap" };
  return { id: "later", title: "Később" };
}

export function relLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)} napja lejárt`;
  if (days === 0) return "ma esedékes";
  if (days === 1) return "holnap";
  if (days < 14) return `${days} nap múlva`;
  if (days < 60) return `${Math.round(days / 7)} hét múlva`;
  return `${Math.round(days / 30)} hónap múlva`;
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
}
