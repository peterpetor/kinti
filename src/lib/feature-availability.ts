/**
 * feature-availability.ts — mely funkciók érhetők el mely országban.
 *
 * Az app sok eszköze KIFEJEZETTEN svájci tudás (Einbürgerung, Serafe/bírság,
 * svájci vám, svájci iskolarendszer, svájci bérkalkuláció stb.). Egy nem-CH
 * országban ezek hibásak/irrelevánsak lennének, ezért a belépési pontoknál
 * (kezdőlap-csempék, menü) ország szerint rejtjük őket.
 *
 * Modell: ami NEM CH-specifikus, az univerzális (minden országban megy). A
 * CH-specifikus kulcsok halmaza alább. Új ország bekapcsolásakor, ahogy elkészül
 * egy adott ország verziója egy eszközből, kivesszük a CH-only halmazból (vagy
 * finomítjuk per-ország listára).
 */
import { DEFAULT_COUNTRY } from "./countries";

/**
 * CH-specifikus funkció-kulcsok (a route első szegmense / logikai név). Ezek
 * csak Svájcban jelennek meg, amíg nincs ország-specifikus változatuk.
 */
export const CH_ONLY_FEATURES: ReadonlySet<string> = new Set([
  "vam",               // vám-kalkulátor: CH (BAZG) + GB (gov.uk) — az AT/DE/NL
                       //   EU-n belül van, ott nincs vámhatár, ezért marad rejtve.
                       //   GB-t a GB_ALLOWED_FEATURES engedi külön.
  // "szolgaltato-valto" — KIVÉVE (2026-07-05): mind a 6 országra van szolgáltató-
  //   adat (provider-switch PROVIDER_CATEGORIES_BY_COUNTRY CH/AT/DE/NL: valós
  //   szolgáltatók + felmondási szabályok + német/holland levél-sablon).
  // "szakmai-szotar" — KIVÉVE (2026-07-04): mind a 6 országra van szótár-bank
  //   (data.ts INDUSTRY_LESSONS + _AT/_DE/_NL, ország-tudatos TTS-nyelvvel).
  // "repulojegy" — már ország-tudatos (CH + AT + DE, lib/flights.ts); a komponens a
  // konfig nélküli országokat (NL) „hamarosan" üzenettel kezeli.
]);

/**
 * Megvannak CH-ban ÉS AT-ban, de DE/NL-ben még NEM (hiányzik a kvíz-kérdésbank /
 * a benchmark-seed). Ezeket DE/NL-ben rejtjük, amíg el nem készül a tartalmuk.
 */
export const CH_AT_ONLY_FEATURES: ReadonlySet<string> = new Set([
  // „allampolgarsag" KIVÉVE: mind a 6 országra van kérdésbank (CH Einbürgerung,
  // AT Staatsbürgerschaft, DE Einbürgerungstest, NL inburgering/KNM) → minden országban él.
  // „lakberles" KIVÉVE (2026-07-04): mind a 6 országra van rent-konfig (RENT_CONFIG
  //   CH/AT/DE/NL — kaució-szabály, rezsi-alapráta, tippek, hivatalos források).
  // "iranytu" — KIVÉVE: az Iránytű közösségi benchmark (a userek töltik), DE-tudatos
  // (region-util DE-ág), és fő nav-fül → ne tűnjön el DE-ben; üresen indul, mint AT.
]);

/**
 * Megvannak CH+AT+DE-ben, de NL-ben még NEM (nincs holland csekklista-tartalom).
 * Az ügyintézés-csekklisták mindhárom országra megírva (admin-checklists.ts).
 */
