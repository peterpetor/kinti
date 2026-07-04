/**
 * Szolgáltató Váltó modul — adatok és logika (CH / AT / DE / NL).
 *
 * Lefedi: egészségbiztosítás, Internet/TV, Mobil, Bank, Áram/energia.
 * Ország-kulcsos: PROVIDER_CATEGORIES_BY_COUNTRY + getProviderCategories(country).
 * A felmondó-sablon CH/AT/DE-ben németül, NL-ben hollandul.
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
    { id: "swisscom", name: "Swisscom",  note: "Prémium tarifa, országos hálózati lefedettség",   url: "https://www.swisscom.ch/",   tier: "premium", color: "#0058A3" },
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
    "Wise: kedvező feltételek nemzetközi átutalásra (HUF-CHF stb.) — díjak változhatnak, ellenőrizd a wise.com-on.",
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

const CH_CATEGORIES: CategoryInfo[] = [KRANKENKASSE, INTERNET, MOBILE, BANK, ELECTRICITY];

/* ═══════════════════════════ NÉMETORSZÁG (DE) ═══════════════════════════
 * EUR; a felmondó-sablon németül. Valós szabályok: GKV 12 hó után 2 hó
 * felmondással váltható; internet/mobil a 2021-es TKG-reform óta a hűségidő
 * után havonta; áram SZABAD piac (2 hét felmondás).
 */
