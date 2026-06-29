/**
 * official-links.ts — „Itt intézheted" hivatalos link-gyűjtemény + konzulátus.
 *
 * A cél NEM tanácsadás (nem peresíthető), hanem a legrövidebb út a felhasználó és
 * a HIVATALOS forrás között: egy élethelyzet-trigger („Útlevelem lejár") → egyetlen
 * kattintás a helyes hivatalos oldalra, magyar magyarázattal. Minden link a hivatalos
 * (állami / konzuli) oldalra mutat — a Kinti nem mondja meg „mit csinálj", csak hogy
 * „hol intézheted".
 *
 * FONTOS (adat-integritás): kizárólag valódi, kanonikus hivatalos domainek. A svájci
 * ch.ch linkek a Tudásbázis (guides.ts) már bevált forrásai. Soha ne találj ki URL-t.
 */

export type OfficialCategory = "okmany" | "tartozkodas" | "kozlekedes" | "munka" | "egeszseg";

export const OFFICIAL_CATEGORIES: { id: OfficialCategory; label: string; emoji: string }[] = [
  { id: "okmany", label: "Okmányok", emoji: "📄" },
  { id: "tartozkodas", label: "Tartózkodás & lakcím", emoji: "🏠" },
  { id: "kozlekedes", label: "Közlekedés", emoji: "🚗" },
  { id: "munka", label: "Munka & pénz", emoji: "💼" },
  { id: "egeszseg", label: "Egészségügy", emoji: "🏥" },
];

export interface OfficialLink {
  /** Élethelyzet-trigger, ahogy a felhasználó keresné. */
  trigger: string;
  /** Egy mondat, semleges — HOL intézheted, nem „mit csinálj". */
  explain: string;
  /** A hivatalos oldal URL-je. */
  url: string;
  /** A forrás megjelenített címkéje (domain). */
  source: string;
  emoji: string;
  category: OfficialCategory;
}

export interface Consulate {
  /** Hivatalos magyar elnevezés. */
  name: string;
  city: string;
  website: string;
  /** Egyéb képviseletek (pl. főkonzulátusok) — opcionális. */
  extra?: { name: string; url: string }[];
}

export interface EmergencyNumber {
  label: string;
  number: string;
}

interface OfficialCountry {
  consulate: Consulate;
  emergency: EmergencyNumber[];
  links: OfficialLink[];
}

/** Minden ország közös, központi hivatalos forrásai (magyar állam). */
export const KONZINFO_APPOINTMENT_URL = "https://konzinfoidopont.mfa.gov.hu/";
export const KONZULI_SERVICE_URL = "https://konzuliszolgalat.kormany.hu/";
/** A Konzuli Szolgálat 0–24 ügyelete (díjmentes). Forrás: konzuliszolgalat.kormany.hu. */
export const KONZULI_EMERGENCY_PHONE = "+36 80 36 80 36";

