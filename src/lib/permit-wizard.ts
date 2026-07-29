/**
 * Svájci tartózkodási engedély-varázsló.
 *
 * 4-5 kérdés alapján javaslatot ad arra, melyik engedély-típus releváns
 * a felhasználónak (L / B / C / G / Schengen / nincs).
 *
 * FONTOS: ez egy tájékoztató eszköz, NEM jogi tanács. A pontos eljárásért
 * mindig a SEM (Staatssekretariat für Migration) vagy a kantoni
 * Migrationsamt oldalát kell ellenőrizni.
 */

export type PermitType =
  | "L" | "B" | "C" | "G" | "schengen" | "none"
  // Ausztria (EU-fókusz: szabad mozgás → regisztráció → tartós; RWR nem-EU-nak)
  | "at-freizug" | "at-anmeldung" | "at-dauer" | "at-rwr"
  // Németország (EU: Freizügigkeit → Anmeldung → Daueraufenthalt; Blaue Karte nem-EU-nak)
  | "de-freizug" | "de-anmeldung" | "de-dauer" | "de-aufenthalt"
  // Hollandia (EU: vrij verkeer → BRP-inschrijving/BSN → duurzaam verblijf; verblijfsvergunning nem-EU-nak)
  | "nl-vrijverkeer" | "nl-inschrijving" | "nl-duurzaam" | "nl-verblijf"
  | "gb-settled" | "gb-presettled" | "gb-skilled" | "gb-other"
  // Spanyolország (EU: szabad beutazás → registro/NIE → permanente; tarjeta nem-EU-nak)
  | "es-libre" | "es-registro" | "es-permanente" | "es-tarjeta";

export interface PermitInfo {
  type: PermitType;
  name: string;
  shortDesc: string;
  emoji: string;
  /** Hex szín az UI-hoz. */
  color: string;
  duration: string;
  workPermitted: string;
  cantonChange: string;
  familyReunion: string;
  pros: string[];
  cons: string[];
  applyTo: string;
  /** Hivatalos linkek. */
  links: { label: string; url: string }[];
}

