/**
 * Svájci Szolgáltató Váltó modul — adatok és logika.
 *
 * Lefedi: Krankenkasse, Internet, Mobil, Bank, Áram.
 *
 * FONTOS: tájékoztató eszköz, NEM jogi tanács. A pontos felmondási
 * feltételeket mindig a szerződésben ellenőrizd.
 */

export type ProviderCategory =
  | "krankenkasse"
  | "internet"
  | "mobile"
  | "bank"
  | "electricity";

export interface CategoryInfo {
  id: ProviderCategory;
  label: string;
  emoji: string;
  description: string;
  /** Felmondási idő (általános szabály). */
  noticePeriod: string;
  /** Felmondási határidő (a felmondás postai bélyegzői dátuma). */
  deadline: string;
  /** Mikor lép életbe a váltás. */
  newProviderStarts: string;
  /** Optimális váltási időablak. */
  bestSwitchWindow: string;
  /** Kötelező-e hűségidő (Mindestlaufzeit). */
  minContract: string;
  /** Általános tippek. */
  tips: string[];
  /** Hivatalos összehasonlító + segítő linkek. */
  officialLinks: { label: string; url: string }[];
  /** Top alternatív szolgáltatók listája. */
  providers: Provider[];
  /** Felmondási levél-minta nyelve német. */
  germanTemplate: (params: TemplateParams) => string;
}

export interface Provider {
  id: string;
  name: string;
  /** Rövid leírás: ár, kategória, stb. */
  note: string;
  /** Hivatalos URL. */
  url: string;
  /** Tipikus pozícionálás. */
  tier: "budget" | "mid" | "premium";
  /** Brand-szín. */
  color: string;
}

export interface TemplateParams {
  customerName: string;
  customerAddress: string;
  providerName: string;
  contractNumber: string;
  dateOfTermination: string;
  todayDate: string;
}

// ============== KRANKENKASSE ==============

