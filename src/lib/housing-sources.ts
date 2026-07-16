/**
 * housing-sources.ts — „Hol keress még albérletet?" link-out katalógus (TISZTA
 * adat, a job-sources mintájára).
 *
 * ⚠️ JOGI KERET (a [[jobs-aggregation-strategy]] tanulsága housing-ra): a
 * lakhatási portáloknak NINCS Adzuna-szerű, hozzájárulásos szindikációs API-ja
 * — a hirdetés-állomány a koronaékszerük, adatbázis-joggal (96/9/EK sui
 * generis) védik és aktívan perelnek érte. A „nem tároljuk, csak átmenően
 * mutatjuk" NEM védekezés: a CJEU Innoweb-ítélete (C-202/12) pont a nem-tároló
 * meta-keresőre mondta ki az újrahasznosítás-jogsértést. Ezért itt KIZÁRÓLAG
 * kilinkelünk a portálok saját felületére (új lap, nofollow) — hirdetést nem
 * húzunk be, nem tárolunk, nem jelenítünk meg. Ez jogtiszta, és a feed így
 * sem „üres": a közösségi börze fölött mindig ott a teljes piaci kínálat.
 */

export interface HousingSource {
  name: string;
  url: string;
  note: string;
}

export interface HousingSourcesData {
  sources: HousingSource[];
  /** Ország-specifikus gyakorlati tipp a lista alá. */
  tip: string;
}

const DATA: Record<string, HousingSourcesData> = {
  CH: {
    sources: [
      { name: "Flatfox", url: "https://flatfox.ch/", note: "Ingyenes svájci bérlési platform — sok hirdetés közvetlenül a kiadótól." },
      { name: "Homegate", url: "https://www.homegate.ch/", note: "A legnagyobb svájci ingatlanportál (bérlés és vétel)." },
      { name: "WGZimmer", url: "https://www.wgzimmer.ch/", note: "Szobák és lakóközösségek (WG) — a legjobb belépő szoba-szinten." },
      { name: "ImmoScout24", url: "https://www.immoscout24.ch/", note: "Országos kínálat, részletes szűrőkkel." },
    ],
    tip: "Svájcban a jó lakásért pályázni kell: készítsd elő a dossziét (fizetés-igazolás, Betreibungsregisterauszug, referencia) — akár még a megtekintés előtt.",
  },
  AT: {
    sources: [
      { name: "willhaben", url: "https://www.willhaben.at/iad/immobilien", note: "A legnagyobb osztrák apróhirdetés-oldal — a bérleti kínálat zöme itt van." },
      { name: "ImmobilienScout24", url: "https://www.immobilienscout24.at/", note: "Országos portál, részletes szűrőkkel." },
      { name: "WG-Gesucht", url: "https://www.wg-gesucht.de/", note: "Szobák és lakóközösségek — a nagy osztrák városokat is lefedi." },
    ],
    tip: "Ausztriában számolj 3 havi kaucióval, és figyeld, hogy a hirdetés provisionsfrei-e — az ingatlanosi jutalék akár 2 havi bérleti díj is lehet.",
  },
  DE: {
    sources: [
      { name: "WG-Gesucht", url: "https://www.wg-gesucht.de/", note: "Szobák és lakóközösségek (WG) — külföldiként a leggyorsabb belépő." },
      { name: "ImmobilienScout24", url: "https://www.immobilienscout24.de/", note: "A legnagyobb német ingatlanportál." },
      { name: "Immowelt", url: "https://www.immowelt.de/", note: "Országos kínálat — érdemes az ImmoScouttal párhuzamosan nézni." },
      { name: "Kleinanzeigen", url: "https://www.kleinanzeigen.de/s-wohnung-mieten/c203", note: "Apróhirdetések közvetlenül a kiadóktól, jutalék nélkül." },
    ],
    tip: "Németországban a beköltözés után az Anmeldunghoz kell a Wohnungsgeberbestätigung (főbérlői igazolás) — kérd el már a szerződéskötéskor.",
  },
  NL: {
    sources: [
      { name: "Funda", url: "https://www.funda.nl/huur/", note: "A fő holland ingatlanportál — a hivatalos bérleti kínálat itt van." },
      { name: "Pararius", url: "https://www.pararius.nl/", note: "Bérlésre szakosodott portál, angol felülettel is." },
      { name: "Kamernet", url: "https://kamernet.nl/", note: "Szobák és stúdiók — a szoba-szintű piac fő helye." },
      { name: "Huurwoningen", url: "https://www.huurwoningen.nl/", note: "Országos bérleti aggregátor-portál." },
    ],
    tip: "Hollandiában sok a kamu hirdetés: sose fizess a lakás megtekintése előtt, és ellenőrizd, jogosult vagy-e huurtoeslagra (lakbér-támogatás).",
  },
};

/** Az adott ország link-out forrásai — ismeretlen országra null. */
export function getHousingSources(country: string): HousingSourcesData | null {
  return DATA[country] ?? null;
}