export const PERMITS: Record<PermitType, PermitInfo> = {
  L: {
    type: "L",
    name: "L — Kurzaufenthalt (rövid távú)",
    emoji: "📅",
    color: "#3a6ea5",
    shortDesc: "1 év, max 24 hónap — szezonális/időszakos munka vagy tanulás",
    duration: "Max 1 év, egyszer meghosszabbítható (összesen 24 hó).",
    workPermitted: "Igen, ha munkaszerződésed van.",
    cantonChange: "Korlátozott — új L kell.",
    familyReunion: "Nehéz, jellemzően nem megengedett.",
    pros: [
      "Gyors elintézés (1-2 hónap)",
      "EU-állampolgárként szabad munkaválasztás",
      "Adminisztráció minimális",
    ],
    cons: [
      "Max 24 hónap — utána nem hosszabbítható",
      "Családtaggal nehezebb",
      "Quellensteuer fizetendő",
    ],
    applyTo: "A kantoni Migrationsamt (a munkáltatód helye szerint).",
    links: [
      { label: "SEM — L-Bewilligung", url: "https://www.sem.admin.ch/sem/de/home/themen/aufenthalt/eu_efta/ausweis_l_eu_efta.html" },
    ],
  },
  B: {
    type: "B",
    name: "B — Aufenthaltsbewilligung (tartózkodási)",
    emoji: "🪪",
    color: "#1d4434",
    shortDesc: "5 év (EU) — a leggyakoribb tartózkodási engedély",
    duration: "EU/EFTA: 5 év, hosszabbítható. Nem-EU: 1 év + hosszabbítható.",
    workPermitted: "Igen, EU-állampolgárként szabadon.",
    cantonChange: "Lehetséges (kanton-engedéllyel).",
    familyReunion: "Igen — házastárs + 18 év alatti gyerekek.",
    pros: [
      "EU-állampolgárként legtöbb jog",
      "Családtag-egyesítés engedélyezett",
      "5 év után meghosszabbítható",
    ],
    cons: [
      "Quellensteuer kötelező (bér-automatikus)",
      "5 év után új meghosszabbítás kell",
      "Nem-EU-snak ÖSSZESEN nehéz megszerezni (kvótás)",
    ],
    applyTo: "A kantoni Migrationsamt — a bejelentkezésed után automatikusan kapod.",
    links: [
      { label: "SEM — B-Bewilligung EU/EFTA", url: "https://www.sem.admin.ch/sem/de/home/themen/aufenthalt/eu_efta/ausweis_b_eu_efta.html" },
    ],
  },
  C: {
    type: "C",
    name: "C — Niederlassungsbewilligung (letelepedési)",
    emoji: "🆔",
    color: "#7f4a1d",
    shortDesc: "Határozatlan — gyakorlatilag 'permanent resident' státusz",
    duration: "Határozatlan idejű. 5 évente biometriai frissítés (kártya).",
    workPermitted: "Igen, korlátlanul. Munkahely-váltás szabad.",
    cantonChange: "Szabad, csak bejelentés szükséges.",
    familyReunion: "Igen, az összes közvetlen családtag.",
    pros: [
      "Quellensteuer megszűnik (normál adózás)",
      "Munkahely-váltás teljesen szabad",
      "Kanton-váltás csak bejelentés",
      "Hitelfelvétel könnyebb",
      "Választójog kantoni szinten (egyes kantonokban)",
    ],
    cons: [
      "5 év B-engedélyt kell előtte (magyaroknak)",
      "B1 szóban + A2 írásban nyelvtudás",
      "Strafregister + Betreibungsauszug bemutatása",
      "Kérvény-díj kb. 100-200 CHF",
    ],
    applyTo: "A kantoni Migrationsamt — kérvénnyel, miután jogosult vagy rá.",
    links: [
      { label: "SEM — C-Bewilligung EU/EFTA", url: "https://www.sem.admin.ch/sem/de/home/themen/aufenthalt/eu_efta/ausweis_c_eu_efta.html" },
    ],
  },
  G: {
    type: "G",
    name: "G — Grenzgänger (határátlépő)",
    emoji: "🚗",
    color: "#5b21b6",
    shortDesc: "Szomszéd országban lakol, CH-ban dolgozol — naponta hazajársz",
    duration: "5 év (EU). Hetente legalább egyszer hazatérés kötelező.",
    workPermitted: "Igen — CH-ban dolgozol, de NEM laksz itt.",
    cantonChange: "A munkahely-kantonokra korlátozott.",
    familyReunion: "Nem releváns — a család a másik országban él.",
    pros: [
      "Olcsóbb élet külföldön (DE/AT/FR/IT)",
      "Magas svájci bér mellett alacsonyabb költség",
      "Nem kell svájci Krankenkasse (külföldi biztosítás OK)",
    ],
    cons: [
      "Naponta utazás (akár 1-2 óra)",
      "Hetente legalább 1× hazatérés kötelező",
      "Az adózás megosztva (CH-ban Quellensteuer, otthon is adózol)",
      "Kanton-korlátozott",
    ],
    applyTo: "A kantoni Migrationsamt + a határ-régió hatóság.",
    links: [
      { label: "SEM — G-Bewilligung", url: "https://www.sem.admin.ch/sem/de/home/themen/aufenthalt/eu_efta/ausweis_g_eu_efta.html" },
    ],
  },
  schengen: {
    type: "schengen",
    name: "Schengen-vízum (rövid távú)",
    emoji: "✈️",
    color: "#dc2626",
    shortDesc: "Max 90 nap 180 napon belül — turizmus, üzleti út, családlátogatás",
    duration: "Max 90 nap egy 180 napos periódusban.",
    workPermitted: "NEM — munkavállalás tilos Schengen-vízummal.",
    cantonChange: "Nincs kanton-bejelentés.",
    familyReunion: "Nem alkalmazható.",
    pros: [
      "Gyors elintézés (1-2 hét)",
      "Egyszerű kérvény",
      "Egész Schengen-térségben utazhatsz",
    ],
    cons: [
      "Csak 90 nap",
      "Munkavállalás tilos",
      "Hosszabbítás nem lehetséges (csak újabb 90 napos vízummal egy év múlva)",
    ],
    applyTo: "A svájci nagykövetség vagy konzulátus a hazádban.",
    links: [
      { label: "EDA — Schengen-vízum", url: "https://www.eda.admin.ch/eda/de/home/services-und-publikationen/visumvorschriften.html" },
    ],
  },
  none: {
    type: "none",
    name: "Nincs engedély szükséges",
    emoji: "✅",
    color: "#16a34a",
    shortDesc: "EU-állampolgárként 90 napig vízummentesen tartózkodhatsz",
    duration: "Max 90 nap 180 napon belül — csak vendég-státusz.",
    workPermitted: "NEM — munkavállaláshoz engedély kell.",
    cantonChange: "Nincs hivatalos bejelentés.",
    familyReunion: "Nem releváns ezen az időkereten.",
    pros: [
      "Semmi adminisztráció",
      "Csak útlevél / személyi kell",
      "Egész Schengen-térségben szabad mozgás",
    ],
    cons: [
      "Max 90 nap",
      "Munka tilos",
      "Hosszabb tartózkodáshoz L vagy B engedély kell",
    ],
    applyTo: "Nincs hova — csak utazz be ID-vel / útlevéllel.",
    links: [
      { label: "ch.ch — Beutazás Svájcba", url: "https://www.ch.ch/de/leben-in-der-schweiz/einreise/" },
    ],
  },

  // ── Ausztria ──────────────────────────────────────────────────────────────
  "at-freizug": {
    type: "at-freizug",
    name: "Szabad mozgás (EU) — nincs engedély",
    emoji: "✅",
    color: "#16a34a",
    shortDesc: "EU-állampolgárként engedély nélkül tartózkodhatsz és dolgozhatsz",
    duration: "Korlátlan — a személyek szabad mozgása alapján.",
    workPermitted: "Igen, azonnal és szabadon (EU-állampolgár).",
    cantonChange: "Szabad — Ausztrián belül bárhova költözhetsz.",
    familyReunion: "EU-családtag szabadon; nem-EU családtag: Aufenthaltskarte.",
    pros: ["Nincs engedély-kérelem", "Szabad munkavállalás az első naptól", "Szabad költözés Ausztrián belül"],
    cons: ["3 hónapnál hosszabb tartózkodáshoz regisztrálni kell (Anmeldebescheinigung)", "A Meldezettel (lakcím) 3 napon belül kötelező"],
    applyTo: "Nincs hova — érvényes útlevél/igazolvány elég. A lakcímet a Meldeamtban jelented be.",
    links: [{ label: "oesterreich.gv.at — EU-Bürger", url: "https://www.oesterreich.gv.at/themen/leben_in_oesterreich/aufenthalt.html" }],
  },
  "at-anmeldung": {
    type: "at-anmeldung",
    name: "Anmeldebescheinigung (EU-regisztráció)",
    emoji: "🪪",
    color: "#1d4434",
    shortDesc: "3 hónapnál hosszabb EU-tartózkodás regisztrációs igazolása",
    duration: "Határozatlan, amíg a feltételek (munka / önfenntartás) fennállnak.",
    workPermitted: "Igen, szabadon.",
    cantonChange: "Szabad (Ausztrián belül).",
    familyReunion: "Igen (EU-családtag); nem-EU családtagnak Aufenthaltskarte.",
    pros: ["A személyek szabad mozgásán alapul", "Igazolás, NEM klasszikus »engedély«", "5 év után tartós tartózkodás (Daueraufenthalt)"],
    cons: ["A beköltözéstől 4 hónapon belül kérni kell (ha >3 hó maradsz)", "Igazolni kell: munka/önfoglalkoztatás VAGY elég pénz + egészségbiztosítás"],
    applyTo: "A lakóhely szerinti tartózkodási hatóság (Bécsben az MA 35; tartományokban a Landeshauptmann/BH).",
    links: [{ label: "oesterreich.gv.at — Anmeldebescheinigung", url: "https://www.oesterreich.gv.at/themen/leben_in_oesterreich/aufenthalt/3.html" }],
  },
  "at-dauer": {
    type: "at-dauer",
    name: "Daueraufenthalt (tartós tartózkodás)",
    emoji: "🆔",
    color: "#7f4a1d",
    shortDesc: "5 év jogszerű EU-tartózkodás után — megerősített státusz",
    duration: "Határozatlan — 5 év folyamatos jogszerű tartózkodás után.",
    workPermitted: "Igen, korlátlanul.",
    cantonChange: "Szabad.",
    familyReunion: "Igen.",
    pros: ["5 év folyamatos jogszerű tartózkodás után jár", "Erősebb védelem a kiutasítás ellen", "Megerősített letelepedési státusz"],
    cons: ["5 év folyamatos tartózkodás kell", "Kérni kell a »Bescheinigung des Daueraufenthalts«-ot"],
    applyTo: "A lakóhely szerinti tartózkodási hatóság (Niederlassungsbehörde).",
    links: [{ label: "oesterreich.gv.at — Daueraufenthalt", url: "https://www.oesterreich.gv.at/themen/leben_in_oesterreich/aufenthalt.html" }],
  },
  "at-rwr": {
    type: "at-rwr",
    name: "Rot-Weiß-Rot Karte (nem-EU)",
    emoji: "🌍",
    color: "#dc2626",
    shortDesc: "Harmadik országbeli (nem-EU) képzett munkaerőnek — pontrendszer",
    duration: "Kezdetben 24 hónap (RWR), majd RWR plus.",
    workPermitted: "Igen — kezdetben adott munkáltatónál, RWR plus után szabadon.",
    cantonChange: "Ausztrián belül szabad.",
    familyReunion: "Igen (RWR – Familienangehörige).",
    pros: ["Képzett munkaerőnek / hiányszakmáknak", "Pontrendszer (Punktesystem)", "RWR plus után szabad munkaerőpiac"],
    cons: ["Csak harmadik országbeli (nem-EU) állampolgárnak", "Pontrendszer + jövedelem-feltétel", "Hosszabb eljárás (több hónap)"],
    applyTo: "Tartózkodási hatóság (ABH) / osztrák képviselet külföldön; az AMS munkaerőpiaci értékelésével.",
    links: [{ label: "migration.gv.at — Rot-Weiß-Rot Karte", url: "https://www.migration.gv.at/" }],
  },
  "de-freizug": {
    type: "de-freizug",
    name: "Freizügigkeit (EU) — nincs engedély",
    emoji: "✅",
    color: "#16a34a",
    shortDesc: "EU-állampolgárként engedély nélkül élhetsz és dolgozhatsz Németországban",
    duration: "Korlátlan — a személyek szabad mozgása alapján.",
    workPermitted: "Igen, azonnal és szabadon (EU-állampolgár).",
    cantonChange: "Szabad — Németországon belül bárhova költözhetsz.",
    familyReunion: "EU-családtag szabadon; nem-EU családtag: Aufenthaltskarte.",
    pros: ["Nincs engedély-kérelem", "Szabad munkavállalás az első naptól", "Szabad költözés Németországon belül"],
    cons: ["A lakcímet a beköltözéstől ~1-2 héten belül be kell jelenteni (Anmeldung)", "A Freizügigkeitsbescheinigungot 2013-ban eltörölték — nincs külön EU-papír"],
    applyTo: "Nincs hova — érvényes útlevél/igazolvány elég. A lakcímet a Bürgeramtban jelented be (Anmeldung).",
    links: [{ label: "make-it-in-germany.com — EU-Bürger", url: "https://www.make-it-in-germany.com/" }],
  },
  "de-anmeldung": {
    type: "de-anmeldung",
    name: "Anmeldung (lakcím-bejelentés)",
    emoji: "🪪",
    color: "#1d4434",
    shortDesc: "A kötelező lakcím-regisztráció a Bürgeramtnál — mindenhez ez kell",
    duration: "A lakcím érvényességéig; költözéskor újra (Ummeldung).",
    workPermitted: "Igen, szabadon (EU-állampolgár).",
    cantonChange: "Szabad; új lakcímnél Ummeldung.",
    familyReunion: "Igen (EU-családtag); nem-EU családtagnak Aufenthaltskarte.",
    pros: ["A Meldebescheinigung kell a bankszámlához, Steuer-ID-hoz, biztosításhoz", "Egyszerű, díjmentes (a legtöbb városban)", "5 év után Daueraufenthalt-jogosultság"],
    cons: ["A beköltözéstől ~1-2 héten belül kötelező (városonként eltér, pl. Berlin 14 nap)", "Termin kell a Bürgeramtnál — nagyvárosban hetekre előre telt"],
    applyTo: "A lakóhely szerinti Bürgeramt / Einwohnermeldeamt (Termin-foglalással).",
    links: [{ label: "make-it-in-germany.com — Anmeldung", url: "https://www.make-it-in-germany.com/de/leben-in-deutschland/erste-schritte/anmeldung" }],
  },
  "de-dauer": {
    type: "de-dauer",
    name: "Daueraufenthalt-EU (tartós tartózkodás)",
    emoji: "🆔",
    color: "#7f4a1d",
    shortDesc: "5 év jogszerű EU-tartózkodás után — megerősített státusz",
    duration: "Határozatlan — 5 év folyamatos jogszerű tartózkodás után.",
    workPermitted: "Igen, korlátlanul.",
    cantonChange: "Szabad.",
    familyReunion: "Igen.",
    pros: ["5 év folyamatos jogszerű tartózkodás után jár", "Erősebb védelem a kiutasítás ellen", "Megerősített letelepedési státusz"],
    cons: ["5 év folyamatos tartózkodás kell", "Kérni kell a »Bescheinigung des Daueraufenthalts«-ot a hatóságnál"],
    applyTo: "A lakóhely szerinti idegenrendészeti hatóság (Ausländerbehörde).",
    links: [{ label: "make-it-in-germany.com — Daueraufenthalt", url: "https://www.make-it-in-germany.com/" }],
  },
  "de-aufenthalt": {
    type: "de-aufenthalt",
    name: "Aufenthaltstitel / Blaue Karte EU (nem-EU)",
    emoji: "🌍",
    color: "#dc2626",
    shortDesc: "Harmadik országbeli (nem-EU) képzett munkaerőnek — Blaue Karte EU",
    duration: "Aufenthaltserlaubnis (határozott); Blaue Karte után Niederlassungserlaubnis.",
    workPermitted: "Igen — a Blaue Karte EU képzett munkaerőnek, jövedelmi küszöbbel.",
    cantonChange: "Németországon belül szabad.",
    familyReunion: "Igen (a Blaue Karte kedvező családegyesítéssel).",
    pros: ["Blaue Karte EU képzett munkaerőnek (Fachkräfteeinwanderungsgesetz)", "Gyorsabb út a letelepedéshez (Niederlassungserlaubnis)", "Kedvező családegyesítés"],
    cons: ["Csak harmadik országbeli (nem-EU) állampolgárnak", "Elismert végzettség + jövedelmi küszöb kell", "Eljárás a Botschaft/Ausländerbehörde-n keresztül"],
    applyTo: "Német külképviselet (vízum) + a lakóhely szerinti Ausländerbehörde.",
    links: [{ label: "make-it-in-germany.com — Blaue Karte", url: "https://www.make-it-in-germany.com/" }],
  },
  "nl-vrijverkeer": {
    type: "nl-vrijverkeer",
    name: "Vrij verkeer (EU) — nincs engedély",
    emoji: "✅",
    color: "#16a34a",
    shortDesc: "EU-állampolgárként engedély nélkül élhetsz és dolgozhatsz Hollandiában",
    duration: "Korlátlan — a személyek szabad mozgása alapján.",
    workPermitted: "Igen, azonnal és szabadon (EU-állampolgár).",
    cantonChange: "Szabad — Hollandián belül bárhova költözhetsz.",
    familyReunion: "EU-családtag szabadon; nem-EU családtagnak IND-verblijfsdocument.",
    pros: ["Nincs engedély-kérelem", "Szabad munkavállalás az első naptól", "Szabad költözés Hollandián belül"],
    cons: ["A gemeenténél be kell jelentkezned (BRP) — a BSN mindenhez kell", "Az EU-verblijfsdocument opcionális (2014 óta nem kötelező)"],
    applyTo: "Nincs hova — érvényes útlevél/igazolvány elég. A gyakorlati lépés a BRP-regisztráció a gemeenténél.",
    links: [{ label: "IND — EU/EER-burgers", url: "https://ind.nl/en/eu-eea-and-swiss-citizens" }],
  },
  "nl-inschrijving": {
    type: "nl-inschrijving",
    name: "Inschrijving BRP + BSN (bejelentkezés)",
    emoji: "🪪",
    color: "#1d4434",
    shortDesc: "A kötelező gemeente-regisztráció (BRP) — a BSN mindenhez kell",
    duration: "A lakcím érvényességéig; költözéskor újra bejelentkezés.",
    workPermitted: "Igen, szabadon (EU-állampolgár).",
    cantonChange: "Szabad; új lakcímnél újra-regisztráció a gemeenténél.",
    familyReunion: "Igen (EU-családtag); nem-EU családtagnak IND-verblijfsvergunning.",
    pros: ["A BSN kell a munkához, bankszámlához, zorgverzekeringhez és az adóhoz", "4+ hónap tartózkodásnál a BRP-regisztráció kötelező", "5 év után duurzaam verblijf-jogosultság"],
    cons: ["Időpont (afspraak) kell a gemeenténél — nagyvárosban hetekre előre telt", "4 hónapnál rövidebb tartózkodásnál RNI-regisztráció kell a BSN-hez"],
    applyTo: "A lakóhely szerinti gemeente (önkormányzat), időpontfoglalással.",
    links: [{ label: "Rijksoverheid — BSN", url: "https://www.government.nl/topics/personal-data/citizen-service-number-bsn" }],
  },
  "nl-duurzaam": {
    type: "nl-duurzaam",
    name: "Duurzaam verblijfsrecht (tartós tartózkodás)",
    emoji: "🆔",
    color: "#7f4a1d",
    shortDesc: "5 év jogszerű EU-tartózkodás után — megerősített státusz",
    duration: "Határozatlan — 5 év folyamatos jogszerű tartózkodás után.",
    workPermitted: "Igen, korlátlanul.",
    cantonChange: "Szabad.",
    familyReunion: "Igen.",
    pros: ["5 év folyamatos jogszerű tartózkodás után jár", "Erősebb védelem a kiutasítás ellen", "Kérhető a »duurzaam verblijfsdocument« az IND-nél"],
    cons: ["5 év folyamatos tartózkodás kell", "A dokumentumot kérni kell (nem automatikus)"],
    applyTo: "Immigratie- en Naturalisatiedienst (IND).",
    links: [{ label: "IND — Duurzaam verblijf EU", url: "https://ind.nl/en/eu-eea-and-swiss-citizens" }],
  },
  // ─────────────── ANGLIA (Brexit után) ───────────────
  // ⚠️ Itt az EU-állampolgárság ÖNMAGÁBAN NEM jogosít semmire — 2021.01.01. óta
  // nincs szabad mozgás. A döntő kérdés: 2020.12.31. ELŐTT itt éltél-e már.
  "gb-settled": {
    type: "gb-settled",
    name: "Settled status (indefinite leave to remain)",
    emoji: "🏅",
    color: "#16a34a",
    shortDesc: "Határozatlan idejű letelepedés az EU Settlement Scheme alapján",
    duration: "Határozatlan — de 5 évnél hosszabb külföldi távollét megszüntetheti.",
    workPermitted: "Igen, korlátlanul — bármilyen munkáltatónál, szponzor nélkül.",
    cantonChange: "Szabad — az Egyesült Királyságon belül bárhova költözhetsz.",
    familyReunion: "Igen; a közeli hozzátartozókra külön EUSS-szabályok élnek.",
    pros: ["Korlátlan munkavállalás, szponzor nélkül", "Nincs vízumdíj és nincs IHS", "5 év után állampolgárság kérhető", "Jogosultság a legtöbb ellátásra"],
    cons: ["Csak annak jár, aki 2020.12.31. előtt itt élt", "5+ év távollét elveszejtheti", "A státusz digitális — share code-dal kell igazolni"],
    applyTo: "Home Office — EU Settlement Scheme (aki még nem jelentkezett, „reasonable grounds” esetén késve is megteheti).",
    links: [{ label: "gov.uk — EU Settlement Scheme", url: "https://www.gov.uk/settled-status-eu-citizens-families" }],
  },
  "gb-presettled": {
    type: "gb-presettled",
    name: "Pre-settled status (5 év alatt)",
    emoji: "🕗",
    color: "#d8a32a",
    shortDesc: "Határozott idejű EUSS-státusz, ami 5 év után settledre váltható",
    duration: "5 év; 2023 óta automatikusan hosszabbítják, de a settledért JELENTKEZNI kell.",
    workPermitted: "Igen, korlátlanul — szponzor nélkül.",
    cantonChange: "Szabad az Egyesült Királyságon belül.",
    familyReunion: "Igen, EUSS-szabályok szerint.",
    pros: ["Korlátlan munkavállalás", "Nincs szponzor-kötelezettség", "5 év után settled statusra váltható"],
    cons: ["⚠️ A settled statusért KÜLÖN jelentkezni kell — nem automatikus", "Hosszabb távollét megszakíthatja a folyamatos tartózkodást", "Digitális státusz, share code kell az igazoláshoz"],
    applyTo: "Home Office — EU Settlement Scheme; az 5 év meglétekor váltás settled statusra.",
    links: [{ label: "gov.uk — Settled and pre-settled status", url: "https://www.gov.uk/settled-status-eu-citizens-families" }],
  },
  "gb-skilled": {
    type: "gb-skilled",
    name: "Skilled Worker vízum",
    emoji: "🛂",
    color: "#c8392e",
    shortDesc: "Munkavállalói vízum — KELL hozzá szponzor-engedélyes munkáltató",
    duration: "Max. 5 év, hosszabbítható; 5 év után ILR (letelepedés) kérhető.",
    workPermitted: "Igen, de KIZÁRÓLAG a szponzoráló munkáltatónál (munkahelyváltáshoz új szponzorálás kell).",
    cantonChange: "Szabad a költözés, de a munkáltató-váltás engedélyhez kötött.",
    familyReunion: "Igen (dependant partner/gyerek), külön díjjal és IHS-sel fejenként.",
    pros: ["5 év után letelepedés (ILR) kérhető", "Családtag hozható", "Több szakmában alacsonyabb bérküszöb (egészségügy, oktatás)"],
    cons: ["⚠️ Munkáltatóhoz kötött — állásvesztésnél 60 nap az új szponzor keresésére", "Drága: vízumdíj + IHS (~1035 £/év/fő) ELŐRE, a teljes időszakra", "Bérküszöb és angol nyelvvizsga (B1) kell", "A munkáltatónak sponsor licence-szel kell rendelkeznie"],
    applyTo: "Home Office (gov.uk) — Certificate of Sponsorship a munkáltatótól, majd online kérelem.",
    links: [{ label: "gov.uk — Skilled Worker visa", url: "https://www.gov.uk/skilled-worker-visa" }],
  },
  "gb-other": {
    type: "gb-other",
    name: "Egyéb vízum-út (tanulmány, család, tehetség)",
    emoji: "🎓",
    color: "#1d4434",
    shortDesc: "Student, Family, Graduate, Global Talent vagy Health and Care Worker vízum",
    duration: "Úttól függ (Student: a képzés hossza; Family: 2,5–5 év; Graduate: 2 év).",
    workPermitted: "Úttól függ — Studentnél korlátozott óraszám, Family/Graduate vízumnál szabad.",
    cantonChange: "Szabad az Egyesült Királyságon belül.",
    familyReunion: "Úttól függ; a Family vízumnál jövedelmi küszöb van.",
    pros: ["Nem mindegyikhez kell munkáltatói szponzor (pl. Graduate, Family)", "A Health and Care Worker vízum olcsóbb és IHS-mentes", "Brit diploma után 2 év szabad munkavállalás (Graduate)"],
    cons: ["Mindegyikhez vízumdíj és jellemzően IHS jár", "Feltételek úttól függően szigorúak (jövedelem, nyelv, megélhetés)", "Turista-vízummal DOLGOZNI TILOS"],
    applyTo: "Home Office (gov.uk) — az adott vízum-típus online kérelmén keresztül.",
    links: [
      { label: "gov.uk — Vízum-kereső", url: "https://www.gov.uk/check-uk-visa" },
      { label: "gov.uk — Health and Care Worker visa", url: "https://www.gov.uk/health-care-worker-visa" },
    ],
  },
  "nl-verblijf": {
    type: "nl-verblijf",
    name: "Verblijfsvergunning / kennismigrant (nem-EU)",
    emoji: "🌍",
    color: "#dc2626",
    shortDesc: "Harmadik országbeli (nem-EU) — verblijfsvergunning / kennismigrant / EU Blue Card",
    duration: "Határozott (verblijfsvergunning); 5 év után onbepaalde tijd.",
    workPermitted: "Igen — a kennismigrant / EU Blue Card képzett munkaerőnek, jövedelmi küszöbbel.",
    cantonChange: "Hollandián belül szabad.",
    familyReunion: "Igen (kedvező a kennismigrant / Blue Card esetén).",
    pros: ["Kennismigrantenregeling (highly skilled migrant) elismert munkáltatóval (erkende referent)", "Gyors IND-eljárás elismert referens esetén", "EU Blue Card is elérhető"],
    cons: ["Csak harmadik országbeli (nem-EU) állampolgárnak", "MVV-vízum + jövedelmi küszöb + elismert munkáltató kell", "Az eljárás az IND-en keresztül megy"],
    applyTo: "Holland külképviselet (MVV) + Immigratie- en Naturalisatiedienst (IND).",
    links: [{ label: "IND — Working in the Netherlands", url: "https://ind.nl/en/work" }],
  },
  // ⚠️ SPANYOLORSZÁG. A jogi helyzet egyszerű (EU-tag, szabad mozgás), a
  // GYAKORLATI viszont nem: a regisztrációhoz cita previa kell, ami hetekre
  // előre elfogyhat. Ezért minden spanyol bejegyzés kimondja az időzítést —
  // a legtöbb elakadás nem jogi, hanem naptári.
  "es-libre": {
    type: "es-libre",
    name: "Szabad tartózkodás (első 3 hónap)",
    emoji: "🛬",
    color: "#3a6ea5",
    shortDesc: "Uniós polgárként az első 3 hónapban semmit nem kell intézned",
    duration: "Legfeljebb 3 hónap — utána regisztrációs kötelezettség.",
    workPermitted: "Igen, korlátlanul — uniós polgárként engedély nélkül dolgozhatsz.",
    cantonChange: "Szabad — az országon belül bárhova költözhetsz.",
    familyReunion: "Igen; uniós családtagra ugyanez vonatkozik.",
    pros: ["Semmilyen engedély nem kell", "Azonnal munkába állhatsz", "Elég az érvényes útlevél vagy személyi"],
    cons: ["3 hónap után regisztrálni KELL", "NIE nélkül nincs szerződés, bankszámla, bejelentés", "Az empadronamiento nélkül nincs egészségügyi kártya"],
    applyTo: "Nincs teendő — de az empadronamientót és a NIE-t érdemes AZONNAL elkezdeni (időpont-várakozás!).",
    links: [{ label: "Real Decreto 240/2007 (BOE)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-4184" }],
  },
  "es-registro": {
    type: "es-registro",
    name: "Certificado de registro (zöld igazolás)",
    emoji: "🪪",
    color: "#16a34a",
    shortDesc: "Uniós polgár regisztrációja — 3 hónapnál hosszabb tartózkodáshoz kötelező",
    duration: "Határozatlan, de 5 év után érdemes állandóra váltani.",
    workPermitted: "Igen, korlátlanul.",
    cantonChange: "Szabad; címváltozásnál az empadronamientót frissítsd.",
    familyReunion: "Igen; nem-EU családtag külön kártyát (tarjeta) kap.",
    pros: ["Tartalmazza a NIE-számot — ez kell minden ügyhöz", "Egyszeri eljárás, nem kell megújítani", "Uniós polgárként alanyi jogon jár, ha teljesíted a feltételt"],
    cons: ["⚠️ Cita previa kell — hetekre előre elfogyhat", "Igazolni kell, miből élsz (munka / fedezet + biztosítás)", "A díjat ELŐRE be kell fizetni (modelo 790, 012)", "NEM személyi igazolvány — az útlevelet is vinni kell mellé"],
    applyTo: "Oficina de Extranjería vagy a Policía Nacional idegenrendészeti ügyfélszolgálata, EX-18 nyomtatvánnyal.",
    links: [
      { label: "Cita previa — extranjería", url: "https://sede.administracionespublicas.gob.es/pagina/index/directorio/icpplus" },
      { label: "Real Decreto 240/2007 (BOE)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-4184" },
    ],
  },
  "es-permanente": {
    type: "es-permanente",
    name: "Residencia permanente (5 év után)",
    emoji: "🏅",
    color: "#0ea5e9",
    shortDesc: "Állandó tartózkodási igazolás 5 év folyamatos tartózkodás után",
    duration: "Határozatlan.",
    workPermitted: "Igen, korlátlanul.",
    cantonChange: "Szabad.",
    familyReunion: "Igen, kedvezőbb feltételekkel.",
    pros: ["Már NEM kell igazolnod, miből élsz", "Erősebb jogállás, nehezebben veszíthető el", "Az állampolgársághoz vezető út része"],
    cons: ["5 év folyamatos, jogszerű tartózkodás kell hozzá", "Hosszabb távollét megszakíthatja a folyamatosságot", "⚠️ Ehhez is cita previa kell"],
    applyTo: "Oficina de Extranjería — a folyamatos tartózkodás igazolásával.",
    links: [{ label: "Real Decreto 240/2007 (BOE)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-4184" }],
  },
  "es-tarjeta": {
    type: "es-tarjeta",
    name: "TIE — Tarjeta de Identidad de Extranjero",
    emoji: "💳",
    color: "#e3a233",
    shortDesc: "Nem-uniós állampolgárok tartózkodási kártyája",
    duration: "A megadott engedély szerint, megújítandó.",
    workPermitted: "Az engedély típusától függ (munkavállalási jogot külön kell tartalmaznia).",
    cantonChange: "Az engedély feltételei szerint.",
    familyReunion: "Külön eljárás (reagrupación familiar), feltételekkel.",
    pros: ["Fényképes okmány — a zöld igazolással ellentétben azonosításra is jó", "Uniós polgár családtagjaként kedvezőbb elbírálás"],
    cons: ["Nem uniós polgárként bonyolultabb és hosszabb eljárás", "Ujjnyomat-vétel miatt személyes megjelenés kötelező", "Megújítási kötelezettség"],
    applyTo: "Oficina de Extranjería / Policía Nacional — ujjnyomat-vétellel.",
    links: [{ label: "Policía Nacional — ügyfélportál", url: "https://sede.policia.gob.es/portalCiudadano/" }],
  },
};

