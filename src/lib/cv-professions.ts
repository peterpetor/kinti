/**
 * cv-professions.ts — magyar → német szakma-szótár a Német Önéletrajz Készítőhöz.
 *
 * KURÁLT (NEM AI): a szó-szerinti gépi fordítás nálunk TILOS (a Betreibung=„kivégzés"
 * bug óta) — ez egy kézzel ellenőrzött Berufsbezeichnung-lista, a job-categories.ts
 * 103 szakmájának id-jére kulcsolva (a wizard ugyanazt a JobCategoryOptions pickert
 * használja). A német alak a bevett HR-megnevezés, jellemzően a /in gender-jelöléssel
 * (a német CV-standard szerint). Ismeretlen id → null (a wizard a magyar nevet vagy
 * a felhasználó saját megnevezését használja).
 */

export const CV_PROFESSION_DE: Record<string, string> = {
  // Építőipar & szakiparok
  epitoipar: "Bauarbeiter/in",
  komuves: "Maurer/in",
  burkolo: "Fliesenleger/in",
  padloburkolo: "Parkett-/Bodenleger/in",
  festo: "Maler und Lackierer/in",
  asztalos: "Schreiner/in (Tischler/in)",
  tetofedo: "Dachdecker/in",
  gipszkarton: "Trockenbaumonteur/in",
  szigetelo: "Isolierer/in (Fassade)",
  uveges: "Glaser/in",
  villanyszerelo: "Elektriker/in (Elektroinstallateur/in)",
  vizszerelo: "Anlagenmechaniker/in SHK (Sanitär/Heizung)",
  epuletgepesz: "Gebäudetechniker/in (HLK)",
  hegeszto: "Schweißer/in (Schlosser/in)",
  allvanyozo: "Gerüstbauer/in",
  foldmunkas: "Bauhelfer/in / Baumaschinenführer/in",
  daru: "Kranführer/in",
  // Ipar, gyártás, technika
  "ipar-gyartas": "Produktionsmitarbeiter/in",
  szereldei: "Montagemitarbeiter/in (Fließband)",
  cnc: "CNC-Maschinenbediener/in",
  forgacsolo: "Zerspanungsmechaniker/in (Dreher/in)",
  gepesz: "Maschinenschlosser/in (Instandhaltung)",
  elektronika: "Elektroniker/in (Automatisierung)",
  muanyag: "Kunststoff-/Gummiverarbeiter/in",
  csomagolo: "Verpackungs-/Produktionshelfer/in",
  // Jármű & szállítás
  logisztika: "Lagerist/in (Logistik)",
  sofor: "LKW-Fahrer/in (C/CE)",
  buszsofor: "Busfahrer/in",
  taxi: "Taxifahrer/in",
  futar: "Kurier-/Zusteller/in",
  targoncas: "Gabelstaplerfahrer/in",
  gepjarmu: "KFZ-Mechatroniker/in",
  // Vendéglátás & turizmus
  vendeglatas: "Mitarbeiter/in Gastronomie",
  szakacs: "Koch/Köchin",
  pincer: "Kellner/in (Servicekraft)",
  konyhai: "Küchenhilfe / Spülkraft",
  gyorsetterem: "Mitarbeiter/in Systemgastronomie",
  pek: "Bäcker/in / Konditor/in",
  barista: "Barista",
  csapos: "Barkeeper/in",
  catering: "Catering-/Bankettmitarbeiter/in",
  hotel: "Hotelfachkraft / Rezeptionist/in",
  idegenvezeto: "Reiseleiter/in",
  // Egészségügy & gondozás
  egeszsegugy: "Pflegefachkraft / Pflegehelfer/in",
  idosgondozas: "Altenpfleger/in (Betreuung)",
  gyermekfelugyelet: "Kinderbetreuer/in / Au-pair",
  szocialis: "Sozialarbeiter/in / Betreuungskraft",
  mento: "Rettungssanitäter/in (Krankentransport)",
  fogaszat: "Zahnmedizinische/r Fachangestellte/r (ZFA)",
  optikus: "Augenoptiker/in",
  gyogyszertar: "Pharmazeutisch-kaufmännische/r Angestellte/r (PKA)",
  laborasszisztens: "Laborassistent/in",
  massaz: "Masseur/in / Physiotherapeut/in",
  // Szépség & wellness
  szepsegipar: "Mitarbeiter/in Kosmetik/Beauty",
  fodrasz: "Friseur/in",
  borbely: "Barbier / Herrenfriseur",
  kozmetikus: "Kosmetiker/in",
  sminkes: "Make-up Artist / Visagist/in",
  mukormos: "Nageldesigner/in",
  tetovalo: "Tätowierer/in / Piercer/in",
  wellness: "Wellness-/Spa-Mitarbeiter/in",
  // Kereskedelem & ügyfélszolgálat
  kereskedelem: "Verkäufer/in (Einzelhandel)",
  penztaros: "Kassierer/in",
  arufeltolto: "Regalauffüller/in / Warenverräumer/in",
  boltvezeto: "Filialleiter/in",
  ugyfelszolgalat: "Kundenberater/in (Call Center)",
  ertekesites: "Vertriebsmitarbeiter/in (Sales)",
  webshop: "E-Commerce-Mitarbeiter/in",
  ingatlan: "Immobilienmakler/in",
  biztositas: "Versicherungsvertreter/in",
  // Szolgáltatás & háztartás
  takaritas: "Reinigungskraft (Gebäudereinigung)",
  ablaktisztito: "Glas-/Fassadenreiniger/in",
  mosoda: "Wäscherei-/Textilreiniger/in",
  koltoztetes: "Umzugshelfer/in / Möbelspediteur/in",
  biztonsag: "Sicherheitsmitarbeiter/in (Wachdienst)",
  karbantartas: "Hausmeister/in (Instandhaltung)",
  hulladek: "Entsorgungs-/Reinigungsmitarbeiter/in",
  // Mezőgazdaság & kertészet
  mezogazdasag: "Landwirtschaftliche/r Mitarbeiter/in",
  idenymunkas: "Saison-/Erntehelfer/in",
  kertesz: "Gärtner/in (GaLaBau)",
  viragkoto: "Florist/in",
  allattenyesztes: "Tierpfleger/in (Landwirtschaft)",
  borasz: "Winzer/in / Kellermeister/in",
  // Iroda, pénzügy, jog
  iroda: "Bürokraft / Sachbearbeiter/in",
  asszisztens: "Assistent/in (Sekretariat)",
  penzugy: "Buchhalter/in (Finanzbuchhaltung)",
  bank: "Bankkaufmann/-frau",
  beszerzes: "Einkäufer/in (Sachbearbeiter/in Einkauf)",
  hr: "Personalsachbearbeiter/in (HR)",
  jog: "Jurist/in / Rechtsanwaltsfachangestellte/r",
  // IT & média
  it: "IT-Fachkraft",
  rendszergazda: "Systemadministrator/in (IT-Support)",
  tesztelo: "Softwaretester/in (QA)",
  adatelemzo: "Datenanalyst/in",
  media: "Marketing-/Medienmitarbeiter/in",
  grafikus: "Grafikdesigner/in (UX/UI)",
  fotos: "Fotograf/in / Videograf/in",
  // Oktatás & nyelvek
  oktatas: "Lehrer/in / Pädagoge/-in",
  ovoda: "Erzieher/in (Kita)",
  korrepetalo: "Nachhilfelehrer/in",
  nyelvtanar: "Sprachlehrer/in / Übersetzer/in",
  edzo: "Trainer/in (Fitness/Sport)",
  // Egyéb
  egyeb: "Sonstige/r Mitarbeiter/in",
};

