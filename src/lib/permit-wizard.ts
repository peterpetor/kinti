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
  | "de-freizug" | "de-anmeldung" | "de-dauer" | "de-aufenthalt";

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