const KRANKENKASSE: CategoryInfo = {
  id: "krankenkasse",
  label: "Krankenkasse (egészségbiztosító)",
  emoji: "🏥",
  description: "A kötelező alap-egészségbiztosítás évente egyszer válthatóra. A díjak között 100-200 CHF/hó eltérés is lehet — érdemes évente felülvizsgálni.",
  noticePeriod: "1 hónap (postán Einschreiben, nov 30-i bélyegzővel)",
  deadline: "November 30. (a következő naptári évre)",
  newProviderStarts: "Január 1.",
  bestSwitchWindow: "Szeptember–november (Priminfo összehasonlító használata)",
  minContract: "1 év (alapbiztosítás)",
  tips: [
    "Hasonlítsd össze a díjakat Priminfo.admin.ch — kantonod + életkorod alapján.",
    "Franchise (önrész) optimalizálása: egészségesnek 2500 CHF, gyermek-tervekkel 300 CHF.",
    "A felmondó levél tértivevényes ajánlott (Einschreiben), postán bélyegezve LEGKÉSŐBB november 30-án.",
    "A Zusatzversicherung (kiegészítő) NEM ugyanaz — annak felmondási határideje általában június 30.",
    "Az 'olcsó' biztosítók (Assura, KPT, Sympany) lassabb visszafizetést adhatnak.",
  ],
  officialLinks: [
    { label: "Priminfo — hivatalos összehasonlító", url: "https://www.priminfo.admin.ch/" },
    { label: "BAG — Grundversicherung", url: "https://www.bag.admin.ch/bag/de/home/versicherungen/krankenversicherung.html" },
  ],
  providers: [
    { id: "css",       name: "CSS",       note: "Nagy hálózat, közepes díj",     url: "https://www.css.ch/",        tier: "premium", color: "#005EA8" },
    { id: "helsana",   name: "Helsana",   note: "Második legnagyobb",            url: "https://www.helsana.ch/",    tier: "premium", color: "#003B71" },
    { id: "swica",     name: "Swica",     note: "Magas árú, jó szolgáltatás",    url: "https://www.swica.ch/",      tier: "premium", color: "#E2231A" },
    { id: "concordia", name: "Concordia", note: "Közepes ár",                    url: "https://www.concordia.ch/",  tier: "mid",     color: "#005CA9" },
    { id: "sanitas",   name: "Sanitas",   note: "Közepes/prémium",               url: "https://www.sanitas.com/",   tier: "mid",     color: "#00B0E1" },
    { id: "kpt",       name: "KPT",       note: "Közepes ár, online jó",         url: "https://www.kpt.ch/",        tier: "mid",     color: "#3B89C2" },
    { id: "assura",    name: "Assura",    note: "Olcsó, lassabb visszafizetés",  url: "https://www.assura.ch/",     tier: "budget",  color: "#E2231A" },
    { id: "visana",    name: "Visana",    note: "Közepes",                       url: "https://www.visana.ch/",     tier: "mid",     color: "#E11B22" },
    { id: "sympany",   name: "Sympany",   note: "Olcsó kategória",               url: "https://www.sympany.ch/",    tier: "budget",  color: "#E2231A" },
  ],
  germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Einschreiben

Betreff: Kündigung der obligatorischen Krankenpflegeversicherung (Grundversicherung) per ${p.dateOfTermination}

Sehr geehrte Damen und Herren,

hiermit kündige ich meine obligatorische Krankenpflegeversicherung gemäss KVG ordentlich und fristgerecht per ${p.dateOfTermination}.

Versicherungsnummer / Police-Nr.: ${p.contractNumber}

Bitte bestätigen Sie mir den Eingang dieser Kündigung schriftlich.

Mit freundlichen Grüssen,

${p.customerName}`,
};

// ============== INTERNET / TV ==============

const INTERNET: CategoryInfo = {
  id: "internet",
  label: "Internet / TV",
  emoji: "🌐",
  description: "Otthoni internet és TV-előfizetés. 2022-től a felmondási idő 1 hónapra csökkent a legtöbb szerződésnél, a hűségidő (Mindestlaufzeit) után.",
  noticePeriod: "30 nap (hűségidő után)",
  deadline: "Bármikor — a hűségidő végéhez közeledve optimális",
  newProviderStarts: "30 nap múlva (új szolgáltató időzítheti)",
  bestSwitchWindow: "Akció-időszakok (tavasz, ősz), hűségidő vége",
  minContract: "12-24 hónap hűségidő (új előfizetésnél), utána havonta felmondható",
  tips: [
    "Az új szolgáltatók gyakran átveszik a régi felmondását — kérdezd meg!",
    "Hűségidő végét NEZ MEG a szerződésen — utána havonta felmondható.",
    "Üvegszálas (Glasfaser) gyorsabb, mint VDSL — Init7 vagy Salt fiber jobb mint Swisscom.",
    "Routert általában visszaküldeni kell — befoglalt costnost vagy bérleti díj.",
    "Csomag-kombinációk (Internet + TV + Mobil) néha olcsóbbak, de szétdarabolva is működnek.",
    "Hűségidő alatti felmondás esetén büntetés (Konventionalstrafe) lehet.",
  ],
  officialLinks: [
    { label: "BAKOM — Telekomszabályozás", url: "https://www.bakom.admin.ch/" },
    { label: "Comparis — Internet összehasonlító", url: "https://www.comparis.ch/internet" },
  ],
  providers: [
    { id: "swisscom", name: "Swisscom",  note: "Legdrágább, legjobb hálózat",   url: "https://www.swisscom.ch/",   tier: "premium", color: "#0058A3" },
    { id: "sunrise",  name: "Sunrise",   note: "Második hálózat, közepes ár",   url: "https://www.sunrise.ch/",    tier: "mid",     color: "#FF0000" },
    { id: "salt",     name: "Salt",      note: "Olcsóbb, jó fiber",             url: "https://www.salt.ch/",       tier: "mid",     color: "#FA002B" },
    { id: "wingo",    name: "Wingo",     note: "Swisscom budget-márka",         url: "https://www.wingo.ch/",      tier: "budget",  color: "#FF7C00" },
    { id: "init7",    name: "Init7",     note: "Fiber-spec, fix IP, no-throttle", url: "https://www.init7.net/",   tier: "premium", color: "#000000" },
    { id: "iway",     name: "iWay",      note: "Üzleti-szintű fiber",           url: "https://www.iway.ch/",       tier: "mid",     color: "#1C5DB4" },
    { id: "quickline",name: "Quickline", note: "Kábel-szövetkezet, vidéki",     url: "https://www.quickline.ch/",  tier: "mid",     color: "#E2231A" },
  ],
  germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreff: Kündigung Internet-/TV-Vertrag Nr. ${p.contractNumber} per ${p.dateOfTermination}

Sehr geehrte Damen und Herren,

hiermit kündige ich meinen Internet- und TV-Vertrag mit der Vertragsnummer ${p.contractNumber} zum nächstmöglichen ordentlichen Termin, frühestens jedoch per ${p.dateOfTermination}.

Bitte bestätigen Sie mir die Kündigung schriftlich und teilen Sie mir das genaue Vertragsende mit. Sollte Router/Modem zurückgesendet werden müssen, bitte ich um entsprechende Anweisungen.

Mit freundlichen Grüssen,

${p.customerName}`,
};