/** A szakma német (HR-bevett) megnevezése a kategória-id alapján, vagy null. */
export function cvProfessionDe(categoryId: string | null | undefined): string | null {
  if (!categoryId) return null;
  return CV_PROFESSION_DE[categoryId] ?? null;
}

/** Szakma-megnevezés a kért CV-nyelven (de = német, en = brit angol, nl = holland, es = spanyol). */
export function cvProfession(
  categoryId: string | null | undefined,
  locale: "de" | "en" | "nl" | "es",
): string | null {
  if (!categoryId) return null;
  const map =
    locale === "en" ? CV_PROFESSION_EN
    : locale === "nl" ? CV_PROFESSION_NL
    : locale === "es" ? CV_PROFESSION_ES
    : CV_PROFESSION_DE;
  return map[categoryId] || null;
}

/** Német nyelvi szintek (CEFR + anyanyelv) a nyelvtudás-blokkhoz. */
export const CV_LANGUAGE_LEVELS = [
  "A1 (Anfänger)",
  "A2 (Grundlagen)",
  "B1 (Fortgeschritten)",
  "B2 (Selbständig)",
  "C1 (Fachkundig)",
  "C2 (Annähernd muttersprachlich)",
  "Muttersprache",
] as const;

/** Brit angol nyelvi szintek (CEFR + anyanyelv). */
export const CV_LANGUAGE_LEVELS_EN = [
  "A1 (Beginner)",
  "A2 (Elementary)",
  "B1 (Intermediate)",
  "B2 (Upper intermediate)",
  "C1 (Advanced)",
  "C2 (Proficient)",
  "Native speaker",
] as const;