// ---------------------------------------------------------------------------
// Decision-tree
// ---------------------------------------------------------------------------

export interface WizardAnswers {
  /** "eu" = EU/EFTA-állampolgár (incl. Magyarország), "non-eu" = harmadik országbeli. */
  citizenship: "eu" | "non-eu";
  /** Mennyi időre tervezi maradni. */
  duration: "short" | "medium" | "long" | "permanent";
  /** Fő célja. */
  purpose: "work" | "study" | "family" | "retired" | "cross-border";
  /** Volt-e már svájci tartózkodási engedélye, és mennyi ideig. */
  previousStay: "none" | "less-than-5" | "5-or-more";
}

export interface WizardResult {
  primary: PermitType;
  /** Alternatív / másodlagos megoldások (max 2). */
  alternatives: PermitType[];
  /** Egyedi tanácsok ehhez a kombinációhoz. */
  notes: string[];
}

export function evaluatePermit(a: WizardAnswers, country: string = "CH"): WizardResult {
  if (country === "AT") return evaluatePermitAT(a);
  if (country === "DE") return evaluatePermitDE(a);
  if (country === "NL") return evaluatePermitNL(a);
  if (country === "GB") return evaluatePermitGB(a);
  if (country === "ES") return evaluatePermitES(a);
  // 1. Cross-border (G-engedély) — különleges eset
  if (a.purpose === "cross-border") {
    return {
      primary: "G",
      alternatives: [],
      notes: [
        "A G-engedélyhez szomszéd országban (DE/AT/FR/IT/LI) kell laknod.",
        "Munkáltatód intézi a bejelentést a kantoni Migrationsamt-on.",
        "Hetente legalább egyszer haza kell térned a lakóhelyedre.",
      ],
    };
  }

  // 2. Rövid tartózkodás (< 3 hónap) — Schengen / vízummentes
  if (a.duration === "short") {
    if (a.citizenship === "eu") {
      return {
        primary: "none",
        alternatives: [],
        notes: [
          "EU-állampolgárként 90 napig vízummentesen tartózkodhatsz Svájcban.",
          "Munkavállalás tilos — ehhez L-engedély kell.",
          "Érvényes útlevél vagy ID elegendő.",
        ],
      };
    }
    return {
      primary: "schengen",
      alternatives: [],
      notes: [
        "Schengen-vízum max 90 nap 180 napon belül.",
        "Munkavállalás SZIGORÚAN tilos vele.",
        "Kérvény: svájci nagykövetség a hazádban (Budapest, ha még itt élsz).",
      ],
    };
  }

  // 3. C-engedély — csak ha már 5+ éve B-engedélyes és tartós szándék
  if (
    a.duration === "permanent" &&
    a.previousStay === "5-or-more" &&
    a.citizenship === "eu"
  ) {
    return {
      primary: "C",
      alternatives: ["B"],
      notes: [
        "Magyar állampolgárként 5 év B-engedély után jogosult vagy C-engedélyre.",
        "Szükséges: B1 szóban + A2 írásban nyelvtudás (német/francia/olasz).",
        "Strafregister + Betreibungsauszug bemutatása.",
        "Quellensteuer megszűnik — átállsz a normál adózási rendszerre.",
      ],
    };
  }

  // 4. Tartós letelepedés szándéka, de még nincs 5 év — B
  if (a.duration === "permanent" || a.duration === "long") {
    if (a.citizenship === "eu") {
      const notes: string[] = [
        "Magyar / EU-állampolgárként a személyek szabad mozgása alapján kapod a B-t.",
        "5 év B után jogosult leszel a C-engedélyre.",
        "Munkáltatói szerződés vagy önálló vállalkozás-igazolás szükséges.",
      ];
      if (a.purpose === "study") {
        notes.push("Tanulmányokhoz: az egyetem fogadólevelével pályázol.");
      } else if (a.purpose === "family") {
        notes.push("Családtagként: a CH-i családtag B/C-engedélye + házassági/születési anyakönyv kell.");
      } else if (a.purpose === "retired") {
        notes.push("Nyugdíjasként: bizonyított anyagi függetlenség kell (kb. 25 000 CHF/év).");
      }
      return { primary: "B", alternatives: ["L"], notes };
    }
    // Non-EU: nehéz a B (kvótás)
    return {
      primary: "B",
      alternatives: ["L"],
      notes: [
        "Nem-EU-állampolgárként a B-engedély megszerzése NEHÉZ — kvótás rendszer.",
        "A munkáltatódnak bizonyítania kell, hogy CH-EU/EFTA-szintű jelölt nincs.",
        "Magasan képzett szakembereknek vagy kulcsfontosságú állásokhoz nyitott.",
        "Tipikus átfutás: 3-6 hónap.",
      ],
    };
  }

  // 5. Középtáv (3-12 hó) — L
  if (a.duration === "medium") {
    const notes: string[] = [
      "L-engedély 1 évig, egyszer meghosszabbítható (összesen 24 hó).",
      "Utána új L vagy B-engedélyre kell pályázni.",
    ];
    if (a.purpose === "study") {
      notes.push("Tanulmányokhoz: nyelvtanfolyam, csere-program L-en intézhető.");
    } else if (a.purpose === "work") {
      notes.push("Szezonális munka (vendéglátás, mezőgazdaság, építkezés) tipikus eset.");
    }
    return { primary: "L", alternatives: ["B"], notes };
  }

  // Fallback
  return {
    primary: "B",
    alternatives: ["L"],
    notes: ["Pontosabb tájékoztatáshoz keresd fel a kantoni Migrationsamt-ot."],
  };
}