// ============== MOBIL ==============

const MOBILE: CategoryInfo = {
  id: "mobile",
  label: "Mobil-előfizetés",
  emoji: "📱",
  description: "Mobil-számla és előfizetés. Az új szabályok (2022) szerint 30 napos felmondási idő, hűségidő után.",
  noticePeriod: "30 nap (hűségidő után)",
  deadline: "Bármikor — minden hónap utolsó napjáig",
  newProviderStarts: "Hordozható szám: 1-3 munkanap (Nummernportabilität)",
  bestSwitchWindow: "Új előfizetés akciói + hűségidő vége",
  minContract: "12-24 hónap (új készülékkel), utána havonta felmondható",
  tips: [
    "Telefonszám-hordozás (Nummernportabilität) ingyenes — az új szolgáltató intézi.",
    "Prepaid (SIM-only) tipikusan olcsóbb mint kontingens-szerződés.",
    "Készülék-bérlés vs vásárlás — gyakran a vásárlás (Refurbished is) olcsóbb.",
    "Hűségidő alatt: a felmondás díjas (Konventionalstrafe a fennmaradó hónapokra).",
    "EU-roaming: minden CH-szolgáltató kínálja, de eltérő feltételekkel.",
  ],
  officialLinks: [
    { label: "BAKOM — Mobilfunk", url: "https://www.bakom.admin.ch/" },
    { label: "Comparis — Mobil összehasonlító", url: "https://www.comparis.ch/telecom/mobile-abo" },
  ],
  providers: [
    { id: "swisscom-m", name: "Swisscom",   note: "Legjobb lefedés, drága",       url: "https://www.swisscom.ch/",  tier: "premium", color: "#0058A3" },
    { id: "sunrise-m",  name: "Sunrise",    note: "Jó lefedés, közepes ár",       url: "https://www.sunrise.ch/",   tier: "mid",     color: "#FF0000" },
    { id: "salt-m",     name: "Salt",       note: "Olcsóbb, jó hálózat",          url: "https://www.salt.ch/",      tier: "mid",     color: "#FA002B" },
    { id: "wingo-m",    name: "Wingo",      note: "Swisscom budget",              url: "https://www.wingo.ch/",     tier: "budget",  color: "#FF7C00" },
    { id: "yallo-m",    name: "Yallo",      note: "Salt budget-márka",            url: "https://www.yallo.ch/",     tier: "budget",  color: "#FF6B00" },
    { id: "mbudget",    name: "M-Budget",   note: "Sunrise alapú, olcsó",         url: "https://www.m-budget.ch/",  tier: "budget",  color: "#FF6800" },
    { id: "lebara",     name: "Lebara",     note: "Prepaid, nemzetközi",          url: "https://www.lebara.ch/",    tier: "budget",  color: "#0066B3" },
    { id: "lyca",       name: "Lycamobile", note: "Prepaid, olcsó nemzetközi hívás", url: "https://www.lycamobile.ch/", tier: "budget", color: "#E2231A" },
  ],
  germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreff: Kündigung Mobilfunk-Vertrag Nr. ${p.contractNumber} per ${p.dateOfTermination}

Sehr geehrte Damen und Herren,

hiermit kündige ich meinen Mobilfunkvertrag mit der Rufnummer / Vertragsnummer ${p.contractNumber} zum nächstmöglichen ordentlichen Termin, frühestens jedoch per ${p.dateOfTermination}.

Falls ich meine Rufnummer zu einem anderen Anbieter portiere, organisiert dieser den Wechsel.

Bitte bestätigen Sie mir die Kündigung schriftlich.

Mit freundlichen Grüssen,

${p.customerName}`,
};

// ============== BANK ==============

const BANK: CategoryInfo = {
  id: "bank",
  label: "Bankszámla",
  emoji: "🏦",
  description: "Folyószámla vagy megtakarítás. A bank-váltás Svájcban egyszerű: nincs hűségidő, 30 nap felmondás.",
  noticePeriod: "30 nap (általában)",
  deadline: "Bármikor",
  newProviderStarts: "Új számla 1-2 nap alatt nyitható",
  bestSwitchWindow: "Bármikor — a digitális bankok (Neon, Yuh) gyorsak",
  minContract: "Nincs",
  tips: [
    "Digitális bankok (Neon, Yuh, Revolut) ingyenesek mindennapi használathoz.",
    "PostFinance: hagyományos, mindenhol bankautomata.",
    "UBS / Raiffeisen / Cantonal: drágább, de személyes ügyfélkapcsolat.",
    "Wise: legjobb a nemzetközi átutalásra (HUF-CHF stb.).",
    "Bankváltáskor a fizetésed új IBAN-jára átírass a munkáltatódnál.",
    "Az állandó utalások (Mietzins, NK) listáját kérd ki a régi banktól.",
  ],
  officialLinks: [
    { label: "Comparis — Bank összehasonlító", url: "https://www.comparis.ch/banken" },
    { label: "FINMA — Pénzügyi felügyelet", url: "https://www.finma.ch/" },
  ],
  providers: [
    { id: "postfinance", name: "PostFinance", note: "Hagyományos, ingyen ATM",       url: "https://www.postfinance.ch/", tier: "mid",     color: "#FFCC00" },
    { id: "ubs",         name: "UBS",         note: "Nagy bank, drágább",            url: "https://www.ubs.com/",        tier: "premium", color: "#E60000" },
    { id: "raiffeisen",  name: "Raiffeisen",  note: "Szövetkezeti, vidéken erős",    url: "https://www.raiffeisen.ch/",  tier: "mid",     color: "#E2231A" },
    { id: "neon",        name: "Neon",        note: "Digital-only, ingyen",          url: "https://www.neon.ch/",        tier: "budget",  color: "#0080FF" },
    { id: "yuh",         name: "Yuh",         note: "Swissquote + PostFinance",      url: "https://www.yuh.com/",        tier: "budget",  color: "#FF5722" },
    { id: "revolut",     name: "Revolut",     note: "Multi-currency, jó utazáshoz",  url: "https://www.revolut.com/",    tier: "budget",  color: "#0075EB" },
    { id: "wise",        name: "Wise",        note: "Legjobb int. utaláshoz",        url: "https://wise.com/",           tier: "budget",  color: "#9FE870" },
    { id: "zkb",         name: "ZKB (Zürcher Kantonalbank)", note: "Zürich kantoni", url: "https://www.zkb.ch/",         tier: "mid",     color: "#003B71" },
  ],
  germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreff: Saldierung Konto/Kontoauflösung — Konto-Nr. ${p.contractNumber}

Sehr geehrte Damen und Herren,

hiermit kündige ich meine Geschäftsverbindung und beauftrage Sie, mein/e nachfolgendes/n Konto/Konten per ${p.dateOfTermination} aufzulösen:

Konto-Nr.: ${p.contractNumber}

Bitte überweisen Sie das Restguthaben auf folgendes Konto:
IBAN: [neue IBAN hier eintragen]
Bei: [neuer Bankname]

Bitte bestätigen Sie mir die Kontoauflösung schriftlich.

Mit freundlichen Grüssen,

${p.customerName}`,
};