export const CH_AT_DE_ONLY_FEATURES: ReadonlySet<string> = new Set([
  // NL-en (egyelőre) rejtett: a tartalom CH/AT/DE-specifikus, nincs holland verzió.
  // Amint elkészül egy holland változat, vedd ki innen (vagy tedd per-ország listára).
  // "iskolarendszer" — KIVÉVE (2026-07-05): VAN holland változat (school-system
  //   NL_LEVELS: basisschool → VMBO/HAVO/VWO → MBO/HBO/WO) — mind a 6 országra él.
  // "tudasbazis" — KIVÉVE (2026-07-05): VAN holland guide-bank (GUIDES_NL,
  //   7 cikk: BRP+BSN / zorgverzekering / belasting+DigiD / school / werk /
  //   betaalrekening / huren) — mind a 6 országra él.
  // "kozlekedes" — KIVÉVE (2026-07-05): VAN holland verzió (transport NL_TARIF_
  //   SYSTEMS/NL_TICKET_TYPES + calculateNlTransport: OVpay/OV-chipkaart, NS,
  //   GVB/RET/HTM, Dal Voordeel) — mind a 6 országra él.
  // "bussen" — KIVÉVE (2026-07-05): VAN holland verzió (speeding-fine
  //   calculateFineNL: WAHV-boete + CJIB, 30 km/h fölött strafrecht, 50 km/h+
  //   rijbewijs ingevorderd) — mind a 6 országra él.
  // "akciok" — KIVÉVE (2026-07-05): VAN holland boltlánc-lista (DEAL_STORES_NL:
  //   Albert Heijn/Jumbo/Lidl/Aldi/PLUS/Dirk/Spar/Vomar); a geo-bbox + térkép-
  //   középpont már NL-kész — mind a 6 országra él.
  // "repulojegy" — KIVÉVE (2026-07-05): VAN holland konfig (flights.ts FLIGHT_
  //   CONFIG.NL: AMS/EIN/RTM ↔ BUD, KLM/Transavia/WizzAir/Ryanair) — mind a 6 ország.
  // "vizum" — KIVÉVE (2026-07-05): VAN holland verzió (permit-wizard STEPS_NL +
  //   evaluatePermitNL: vrij verkeer / BRP-inschrijving+BSN / duurzaam verblijf /
  //   kennismigrant) — mind a 6 országra él.
  // "berkalkulator" — KIVÉVE (2026-07-04): VAN holland verzió (computeSalaryNL,
  // 2025 Box 1 + heffingskortingen, c8bb005 óta él) — a 07-04-i vissza-gate-elés
  // tévedés volt („NL nincs" feltételezéssel).
]);

/**
 * Univerzális funkciók (minden országban): szaknévsor, állások, közösség,
 * vállalkozás-felvétel, árfolyam, repülőjegy, hírlevél, értesítések, ranglista,
 * akció-térkép — ezek nincsenek a CH-only halmazban, így automatikusan mennek.
 */

/**
 * ⚠️ ANGLIA (GB) — MEGFORDÍTOTT MODELL: EXPLICIT ENGEDÉLYEZŐ-LISTA.
 *
 * A CH/AT/DE/NL országoknál a modell „minden megy, kivéve a felsoroltakat".
 * GB-nél ez VESZÉLYES lenne: Anglia Brexit óta nem EU-tag, más az adórendszer
 * (PAYE/NI, nem AHV/Quellensteuer), más az egészségügy (NHS, nem Krankenkasse),
 * más a lakhatás (council tax, tenancy deposit scheme), és nincs sem
 * letelepedési varázslónk, sem állampolgársági kérdésbankunk hozzá. Ha a
 * „minden megy" ág érvényesülne, a magyar felhasználó SVÁJCI/EU-s számokat
 * látna hitelesnek tűnő módon — pontosan az a hiba-osztály, amit a
 * binary-country-fallthrough tanulság ír le.
 *
 * Ezért GB-ben CSAK az itt felsorolt funkciók jelennek meg — azok, amelyek
 * vagy ország-függetlenek (közösség, szaknévsor, állás-lista), vagy amelyekhez
 * ténylegesen készült GB-adat (vám-kalkulátor: gov.uk Brexit utáni keretek).
 *
 * Új GB-tartalom elkészültekor ADD HOZZÁ a kulcsot ehhez a listához — ne a
 * modellt fordítsd vissza.
 */