/** Ausztria — EU-fókuszú döntési fa (szabad mozgás / Anmeldebescheinigung / Daueraufenthalt / RWR). */
function evaluatePermitAT(a: WizardAnswers): WizardResult {
  // Harmadik országbeli (nem-EU)
  if (a.citizenship === "non-eu") {
    if (a.duration === "short") {
      return {
        primary: "at-rwr",
        alternatives: [],
        notes: [
          "Rövid (max 90 nap) tartózkodáshoz harmadik országbeliként Schengen-vízum kell az osztrák képviseleten.",
          "Munkavállaláshoz / hosszabb tartózkodáshoz Rot-Weiß-Rot Karte szükséges.",
        ],
      };
    }
    return {
      primary: "at-rwr",
      alternatives: [],
      notes: [
        "Harmadik országbeliként a Rot-Weiß-Rot Karte a fő út (pontrendszer / Punktesystem).",
        "A képzettségedtől, jövedelmedtől és a hiányszakma-listától függ.",
        "Az eljárás jellemzően több hónap; a munkáltató és az AMS is részt vesz.",
      ],
    };
  }

  // EU-állampolgár (magyar) — szabad mozgás
  if (a.duration === "short" || a.purpose === "cross-border") {
    return {
      primary: "at-freizug",
      alternatives: [],
      notes: [
        "EU-állampolgárként szabad mozgásod van — nincs szükség tartózkodási engedélyre.",
        a.purpose === "cross-border"
          ? "Ingázóként (pl. Burgenland–Sopron) sem kell külön engedély; a magyar lakcímed megmaradhat."
          : "3 hónapnál hosszabb tartózkodáshoz Anmeldebescheinigung kell.",
        "A Meldezettel (lakcímbejelentés) a beköltözéstől 3 napon belül kötelező.",
      ],
    };
  }

  // 5+ év jogszerű tartózkodás → Daueraufenthalt
  if (a.duration === "permanent" && a.previousStay === "5-or-more") {
    return {
      primary: "at-dauer",
      alternatives: ["at-anmeldung"],
      notes: [
        "5 év folyamatos jogszerű tartózkodás után tartós tartózkodási státusz (Daueraufenthalt) jár.",
        "Kérd a »Bescheinigung des Daueraufenthalts«-ot a tartózkodási hatóságnál.",
        "Megerősített védelem és letelepedési státusz.",
      ],
    };
  }

  // EU, 3+ hónap (de még nincs 5 év) → Anmeldebescheinigung
  const notes: string[] = [
    "EU-állampolgárként a személyek szabad mozgása alapján tartózkodhatsz.",
    "3 hónapnál hosszabb tartózkodás esetén a beköltözéstől 4 hónapon belül kérd az Anmeldebescheinigungot.",
    "Igazolnod kell: munkaviszony / önfoglalkoztatás VAGY elég megélhetés + egészségbiztosítás.",
  ];
  if (a.purpose === "study") notes.push("Tanulóként: beiratkozási igazolás + megélhetés + biztosítás kell.");
  else if (a.purpose === "family") notes.push("Családtagként: az EU-s rokon státusza + házassági/születési anyakönyvi kivonat kell.");
  else if (a.purpose === "retired") notes.push("Nyugdíjasként: elég jövedelem + egészségbiztosítás igazolása.");
  return { primary: "at-anmeldung", alternatives: ["at-freizug"], notes };
}