/** Holland nyelvi szintek (ERK = a CEFR holland neve + anyanyelv). */
export const CV_LANGUAGE_LEVELS_NL = [
  "A1 (Beginner)",
  "A2 (Basisgebruiker)",
  "B1 (Gevorderd)",
  "B2 (Zelfstandig)",
  "C1 (Vergevorderd)",
  "C2 (Bijna moedertaal)",
  "Moedertaal",
] as const;

/** Spanyol nyelvi szintek (MCER = a CEFR spanyol neve + anyanyelv). */
export const CV_LANGUAGE_LEVELS_ES = [
  "A1 (Principiante)",
  "A2 (Básico)",
  "B1 (Intermedio)",
  "B2 (Intermedio alto)",
  "C1 (Avanzado)",
  "C2 (Dominio)",
  "Lengua materna",
] as const;

/** A nyelvtudás-szintek listája a kért CV-nyelven. */
export function cvLanguageLevels(locale: "de" | "en" | "nl" | "es"): readonly string[] {
  if (locale === "en") return CV_LANGUAGE_LEVELS_EN;
  if (locale === "nl") return CV_LANGUAGE_LEVELS_NL;
  if (locale === "es") return CV_LANGUAGE_LEVELS_ES;
  return CV_LANGUAGE_LEVELS;
}

/**
 * cv-professions EN — magyar → ANGOL (UK) szakma-megnevezés az Angol Önéletrajz
 * Készítőhöz. Ugyanaz az elv, mint a németnél: KURÁLT lista, nem gépi fordítás.
 *
 * ⚠️ A brit CV-ben NINCS gender-jelölés (a német /in párja) — ez a UK-ban
 * kifejezetten kerülendő (Equality Act). A megnevezések a bevett brit
 * álláshirdetés-nyelvet követik (pl. „Forklift Driver", nem „Fork-lift operator").
 */