export const GB_ALLOWED_FEATURES: ReadonlySet<string> = new Set([
  // Ország-független közösségi/piac funkciók
  "szaknevsor",      // magyar szakemberek — a felhasználók töltik
  "allasok",         // állás-lista (aggregátor + saját hirdetés)
  "piacter",         // börze/albérlet — user-tartalom
  "keresek",         // igény-hirdetések
  "tortenetek",      // élettörténetek
  "iranytu",         // közösségi benchmark — a userek töltik
  "ranglista",
  "kviz",            // napi kvíz (általános, nem ország-jogi)
  "hatarido",        // saját határidők — a user viszi fel
  "b2b",             // zárt vállalkozói projektpiac
  "utalas",          // árfolyam/utalás — GBP→HUF ugyanúgy működik
  "vam",             // ⭐ VAN GB-konfig (customs.ts CUSTOMS_CONFIG.GB, gov.uk)
  "tudasbazis",      // ⭐ VAN GB guide-bank (guides.ts GUIDES_GB, 8 cikk gov.uk/NHS forrásból)
  // ⚠️ „angol-oneletrajz" INNEN KIKERÜLT — a CV-készítőket a CV_FEATURE_COUNTRIES
  //   tábla kapuzza, ami MINDEN ág előtt fut. Ha itt is szerepelne, két helyen
  //   kellene karbantartani ugyanazt a szabályt.
  "berkalkulator",   // ⭐ VAN GB-számítás (computeSalaryGB: PAYE + Class 1 NI)
  "vizum",           // ⭐ VAN GB letelepedés-varázsló (EUSS vs Skilled Worker)
  "ugyintezes",      // ⭐ VAN GB csekklista-bank (CHECKLISTS_GB, 6 db)
  "iskolarendszer",  // ⭐ VAN GB iskolarendszer (GB_LEVELS: Reception→GCSE→A-level)
  "kozlekedes",      // ⭐ VAN GB közlekedés (TfL capping, National Rail, Railcard)
  "allampolgarsag",  // ⭐ VAN GB kérdésbank (Life in the UK, GB_BANK)
  "szolgaltato-valto", // ⭐ VAN GB szolgáltató-adat (CASS bankváltás, Ofgem, Ofcom)
  "repulojegy",      // ⭐ VAN GB járat-konfig (7 angol reptér, WizzAir/Ryanair/BA)
  "lakberles",       // ⭐ VAN GB rent-konfig (5 heti kaució, TDP, council tax)
  "nyelvlecke",      // ⭐ VAN GB kurzus (data-gb.ts, 100 lecke: brit angol, en-GB TTS)
]);

/**
 * ⚠️ SPANYOLORSZÁG (ES) — szintén ENGEDÉLYEZŐ-LISTA, a GB-modell szerint.
 *
 * Spanyolország EU-tag, tehát a vám/letelepedés oldaláról közelebb van az
 * AT/DE/NL hármashoz, mint Anglia. A „minden megy, kivéve…" ág mégis hibás
 * lenne: az adórendszer (IRPF + Seguridad Social, autonóm közösségenként ELTÉRŐ
 * sávokkal), az egészségügy (tarjeta sanitaria a közösségtől függ, nem
 * Krankenkasse), a lakhatás (LAU, fianza) és mindenekelőtt az ÜGYINTÉZÉS
 * logikája (cita previa-kényszer) más. Ha a fel nem sorolt eszközök is
 * megjelennének, a spanyolországi magyar SVÁJCI számokat kapna hitelesnek tűnő
 * formában — ez a binary-country-fallthrough hiba-osztály.
 *
 * Új ES-tartalom elkészültekor ADD HOZZÁ a kulcsot ehhez a listához.
 */
export const ES_ALLOWED_FEATURES: ReadonlySet<string> = new Set([
  // Ország-független közösségi/piac funkciók
  "szaknevsor",        // magyar szakemberek — a felhasználók töltik
  "allasok",           // állás-lista (aggregátor + saját hirdetés)
  "piacter",           // börze/albérlet — user-tartalom
  "keresek",           // igény-hirdetések
  "tortenetek",        // élettörténetek
  "iranytu",           // közösségi benchmark — a userek töltik
  "ranglista",
  "kviz",              // napi kvíz (általános, nem ország-jogi)
  "hatarido",          // saját határidők — a user viszi fel
  "b2b",               // zárt vállalkozói projektpiac
  "utalas",            // árfolyam/utalás — EUR→HUF ugyanúgy működik
  // ── Spanyol tartalommal elkészült eszközök ──
  "tudasbazis",        // ⭐ VAN ES guide-bank (guides.ts GUIDES_ES, 12 cikk BOE/gob.es forrásból)
  "ugyintezes",        // ⭐ VAN ES csekklista-bank (CHECKLISTS_ES, 6 db, cita previa-tudatos)
  // ⚠️ „vam" SZÁNDÉKOSAN KIMARAD: Spanyolország EU-tag, nincs vámhatár
  //   Magyarország felé — vám-kalkulátort mutatni félrevezető lenne.
]);