/** Németország — EU-fókuszú döntési fa (Freizügigkeit / Anmeldung / Daueraufenthalt / Blaue Karte). */
function evaluatePermitDE(a: WizardAnswers): WizardResult {
  // Harmadik országbeli (nem-EU)
  if (a.citizenship === "non-eu") {
    if (a.duration === "short") {
      return {
        primary: "de-aufenthalt",
        alternatives: [],
        notes: [
          "Rövid (max 90 nap) tartózkodáshoz harmadik országbeliként Schengen-vízum kell a német képviseleten.",
          "Munkavállaláshoz / hosszabb tartózkodáshoz Aufenthaltstitel (pl. Blaue Karte EU) szükséges.",
        ],
      };
    }
    return {
      primary: "de-aufenthalt",
      alternatives: [],
      notes: [
        "Harmadik országbeliként a Blaue Karte EU a fő út képzett munkaerőnek (Fachkräfteeinwanderungsgesetz).",
        "Elismert végzettség + jövedelmi küszöb + munkaszerződés kell.",
        "Az eljárás a német külképviseleten (vízum) és a helyi Ausländerbehörde-n keresztül megy.",
      ],
    };
  }

  // EU-állampolgár (magyar) — szabad mozgás
  if (a.duration === "short" || a.purpose === "cross-border") {
    return {
      primary: "de-freizug",
      alternatives: ["de-anmeldung"],
      notes: [
        "EU-állampolgárként szabad mozgásod van — nincs szükség tartózkodási engedélyre.",
        a.purpose === "cross-border"
          ? "Ingázóként sem kell külön engedély; a magyar lakcímed megmaradhat."
          : "Ha egy lakásba beköltözöl, a lakcímet ~1-2 héten belül be kell jelentened (Anmeldung).",
        "A Freizügigkeitsbescheinigungot 2013-ban eltörölték — EU-állampolgárnak nincs külön papír.",
      ],
    };
  }

  // 5+ év jogszerű tartózkodás → Daueraufenthalt-EU
  if (a.duration === "permanent" && a.previousStay === "5-or-more") {
    return {
      primary: "de-dauer",
      alternatives: ["de-anmeldung"],
      notes: [
        "5 év folyamatos jogszerű tartózkodás után tartós tartózkodási jog (Daueraufenthalt-EU) jár.",
        "Kérd a »Bescheinigung des Daueraufenthalts«-ot az Ausländerbehörde-n.",
        "Megerősített védelem és letelepedési státusz.",
      ],
    };
  }

  // EU, 3+ hónap (de még nincs 5 év) → Anmeldung + szabad mozgás
  const notes: string[] = [
    "EU-állampolgárként a személyek szabad mozgása alapján élhetsz és dolgozhatsz — nincs engedély-kérelem.",
    "A gyakorlati lépés a lakcím-bejelentés (Anmeldung) a Bürgeramtnál, a beköltözéstől ~1-2 héten belül.",
    "A Meldebescheinigung kell a bankszámlához, a Steuer-ID-hoz és a biztosításhoz.",
  ];
  if (a.purpose === "study") notes.push("Tanulóként: beiratkozási igazolás + megélhetés + egészségbiztosítás kell.");
  else if (a.purpose === "family") notes.push("Családtagként: az EU-s rokon státusza + házassági/születési anyakönyvi kivonat kell.");
  else if (a.purpose === "retired") notes.push("Nyugdíjasként: elég jövedelem + egészségbiztosítás igazolása.");
  return { primary: "de-anmeldung", alternatives: ["de-freizug"], notes };
}