export const CV_PROFESSION_EN: Record<string, string> = {
  // Építőipar & szakiparok
  epitoipar: "Construction Worker",
  komuves: "Bricklayer",
  burkolo: "Tiler",
  padloburkolo: "Flooring Fitter",
  festo: "Painter and Decorator",
  asztalos: "Carpenter / Joiner",
  tetofedo: "Roofer",
  gipszkarton: "Dry Liner (Plasterboard Fitter)",
  szigetelo: "Insulation Installer",
  uveges: "Glazier",
  villanyszerelo: "Electrician",
  vizszerelo: "Plumber",
  epuletgepesz: "Building Services Engineer (HVAC)",
  hegeszto: "Welder / Fabricator",
  allvanyozo: "Scaffolder",
  foldmunkas: "Groundworker / Plant Operator",
  daru: "Crane Operator",
  // Ipar, gyártás, technika
  "ipar-gyartas": "Production Operative",
  szereldei: "Assembly Operative",
  cnc: "CNC Machine Operator",
  forgacsolo: "CNC Machinist (Turner)",
  gepesz: "Maintenance Fitter",
  elektronika: "Electronics Technician",
  muanyag: "Plastics / Rubber Process Operative",
  csomagolo: "Packing Operative",
  // Jármű & szállítás
  logisztika: "Warehouse Operative",
  sofor: "HGV / LGV Driver",
  buszsofor: "Bus Driver",
  taxi: "Taxi / Private Hire Driver",
  futar: "Delivery Driver / Courier",
  targoncas: "Forklift Driver",
  gepjarmu: "Vehicle Mechanic (MOT Tester)",
  // Vendéglátás
  vendeglatas: "Hospitality Staff",
  szakacs: "Chef",
  pincer: "Waiter / Waitress",
  konyhai: "Kitchen Porter",
  gyorsetterem: "Fast Food Team Member",
  pek: "Baker",
  barista: "Barista",
  csapos: "Bartender",
  catering: "Catering Assistant",
  hotel: "Hotel Receptionist / Housekeeper",
  idegenvezeto: "Tour Guide",
  // Egészségügy & gondozás
  egeszsegugy: "Healthcare Assistant",
  idosgondozas: "Care Assistant (Elderly Care)",
  gyermekfelugyelet: "Childcare Worker / Nanny",
  szocialis: "Support Worker",
  mento: "Ambulance Care Assistant",
  fogaszat: "Dental Nurse",
  optikus: "Optical Assistant",
  gyogyszertar: "Pharmacy Assistant",
  laborasszisztens: "Laboratory Assistant",
  massaz: "Massage Therapist",
  // Szépségipar
  szepsegipar: "Beauty Therapist",
  fodrasz: "Hairdresser",
  borbely: "Barber",
  kozmetikus: "Beautician",
  sminkes: "Make-up Artist",
  mukormos: "Nail Technician",
  tetovalo: "Tattoo Artist",
  wellness: "Spa Therapist",
  // Kereskedelem
  kereskedelem: "Retail Assistant",
  penztaros: "Cashier",
  arufeltolto: "Shelf Stacker / Replenishment Assistant",
  boltvezeto: "Store Manager",
  ugyfelszolgalat: "Customer Service Advisor",
  ertekesites: "Sales Advisor",
  webshop: "E-commerce Assistant",
  ingatlan: "Estate Agent",
  biztositas: "Insurance Advisor",
  // Szolgáltatás
  takaritas: "Cleaner",
  ablaktisztito: "Window Cleaner",
  mosoda: "Laundry Operative",
  koltoztetes: "Removals Operative",
  biztonsag: "Security Officer (SIA)",
  karbantartas: "Maintenance Operative / Handyperson",
  hulladek: "Waste and Recycling Operative",
  // Mezőgazdaság
  mezogazdasag: "Agricultural Worker",
  idenymunkas: "Seasonal Farm Worker (Fruit Picker)",
  kertesz: "Gardener / Landscaper",
  viragkoto: "Florist",
  allattenyesztes: "Livestock Worker",
  borasz: "Winemaker",
  // Iroda & szakma
  iroda: "Office Administrator",
  asszisztens: "Personal Assistant",
  penzugy: "Accounts Assistant",
  bank: "Bank Clerk",
  beszerzes: "Procurement Officer",
  hr: "HR Administrator",
  jog: "Legal Assistant / Paralegal",
  // IT & média
  it: "Software Developer",
  rendszergazda: "IT Systems Administrator",
  tesztelo: "QA Tester",
  adatelemzo: "Data Analyst",
  media: "Media Assistant",
  grafikus: "Graphic Designer",
  fotos: "Photographer",
  // Oktatás
  oktatas: "Teaching Assistant",
  ovoda: "Nursery Practitioner",
  korrepetalo: "Private Tutor",
  nyelvtanar: "Language Teacher",
  edzo: "Fitness Instructor / Personal Trainer",
  egyeb: "",
};

/**
 * cv-professions NL — magyar → HOLLAND szakma-megnevezés a Holland Önéletrajz
 * Készítőhöz. Ugyanaz az elv, mint a németnél és az angolnál: KURÁLT lista,
 * nem gépi fordítás (ld. [[ai-content-accuracy]]).
 *
 * ⚠️ A holland CV-ben NINCS gender-jelölés (a német /in párja) — a holland
 * álláshirdetés-nyelv semleges alakot használ („Kapper", nem „Kapper/ster").
 * A megnevezések a bevett holland vacaturetekst-szóhasználatot követik: sok
 * szakmánál a `-medewerker` (pl. Productiemedewerker) és a `-monteur`
 * (pl. Onderhoudsmonteur) a HR-standard, nem a szótári alak.
 */