/**
 * ⚠️ ÖNÉLETRAJZ-KÉSZÍTŐK — ORSZÁGONKÉNT PONTOSAN EGY a helyes.
 *
 * Ugyanaz az eszköz NÉGY ország-konvencióban (német Lebenslauf / brit CV /
 * holland CV / spanyol currículum). Hollandiában a német CV kifejezetten HIBÁS
 * ajánlás: a holland munkáltató holland nyelvű, holland szakma-megnevezésű CV-t
 * vár — és ugyanez igaz Spanyolországra is. Ezért minden országban CSAK a hozzá
 * illő belépési pont jelenik meg.
 *
 * ⚠️ 2026-07-29-ig ez ORSZÁGONKÉNT KÜLÖN ÁGON futott (NL_ONLY / NL_HIDDEN
 * halmaz), és emiatt az ANGOL CV-készítő minden országban látszott: sem a
 * menüben, sem a kereső-találatokban nem volt kapuja, a `c === "CH"` ág pedig
 * mindent beenged. A svájci felhasználó tehát „Német CV" és „Angol CV" közül
 * választhatott — értelmetlenül. Ezért lett belőle EGY tábla: itt egyszerre
 * látszik, hogy melyik készítő melyik országban való, és új ország felvételekor
 * nem lehet elfelejteni a másik irányt (elrejtést) megírni.
 *
 * Maguk az oldalak közvetlen linkről bárhonnan elérhetők maradnak — ez a
 * szabály csak a belépési pontokat (kezdőlap-rács, menü, kereső,
 * „Neked ajánljuk") rendezi.
 */
const CV_FEATURE_COUNTRIES: Readonly<Record<string, readonly string[]>> = {
  "nemet-oneletrajz": ["CH", "AT", "DE"], // a teljes német nyelvterület
  "holland-oneletrajz": ["NL"],
  "angol-oneletrajz": ["GB"],
  "spanyol-oneletrajz": ["ES"],
};

/**
 * Ország → a HELYES önéletrajz-készítő. Egyetlen forrás, hogy a szöveges
 * ajánlók (jelentkezés-oldal, hírlevél) ne csússzanak el a menü-gate-től.
 * Az `adj` a magyar mondatba illő melléknév („német önéletrajz").
 */
export const CV_BUILDER_BY_COUNTRY: Readonly<Record<string, { href: string; adj: string }>> = {
  CH: { href: "/nemet-oneletrajz", adj: "német" },
  AT: { href: "/nemet-oneletrajz", adj: "német" },
  DE: { href: "/nemet-oneletrajz", adj: "német" },
  NL: { href: "/holland-oneletrajz", adj: "holland" },
  GB: { href: "/angol-oneletrajz", adj: "angol" },
  ES: { href: "/spanyol-oneletrajz", adj: "spanyol" },
};

/** A megadott országhoz illő CV-készítő; ismeretlen ország → a német (CH-alap). */
export function cvBuilderFor(country: string | null | undefined): { href: string; adj: string } {
  return CV_BUILDER_BY_COUNTRY[country || DEFAULT_COUNTRY] ?? CV_BUILDER_BY_COUNTRY.CH;
}

export function isFeatureAvailable(
  feature: string,
  country: string | null | undefined,
): boolean {
  const c = country || DEFAULT_COUNTRY;
  // ⚠️ A CV-készítők kapuja MINDEN más ág ELŐTT fut — a lenti „CH-ban minden
  // elérhető" ág egyébként a holland CV-t is beengedné Svájcba, a GB/ES
  // engedélyező-lista pedig a sajátját duplán sorolná.
  const cvCountries = CV_FEATURE_COUNTRIES[feature];
  if (cvCountries) return cvCountries.includes(c);
  if (c === "CH") return true; // Svájcban minden elérhető (a teljes meglévő app)
  // GB: engedélyező-lista (ld. a GB_ALLOWED_FEATURES fenti magyarázatát) — a
  // fel nem sorolt funkciók REJTVE maradnak, mert nincs hozzájuk angol tartalom.
  if (c === "GB") return GB_ALLOWED_FEATURES.has(feature);
  // ES: ugyanaz a megfordított modell (ld. ES_ALLOWED_FEATURES).
  if (c === "ES") return ES_ALLOWED_FEATURES.has(feature);
  if (CH_ONLY_FEATURES.has(feature)) return false;
  // DE/NL: a csak-CH+AT funkciók még nem elérhetők (AT-ban igen).
  if (c !== "AT" && CH_AT_ONLY_FEATURES.has(feature)) return false;
  // NL: a CH+AT+DE funkciók még nem elérhetők (CH/AT/DE-ben igen).
  if (c !== "AT" && c !== "DE" && CH_AT_DE_ONLY_FEATURES.has(feature)) return false;
  return true;
}