/** Hollandia — EU-fókuszú döntési fa (vrij verkeer / BRP-inschrijving+BSN / duurzaam verblijf / kennismigrant). */
function evaluatePermitNL(a: WizardAnswers): WizardResult {
  // Harmadik országbeli (nem-EU)
  if (a.citizenship === "non-eu") {
    if (a.duration === "short") {
      return {
        primary: "nl-verblijf",
        alternatives: [],
        notes: [
          "Rövid (max 90 nap) tartózkodáshoz harmadik országbeliként Schengen-vízum kell a holland képviseleten.",
          "Munkavállaláshoz / hosszabb tartózkodáshoz verblijfsvergunning (pl. kennismigrant, EU Blue Card) szükséges.",
        ],
      };
    }
    return {
      primary: "nl-verblijf",
      alternatives: [],
      notes: [
        "Harmadik országbeliként a kennismigrantenregeling (highly skilled migrant) a fő út — elismert munkáltatóval (erkende referent).",
        "MVV-vízum + jövedelmi küszöb + munkaszerződés kell; alternatíva az EU Blue Card.",
        "Az eljárás a holland külképviseleten (MVV) és az IND-en keresztül megy.",
      ],
    };
  }

  // EU-állampolgár (magyar) — szabad mozgás
  if (a.duration === "short" || a.purpose === "cross-border") {
    return {
      primary: "nl-vrijverkeer",
      alternatives: ["nl-inschrijving"],
      notes: [
        "EU-állampolgárként szabad mozgásod van — nincs szükség tartózkodási engedélyre.",
        a.purpose === "cross-border"
          ? "Ingázóként sem kell külön engedély; a munkához azonban BSN kell (RNI-regisztráció, ha nem laksz Hollandiában)."
          : "4 hónapnál hosszabb tartózkodásnál a gemeenténél BRP-regisztráció kell (BSN-nel).",
        "A BSN (burgerservicenummer) kell a munkához, a bankszámlához és a kötelező zorgverzekeringhez.",
      ],
    };
  }

  // 5+ év jogszerű tartózkodás → duurzaam verblijf
  if (a.duration === "permanent" && a.previousStay === "5-or-more") {
    return {
      primary: "nl-duurzaam",
      alternatives: ["nl-inschrijving"],
      notes: [
        "5 év folyamatos jogszerű tartózkodás után tartós tartózkodási jog (duurzaam verblijfsrecht) jár.",
        "Kérheted a »duurzaam verblijfsdocument«-et az IND-nél (nem automatikus).",
        "Megerősített védelem és letelepedési státusz.",
      ],
    };
  }

  // EU, 3+ hónap (de még nincs 5 év) → BRP-inschrijving + szabad mozgás
  const notes: string[] = [
    "EU-állampolgárként a személyek szabad mozgása alapján élhetsz és dolgozhatsz — nincs engedély-kérelem.",
    "A gyakorlati lépés a BRP-regisztráció a gemeenténél (afspraak-kal), ami a BSN-t adja.",
    "A BSN kell a munkához, a bankszámlához, az adóhoz és a kötelező zorgverzekeringhez.",
  ];
  if (a.purpose === "study") notes.push("Tanulóként: beiratkozási igazolás + megélhetés + zorgverzekering kell.");
  else if (a.purpose === "family") notes.push("Családtagként: az EU-s rokon státusza + házassági/születési anyakönyvi kivonat kell.");
  else if (a.purpose === "retired") notes.push("Nyugdíjasként: elég jövedelem + egészségbiztosítás igazolása.");
  return { primary: "nl-inschrijving", alternatives: ["nl-vrijverkeer"], notes };
}