// ============== ÁRAM ==============

const ELECTRICITY: CategoryInfo = {
  id: "electricity",
  label: "Áramszolgáltató",
  emoji: "⚡",
  description: "Svájcban az áram-piac TIPIKUSAN NEM SZABAD lakossági felhasználóknak — a helyi monopol szolgáltatótól (Stadtwerke, ewz, EWB stb.) vagy vagy a tied. Csak nagyvállalatok (>100 000 kWh/év) válthatnak.",
  noticePeriod: "Nem alkalmazható (monopol)",
  deadline: "Lakossági szinten általában nincs választás",
  newProviderStarts: "—",
  bestSwitchWindow: "Csak nagyvállalati (>100 000 kWh/év)",
  minContract: "—",
  tips: [
    "Lakosság: a lakhelyed kantoni / városi szolgáltatóhoz vagy kötve (pl. ewz Zürich, EWB Bern, IWB Basel).",
    "A díj-tarifa változhat évente — érdemes figyelni az új szabályozást.",
    "Megújuló energia (zöld áram): a legtöbb szolgáltató kínál 100% zöld opciót, kicsit drágábban.",
    "Solar saját termelés: a lakhelyed kantonja támogathat (Förderbeitrag).",
    "Nagyvállalati felhasználók: szabad piacon választhatnak (Strompreis-Vergleich).",
    "2025-től részleges piacliberalizáció várható lakosságnak is.",
  ],
  officialLinks: [
    { label: "ElCom — Áram-Felügyelet", url: "https://www.elcom.admin.ch/" },
    { label: "Strompreis — Tarifa-összehasonlító", url: "https://www.strompreis.elcom.admin.ch/" },
  ],
  providers: [
    { id: "ewz",       name: "ewz (Zürich)",        note: "Zürich városi monopol",   url: "https://www.ewz.ch/",     tier: "mid", color: "#E2231A" },
    { id: "ewb",       name: "EWB (Bern)",           note: "Bern városi monopol",    url: "https://www.ewb.ch/",     tier: "mid", color: "#E2231A" },
    { id: "iwb",       name: "IWB (Basel)",          note: "Basel városi monopol",   url: "https://www.iwb.ch/",     tier: "mid", color: "#003B71" },
    { id: "sig",       name: "SIG (Genf)",           note: "Genfi városi monopol",   url: "https://www.sig-ge.ch/",  tier: "mid", color: "#005CA9" },
    { id: "groupee",   name: "Groupe E (Fribourg)",  note: "Fribourg régió",          url: "https://www.groupe-e.ch/", tier: "mid", color: "#E2231A" },
  ],
  germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreff: Kündigung / Vertragsänderung Strom

Sehr geehrte Damen und Herren,

hiermit beantrage ich eine Überprüfung meines aktuellen Strom-Vertrags / Tarifs.

Kunden-Nr.: ${p.contractNumber}

Bitte teilen Sie mir die aktuellen Tarif-Optionen und gegebenfalls verfügbaren Wechsel-Möglichkeiten mit.

Mit freundlichen Grüssen,

${p.customerName}`,
};

export const PROVIDER_CATEGORIES: CategoryInfo[] = [
  KRANKENKASSE,
  INTERNET,
  MOBILE,
  BANK,
  ELECTRICITY,
];

export function getCategoryInfo(id: ProviderCategory): CategoryInfo | null {
  return PROVIDER_CATEGORIES.find((c) => c.id === id) ?? null;
}

/** Mai dátum DE formátum (DD.MM.YYYY). */
export function formatDateDe(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${d.getFullYear()}`;
}
