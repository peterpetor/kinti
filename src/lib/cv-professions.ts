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

/** Szakma-megnevezés a kért CV-nyelven (de = német, en = brit angol). */
export function cvProfession(
  categoryId: string | null | undefined,
  locale: "de" | "en",
): string | null {
  if (!categoryId) return null;
  const map = locale === "en" ? CV_PROFESSION_EN : CV_PROFESSION_DE;
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