/**
 * ⚠️ ANGLIA — a logika MEGFORDUL a többi országhoz képest.
 *
 * CH/AT/DE/NL-ben az „EU-állampolgár" válasz azt jelenti: szabad mozgás, nincs
 * engedély. NAGY-BRITANNIÁBAN 2021. január 1. óta NEM: az EU-állampolgárság
 * önmagában SEMMIRE nem jogosít. A döntő kérdés az, hogy a kérelmező
 * 2020. december 31. ELŐTT itt élt-e már (→ EU Settlement Scheme), vagy sem
 * (→ vízum kell).
 *
 * Ezt a `previousStay` válaszból vezetjük le, mert a varázslónak nincs külön
 * „mikor érkeztél" kérdése:
 *   - "5-or-more"   → jóval 2021 előtt itt élt → settled status (ILR)
 *   - "less-than-5" → 2021 előtt érkezett, de még nincs 5 éve → pre-settled
 *   - "none"        → új érkező → VÍZUM kell
 * A visszaadott notes MINDIG kimondja ezt a feltételezést, hogy a felhasználó
 * korrigálni tudja, ha nem illik rá.
 */
function evaluatePermitGB(a: WizardAnswers): WizardResult {
  const EUSS_CAVEAT =
    "⚠️ Ez arra az esetre igaz, ha 2020. december 31. ELŐTT már Nagy-Britanniában éltél. Ha később érkeztél, az EU Settlement Scheme NEM vonatkozik rád — akkor vízum kell.";

  // Rövid látogatás — se EU, se nem-EU állampolgárnak nem kell vízum turistaként
  // (magyar útlevéllel 6 hónapig vízummentes a látogatás), de DOLGOZNI TILOS.
  if (a.duration === "short" && a.purpose !== "work") {
    return {
      primary: "gb-other",
      alternatives: [],
      notes: [
        "Magyar útlevéllel turistaként vízum nélkül utazhatsz be, jellemzően legfeljebb 6 hónapra.",
        "⚠️ Látogatóként DOLGOZNI TILOS — még alkalmi vagy távmunkát sem végezhetsz brit munkáltatónak.",
        "2025 óta a vízummentes belépéshez is előzetes elektronikus engedély (ETA) kell — indulás előtt ellenőrizd a gov.uk-on.",
      ],
    };
  }

  // ⚠️ Ingázás: szigetország, az EU-ból napi ingázás nem életszerű út.
  if (a.purpose === "cross-border") {
    return {
      primary: "gb-skilled",
      alternatives: ["gb-other"],
      notes: [
        "⚠️ Nagy-Britanniában nincs a svájcihoz hasonló határátlépő (ingázó) engedély — szigetország, és Brexit óta nincs szabad mozgás.",
        "Ha brit munkáltatónak dolgoznál, ahhoz munkavállalási jog kell (vízum vagy EUSS-státusz), akkor is, ha nem költözöl ki véglegesen.",
        "Ha magyar munkáltatónak dolgozol távolról, ahhoz nem kell brit engedély — de az adózás helye külön kérdés, nézz utána.",
      ],
    };
  }

  // Már itt élt korábban → EU Settlement Scheme
  if (a.previousStay === "5-or-more") {
    return {
      primary: "gb-settled",
      alternatives: ["gb-presettled"],
      notes: [
        "5+ év folyamatos tartózkodás után settled status (indefinite leave to remain) jár az EU Settlement Scheme keretében.",
        EUSS_CAVEAT,
        "A jelentkezési fő határidő 2021. június 30. volt, de „reasonable grounds” (pl. betegség, tájékozatlanság, gyerek) esetén ma is lehet késve jelentkezni.",
        "A settled status után 12 hónappal brit állampolgárságot is kérhetsz (ha a többi feltétel teljesül).",
      ],
    };
  }

  if (a.previousStay === "less-than-5") {
    return {
      primary: "gb-presettled",
      alternatives: ["gb-settled"],
      notes: [
        "5 évnél rövidebb ittlétnél pre-settled status jár (EU Settlement Scheme).",
        EUSS_CAVEAT,
        "⚠️ Az 5 év összejöttével a settled statusért KÜLÖN kell jelentkezni — nem automatikus. A pre-settled státuszt 2023 óta automatikusan hosszabbítják, de ez nem pótolja a váltást.",
        "Vigyázz a hosszabb külföldi tartózkodásra: évi 6 hónapnál több távollét megszakíthatja a folyamatos tartózkodást.",
      ],
    };
  }

  // Új érkező (previousStay === "none") → vízum kell
  const notes: string[] = [
    "⚠️ Brexit óta az EU-állampolgárság ÖNMAGÁBAN nem jogosít munkavállalásra vagy letelepedésre Nagy-Britanniában — vízum kell.",
    "A legtöbb vízumnál a kérelemmel együtt ki kell fizetni az Immigration Health Surcharge-t (~1035 £/év/fő, a TELJES időszakra előre) — ez a vízumdíjon felül értendő, és családnál sokszorozódik.",
  ];

  if (a.purpose === "study") {
    notes.push("Tanulmányi célra a Student vízum az út: elfogadó levél (CAS) egy engedélyes intézménytől, megélhetés igazolása, angol nyelvtudás.");
    notes.push("Student vízummal a munkavégzés korlátozott (jellemzően heti 20 óra szorgalmi időszakban).");
    notes.push("A brit diploma után a Graduate vízum 2 év szabad, szponzor nélküli munkavállalást ad — ez a leggyakoribb átmenet munkavállalói státuszba.");
    return { primary: "gb-other", alternatives: ["gb-skilled"], notes };
  }

  if (a.purpose === "family") {
    notes.push("Brit vagy letelepedett házastárssal/partnerrel a Family (spouse) vízum az út — jövedelmi küszöbbel és angol nyelvi követelménnyel.");
    notes.push("A jövedelmi küszöb az utóbbi években jelentősen emelkedett, és gyakran változik — a kérelem előtt MINDIG a gov.uk aktuális értékét nézd.");
    notes.push("5 év után ILR (letelepedés) kérhető ezen az úton is.");
    return { primary: "gb-other", alternatives: ["gb-skilled"], notes };
  }

  if (a.purpose === "retired") {
    notes.push("⚠️ Nagy-Britanniának NINCS általános „nyugdíjas vízuma” — a korábbi retired person of independent means út 2008-ban megszűnt.");
    notes.push("Reális utak: brit családtag (Family vízum), Global Talent, vagy jelentős befektetéshez kötött vállalkozói utak.");
    notes.push("Elég megtakarítás önmagában NEM elég a letelepedéshez, ellentétben több EU-országgal.");
    return { primary: "gb-other", alternatives: [], notes };
  }

  // Munkavállalás (alapeset)
  notes.push("A fő út a Skilled Worker vízum: KELL egy Home Office által engedélyezett (sponsor licence-szel rendelkező) munkáltató álláskánlata és Certificate of Sponsorship-je.");
  notes.push("További feltételek: a szakmára előírt bérküszöb elérése és angol nyelvtudás (jellemzően B1). A bérküszöb 2024-ben jelentősen emelkedett és gyakran változik — a gov.uk aktuális értéke a mérvadó.");
  notes.push("Egészségügyi és gondozói szakmákban a Health and Care Worker vízum alacsonyabb küszöböt ad, és mentes az IHS alól — ápolóként, gondozóként ezt nézd először.");
  notes.push("⚠️ A vízum a MUNKÁLTATÓHOZ kötött: ha elveszíted az állásod, jellemzően 60 napod van új szponzort találni.");
  return { primary: "gb-skilled", alternatives: ["gb-other"], notes };
}


