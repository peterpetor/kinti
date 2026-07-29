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

const OFFICIAL: Record<"CH" | "AT" | "DE" | "NL" | "GB" | "ES", OfficialCountry> = {
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
  /**
   * ⚠️ ANGLIA. A hiánya KOMOLY hiba volt: a getterek a svájci ágra estek, így
   * angliai felhasználónak SVÁJCI SEGÉLYHÍVÓ SZÁMOKAT (117/118/144) és svájci
   * hivatalokat mutatott volna a rendszer. Új ország felvételekor EZT a blokkot
   * is kötelező megírni — a `hivatalos` oldal NINCS feature-gate mögött.
   */
  GB: {
    consulate: {
      name: "Magyarország Nagykövetsége",
      city: "London",
      website: "https://london.mfa.gov.hu/",
      extra: [
        { name: "Konzuli Szolgálat — Egyesült Királyság", url: "https://london.mfa.gov.hu/page/konzuli-ugyek" },
      ],
    },
    emergency: [
      { label: "Sürgősség (mentő, rendőrség, tűzoltó)", number: "999" },
      { label: "Sürgősség (EU-s szám, itt is működik)", number: "112" },
      { label: "NHS — nem sürgős egészségügy (0–24)", number: "111" },
      { label: "Rendőrség — nem sürgős", number: "101" },
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
        trigger: "Itt élek — mi a státuszom Brexit után?",
        explain: "Aki 2020. december 31. előtt érkezett, az EU Settlement Scheme-ben kaphat pre-settled / settled státuszt.",
        url: "https://www.gov.uk/settled-status-eu-citizens-families", source: "gov.uk", emoji: "🪪", category: "tartozkodas",
      },
      {
        trigger: "Most jövök — milyen vízum kell?",
        explain: "A 2021 után érkezőknek vízum kell; a vízum-kereső megmondja, melyik út illik rád.",
        url: "https://www.gov.uk/check-uk-visa", source: "gov.uk", emoji: "✈️", category: "tartozkodas",
      },
      {
        trigger: "Igazolnom kell, hogy dolgozhatok",
        explain: "A munkáltató right to work ellenőrzést végez — itt generálsz hozzá share code-ot.",
        url: "https://www.gov.uk/prove-right-to-work", source: "gov.uk", emoji: "✅", category: "munka",
      },
      {
        trigger: "Kell a National Insurance Number",
        explain: "A munkához, adóhoz és nyugdíjhoz szükséges azonosító online igényelhető.",
        url: "https://www.gov.uk/apply-national-insurance-number", source: "gov.uk", emoji: "🔢", category: "munka",
      },
      {
        trigger: "Adóügy, tax code, túlfizetés",
        explain: "A HMRC személyes adószámlájában látod a tax code-od és igényelheted vissza a túlfizetést.",
        url: "https://www.gov.uk/personal-tax-account", source: "gov.uk", emoji: "💷", category: "munka",
      },
      {
        trigger: "Adóbevallást kell beadnom",
        explain: "Self Assessment — önfoglalkoztatóknak és bizonyos jövedelmeknél; határidő január 31.",
        url: "https://www.gov.uk/self-assessment-tax-returns", source: "gov.uk", emoji: "🧾", category: "munka",
      },
      {
        trigger: "Háziorvoshoz (GP) kell regisztrálnom",
        explain: "Az NHS-ellátás kapuja a GP — a rendelő nem utasíthat el lakcímigazolás hiánya miatt.",
        url: "https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/", source: "nhs.uk", emoji: "🏥", category: "egeszseg",
      },
      {
        trigger: "Nem tudom, hova forduljak egészségügyi ügyben",
        explain: "Az NHS 111 online és telefonon is eligazít, ha nem sürgősségi az eset.",
        url: "https://111.nhs.uk/", source: "111.nhs.uk", emoji: "☎️", category: "egeszseg",
      },
      {
        trigger: "Council taxet kell fizetnem / bejelentkeznem",
        explain: "A lakóhelyed önkormányzatát a postcode alapján találod meg — a council tax a lakót terheli.",
        url: "https://www.gov.uk/find-local-council", source: "gov.uk", emoji: "🏛️", category: "tartozkodas",
      },
      {
        trigger: "A kaucióm védve van?",
        explain: "A bérbeadónak 30 napon belül állami sémába kell tennie a kauciót — itt ellenőrizheted a szabályokat.",
        url: "https://www.gov.uk/tenancy-deposit-protection", source: "gov.uk", emoji: "🔐", category: "tartozkodas",
      },
      {
        trigger: "Magyar jogosítvánnyal vezethetek?",
        explain: "Az EU-s engedéllyel való vezetés és a brit engedélyre cserélés feltételei.",
        url: "https://www.gov.uk/driving-nongb-licence", source: "gov.uk", emoji: "🚗", category: "kozlekedes",
      },
      {
        trigger: "Autó: adó, MOT, biztosítás",
        explain: "A három kötelező elem ellenőrzése és intézése egy helyen.",
        url: "https://www.gov.uk/browse/driving/vehicle-tax-mot-insurance", source: "gov.uk", emoji: "🔧", category: "kozlekedes",
      },
      {
        trigger: "Iskolai helyet kell igényelnem a gyereknek",
        explain: "A helyet az önkormányzatnál pályázod meg — szigorú határidőkkel (jan. 15. / okt. 31.).",
        url: "https://www.gov.uk/apply-for-primary-school-place", source: "gov.uk", emoji: "🎒", category: "tartozkodas",
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
  // ⚠️ SPANYOLORSZÁG. Két sajátosság szervezi ezt a listát:
  //   1) CITA PREVIA — szinte minden hivatalnál előzetes időpont kell, ezért a
  //      lista ELSŐ eleme (a magyar okmányügyek után) az időpontfoglalás.
  //   2) AUTONÓM KÖZÖSSÉG — az egészségügy és az oktatás nem országos, hanem
  //      közösségi hatáskör. Ilyen ügynél SZÁNDÉKOSAN az országos belépő
  //      oldalra linkelünk, és a magyarázat mondja ki, hogy a saját közösséged
  //      oldala a végállomás — nem tettetjük, hogy egy országos link elég.
  ES: {
    consulate: {
      name: "Magyarország Nagykövetsége",
      city: "Madrid",
      website: "https://madrid.mfa.gov.hu/",
      extra: [
        { name: "Madridi Nagykövetség Konzuli Hivatala", url: "https://madrid.mfa.gov.hu/hu/Magyarorszag-Madridi-Nagykovetsegenek-Konzuli-Hivatala" },
        { name: "Magyarország Főkonzulátusa — Barcelona", url: "https://barcelona.mfa.gov.hu/" },
        { name: "Miben tud (és miben nem) segíteni a konzulátus", url: "https://madrid.mfa.gov.hu/hu/miben-tud-nem-tud-segiteni-a-konzulatus" },
      ],
    },
    emergency: [
      { label: "Egységes segélyhívó (mentő, rendőrség, tűzoltó)", number: "112" },
      { label: "Policía Nacional", number: "091" },
      { label: "Guardia Civil", number: "062" },
      { label: "Helyi rendőrség (Policía Local)", number: "092" },
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
        trigger: "Időpontot kell foglalnom egy hivatalba",
        explain: "A legtöbb spanyol hivatal csak előzetes időponttal (cita previa) fogad — az idegenrendészeti ügyek foglalója ez.",
        url: "https://sede.administracionespublicas.gob.es/pagina/index/directorio/icpplus", source: "administracionespublicas.gob.es", emoji: "🗓️", category: "tartozkodas",
      },
      {
        trigger: "Kell a NIE-szám / regisztrálnom kell uniós polgárként",
        explain: "3 hónapnál hosszabb tartózkodásnál a külföldiek nyilvántartásába kell bejelentkezni; itt az összes idegenrendészeti eljárás.",
        url: "https://www.inclusion.gob.es/", source: "inclusion.gob.es", emoji: "🪪", category: "tartozkodas",
      },
      {
        trigger: "Be kell jelentenem a lakcímemet (empadronamiento)",
        explain: "A padrónt a lakóhelyed szerinti önkormányzat vezeti — a te településed hivatalát a központi portálon találod meg.",
        url: "https://administracion.gob.es/", source: "administracion.gob.es", emoji: "🏛️", category: "tartozkodas",
      },
      {
        trigger: "Kell a társadalombiztosítási számom",
        explain: "A Seguridad Social-szám online is igényelhető az Importass portálon — a munkába állás feltétele.",
        url: "https://portal.seg-social.gob.es/wps/portal/importass/importass/tramites/obtenernumeroseguridadsocial", source: "seg-social.gob.es", emoji: "🔢", category: "munka",
      },
      {
        trigger: "Tényleg bejelentett a munkáltatóm?",
        explain: "Az informe de vida laboral felsorolja az összes bejelentett munkaviszonyodat — bárki lekérheti a sajátját.",
        url: "https://portal.seg-social.gob.es/wps/portal/importass/importass/tramites/informedevidalaboral", source: "seg-social.gob.es", emoji: "📄", category: "munka",
      },
      {
        trigger: "Munkanélküli lettem",
        explain: "A járulékalapú ellátást (paro) a SEPE folyósítja — a jelentkezésre a munkaviszony vége után rövid határidő van.",
        url: "https://www.sepe.es/HomeSepe/Personas/distributiva-prestaciones.html", source: "sepe.es", emoji: "🔎", category: "munka",
      },
      {
        trigger: "Adóbevallást kell beadnom (la Renta)",
        explain: "Az éves IRPF-bevallás az Agencia Tributaria oldalán készül el, a hivatal által előkészített tervezetből.",
        url: "https://sede.agenciatributaria.gob.es/Sede/Renta.html", source: "agenciatributaria.gob.es", emoji: "🧾", category: "munka",
      },
      {
        trigger: "Digitális azonosító kell az ügyintézéshez",
        explain: "A Cl@ve a spanyol állam belépési rendszere — enélkül a legtöbb online ügyintézés nem megy.",
        url: "https://clave.gob.es/", source: "clave.gob.es", emoji: "🔐", category: "okmany",
      },
      {
        trigger: "Kell az egészségügyi kártya (tarjeta sanitaria)",
        explain: "Az egészségügy AUTONÓM KÖZÖSSÉGI hatáskör — a kártyát a lakóhelyed szerinti egészségügyi szolgálat adja ki, ez az országos belépő.",
        url: "https://www.sanidad.gob.es/", source: "sanidad.gob.es", emoji: "🏥", category: "egeszseg",
      },
      {
        trigger: "Európai egészségbiztosítási kártya kell",
        explain: "Az EU-kártyát a Seguridad Socialnál igényled — külföldi ideiglenes tartózkodásra való, itthoni ellátásra nem.",
        url: "https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10938/11566/1761", source: "seg-social.es", emoji: "💳", category: "egeszseg",
      },
      {
        trigger: "Jogosítvány, forgalmi, bírság",
        explain: "A DGT intézi a közúti ügyeket — időpontfoglalással, a bírságokat is itt látod és rendezheted.",
        url: "https://sede.dgt.gob.es/es/", source: "dgt.gob.es", emoji: "🚗", category: "kozlekedes",
      },
      {
        trigger: "El kell ismertetnem a magyar bizonyítványt",
        explain: "A közoktatási bizonyítvány honosítását (homologación) az oktatási minisztérium végzi — időigényes eljárás.",
        url: "https://www.educacionfpydeportes.gob.es/servicios-al-ciudadano/catalogo/gestion-titulos/estudios-no-universitarios/titulos-extranjeros/homologacion-convalidacion-no-universitarios.html", source: "educacionfpydeportes.gob.es", emoji: "🎓", category: "okmany",
      },
      {
        trigger: "Lakhatási kérdésem van",
        explain: "A lakhatási minisztérium oldala a bérlővédelem, a támogatások és a jogszabályok hivatalos belépője.",
        url: "https://www.mivau.gob.es/", source: "mivau.gob.es", emoji: "🏠", category: "tartozkodas",
      },
    ],
  },
};

export function getConsulate(country: string | null | undefined): Consulate {
  if (country === "AT") return OFFICIAL.AT.consulate;
  if (country === "DE") return OFFICIAL.DE.consulate;
  if (country === "NL") return OFFICIAL.NL.consulate;
  if (country === "GB") return OFFICIAL.GB.consulate;
  if (country === "ES") return OFFICIAL.ES.consulate;
  return OFFICIAL.CH.consulate;
}

export function getEmergencyNumbers(country: string | null | undefined): EmergencyNumber[] {
  if (country === "AT") return OFFICIAL.AT.emergency;
  if (country === "DE") return OFFICIAL.DE.emergency;
  if (country === "NL") return OFFICIAL.NL.emergency;
  if (country === "GB") return OFFICIAL.GB.emergency;
  if (country === "ES") return OFFICIAL.ES.emergency;
  return OFFICIAL.CH.emergency;
}

export function getOfficialLinks(country: string | null | undefined): OfficialLink[] {
  if (country === "AT") return OFFICIAL.AT.links;
  if (country === "DE") return OFFICIAL.DE.links;
  if (country === "NL") return OFFICIAL.NL.links;
  if (country === "GB") return OFFICIAL.GB.links;
  if (country === "ES") return OFFICIAL.ES.links;
  return OFFICIAL.CH.links;
}
