/**
 * job-sources.ts — ország-tudatos „Hivatalos álláskereső-források" katalógus.
 *
 * Jogtiszta tartalom: NEM tárolunk idegen hirdetést, csak a hivatalos/fő
 * álláskereső-portálokra MUTATÓ hivatkozásokat (deep-link, target=_blank).
 * Linkelni mindig szabad → nulla pertárgy, mégis pont az, amit egy kint élő
 * magyar először keres. A `regions.ts` mintájára: 1 fájl, 4 ország.
 *
 * Új ország bekötése: vedd fel a `JOB_SOURCES`-ba a kódot a hivatalos
 * közszolgálati portállal (official:true) + a nagy piaci oldalakkal + EURES-szel.
 */

export interface JobSource {
  /** Megjelenített név. */
  name: string;
  /** Teljes URL (https). A „Jelentkezés"/megnyitás ide visz, új lapon. */
  url: string;
  /** Rövid, magyar leírás — mi ez, kinek jó. */
  note: string;
  /** Hivatalos állami munkaügyi szolgálat (kiemelt badge). */
  official?: boolean;
}

export interface CountryJobSources {
  /** Portálok — a hivatalos(ak) elöl. */
  sources: JobSource[];
  /** „Magyar szempont" tipp a lista alá. */
  tip: string;
}

/** EURES — az EU hivatalos, határokon átnyúló álláskereső portálja (közös tétel). */
const EURES: JobSource = {
  name: "EURES (EU)",
  url: "https://eures.europa.eu/index_hu",
  note: "Az EU hivatalos, határokon átnyúló álláskereső portálja — magyarul is.",
  official: true,
};

export const JOB_SOURCES: Record<string, CountryJobSources> = {
  CH: {
    sources: [
      { name: "Job-Room (SECO)", url: "https://www.job-room.ch", note: "A svájci állami munkaközvetítés hivatalos állásportálja.", official: true },
      { name: "jobs.ch", url: "https://www.jobs.ch", note: "Svájc legnagyobb állásportálja (német nyelvterület)." },
      { name: "jobup.ch", url: "https://www.jobup.ch", note: "A francia nyelvű Svájc vezető állásportálja (Romandie)." },
      { name: "JobScout24", url: "https://www.jobscout24.ch", note: "Nagy svájci állásportál, széles kínálattal." },
      { name: "Indeed Svájc", url: "https://ch.indeed.com", note: "Aggregátor — sok hirdetés egy helyen, kényelmes kereső." },
      { name: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs", note: "Nemzetközi szakmai állások, sok svájci munkáltatóval." },
      { name: "Gastrojob", url: "https://www.gastrojob.ch", note: "Vendéglátás és szálloda — sok magyarnak releváns belépő." },
      { name: "EURES Svájc", url: "https://eures.europa.eu/index_hu", note: "Svájc is részt vesz az EURES-hálózatban (EU/EFTA mobilitás).", official: true },
    ],
    tip: "A munkavállalási feltételekhez (B/L engedély) nézd az Iránytű és az Ügyintézés modulokat. Sok magyar-barát állás a Közösség oldalon és helyi magyar csoportokban is felbukkan.",
  },
  AT: {
    sources: [
      { name: "AMS (Arbeitsmarktservice)", url: "https://www.ams.at", note: "Az osztrák állami munkaügyi szolgálat — a legtöbb bejelentett állás itt van.", official: true },
      { name: "karriere.at", url: "https://www.karriere.at", note: "Ausztria egyik legnagyobb piaci állásportálja." },
      { name: "willhaben Jobs", url: "https://www.willhaben.at/jobs", note: "Széles kínálat, sok regionális és alkalmi állás." },
      { name: "StepStone", url: "https://www.stepstone.at", note: "Szakmai és irodai állások, sok osztrák munkáltatóval." },
      { name: "hokify", url: "https://hokify.at", note: "Mobil-első portál, sok kékgalléros és szakmunkás állás." },
      { name: "Indeed Ausztria", url: "https://at.indeed.com", note: "Aggregátor — sok hirdetés egy helyen." },
      { name: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs", note: "Nemzetközi szakmai állások, osztrák munkáltatókkal." },
      EURES,
    ],
    tip: "Az AMS-nél érdemes regisztrálni (eAMS-Konto) — sok ajánlat csak ott látszik. A bejelentett munkáról és az adóról a Tudásbázis és a Bérkalkulátor segít.",
  },
  DE: {
    sources: [
      { name: "Bundesagentur für Arbeit", url: "https://www.arbeitsagentur.de/jobsuche", note: "A német állami munkaügyi szolgálat hivatalos állásbörzéje.", official: true },
      { name: "StepStone", url: "https://www.stepstone.de", note: "Németország egyik vezető piaci állásportálja." },
      { name: "Indeed.de", url: "https://de.indeed.com", note: "Nagy aggregátor — sok hirdetés egy helyen." },
      { name: "Xing Jobs", url: "https://www.xing.com/jobs", note: "DACH-régió szakmai hálózata és állásbörzéje." },
      { name: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs", note: "Nemzetközi szakmai állások, német munkáltatókkal." },
      { name: "Monster.de", url: "https://www.monster.de", note: "Klasszikus, széles állásportál." },
      { name: "meinestadt.de Jobs", url: "https://www.meinestadt.de/deutschland/jobs", note: "Regionális keresés — város szerinti állások." },
      EURES,
    ],
    tip: "EU-állampolgárként szabadon vállalhatsz munkát. Az anyakönyvi/bejelentkezési (Anmeldung) és adó-tudnivalókat a hivatalos forrásoknál ellenőrizd.",
  },
  NL: {
    sources: [
      { name: "werk.nl (UWV)", url: "https://www.werk.nl", note: "A holland állami munkaügyi szolgálat (UWV) hivatalos portálja.", official: true },
      { name: "Nationale Vacaturebank", url: "https://www.nationalevacaturebank.nl", note: "Nagy holland piaci állásportál." },
      { name: "Indeed.nl", url: "https://nl.indeed.com", note: "Aggregátor — sok hirdetés, kényelmes kereső." },
      { name: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs", note: "Nemzetközi szakmai állások, holland munkáltatókkal." },
      { name: "Undutchables", url: "https://www.undutchables.nl", note: "Angol nyelvű / nemzetközi állások — ha még nem beszélsz hollandul." },
      { name: "Monsterboard", url: "https://www.monsterboard.nl", note: "Klasszikus, széles holland állásportál." },
      { name: "Jobbird", url: "https://www.jobbird.com/nl", note: "Nagy aggregátor, sok hirdetéssel." },
      EURES,
    ],
    tip: "Hollandiában munkához BSN-szám (társadalombiztosítási azonosító) kell — intézd a beköltözéskor. Sok nemzetközi állás angolul is elérhető.",
  },
};

/** Egy ország forrás-katalógusa (vagy `null`, ha nincs felvéve). */
export function getJobSources(country: string | null | undefined): CountryJobSources | null {
  if (!country) return null;
  return JOB_SOURCES[country] ?? null;
}
