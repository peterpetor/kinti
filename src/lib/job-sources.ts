/**
 * job-sources.ts — ország-tudatos „Hivatalos álláskereső-források" katalógus.
 *
 * Jogtiszta tartalom: NEM tárolunk idegen hirdetést, csak a hivatalos/fő
 * álláskereső-portálokra MUTATÓ hivatkozásokat (deep-link, target=_blank).
 * Linkelni mindig szabad → nulla pertárgy, mégis pont az, amit egy kint élő
 * magyar először keres. A `regions.ts` mintájára: 1 fájl, 6 ország.
 *
 * Új ország bekötése: vedd fel a `JOB_SOURCES`-ba a kódot a hivatalos
 * közszolgálati portállal (official:true) + 2-3 nagy piaci oldallal + EURES-szel.
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
      { name: "EURES Svájc", url: "https://eures.europa.eu/index_hu", note: "Svájc is részt vesz az EURES-hálózatban (EU/EFTA mobilitás)." },
    ],
    tip: "A munkavállalási feltételekhez (B/L engedély) nézd az Iránytű és az Ügyintézés modulokat. Sok magyar-barát állás a Közösség oldalon és helyi magyar csoportokban is felbukkan.",
  },
  AT: {
    sources: [
      { name: "AMS (Arbeitsmarktservice)", url: "https://www.ams.at", note: "Az osztrák állami munkaügyi szolgálat — a legtöbb bejelentett állás itt van.", official: true },
      { name: "karriere.at", url: "https://www.karriere.at", note: "Ausztria egyik legnagyobb piaci állásportálja." },
      { name: "willhaben Jobs", url: "https://www.willhaben.at/jobs", note: "Széles kínálat, sok regionális és alkalmi állás." },
      EURES,
    ],
    tip: "Az AMS-nél érdemes regisztrálni (eAMS-Konto) — sok ajánlat csak ott látszik. A bejelentett munkáról és az adóról a Tudásbázis és a Bérkalkulátor segít.",
  },
  DE: {
    sources: [
      { name: "Bundesagentur für Arbeit", url: "https://www.arbeitsagentur.de/jobsuche", note: "A német állami munkaügyi szolgálat hivatalos állásbörzéje.", official: true },
      { name: "StepStone", url: "https://www.stepstone.de", note: "Németország egyik vezető piaci állásportálja." },
      { name: "Indeed.de", url: "https://de.indeed.com", note: "Nagy aggregátor — sok hirdetés egy helyen." },
      EURES,
    ],
    tip: "EU-állampolgárként szabadon vállalhatsz munkát. Az anyakönyvi/bejelentkezési (Anmeldung) és adó-tudnivalókat a hivatalos forrásoknál ellenőrizd.",
  },
  NL: {
    sources: [
      { name: "werk.nl (UWV)", url: "https://www.werk.nl", note: "A holland állami munkaügyi szolgálat (UWV) hivatalos portálja.", official: true },
      { name: "Nationale Vacaturebank", url: "https://www.nationalevacaturebank.nl", note: "Nagy holland piaci állásportál." },
      { name: "Indeed.nl", url: "https://nl.indeed.com", note: "Aggregátor — sok hirdetés, kényelmes kereső." },
      EURES,
    ],
    tip: "Hollandiában munkához BSN-szám (társadalombiztosítási azonosító) kell — intézd a beköltözéskor. Sok nemzetközi állás angolul is elérhető.",
  },
  DK: {
    sources: [
      { name: "Jobnet (jobnet.dk)", url: "https://job.jobnet.dk", note: "A dán állam hivatalos állásportálja.", official: true },
      { name: "Work in Denmark", url: "https://www.workindenmark.dk", note: "Hivatalos portál kifejezetten külföldi munkavállalóknak — angolul.", official: true },
      { name: "Jobindex", url: "https://www.jobindex.dk", note: "Dánia legnagyobb piaci állásportálja." },
      EURES,
    ],
    tip: "A Work in Denmark a legjobb belépő külföldinek (angol nyelvű, hatósági). Munkához CPR-szám és (sok helyen) NemKonto kell.",
  },
  SE: {
    sources: [
      { name: "Platsbanken (Arbetsförmedlingen)", url: "https://arbetsformedlingen.se/platsbanken", note: "A svéd állami munkaügyi szolgálat hivatalos állásbörzéje.", official: true },
      { name: "Blocket Jobb", url: "https://jobb.blocket.se", note: "Nagy svéd piaci állásportál." },
      { name: "Indeed.se", url: "https://se.indeed.com", note: "Aggregátor — sok hirdetés egy helyen." },
      EURES,
    ],
    tip: "Munkához és adóhoz svéd személyi szám (personnummer) kell — intézd a Skatteverketnél. Sok tech- és nemzetközi állás angolul is megy.",
  },
};

/** Egy ország forrás-katalógusa (vagy `null`, ha nincs felvéve). */
export function getJobSources(country: string | null | undefined): CountryJobSources | null {
  if (!country) return null;
  return JOB_SOURCES[country] ?? null;
}