/**
 * Spanyol letelepedés-értékelő.
 *
 * ⚠️ A JOGI kép egyszerű (EU-tag → szabad mozgás), ezért a hozzáadott érték
 * NEM a jogszabály ismertetése, hanem az IDŐZÍTÉS. A spanyolországi elakadások
 * túlnyomó része abból ered, hogy a felhasználó a harmadik hónap végén kezdi
 * intézni a regisztrációt — mire időpontot kap, a határidő lejárt. Ezért minden
 * ág kimondja, mikor kell ELINDULNI, nem csak azt, hogy mit kell tenni.
 */
function evaluatePermitES(a: WizardAnswers): WizardResult {
  const CITA_NOTE =
    "⚠️ IDŐZÍTÉS: az idegenrendészeti ügyintézéshez előzetes időpont (cita previa) kell, ami nagyvárosban hetekre előre elfogyhat. A regisztrációt a beköltözés ELSŐ hetében indítsd el, ne a harmadik hónap végén.";

  // Nem-uniós állampolgár — külön rendszer, itt csak irányt adunk.
  if (a.citizenship === "non-eu") {
    return {
      primary: "es-tarjeta",
      alternatives: ["es-registro"],
      notes: [
        "Nem uniós állampolgárként a spanyol idegenrendészeti rendszer (TIE) vonatkozik rád, nem az uniós szabad mozgás.",
        "Ha uniós polgár (pl. magyar) házastársa vagy közeli hozzátartozója vagy, kedvezőbb, uniós családtagi elbírálás jár — ezt kifejezetten kérni kell.",
        CITA_NOTE,
        "A konkrét engedélytípust a célod (munka, tanulás, család) dönti el — ez a varázsló uniós polgárokra van hangolva, nem-uniós ügyben kérj személyre szabott tanácsot.",
      ],
    };
  }

  // Ingázás: Spanyolország csak Portugáliával és Franciaországgal határos —
  // napi ingázás Magyarországról nem életszerű, de a kérdés jöhet.
  if (a.purpose === "cross-border") {
    return {
      primary: "es-libre",
      alternatives: ["es-registro"],
      notes: [
        "Uniós polgárként szabadon beutazhatsz és dolgozhatsz — külön határátlépő engedély nem létezik.",
        "Ha spanyol munkáltatónak dolgozol, a Seguridad Social-bejelentés akkor is kötelező, ha nem költözöl ki véglegesen.",
        "Ha magyar munkáltatónak dolgozol távolról, spanyol engedély nem kell — de ha 183 napnál többet töltesz itt, spanyol adóügyi illetőségű leszel. Ez a leggyakrabban elfelejtett következmény.",
      ],
    };
  }

  // Rövid tartózkodás (3 hónap alatt)
  if (a.duration === "short") {
    return {
      primary: "es-libre",
      alternatives: [],
      notes: [
        "Az első 3 hónapban uniós polgárként semmilyen engedélyt nem kell intézned — elég az érvényes útlevél vagy személyi igazolvány.",
        "Dolgozni is szabad ez idő alatt, DE a munkáltatónak be kell jelentenie: ehhez kell a NIE és a Seguridad Social-szám.",
        "Ha van esély rá, hogy maradsz, akkor is érdemes AZONNAL elindítani az empadronamientót és a NIE-t — az időpont-várakozás miatt.",
      ],
    };
  }

  // Már 5+ éve itt él → állandó tartózkodás
  if (a.previousStay === "5-or-more" || a.duration === "permanent") {
    return {
      primary: "es-permanente",
      alternatives: ["es-registro"],
      notes: [
        "5 év folyamatos, jogszerű tartózkodás után kérheted az állandó tartózkodási igazolást (certificado de residencia permanente).",
        "Ennél már NEM kell igazolnod, miből élsz — ez az erősebb jogállás fő előnye.",
        "⚠️ Ha még nincs meg az 5 év, előbb a rendes regisztráció (zöld igazolás) az út.",
        "Spanyol állampolgárság magyarként jellemzően 10 év után kérhető, és fő szabályként a magyar állampolgárságról le kellene mondani — ez külön, alapos utánajárást igényel.",
        CITA_NOTE,
      ],
    };
  }

  // 3 hónapnál hosszabb tartózkodás → regisztráció
  const notes: string[] = [
    "3 hónapnál hosszabb tartózkodásnál be kell jelentkezned a külföldiek központi nyilvántartásába — ezért kapod a zöld igazolást (certificado de registro), rajta a NIE-számoddal.",
    CITA_NOTE,
    "⚠️ A díjat (modelo 790, 012-es kód) a hivatali időpont ELŐTT kell befizetni, és a bizonylatot vinni. Enélkül nem fogadják be a kérelmet — ez a leggyakoribb ok az újrafoglalásra.",
  ];

  if (a.purpose === "work") {
    notes.push("Munkavállalóként a megélhetést a munkaszerződés vagy a társadalombiztosítási bejelentés (alta) igazolja — ez a legegyszerűbb út.");
    notes.push("A munkába álláshoz a NIE mellett Seguridad Social-szám is kell; azt viszont ONLINE is megkapod, időpont nélkül.");
  } else if (a.purpose === "study") {
    notes.push("Hallgatóként a beiratkozási igazolás + teljes körű egészségbiztosítás + a megélhetés igazolása kell.");
    notes.push("A magánbiztosítás akkor is elfogadható, ha nincs spanyol munkaviszonyod — ez tanulóknál a bevett út.");
  } else if (a.purpose === "family") {
    notes.push("Uniós polgár családtagjaként a rokoni kapcsolat igazolása és az eltartás bizonyítása a kulcs.");
    notes.push("Nem-uniós családtag NEM zöld igazolást, hanem TIE-kártyát kap — más eljárás, ujjnyomat-vétellel.");
  } else if (a.purpose === "retired") {
    notes.push("Nyugdíjasként elegendő anyagi fedezetet és teljes körű egészségbiztosítást kell igazolnod.");
    notes.push("Magyar nyugdíjasként az S1 nyomtatvánnyal léphetsz be a spanyol közegészségügybe — ezt a magyar egészségbiztosítótól kérd MÉG A KIKÖLTÖZÉS ELŐTT.");
    notes.push("⚠️ Ha 183 napnál többet töltesz itt, spanyol adóügyi illetőségű leszel, és a nyugdíjadról is itt kell bevallást adni.");
  }

  return {
    primary: "es-registro",
    alternatives: a.previousStay === "less-than-5" ? ["es-permanente"] : ["es-libre"],
    notes,
  };
}