export const CV_PROFESSION_NL: Record<string, string> = {
  // Építőipar & szakiparok
  epitoipar: "Bouwvakker",
  komuves: "Metselaar",
  burkolo: "Tegelzetter",
  padloburkolo: "Vloerenlegger (parketteur)",
  festo: "Schilder (afwerking)",
  asztalos: "Timmerman / Meubelmaker",
  tetofedo: "Dakdekker",
  gipszkarton: "Wand- en plafondmonteur (gipsplaat)",
  szigetelo: "Isolatiemonteur (gevel)",
  uveges: "Glaszetter",
  villanyszerelo: "Elektricien (elektromonteur)",
  vizszerelo: "Loodgieter (installatiemonteur)",
  epuletgepesz: "Installatiemonteur klimaattechniek (W-installaties)",
  hegeszto: "Lasser (constructiebankwerker)",
  allvanyozo: "Steigerbouwer",
  foldmunkas: "Grondwerker / Machinist",
  daru: "Kraanmachinist",
  // Ipar, gyártás, technika
  "ipar-gyartas": "Productiemedewerker",
  szereldei: "Assemblagemedewerker (lopende band)",
  cnc: "CNC-operator",
  forgacsolo: "CNC-verspaner (draaier)",
  gepesz: "Onderhoudsmonteur (machinebouw)",
  elektronika: "Elektrotechnicus (industriële automatisering)",
  muanyag: "Procesoperator kunststof/rubber",
  csomagolo: "Inpakmedewerker (productie)",
  // Jármű & szállítás
  logisztika: "Magazijnmedewerker (logistiek)",
  sofor: "Vrachtwagenchauffeur (C/CE)",
  buszsofor: "Buschauffeur",
  taxi: "Taxichauffeur",
  futar: "Bezorger / Koerier",
  targoncas: "Heftruckchauffeur",
  gepjarmu: "Automonteur (APK-keurmeester)",
  // Vendéglátás & turizmus
  vendeglatas: "Horecamedewerker",
  szakacs: "Kok",
  pincer: "Medewerker bediening (ober)",
  konyhai: "Keukenhulp / Afwasser",
  gyorsetterem: "Crewmedewerker (fastfood)",
  pek: "Bakker / Banketbakker",
  barista: "Barista",
  csapos: "Barmedewerker (barman)",
  catering: "Cateringmedewerker (banqueting)",
  hotel: "Hotelmedewerker / Receptionist",
  idegenvezeto: "Reisleider / Gids",
  // Egészségügy & gondozás
  egeszsegugy: "Zorgmedewerker (verzorgende IG)",
  idosgondozas: "Verzorgende ouderenzorg",
  gyermekfelugyelet: "Pedagogisch medewerker kinderopvang",
  szocialis: "Begeleider (sociaal werk)",
  mento: "Ambulancemedewerker (zorgvervoer)",
  fogaszat: "Tandartsassistent",
  optikus: "Opticien (optiekmedewerker)",
  gyogyszertar: "Apothekersassistent",
  laborasszisztens: "Laboratoriumassistent (analist)",
  massaz: "Masseur / Fysiotherapeut",
  // Szépség & wellness
  szepsegipar: "Medewerker schoonheidsverzorging",
  fodrasz: "Kapper",
  borbely: "Barbier (herenkapper)",
  kozmetikus: "Schoonheidsspecialist",
  sminkes: "Visagist (make-upartiest)",
  mukormos: "Nagelstylist",
  tetovalo: "Tatoeëerder / Piercer",
  wellness: "Wellness-/spamedewerker",
  // Kereskedelem & ügyfélszolgálat
  kereskedelem: "Verkoopmedewerker (detailhandel)",
  penztaros: "Kassamedewerker",
  arufeltolto: "Vakkenvuller",
  boltvezeto: "Filiaalmanager",
  ugyfelszolgalat: "Klantenservicemedewerker (callcenter)",
  ertekesites: "Verkoopadviseur (accountmanager)",
  webshop: "E-commercemedewerker",
  ingatlan: "Makelaar (onroerend goed)",
  biztositas: "Verzekeringsadviseur",
  // Szolgáltatás & háztartás
  takaritas: "Schoonmaakmedewerker",
  ablaktisztito: "Glazenwasser (gevelreiniger)",
  mosoda: "Medewerker wasserij (textielreiniging)",
  koltoztetes: "Verhuismedewerker",
  biztonsag: "Beveiligingsmedewerker",
  karbantartas: "Onderhoudsmedewerker (huismeester)",
  hulladek: "Medewerker afval en recycling",
  // Mezőgazdaság & kertészet
  mezogazdasag: "Agrarisch medewerker",
  idenymunkas: "Seizoenmedewerker (oogst)",
  kertesz: "Hovenier (tuinonderhoud)",
  viragkoto: "Bloemist",
  allattenyesztes: "Dierverzorger (veehouderij)",
  borasz: "Wijnmaker (keldermeester)",
  // Iroda, pénzügy, jog
  iroda: "Administratief medewerker",
  asszisztens: "Managementassistent (secretariaat)",
  penzugy: "Boekhouder (financiële administratie)",
  bank: "Bankmedewerker",
  beszerzes: "Inkoper (inkoopmedewerker)",
  hr: "HR-medewerker (personeelszaken)",
  jog: "Juridisch medewerker (jurist)",
  // IT & média
  it: "Softwareontwikkelaar",
  rendszergazda: "Systeembeheerder (IT-support)",
  tesztelo: "Softwaretester (QA)",
  adatelemzo: "Data-analist",
  media: "Marketing-/mediamedewerker",
  grafikus: "Grafisch vormgever (UX/UI)",
  fotos: "Fotograaf / Videograaf",
  // Oktatás & nyelvek
  oktatas: "Leerkracht / Docent",
  ovoda: "Pedagogisch medewerker (kinderdagverblijf)",
  korrepetalo: "Bijlesdocent",
  nyelvtanar: "Taaldocent / Vertaler",
  edzo: "Sportinstructeur / Personal trainer",
  egyeb: "",
};