const OFFICIAL: Record<"CH" | "AT" | "DE" | "NL", OfficialCountry> = {
  CH: {
    consulate: {
      name: "Magyarország Nagykövetsége",
      city: "Bern",
      website: "https://bern.mfa.gov.hu/",
    },
    emergency: [
      { label: "Általános (EU)", number: "112" },
      { label: "Rendőrség", number: "117" },
      { label: "Mentő", number: "144" },
      { label: "Tűzoltóság", number: "118" },
      { label: "Rega (légi mentés)", number: "1414" },
    ],
    links: [
      {
        trigger: "Útlevelem / személyim lejár",
        explain: "Magyar okmányt (útlevél, személyi) a konzulátus állít ki — időpontot a Konzinfón foglalsz.",
        url: KONZINFO_APPOINTMENT_URL, source: "konzinfoidopont.mfa.gov.hu", emoji: "🛂", category: "okmany",
      },
      {
        trigger: "Anyakönyvi / állampolgársági ügy itthonról",
        explain: "Születés, házasság, honosítás konzuli intézése — a Konzuli Szolgálat hivatalos oldalán.",
        url: KONZULI_SERVICE_URL, source: "konzuliszolgalat.kormany.hu", emoji: "📜", category: "okmany",
      },
      {
        trigger: "Most költöztem ide",
        explain: "A bejelentkezést (14 napon belül a községnél) a hivatalos ch.ch írja le — kantononként eltér.",
        url: "https://www.ch.ch/en/housing/moving/notification-of-departure-and-registration/", source: "ch.ch", emoji: "🏠", category: "tartozkodas",
      },
      {
        trigger: "Gyereket vártam — családi pótlék",
        explain: "A családi pótlék (Kinderzulage) feltételeit és igénylését a hivatalos ch.ch foglalja össze.",
        url: "https://www.ch.ch/en/family-and-partnership/maternity-and-paternity/pregnancy-and-birth/family-allowance/", source: "ch.ch", emoji: "👶", category: "tartozkodas",
      },
      {
        trigger: "Át kell írnom a jogosítványom",
        explain: "A jogsi-csere menetét (a kantoni közúti hivatalnál) a hivatalos ch.ch írja le.",
        url: "https://www.ch.ch/en/documents-and-register-extracts/driving-licence/exchanging-your-driving-licence/", source: "ch.ch", emoji: "🚗", category: "kozlekedes",
      },
      {
        trigger: "Egészségbiztosítást kell kötnöm",
        explain: "A kötelező alapbiztosítás díjait a hivatalos állami kalkulátoron (priminfo) hasonlíthatod össze.",
        url: "https://www.priminfo.admin.ch/", source: "priminfo.admin.ch", emoji: "🏥", category: "egeszseg",
      },
      {
        trigger: "Elvesztettem a munkám",
        explain: "A munkanélküli-ellátáshoz a RAV-nál való bejelentkezést a hivatalos arbeit.swiss intézi.",
        url: "https://www.arbeit.swiss/secoalv/en/home/menue/stellensuchende/arbeitslos-was-tun-/anmeldung.html", source: "arbeit.swiss", emoji: "💼", category: "munka",
      },
      {
        trigger: "Adóbevallást kell beadnom",
        explain: "Az adóbevallás menetét a hivatalos ch.ch írja le; a beadás a kantoni adóhivatalnál.",
        url: "https://www.ch.ch/en/taxes-and-finances/tax-return/", source: "ch.ch", emoji: "🧾", category: "munka",
      },
      {
        trigger: "Nyugdíj / AHV ügyek",
        explain: "Az AHV (1. pillér) hivatalos információs központja minden járulék- és nyugdíj-ügyhöz.",
        url: "https://www.ahv-iv.ch/en/", source: "ahv-iv.ch", emoji: "👴", category: "munka",
      },
    ],
  },
  AT: {
    consulate: {
      name: "Magyarország Nagykövetsége",
      city: "Bécs",
      website: "https://becs.mfa.gov.hu/",
    },
    emergency: [
      { label: "Általános (EU)", number: "112" },
      { label: "Rendőrség", number: "133" },
      { label: "Mentő", number: "144" },
      { label: "Tűzoltóság", number: "122" },
    ],
    links: [
      {
        trigger: "Útlevelem / személyim lejár",
        explain: "Magyar okmányt (útlevél, személyi) a konzulátus állít ki — időpontot a Konzinfón foglalsz.",
        url: KONZINFO_APPOINTMENT_URL, source: "konzinfoidopont.mfa.gov.hu", emoji: "🛂", category: "okmany",
      },
      {
        trigger: "Anyakönyvi / állampolgársági ügy itthonról",
        explain: "Születés, házasság, honosítás konzuli intézése — a Konzuli Szolgálat hivatalos oldalán.",
        url: KONZULI_SERVICE_URL, source: "konzuliszolgalat.kormany.hu", emoji: "📜", category: "okmany",
      },
      {
        trigger: "Most költöztem — lakcímbejelentés (Meldezettel)",
        explain: "A lakcímbejelentést (3 napon belül a Meldeamtnál) a hivatalos állami portál írja le.",
        url: "https://www.oesterreich.gv.at/", source: "oesterreich.gv.at", emoji: "🏠", category: "tartozkodas",
      },
      {
        trigger: "EU-tartózkodás bejelentése (Anmeldebescheinigung)",
        explain: "A 4 hónapnál hosszabb tartózkodáshoz szükséges igazolás feltételei a hivatalos állami portálon.",
        url: "https://www.oesterreich.gv.at/", source: "oesterreich.gv.at", emoji: "📋", category: "tartozkodas",
      },
      {
        trigger: "Jogosítvány átírása (Umschreibung)",
        explain: "Az EU-jogsi kezelését és a csere menetét a hivatalos állami portál írja le.",
        url: "https://www.oesterreich.gv.at/", source: "oesterreich.gv.at", emoji: "🚗", category: "kozlekedes",
      },
      {
        trigger: "e-card / ÖGK egészségbiztosítás",
        explain: "A kötelező egészségbiztosítás (ÖGK) és az e-card ügyei az ÖGK hivatalos oldalán.",
        url: "https://www.gesundheitskasse.at/", source: "gesundheitskasse.at", emoji: "🏥", category: "egeszseg",
      },
      {
        trigger: "Elvesztettem a munkám (AMS)",
        explain: "Az álláskeresőként való bejelentkezés és a munkanélküli-ellátás az AMS hivatalos oldalán.",
        url: "https://www.ams.at/", source: "ams.at", emoji: "💼", category: "munka",
      },
      {
        trigger: "Adó / FinanzOnline",
        explain: "Az adóügyeket a Finanzamt intézi, online a hivatalos FinanzOnline-on.",
        url: "https://www.bmf.gv.at/", source: "bmf.gv.at", emoji: "🧾", category: "munka",
      },
      {
        trigger: "Családi pótlék (Familienbeihilfe)",
        explain: "A Familienbeihilfe igénylését a Finanzamt intézi — a feltételek a hivatalos állami portálon.",
        url: "https://www.oesterreich.gv.at/", source: "oesterreich.gv.at", emoji: "👶", category: "munka",
      },
    ],
  },
  DE: {
    consulate: {
      name: "Magyarország Nagykövetsége",
      city: "Berlin",
      website: "https://berlin.mfa.gov.hu/",
      extra: [
        { name: "Főkonzulátus, München", url: "https://munchen.mfa.gov.hu/" },
        { name: "Főkonzulátus, Düsseldorf", url: "https://dusseldorf.mfa.gov.hu/" },
      ],
    },
    emergency: [
      { label: "Mentő / tűzoltó", number: "112" },
      { label: "Rendőrség", number: "110" },
    ],
    links: [
      {
        trigger: "Útlevelem / személyim lejár",
        explain: "Magyar okmányt (útlevél, személyi) a konzulátus állít ki — időpontot a Konzinfón foglalsz.",
        url: KONZINFO_APPOINTMENT_URL, source: "konzinfoidopont.mfa.gov.hu", emoji: "🛂", category: "okmany",
      },
      {
        trigger: "Anyakönyvi / állampolgársági ügy itthonról",
        explain: "Születés, házasság, honosítás konzuli intézése — a Konzuli Szolgálat hivatalos oldalán.",
        url: KONZULI_SERVICE_URL, source: "konzuliszolgalat.kormany.hu", emoji: "📜", category: "okmany",
      },
      {
        trigger: "Most költöztem — lakcímbejelentés (Anmeldung)",
        explain: "Az Anmeldung a Bürgeramtnál történik — a hozzád tartozó hivatalt a hivatalos szövetségi keresőn találod.",
        url: "https://www.bund.de/", source: "bund.de", emoji: "🏠", category: "tartozkodas",
      },
      {
        trigger: "Jogosítvány átírása (Umschreibung)",
        explain: "Az EU-jogsi érvényes; a csere a Fahrerlaubnisbehördénél — a hivatalt a szövetségi keresőn találod.",
        url: "https://www.bund.de/", source: "bund.de", emoji: "🚗", category: "kozlekedes",
      },
      {
        trigger: "Egészségbiztosítás (Krankenversicherung)",
        explain: "A törvényi egészségbiztosítás kötelező; a rendszer hivatalos áttekintése a GKV oldalán.",
        url: "https://www.gkv-spitzenverband.de/", source: "gkv-spitzenverband.de", emoji: "🏥", category: "egeszseg",
      },
      {
        trigger: "Elvesztettem a munkám (Arbeitsagentur)",
        explain: "Az álláskeresőként való bejelentkezés és az Arbeitslosengeld a Bundesagentur für Arbeit hivatalos oldalán.",
        url: "https://www.arbeitsagentur.de/", source: "arbeitsagentur.de", emoji: "💼", category: "munka",
      },
      {
        trigger: "Adó / ELSTER",
        explain: "Az adóbevallás elektronikusan a hivatalos ELSTER-en; az ügyet a Finanzamt intézi.",
        url: "https://www.elster.de/", source: "elster.de", emoji: "🧾", category: "munka",
      },
      {
        trigger: "Kindergeld (családi pótlék)",
        explain: "A Kindergeldet a Familienkasse (Arbeitsagentur) intézi — a hivatalos oldalon igényelhető.",
        url: "https://www.arbeitsagentur.de/familie-und-kinder/kindergeld", source: "arbeitsagentur.de", emoji: "👶", category: "munka",
      },
    ],
  },
  NL: {
    consulate: {
      name: "Magyarország Nagykövetsége",
      city: "Hága (Den Haag)",
      website: "https://haga.mfa.gov.hu/",
    },
    emergency: [
      { label: "Általános (EU)", number: "112" },
      { label: "Rendőrség (nem sürgős)", number: "0900-8844" },
    ],
    links: [
      {
        trigger: "Útlevelem / személyim lejár",
        explain: "Magyar okmányt (útlevél, személyi) a konzulátus állít ki — időpontot a Konzinfón foglalsz.",
        url: KONZINFO_APPOINTMENT_URL, source: "konzinfoidopont.mfa.gov.hu", emoji: "🛂", category: "okmany",
      },
      {
        trigger: "Anyakönyvi / állampolgársági ügy itthonról",
        explain: "Születés, házasság, honosítás konzuli intézése — a Konzuli Szolgálat hivatalos oldalán.",
        url: KONZULI_SERVICE_URL, source: "konzuliszolgalat.kormany.hu", emoji: "📜", category: "okmany",
      },
      {
        trigger: "Most költöztem — EU-regisztráció / BRP",
        explain: "EU-állampolgárként a községnél (gemeente) regisztrálsz a lakcímnyilvántartásba (BRP); a tartózkodás az IND-nél.",
        url: "https://ind.nl/", source: "ind.nl", emoji: "🏠", category: "tartozkodas",
      },
      {
        trigger: "DigiD — digitális azonosító",
        explain: "Szinte minden holland hivatali ügyhöz DigiD kell — itt igényled.",
        url: "https://www.digid.nl/", source: "digid.nl", emoji: "📱", category: "tartozkodas",
      },
      {
        trigger: "Egészségbiztosítás (zorgverzekering)",
        explain: "A holland egészségbiztosítás KÖTELEZŐ; a hivatalos tájékoztató a Zorgverzekeringslijn oldalán.",
        url: "https://www.zorgverzekeringslijn.nl/", source: "zorgverzekeringslijn.nl", emoji: "🏥", category: "egeszseg",
      },
      {
        trigger: "Elvesztettem a munkám (UWV)",
        explain: "A munkanélküli-ellátás (WW) és az álláskeresés az UWV hivatalos oldalán.",
        url: "https://www.uwv.nl/", source: "uwv.nl", emoji: "💼", category: "munka",
      },
      {
        trigger: "Adó (Belastingdienst)",
        explain: "Az adóügyeket a Belastingdienst intézi, online DigiD-vel.",
        url: "https://www.belastingdienst.nl/", source: "belastingdienst.nl", emoji: "🧾", category: "munka",
      },
      {
        trigger: "Családi pótlék (kinderbijslag)",
        explain: "A kinderbijslagot az SVB (Sociale Verzekeringsbank) intézi.",
        url: "https://www.svb.nl/nl", source: "svb.nl", emoji: "👶", category: "munka",
      },
    ],
  },
};

export function getConsulate(country: string | null | undefined): Consulate {
  if (country === "AT") return OFFICIAL.AT.consulate;
  if (country === "DE") return OFFICIAL.DE.consulate;
  if (country === "NL") return OFFICIAL.NL.consulate;
  return OFFICIAL.CH.consulate;
}

export function getEmergencyNumbers(country: string | null | undefined): EmergencyNumber[] {
  if (country === "AT") return OFFICIAL.AT.emergency;
  if (country === "DE") return OFFICIAL.DE.emergency;
  if (country === "NL") return OFFICIAL.NL.emergency;
  return OFFICIAL.CH.emergency;
}

export function getOfficialLinks(country: string | null | undefined): OfficialLink[] {
  if (country === "AT") return OFFICIAL.AT.links;
  if (country === "DE") return OFFICIAL.DE.links;
  if (country === "NL") return OFFICIAL.NL.links;
  return OFFICIAL.CH.links;
}