const DE_CATEGORIES: CategoryInfo[] = [
  {
    id: "krankenkasse",
    label: "Krankenkasse (GKV)",
    emoji: "🏥",
    description: "A gesetzliche Krankenversicherung (GKV) SZABADON válható 12 hónap tagság után, 2 hónap felmondási idővel. A Zusatzbeitrag-emeléskor rendkívüli felmondási jog (Sonderkündigungsrecht).",
    noticePeriod: "2 hónap (12 hónap tagság után)",
    deadline: "A 12. hónap után bármikor; Zusatzbeitrag-emeléskor rendkívüli felmondás",
    newProviderStarts: "A felmondás utáni 2. hónap végén",
    bestSwitchWindow: "Zusatzbeitrag-emelés bejelentésekor (Sonderkündigungsrecht)",
    minContract: "12 hónap kötelező tagság",
    tips: [
      "Az alapszolgáltatás törvényi (nagyrészt azonos) — a Zusatzbeitrag (átlag ~2,5%) és a bónuszprogramok térnek el.",
      "Az új pénztárnál elég JELENTKEZNED — ők intézik a felmondást a réginél.",
      "A TK és a HKK gyakran alacsony Zusatzbeitraggal; hasonlítsd össze.",
      "A Zusatzbeitrag-emelés bejelentése rendkívüli felmondást nyit — a 12 hónap letelte előtt is válthatsz.",
      "A privát (PKV) más világ — oda visszalépni nehéz, jól gondold meg.",
    ],
    officialLinks: [
      { label: "GKV-Spitzenverband", url: "https://www.gkv-spitzenverband.de/" },
      { label: "Check24 — Krankenkassen-Vergleich", url: "https://www.check24.de/gesetzliche-krankenversicherung/" },
    ],
    providers: [
      { id: "tk",     name: "Techniker (TK)", note: "Nagy, gyakran alacsony Zusatzbeitrag", url: "https://www.tk.de/",     tier: "premium", color: "#1EA2B1" },
      { id: "aok",    name: "AOK",            note: "Regionális, széles hálózat",           url: "https://www.aok.de/",    tier: "mid",     color: "#005E3F" },
      { id: "barmer", name: "Barmer",         note: "Országos, jó bónuszprogram",           url: "https://www.barmer.de/", tier: "mid",     color: "#009B3E" },
      { id: "dak",    name: "DAK-Gesundheit", note: "Országos",                             url: "https://www.dak.de/",    tier: "mid",     color: "#EC6608" },
      { id: "hkk",    name: "hkk",            note: "Gyakran a legalacsonyabb Zusatzbeitrag", url: "https://www.hkk.de/",   tier: "budget",  color: "#005AA0" },
    ],
    germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreff: Kündigung der Mitgliedschaft in der gesetzlichen Krankenversicherung per ${p.dateOfTermination}

Sehr geehrte Damen und Herren,

hiermit kündige ich meine Mitgliedschaft ordentlich und fristgerecht per ${p.dateOfTermination}.

Versicherten-Nr.: ${p.contractNumber}

Bitte bestätigen Sie mir den Eingang und das Ende der Mitgliedschaft schriftlich.

Mit freundlichen Grüßen,

${p.customerName}`,
  },
  {
    id: "internet",
    label: "Internet / TV",
    emoji: "🌐",
    description: "Otthoni internet/TV. A 2021-es TKG-reform óta a hűségidő (jellemzően 24 hó) UTÁN havonta felmondható (1 hónap).",
    noticePeriod: "1 hónap (a hűségidő után)",
    deadline: "A hűségidő vége felé optimális",
    newProviderStarts: "A régi szerződés végén; az új szolgáltató időzítheti",
    bestSwitchWindow: "A hűségidő vége + akció-időszakok",
    minContract: "24 hónap (új szerződésnél), utána havonta felmondható",
    tips: [
      "Az új szolgáltató gyakran átveheti a régi felmondását — kérdezd meg (Anbieterwechsel).",
      "A hűségidő végét (Mindestvertragslaufzeit) nézd meg a szerződésen.",
      "Glasfaser (üvegszál) gyorsabb, mint a VDSL — ahol elérhető, jobb választás.",
      "A routert gyakran vissza kell küldeni — kérj visszaküldési instrukciót.",
      "Csomag (Internet+TV+Mobil) néha olcsóbb, de szétdarabolva is működik.",
    ],
    officialLinks: [
      { label: "Bundesnetzagentur", url: "https://www.bundesnetzagentur.de/" },
      { label: "Check24 — DSL-Vergleich", url: "https://www.check24.de/dsl/" },
    ],
    providers: [
      { id: "telekom", name: "Telekom",  note: "Legnagyobb hálózat, prémium",  url: "https://www.telekom.de/", tier: "premium", color: "#E20074" },
      { id: "vodafone",name: "Vodafone", note: "Kábel + DSL, országos",         url: "https://www.vodafone.de/", tier: "mid",    color: "#E60000" },
      { id: "1und1",   name: "1&1",      note: "Kedvező árú DSL",               url: "https://www.1und1.de/",   tier: "mid",     color: "#004B93" },
      { id: "o2-de",   name: "o2",       note: "Olcsóbb, Telefónica",           url: "https://www.o2online.de/", tier: "budget", color: "#0019A5" },
      { id: "pyur",    name: "PŸUR",     note: "Kábel, regionális",             url: "https://www.pyur.com/",   tier: "budget",  color: "#E5006D" },
    ],
    germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreff: Kündigung Internet-/TV-Vertrag Nr. ${p.contractNumber} per ${p.dateOfTermination}

Sehr geehrte Damen und Herren,

hiermit kündige ich meinen Internet- und TV-Vertrag mit der Vertragsnummer ${p.contractNumber} zum nächstmöglichen Termin, frühestens jedoch per ${p.dateOfTermination}.

Bitte bestätigen Sie mir die Kündigung schriftlich und teilen Sie mir das genaue Vertragsende mit.

Mit freundlichen Grüßen,

${p.customerName}`,
  },
  {
    id: "mobile",
    label: "Mobil-előfizetés",
    emoji: "📱",
    description: "Mobil-szerződés. A 2021-es reform óta a hűségidő után havonta felmondható; a telefonszám ingyen hordozható (Rufnummermitnahme).",
    noticePeriod: "1 hónap (a hűségidő után)",
    deadline: "Bármikor a hűségidő után",
    newProviderStarts: "Szám-hordozás: néhány munkanap",
    bestSwitchWindow: "A hűségidő vége + készülék-akciók",
    minContract: "24 hónap (készülékkel), utána havonta felmondható",
    tips: [
      "A Rufnummermitnahme (szám-hordozás) ingyenes/olcsó — az új szolgáltató intézi.",
      "SIM-only (készülék nélkül) tipikusan sokkal olcsóbb.",
      "Prepaid opciók (Aldi Talk, congstar) jók alacsony fogyasztásnál.",
      "A hűségidő alatti felmondás a maradék hónapokra díjas lehet.",
      "EU-roaming minden német szolgáltatónál benne van (Roam-like-at-home).",
    ],
    officialLinks: [
      { label: "Bundesnetzagentur", url: "https://www.bundesnetzagentur.de/" },
      { label: "Check24 — Handytarife", url: "https://www.check24.de/handytarife/" },
    ],
    providers: [
      { id: "telekom-m", name: "Telekom",   note: "Legjobb lefedettség, drága", url: "https://www.telekom.de/", tier: "premium", color: "#E20074" },
      { id: "vodafone-m",name: "Vodafone",  note: "Jó lefedettség",             url: "https://www.vodafone.de/", tier: "mid",    color: "#E60000" },
      { id: "o2-m",      name: "o2",        note: "Olcsóbb, városban jó",       url: "https://www.o2online.de/", tier: "mid",    color: "#0019A5" },
      { id: "congstar",  name: "congstar",  note: "Telekom-hálózat, budget",    url: "https://www.congstar.de/", tier: "budget", color: "#FFCC00" },
      { id: "alditalk",  name: "Aldi Talk", note: "Prepaid, nagyon olcsó",      url: "https://www.alditalk.de/", tier: "budget", color: "#00A9E0" },
    ],
    germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreff: Kündigung Mobilfunk-Vertrag Nr. ${p.contractNumber} per ${p.dateOfTermination}

Sehr geehrte Damen und Herren,

hiermit kündige ich meinen Mobilfunkvertrag mit der Rufnummer / Vertragsnummer ${p.contractNumber} zum nächstmöglichen Termin, frühestens jedoch per ${p.dateOfTermination}.

Falls ich meine Rufnummer portiere, organisiert der neue Anbieter den Wechsel.

Bitte bestätigen Sie mir die Kündigung schriftlich.

Mit freundlichen Grüßen,

${p.customerName}`,
  },
  {
    id: "bank",
    label: "Bankszámla (Girokonto)",
    emoji: "🏦",
    description: "Folyószámla. Nincs hűségidő; a törvényi Kontowechselservice (§ 20-23 ZKG) segíti az átutalások átvitelét.",
    noticePeriod: "Nincs (bármikor felmondható)",
    deadline: "Bármikor",
    newProviderStarts: "Új számla 1-2 nap alatt",
    bestSwitchWindow: "Bármikor — a direktbankok (DKB, ING, N26) gyorsak",
    minContract: "Nincs",
    tips: [
      "A Kontowechselservice (törvényi) átviszi az állandó megbízásokat és értesíti a fizetőket.",
      "A direktbankok (DKB, ING, N26, comdirect) gyakran ingyenesek.",
      "A Sparkasse/Volksbank drágább, de személyes fiók + készpénz mindenhol.",
      "A fizetésed új IBAN-ját add meg a munkáltatódnak és a Krankenkassénak.",
      "Wise/Revolut a nemzetközi utaláshoz (HUF↔EUR) kedvező — a díjak változhatnak.",
    ],
    officialLinks: [
      { label: "BaFin — Pénzügyi felügyelet", url: "https://www.bafin.de/" },
      { label: "Check24 — Girokonto-Vergleich", url: "https://www.check24.de/girokonto/" },
    ],
    providers: [
      { id: "dkb",       name: "DKB",       note: "Direktbank, ingyenes",       url: "https://www.dkb.de/",        tier: "budget",  color: "#1B7AC2" },
      { id: "ing-de",    name: "ING",       note: "Direktbank, népszerű",       url: "https://www.ing.de/",        tier: "budget",  color: "#FF6200" },
      { id: "n26",       name: "N26",       note: "Mobil-only, gyors nyitás",   url: "https://n26.com/",           tier: "budget",  color: "#48AC98" },
      { id: "sparkasse", name: "Sparkasse", note: "Fiókbank, mindenhol ATM",    url: "https://www.sparkasse.de/",  tier: "mid",     color: "#FF0000" },
      { id: "comdirect", name: "comdirect", note: "Commerzbank-direkt",         url: "https://www.comdirect.de/",  tier: "mid",     color: "#FFCC00" },
    ],
    germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreff: Kündigung / Auflösung Girokonto Nr. ${p.contractNumber} per ${p.dateOfTermination}

Sehr geehrte Damen und Herren,

hiermit kündige ich mein Girokonto und bitte um Auflösung per ${p.dateOfTermination}.

Konto-Nr. / IBAN: ${p.contractNumber}

Bitte überweisen Sie das Restguthaben auf:
IBAN: [neue IBAN hier eintragen]

Bitte bestätigen Sie mir die Kontoauflösung schriftlich.

Mit freundlichen Grüßen,

${p.customerName}`,
  },
  {
    id: "electricity",
    label: "Áramszolgáltató (Strom)",
    emoji: "⚡",
    description: "Németországban az áram-piac SZABAD — bárki válthat áramszolgáltatót. A Grundversorger (helyi alapellátó) 2 hét felmondással, más szerződés a hűségidő szerint.",
    noticePeriod: "2 hét (Grundversorgung); egyébként a szerződés szerint",
    deadline: "Bármikor",
    newProviderStarts: "Az új szolgáltató intézi a váltást (kb. 2-6 hét)",
    bestSwitchWindow: "Bármikor — évente érdemes összehasonlítani (Verivox/Check24)",
    minContract: "Grundversorgung: nincs; akciós tarifák: 12-24 hó",
    tips: [
      "Az új szolgáltató intézi a felmondást és a váltást — neked csak szerződnöd kell.",
      "Verivox / Check24 tarifa-összehasonlítóval évente sokat lehet spórolni.",
      "Figyelj a Neukundenbonus / Sofortbonus feltételeire (első év után dráguló ár).",
      "Ökostrom (zöld áram) ma sokszor nem drágább — érdemes megnézni.",
      "A Zählerstand (mérőóra-állás) leolvasása kell a váltáskor.",
    ],
    officialLinks: [
      { label: "Bundesnetzagentur — Strom", url: "https://www.bundesnetzagentur.de/" },
      { label: "Verivox — Stromvergleich", url: "https://www.verivox.de/strom/" },
    ],
    providers: [
      { id: "eon",       name: "E.ON",       note: "Országos nagyszolgáltató", url: "https://www.eon.de/",       tier: "mid",     color: "#E2001A" },
      { id: "enbw",      name: "EnBW",       note: "Országos",                 url: "https://www.enbw.com/",     tier: "mid",     color: "#0BA1E2" },
      { id: "vattenfall",name: "Vattenfall", note: "Nagyvárosi ellátó",        url: "https://www.vattenfall.de/", tier: "mid",    color: "#FFDA00" },
      { id: "lichtblick",name: "LichtBlick", note: "100% zöld áram",           url: "https://www.lichtblick.de/", tier: "premium",color: "#FDC300" },
      { id: "eprimo",    name: "eprimo",     note: "Olcsó, online",            url: "https://www.eprimo.de/",    tier: "budget",  color: "#95C11F" },
    ],
    germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreff: Kündigung Stromvertrag Nr. ${p.contractNumber} per ${p.dateOfTermination}

Sehr geehrte Damen und Herren,

hiermit kündige ich meinen Stromliefervertrag zum nächstmöglichen Termin, frühestens jedoch per ${p.dateOfTermination}.

Kunden-Nr. / Zählernummer: ${p.contractNumber}

Bitte bestätigen Sie mir die Kündigung und das Vertragsende schriftlich.

Mit freundlichen Grüßen,

${p.customerName}`,
  },
];

/* ═══════════════════════════ AUSZTRIA (AT) ═══════════════════════════
 * EUR; a felmondó-sablon németül. Az egészségbiztosítás (ÖGK) TÖRVÉNYI és a
 * munkaviszonyhoz kötött — NEM szabadon váltható; a Zusatzversicherung igen.
 * Az áram SZABAD piac (E-Control Tarifkalkulator).
 */
const AT_CATEGORIES: CategoryInfo[] = [
  {
    id: "krankenkasse",
    label: "Krankenversicherung (ÖGK)",
    emoji: "🏥",
    description: "Ausztriában a kötelező egészségbiztosítás TÖRVÉNYI és a foglalkozásodhoz kötött (ÖGK munkavállalóknak, SVS önállóknak, BVAEB közszférának) — NEM szabadon váltható. Amit válthatsz: a privát Zusatzversicherung (kiegészítő).",
    noticePeriod: "Alapbiztosítás: nem választható; Zusatzversicherung: a szerződés szerint",
    deadline: "A kötelező ÖGK a munkaviszonnyal automatikus",
    newProviderStarts: "Munkaviszony-kezdéskor a munkáltató jelent be",
    bestSwitchWindow: "Zusatzversicherung: a hűségidő / évforduló előtt",
    minContract: "Alap: nincs választás; Zusatz: jellemzően 1 év",
    tips: [
      "A kötelező biztosító a foglalkozásod szerint automatikus (ÖGK / SVS / BVAEB) — nem te választod.",
      "A munkáltató jelent be az ÖGK-ba; neked az e-cardod lesz a TB-kártyád.",
      "Amit összehasonlíthatsz: a privát Zusatzversicherung (Sonderklasse, magánorvos) — Uniqa, Wiener Städtische, Merkur, Generali.",
      "A Zusatzversicherungot a hűségidő/évforduló előtt mondhatod fel — nézd a szerződést.",
      "Kérdés esetén az ÖGK ügyfélszolgálata vagy az Arbeiterkammer (AK) segít.",
    ],
    officialLinks: [
      { label: "ÖGK — Österreichische Gesundheitskasse", url: "https://www.gesundheitskasse.at/" },
      { label: "durchblicker — Zusatzversicherung", url: "https://durchblicker.at/zusatzversicherung" },
    ],
    providers: [
      { id: "oegk",   name: "ÖGK",              note: "Munkavállalók kötelező biztosítója", url: "https://www.gesundheitskasse.at/", tier: "mid",     color: "#E1001A" },
      { id: "svs",    name: "SVS",              note: "Önállók / vállalkozók",              url: "https://www.svs.at/",              tier: "mid",     color: "#004B8D" },
      { id: "uniqa",  name: "Uniqa (Zusatz)",   note: "Privát kiegészítő",                  url: "https://www.uniqa.at/",            tier: "premium", color: "#003366" },
      { id: "merkur", name: "Merkur (Zusatz)",  note: "Privát kiegészítő",                  url: "https://www.merkur.at/",           tier: "premium", color: "#009640" },
      { id: "wst",    name: "Wiener Städtische", note: "Privát kiegészítő",                 url: "https://www.wienerstaedtische.at/", tier: "premium", color: "#00539F" },
    ],
    germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreff: Kündigung der Zusatzversicherung Nr. ${p.contractNumber} per ${p.dateOfTermination}

Sehr geehrte Damen und Herren,

hiermit kündige ich meine private Zusatzversicherung ordentlich und fristgerecht per ${p.dateOfTermination}.

Polizzennummer: ${p.contractNumber}

Bitte bestätigen Sie mir den Eingang der Kündigung schriftlich.

Mit freundlichen Grüßen,

${p.customerName}`,
  },
  {
    id: "internet",
    label: "Internet / TV",
    emoji: "🌐",
    description: "Otthoni internet/TV. Hűségidő (Mindestvertragsdauer) jellemzően 12-24 hó, utána a szerződés szerinti felmondással.",
    noticePeriod: "1-3 hónap (a hűségidő után, a szerződés szerint)",
    deadline: "A hűségidő vége felé optimális",
    newProviderStarts: "A régi szerződés végén",
    bestSwitchWindow: "A hűségidő vége + akciók",
    minContract: "12-24 hónap, utána a szerződés szerint felmondható",
    tips: [
      "A hűségidő (Mindestvertragsdauer) és a felmondási idő a szerződésben áll.",
      "Glasfaser ahol elérhető gyorsabb, mint a VDSL/kábel.",
      "A modemet/routert gyakran vissza kell adni — kérj instrukciót.",
      "Csomag (Internet+TV+Mobil) néha olcsóbb — durchblicker.at összehasonlító.",
      "A hűségidő alatti felmondás díjas lehet.",
    ],
    officialLinks: [
      { label: "RTR — Telekom-Regulierung", url: "https://www.rtr.at/" },
      { label: "durchblicker — Internet", url: "https://durchblicker.at/internet" },
    ],
    providers: [
      { id: "a1",       name: "A1",       note: "Legnagyobb hálózat, prémium", url: "https://www.a1.net/",        tier: "premium", color: "#E2001A" },
      { id: "magenta",  name: "Magenta",  note: "T-Mobile utód, kábel+DSL",    url: "https://www.magenta.at/",    tier: "mid",     color: "#E20074" },
      { id: "drei",     name: "Drei",     note: "Olcsóbb, jó ajánlatok",       url: "https://www.drei.at/",       tier: "mid",     color: "#000000" },
      { id: "spusu",    name: "spusu",    note: "Kedvező árú",                 url: "https://www.spusu.at/",      tier: "budget",  color: "#95C11F" },
    ],
    germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreff: Kündigung Internet-/TV-Vertrag Nr. ${p.contractNumber} per ${p.dateOfTermination}

Sehr geehrte Damen und Herren,

hiermit kündige ich meinen Internet- und TV-Vertrag mit der Vertragsnummer ${p.contractNumber} zum nächstmöglichen Termin, frühestens jedoch per ${p.dateOfTermination}.

Bitte bestätigen Sie mir die Kündigung schriftlich.

Mit freundlichen Grüßen,

${p.customerName}`,
  },
  {
    id: "mobile",
    label: "Mobil-előfizetés",
    emoji: "📱",
    description: "Mobil-szerződés. A telefonszám ingyen hordozható (Rufnummernmitnahme); a hűségidő után a szerződés szerint felmondható.",
    noticePeriod: "1-2 hónap (a hűségidő után)",
    deadline: "Bármikor a hűségidő után",
    newProviderStarts: "Szám-hordozás: néhány munkanap",
    bestSwitchWindow: "A hűségidő vége + készülék-akciók",
    minContract: "12-24 hónap (készülékkel), utána felmondható",
    tips: [
      "A Rufnummernmitnahme (szám-hordozás) olcsó/ingyenes — az új szolgáltató intézi.",
      "SIM-only (Wertkarte / kártyás) tipikusan olcsóbb.",
      "A diszkont-márkák (HoT, spusu, Yesss) A1/Magenta-hálózaton olcsók.",
      "A hűségidő alatti felmondás a maradék hónapokra díjas.",
      "EU-roaming minden osztrák szolgáltatónál benne van.",
    ],
    officialLinks: [
      { label: "RTR — Mobilfunk", url: "https://www.rtr.at/" },
      { label: "durchblicker — Handytarife", url: "https://durchblicker.at/handytarife" },
    ],
    providers: [
      { id: "a1-m",      name: "A1",      note: "Legjobb lefedettség, drága", url: "https://www.a1.net/",     tier: "premium", color: "#E2001A" },
      { id: "magenta-m", name: "Magenta", note: "Jó lefedettség",             url: "https://www.magenta.at/", tier: "mid",    color: "#E20074" },
      { id: "drei-m",    name: "Drei",    note: "Olcsóbb, jó ajánlatok",      url: "https://www.drei.at/",    tier: "mid",     color: "#000000" },
      { id: "hot",       name: "HoT",     note: "Hofer-hálózat (A1), olcsó",  url: "https://www.hot.at/",     tier: "budget",  color: "#E30613" },
      { id: "yesss",     name: "Yesss",   note: "A1-diszkont",                url: "https://www.yesss.at/",   tier: "budget",  color: "#FFED00" },
    ],
    germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreff: Kündigung Mobilfunk-Vertrag Nr. ${p.contractNumber} per ${p.dateOfTermination}

Sehr geehrte Damen und Herren,

hiermit kündige ich meinen Mobilfunkvertrag mit der Rufnummer / Vertragsnummer ${p.contractNumber} zum nächstmöglichen Termin, frühestens jedoch per ${p.dateOfTermination}.

Bitte bestätigen Sie mir die Kündigung schriftlich.

Mit freundlichen Grüßen,

${p.customerName}`,
  },
  {
    id: "bank",
    label: "Bankszámla (Girokonto)",
    emoji: "🏦",
    description: "Folyószámla. Nincs hűségidő; a bankok kínálnak Kontowechsel-szolgáltatást az átutalások átvitelére.",
    noticePeriod: "Nincs (bármikor felmondható)",
    deadline: "Bármikor",
    newProviderStarts: "Új számla 1-2 nap alatt",
    bestSwitchWindow: "Bármikor — a direktbankok (N26, bunq) gyorsak",
    minContract: "Nincs",
    tips: [
      "A Kontowechselservice átviszi az állandó megbízásokat és értesíti a partnereket.",
      "A direktbankok (N26, bunq, Revolut) gyakran ingyenesek.",
      "Az Erste/Sparkasse, Bank Austria, Raiffeisen, BAWAG hagyományos fiókkal.",
      "A fizetésed új IBAN-ját add meg a munkáltatódnak és a hatóságoknak.",
      "Wise/Revolut a nemzetközi utaláshoz (HUF↔EUR) kedvező.",
    ],
    officialLinks: [
      { label: "FMA — Pénzügyi felügyelet", url: "https://www.fma.gv.at/" },
      { label: "durchblicker — Girokonto", url: "https://durchblicker.at/girokonto" },
    ],
    providers: [
      { id: "erste",   name: "Erste Bank / Sparkasse", note: "Nagy, fiókhálózat", url: "https://www.sparkasse.at/", tier: "mid",    color: "#004B8D" },
      { id: "ba",      name: "Bank Austria",           note: "UniCredit-csoport", url: "https://www.bankaustria.at/", tier: "mid",   color: "#E2001A" },
      { id: "bawag",   name: "BAWAG",                  note: "Kedvező feltételek", url: "https://www.bawag.at/",     tier: "mid",    color: "#005CA9" },
      { id: "n26-at",  name: "N26",                    note: "Mobil-only, ingyen", url: "https://n26.com/",          tier: "budget", color: "#48AC98" },
      { id: "bunq-at", name: "bunq",                   note: "Mobil-bank",         url: "https://www.bunq.com/",     tier: "budget", color: "#3394FF" },
    ],
    germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreff: Kündigung / Auflösung Girokonto Nr. ${p.contractNumber} per ${p.dateOfTermination}

Sehr geehrte Damen und Herren,

hiermit kündige ich mein Girokonto und bitte um Auflösung per ${p.dateOfTermination}.

Konto-Nr. / IBAN: ${p.contractNumber}

Bitte überweisen Sie das Restguthaben auf:
IBAN: [neue IBAN hier eintragen]

Bitte bestätigen Sie mir die Kontoauflösung schriftlich.

Mit freundlichen Grüßen,

${p.customerName}`,
  },
  {
    id: "electricity",
    label: "Áramszolgáltató (Strom)",
    emoji: "⚡",
    description: "Ausztriában az áram-piac SZABAD — bárki válthat. Az E-Control hivatalos Tarifkalkulatorával összehasonlíthatsz; a felmondás jellemzően 2 hét – 1 hónap.",
    noticePeriod: "2 hét – 1 hónap (a szerződés szerint)",
    deadline: "Bármikor",
    newProviderStarts: "Az új szolgáltató intézi a váltást (~2-4 hét)",
    bestSwitchWindow: "Bármikor — évente érdemes összehasonlítani",
    minContract: "Alapellátás: nincs; akciós tarifák: 12 hó",
    tips: [
      "Az új szolgáltató intézi a felmondást és a váltást — neked csak szerződnöd kell.",
      "Az E-Control Tarifkalkulator a HIVATALOS, semleges összehasonlító.",
      "Figyelj a Neukundenrabatt / Bonus feltételeire (első év után dráguló ár).",
      "Ökostrom (zöld áram) sokszor nem drágább.",
      "A Zählerstand (mérőóra-állás) kell a váltáskor.",
    ],
    officialLinks: [
      { label: "E-Control — Tarifkalkulator", url: "https://www.e-control.at/konsumenten/service-und-beratung/tarifkalkulator" },
      { label: "durchblicker — Strom", url: "https://durchblicker.at/strom" },
    ],
    providers: [
      { id: "verbund",   name: "Verbund",      note: "Országos, vízerő",       url: "https://www.verbund.com/", tier: "mid",     color: "#004B8D" },
      { id: "wienenergie",name: "Wien Energie", note: "Bécsi ellátó",          url: "https://www.wienenergie.at/", tier: "mid",  color: "#E2001A" },
      { id: "evn",       name: "EVN",          note: "Alsó-Ausztria",          url: "https://www.evn.at/",      tier: "mid",     color: "#005CA9" },
      { id: "kelag",     name: "Kelag",        note: "Karintia, vízerő",       url: "https://www.kelag.at/",    tier: "mid",     color: "#009640" },
    ],
    germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreff: Kündigung Stromvertrag Nr. ${p.contractNumber} per ${p.dateOfTermination}

Sehr geehrte Damen und Herren,

hiermit kündige ich meinen Stromliefervertrag zum nächstmöglichen Termin, frühestens jedoch per ${p.dateOfTermination}.

Kunden-Nr. / Zählpunkt: ${p.contractNumber}

Bitte bestätigen Sie mir die Kündigung schriftlich.

Mit freundlichen Grüßen,

${p.customerName}`,
  },
];