/**
 * cv-professions ES — magyar → SPANYOL szakma-megnevezés a Spanyol Önéletrajz
 * Készítőhöz. Ugyanaz az elv: KURÁLT lista, nem gépi fordítás.
 *
 * ⚠️ NEM tettünk gender-jelölést a megnevezésekbe (nincs „Camarero/a"): a spanyol
 * álláshirdetés-nyelvben ez a HIRDETŐ oldalán bevett, a SAJÁT önéletrajzodban
 * viszont a saját nemedben írod ki magad. Egy „/a" a CV-ben zavaros — a wizard
 * ezért a semleges hímnemű alapalakot adja, amit a felhasználó egy karakterrel
 * átírhat (Camarero → Camarera). Ezt a wizard szövege ki is mondja.
 *
 * ⚠️ Ahol a spanyol munkaerőpiacon a hivatalos SZAKKÉPESÍTÉS neve más, mint a
 * hétköznapi szó, a bevett HIRDETÉSI megnevezést használjuk — az önéletrajz
 * dolga, hogy a HR megtalálja, nem az, hogy jogszabályt idézzen.
 */
export const CV_PROFESSION_ES: Record<string, string> = {
  // Építőipar & szakiparok
  epitoipar: "Peón de construcción",
  komuves: "Albañil",
  burkolo: "Alicatador / Solador",
  padloburkolo: "Instalador de suelos (parquetista)",
  festo: "Pintor de construcción",
  asztalos: "Carpintero",
  tetofedo: "Techador / Instalador de cubiertas",
  gipszkarton: "Instalador de pladur (tabiquería seca)",
  szigetelo: "Instalador de aislamiento (fachadas)",
  uveges: "Cristalero / Instalador de ventanas",
  villanyszerelo: "Electricista",
  vizszerelo: "Fontanero / Instalador de calefacción",
  epuletgepesz: "Técnico de climatización (HVAC)",
  hegeszto: "Soldador / Cerrajero",
  allvanyozo: "Montador de andamios",
  foldmunkas: "Operario de movimiento de tierras / Maquinista",
  daru: "Operador de grúa",
  // Ipar, gyártás, technika
  "ipar-gyartas": "Operario de producción",
  szereldei: "Operario de montaje",
  cnc: "Operario de máquina CNC",
  forgacsolo: "Tornero / Fresador",
  gepesz: "Técnico de mantenimiento mecánico",
  elektronika: "Técnico de electrónica y automatización",
  muanyag: "Operario de plásticos y caucho",
  csomagolo: "Operario de envasado / Línea de producción",
  logisztika: "Mozo de almacén / Logística",
  // Jármű & szállítás
  sofor: "Conductor de camión (C/CE)",
  buszsofor: "Conductor de autobús",
  taxi: "Taxista / Conductor VTC",
  futar: "Repartidor / Mensajero",
  targoncas: "Carretillero (operador de carretilla elevadora)",
  gepjarmu: "Mecánico de automoción",
  // Vendéglátás & turizmus
  vendeglatas: "Personal de hostelería",
  szakacs: "Cocinero / Jefe de cocina",
  pincer: "Camarero de sala",
  konyhai: "Ayudante de cocina / Friegaplatos",
  gyorsetterem: "Empleado de restauración rápida",
  pek: "Panadero / Pastelero",
  barista: "Barista",
  csapos: "Camarero de barra / Bartender",
  catering: "Personal de catering y eventos",
  hotel: "Recepcionista de hotel",
  idegenvezeto: "Guía turístico",
  // Egészségügy & gondozás
  egeszsegugy: "Personal sanitario / Enfermería",
  idosgondozas: "Cuidador de personas mayores",
  gyermekfelugyelet: "Canguro / Au pair",
  szocialis: "Trabajador social / Cuidador",
  mento: "Técnico en emergencias sanitarias (TES)",
  fogaszat: "Auxiliar de clínica dental",
  optikus: "Óptico optometrista",
  gyogyszertar: "Auxiliar de farmacia",
  laborasszisztens: "Técnico de laboratorio",
  massaz: "Masajista / Fisioterapeuta",
  // Szépség & wellness
  szepsegipar: "Profesional de estética",
  fodrasz: "Peluquero",
  borbely: "Barbero",
  kozmetikus: "Esteticista",
  sminkes: "Maquillador profesional",
  mukormos: "Manicurista / Técnico de uñas",
  tetovalo: "Tatuador / Perforador corporal",
  wellness: "Profesional de spa y bienestar",
  // Kereskedelem & ügyfélszolgálat
  kereskedelem: "Dependiente de comercio",
  penztaros: "Cajero",
  arufeltolto: "Reponedor",
  boltvezeto: "Encargado de tienda",
  ugyfelszolgalat: "Agente de atención al cliente",
  ertekesites: "Comercial / Ventas",
  webshop: "Gestor de comercio electrónico",
  ingatlan: "Agente inmobiliario",
  biztositas: "Agente de seguros",
  // Szolgáltatás & háztartás
  takaritas: "Personal de limpieza",
  ablaktisztito: "Limpiacristales / Limpieza de fachadas",
  mosoda: "Operario de lavandería / Tintorería",
  koltoztetes: "Operario de mudanzas",
  biztonsag: "Vigilante de seguridad",
  karbantartas: "Conserje / Personal de mantenimiento",
  hulladek: "Operario de recogida de residuos",
  // Mezőgazdaság & kertészet
  mezogazdasag: "Peón agrícola",
  idenymunkas: "Temporero (recolección)",
  kertesz: "Jardinero",
  viragkoto: "Florista",
  allattenyesztes: "Ganadero / Operario de granja",
  borasz: "Enólogo / Operario de bodega",
  // Iroda, pénzügy, jog
  iroda: "Administrativo",
  asszisztens: "Auxiliar administrativo / Secretaría",
  penzugy: "Contable",
  bank: "Empleado de banca / Asesor financiero",
  beszerzes: "Técnico de compras y logística",
  hr: "Técnico de recursos humanos (RR. HH.)",
  jog: "Abogado / Asesor jurídico",
  // IT & média
  it: "Desarrollador de software",
  rendszergazda: "Administrador de sistemas / Soporte IT",
  tesztelo: "Tester de software (QA)",
  adatelemzo: "Analista de datos",
  media: "Técnico de marketing y comunicación",
  grafikus: "Diseñador gráfico (UX/UI)",
  fotos: "Fotógrafo / Videógrafo",
  // Oktatás & nyelvek
  oktatas: "Docente / Profesor",
  ovoda: "Técnico de educación infantil",
  korrepetalo: "Profesor particular",
  nyelvtanar: "Profesor de idiomas / Traductor",
  edzo: "Monitor deportivo / Entrenador personal",
  egyeb: "",
};
