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