/* ═══════════════════════════ HOLLANDIA (NL) ═══════════════════════════
 * EUR; a felmondó-sablon HOLLANDUL. A zorgverzekering évente váltható (dec 31 /
 * jan 31); az energia SZABAD piac; internet/mobil hűségidő után havonta.
 */
const NL_CATEGORIES: CategoryInfo[] = [
  {
    id: "krankenkasse",
    label: "Zorgverzekering (egészségbiztosítás)",
    emoji: "🏥",
    description: "A kötelező basisverzekering ÉVENTE válható: a régit december 31-ig mondod fel, az újat január 31-ig kötöd meg (visszamenőleg január 1-től). A díjak és a szolgáltatás eltérnek.",
    noticePeriod: "Éves váltás (december 31. felmondás, január 31-ig új szerződés)",
    deadline: "December 31. (a régi felmondása)",
    newProviderStarts: "Január 1. (visszamenőleg, ha jan 31-ig kötöd)",
    bestSwitchWindow: "November–december (az új díjak közzététele után)",
    minContract: "1 naptári év (a basisverzekering)",
    tips: [
      "Az alapcsomag (basisverzekering) tartalma törvényi — az ár, az eigen risico-kezelés és a szerződött szolgáltatók (gecontracteerd) térnek el.",
      "Az új biztosítónál elég MEGKÖTNI a szerződést jan 31-ig — az gyakran automatikusan felmondja a régit.",
      "Az eigen risico (~385 €/év) minden biztosítónál azonos; a szabad orvosválasztás (restitutiepolis) drágább, mint a natura.",
      "Zorgtoeslag (a Belastingdiensttől) alacsony jövedelemnél igényelhető.",
      "A kiegészítő (aanvullend) NEM kötelező — külön nézd, ha fogászat/fizioterápia kell.",
    ],
    officialLinks: [
      { label: "Zorgwijzer — összehasonlító", url: "https://www.zorgwijzer.nl/" },
      { label: "Independer — Zorgverzekering", url: "https://www.independer.nl/zorgverzekering/" },
    ],
    providers: [
      { id: "zilverenkruis", name: "Zilveren Kruis", note: "Legnagyobb, széles hálózat", url: "https://www.zilverenkruis.nl/", tier: "premium", color: "#00A1E0" },
      { id: "vgz",           name: "VGZ",            note: "Nagy, kedvező alapcsomag",    url: "https://www.vgz.nl/",           tier: "mid",     color: "#E6007E" },
      { id: "cz",            name: "CZ",             note: "Nagy, jó szolgáltatás",       url: "https://www.cz.nl/",            tier: "mid",     color: "#009BDF" },
      { id: "menzis",        name: "Menzis",         note: "Országos",                    url: "https://www.menzis.nl/",        tier: "mid",     color: "#F39200" },
      { id: "onvz",          name: "ONVZ",           note: "Szabad orvosválasztás (restitutie)", url: "https://www.onvz.nl/",  tier: "premium", color: "#004890" },
    ],
    germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreft: Opzegging zorgverzekering per ${p.dateOfTermination}

Geachte heer/mevrouw,

Hierbij zeg ik mijn zorgverzekering op per ${p.dateOfTermination}.

Polisnummer / klantnummer: ${p.contractNumber}

Ik verzoek u de opzegging schriftelijk te bevestigen.

Met vriendelijke groet,

${p.customerName}`,
  },
  {
    id: "internet",
    label: "Internet / TV",
    emoji: "🌐",
    description: "Otthoni internet/TV. A hűségidő (jellemzően 1 év) UTÁN havonta felmondható (1 hónap, opzegtermijn).",
    noticePeriod: "1 hónap (a hűségidő után)",
    deadline: "A hűségidő vége felé optimális",
    newProviderStarts: "A régi szerződés végén; az új szolgáltató időzítheti",
    bestSwitchWindow: "A hűségidő vége + akciók (aanbiedingen)",
    minContract: "1 év (új szerződésnél), utána havonta felmondható",
    tips: [
      "Az új szolgáltató gyakran átveheti a váltást (overstapservice) — kérdezd meg.",
      "A hűségidő (contractduur) és az opzegtermijn a szerződésben áll.",
      "A glasvezel (üvegszál) gyorsabb, mint a kábel/DSL — ahol elérhető, jobb.",
      "A modemet gyakran vissza kell küldeni (retourneren).",
      "Csomag (internet+TV+bellen) néha olcsóbb — pricewise.nl összehasonlító.",
    ],
    officialLinks: [
      { label: "ACM — ConsuWijzer", url: "https://www.consuwijzer.nl/" },
      { label: "Pricewise — Internet vergelijken", url: "https://www.pricewise.nl/internet/" },
    ],
    providers: [
      { id: "kpn",   name: "KPN",   note: "Legnagyobb hálózat, prémium", url: "https://www.kpn.com/",   tier: "premium", color: "#008AC9" },
      { id: "ziggo", name: "Ziggo", note: "Kábel, országos",             url: "https://www.ziggo.nl/",  tier: "mid",     color: "#F9A01B" },
      { id: "odido", name: "Odido", note: "T-Mobile utód",               url: "https://www.odido.nl/",  tier: "mid",     color: "#E20074" },
      { id: "delta", name: "Delta", note: "Glasvezel, regionális",       url: "https://www.delta.nl/",  tier: "budget",  color: "#009FE3" },
    ],
    germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreft: Opzegging internet-/TV-abonnement nr. ${p.contractNumber} per ${p.dateOfTermination}

Geachte heer/mevrouw,

Hierbij zeg ik mijn internet- en TV-abonnement met nummer ${p.contractNumber} op tegen de eerst mogelijke datum, doch niet eerder dan ${p.dateOfTermination}.

Ik verzoek u de opzegging schriftelijk te bevestigen en de einddatum door te geven.

Met vriendelijke groet,

${p.customerName}`,
  },
  {
    id: "mobile",
    label: "Mobiel abonnement",
    emoji: "📱",
    description: "Mobil-szerződés. A telefonszám megtartható (nummerbehoud); a hűségidő után havonta felmondható.",
    noticePeriod: "1 hónap (a hűségidő után)",
    deadline: "Bármikor a hűségidő után",
    newProviderStarts: "Szám-megtartás: néhány munkanap",
    bestSwitchWindow: "A hűségidő vége + készülék-akciók",
    minContract: "1-2 év (készülékkel), utána havonta felmondható",
    tips: [
      "A nummerbehoud (szám-megtartás) ingyenes — az új szolgáltató intézi.",
      "A SIM-only (készülék nélkül) tipikusan sokkal olcsóbb.",
      "A diszkont-márkák (Simyo, hollandsnieuwe, Lebara) az nagy hálózatokon olcsók.",
      "A hűségidő alatti felmondás a maradék hónapokra díjas.",
      "EU-roaming minden holland szolgáltatónál benne van.",
    ],
    officialLinks: [
      { label: "ACM — ConsuWijzer", url: "https://www.consuwijzer.nl/" },
      { label: "Pricewise — Mobiel vergelijken", url: "https://www.pricewise.nl/sim-only/" },
    ],
    providers: [
      { id: "kpn-m",   name: "KPN",           note: "Legjobb lefedettség, drága", url: "https://www.kpn.com/",   tier: "premium", color: "#008AC9" },
      { id: "odido-m", name: "Odido",         note: "Jó lefedettség, kedvező",    url: "https://www.odido.nl/",  tier: "mid",     color: "#E20074" },
      { id: "voda-nl", name: "Vodafone",      note: "Országos",                   url: "https://www.vodafone.nl/", tier: "mid",   color: "#E60000" },
      { id: "simyo",   name: "Simyo",         note: "KPN-hálózat, budget",        url: "https://www.simyo.nl/",  tier: "budget",  color: "#7AB800" },
      { id: "lebara-nl",name: "Lebara",       note: "Olcsó nemzetközi hívás",     url: "https://www.lebara.nl/", tier: "budget",  color: "#0066B3" },
    ],
    germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreft: Opzegging mobiel abonnement nr. ${p.contractNumber} per ${p.dateOfTermination}

Geachte heer/mevrouw,

Hierbij zeg ik mijn mobiele abonnement met nummer ${p.contractNumber} op tegen de eerst mogelijke datum, doch niet eerder dan ${p.dateOfTermination}.

Indien ik mijn nummer meeneem, regelt de nieuwe provider de overstap.

Ik verzoek u de opzegging schriftelijk te bevestigen.

Met vriendelijke groet,

${p.customerName}`,
  },
  {
    id: "bank",
    label: "Bankszámla (betaalrekening)",
    emoji: "🏦",
    description: "Folyószámla. Nincs hűségidő; a törvényi Overstapservice automatikusan átirányítja az átutalásokat 13 hónapig.",
    noticePeriod: "Nincs (bármikor felmondható)",
    deadline: "Bármikor",
    newProviderStarts: "Új számla 1-2 nap alatt",
    bestSwitchWindow: "Bármikor — a mobil-bankok (bunq, Revolut) gyorsak",
    minContract: "Nincs",
    tips: [
      "Az Overstapservice (törvényi) 13 hónapig átirányítja a bejövő/kimenő fizetéseket az új számládra.",
      "Az ING, Rabobank, ABN AMRO a három nagy; a bunq/Revolut mobil-only.",
      "Az iDEAL fizetéshez holland IBAN kell — nyiss helyi számlát mielőbb.",
      "A fizetésed új IBAN-ját add meg a munkáltatódnak és a hatóságoknak.",
      "Wise/Revolut a nemzetközi utaláshoz (HUF↔EUR) kedvező.",
    ],
    officialLinks: [
      { label: "Overstapservice", url: "https://www.overstapservice.nl/" },
      { label: "Consumentenbond — Betaalrekening", url: "https://www.consumentenbond.nl/betaalrekening" },
    ],
    providers: [
      { id: "ing-nl",  name: "ING",       note: "Legnagyobb, jó app",       url: "https://www.ing.nl/",       tier: "mid",     color: "#FF6200" },
      { id: "rabo",    name: "Rabobank",  note: "Szövetkezeti, országos",   url: "https://www.rabobank.nl/",  tier: "mid",     color: "#000066" },
      { id: "abn",     name: "ABN AMRO",  note: "Nagy bank",                url: "https://www.abnamro.nl/",   tier: "mid",     color: "#009286" },
      { id: "bunq-nl", name: "bunq",      note: "Mobil-bank, gyors nyitás", url: "https://www.bunq.com/",     tier: "budget",  color: "#3394FF" },
      { id: "sns",     name: "SNS",       note: "Kedvező, egyszerű",        url: "https://www.snsbank.nl/",   tier: "budget",  color: "#5A2D81" },
    ],
    germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreft: Opzegging / opheffing betaalrekening nr. ${p.contractNumber} per ${p.dateOfTermination}

Geachte heer/mevrouw,

Hierbij zeg ik mijn betaalrekening op en verzoek om opheffing per ${p.dateOfTermination}.

Rekeningnummer / IBAN: ${p.contractNumber}

Gelieve het resterende saldo over te maken naar:
IBAN: [nieuw IBAN hier invullen]

Ik verzoek u de opheffing schriftelijk te bevestigen.

Met vriendelijke groet,

${p.customerName}`,
  },
  {
    id: "electricity",
    label: "Energie (stroom & gas)",
    emoji: "⚡",
    description: "Hollandiában az energia-piac SZABAD — bárki válthat. A vast (fix) szerződésnek hűségideje van; a variabel (változó) havonta felmondható. Gyakran stroom + gas egy szerződésben.",
    noticePeriod: "1 hónap (variabel); vast: a hűségidő szerint (opzegvergoeding lehet)",
    deadline: "Bármikor (variabel); vast szerződésnél a lejárat felé",
    newProviderStarts: "Az új szolgáltató intézi a váltást (~2-4 hét)",
    bestSwitchWindow: "Bármikor — évente érdemes összehasonlítani (Independer/Pricewise)",
    minContract: "Variabel: nincs; vast (fix ár): 1-3 év, korai felmondásnál opzegvergoeding",
    tips: [
      "Az új szolgáltató intézi a felmondást és a váltást — neked csak szerződnöd kell.",
      "Independer / Pricewise összehasonlítóval évente sokat lehet spórolni.",
      "A vast (fix ár) szerződés korai felmondása díjas lehet (opzegvergoeding).",
      "Sokszor stroom + gas EGY szerződésben (duo) — nézd meg mindkettőt.",
      "A meterstand (mérőóra-állás) kell a váltáskor; a welkomstbonus feltételeit ellenőrizd.",
    ],
    officialLinks: [
      { label: "ACM — Energie overstappen", url: "https://www.consuwijzer.nl/energie" },
      { label: "Independer — Energie vergelijken", url: "https://www.independer.nl/energie/" },
    ],
    providers: [
      { id: "vattenfall-nl", name: "Vattenfall", note: "Nagy szolgáltató",       url: "https://www.vattenfall.nl/", tier: "mid",     color: "#FFDA00" },
      { id: "eneco",         name: "Eneco",      note: "Nagy, zöld fókusz",       url: "https://www.eneco.nl/",      tier: "mid",     color: "#E5007D" },
      { id: "essent",        name: "Essent",     note: "Országos",                url: "https://www.essent.nl/",     tier: "mid",     color: "#E2001A" },
      { id: "greenchoice",   name: "Greenchoice", note: "100% zöld",              url: "https://www.greenchoice.nl/", tier: "premium",color: "#4CAF50" },
      { id: "budgetenergie", name: "Budget Energie", note: "Olcsó, online",       url: "https://www.budgetenergie.nl/", tier: "budget", color: "#EC008C" },
    ],
    germanTemplate: (p) => `${p.customerName}
${p.customerAddress}

${p.todayDate}

${p.providerName}

Betreft: Opzegging energiecontract (stroom & gas) nr. ${p.contractNumber} per ${p.dateOfTermination}

Geachte heer/mevrouw,

Hierbij zeg ik mijn energiecontract op tegen de eerst mogelijke datum, doch niet eerder dan ${p.dateOfTermination}.

Klantnummer: ${p.contractNumber}

Ik verzoek u de opzegging en de einddatum schriftelijk te bevestigen.

Met vriendelijke groet,

${p.customerName}`,
  },
];

/** Ország → kategóriák (ismeretlen ország → CH). */
export const PROVIDER_CATEGORIES_BY_COUNTRY: Record<string, CategoryInfo[]> = {
  CH: CH_CATEGORIES,
  AT: AT_CATEGORIES,
  DE: DE_CATEGORIES,
  NL: NL_CATEGORIES,
};

export function getProviderCategories(country: string | null | undefined): CategoryInfo[] {
  return (country && PROVIDER_CATEGORIES_BY_COUNTRY[country]) || CH_CATEGORIES;
}

/** Visszafelé kompatibilis export (CH). */
export const PROVIDER_CATEGORIES: CategoryInfo[] = CH_CATEGORIES;

export function getCategoryInfo(id: ProviderCategory, country?: string | null): CategoryInfo | null {
  return getProviderCategories(country).find((c) => c.id === id) ?? null;
}

/** Mai dátum DE formátum (DD.MM.YYYY). */
export function formatDateDe(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${d.getFullYear()}`;
}
