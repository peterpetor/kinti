/**
 * Ország-illő PÉLDA-értékek (űrlap-helyőrzők, minta-adatok).
 *
 * ⚠️ MIÉRT LÉTEZIK: az űrlapok helyőrzői végig SVÁJCIAK voltak bedrótozva
 * (`+41 79 …`, `hr@ceged.ch`, `CHE-123.456.789`, „Kinti AG"), így egy angliai
 * felhasználó a regisztrációnál, a munkavállalói profilnál és a beküldő
 * űrlapoknál is svájci mintát látott. Ez volt a leggyakoribb, legláthatóbb
 * fallthrough-osztály — ezért NEM fájlonként javítjuk, hanem EGY helyen.
 *
 * ⚠️ ÚJ ORSZÁG FELVÉTELEKOR EZT A FÁJLT IS BŐVÍTSD. Ismeretlen kódnál a
 * `countryExamples()` a semleges, ország-független példákra esik vissza (nem
 * svájcira) — így egy kimaradt ország nem kap hamis, más országbeli mintát.
 */

export interface CountryExamples {
  /** Telefonszám-helyőrző (nemzetközi formátum). */
  phone: string;
  /** Példa kapcsolattartó e-mail (cég). */
  companyEmail: string;
  /** Példa céges weboldal. */
  companyWebsite: string;
  /** Példa cégnév (helyi társasági forma). */
  companyName: string;
  /** Cég-azonosító megnevezése + példa (pl. CHE-… / Companies House). */
  companyIdLabel: string;
  companyIdExample: string;
  /** Példa nagyváros. */
  city: string;
  /** A régió-szint megnevezése az űrlap-címkékhez (Kanton / Bundesland / …). */
  regionLabel: string;
  /** Pénznem-kód. */
  currency: string;
}

const CH: CountryExamples = {
  phone: "+41 79 123 45 67",
  companyEmail: "hr@ceged.ch",
  companyWebsite: "https://ceged.ch",
  companyName: "Pl. Kinti AG",
  companyIdLabel: "Cég-azonosító (UID)",
  companyIdExample: "CHE-123.456.789",
  city: "Zürich",
  regionLabel: "Kanton",
  currency: "CHF",
};

const EXAMPLES: Record<string, CountryExamples> = {
  CH,
  AT: {
    phone: "+43 660 1234567",
    companyEmail: "hr@ceged.at",
    companyWebsite: "https://ceged.at",
    companyName: "Pl. Kinti GmbH",
    companyIdLabel: "Cég-azonosító (Firmenbuchnummer)",
    companyIdExample: "FN 123456a",
    city: "Wien",
    regionLabel: "Bundesland",
    currency: "EUR",
  },
  DE: {
    phone: "+49 151 12345678",
    companyEmail: "hr@ceged.de",
    companyWebsite: "https://ceged.de",
    companyName: "Pl. Kinti GmbH",
    companyIdLabel: "Cég-azonosító (Handelsregisternummer)",
    companyIdExample: "HRB 12345",
    city: "München",
    regionLabel: "Bundesland",
    currency: "EUR",
  },
  NL: {
    phone: "+31 6 12345678",
    companyEmail: "hr@bedrijf.nl",
    companyWebsite: "https://bedrijf.nl",
    companyName: "Pl. Kinti B.V.",
    companyIdLabel: "Cég-azonosító (KvK-nummer)",
    companyIdExample: "12345678",
    city: "Amsterdam",
    regionLabel: "Provincia",
    currency: "EUR",
  },
  GB: {
    phone: "+44 7700 900123",
    companyEmail: "hr@company.co.uk",
    companyWebsite: "https://company.co.uk",
    companyName: "Pl. Kinti Ltd",
    companyIdLabel: "Cég-azonosító (Company number)",
    companyIdExample: "12345678",
    city: "London",
    regionLabel: "Régió",
    currency: "GBP",
  },
};

/** Semleges példák ismeretlen országra — SZÁNDÉKOSAN nem svájciak. */
const NEUTRAL: CountryExamples = {
  phone: "+36 30 123 4567",
  companyEmail: "hr@ceged.com",
  companyWebsite: "https://ceged.com",
  companyName: "Pl. Kinti Kft.",
  companyIdLabel: "Cég-azonosító",
  companyIdExample: "12345678",
  city: "—",
  regionLabel: "Régió",
  currency: "EUR",
};

export function countryExamples(country: string | null | undefined): CountryExamples {
  return (country && EXAMPLES[country]) || NEUTRAL;
}

/**
 * Pénznem-kód → megjelenítendő jel.
 *
 * ⚠️ MIÉRT KELL: a kódban több helyen BINÁRIS elágazás volt
 * (`currency === "CHF" ? "CHF" : "€"`), ami minden nem-svájci pénznemet
 * eurónak vett — így Anglián € jelent meg font helyett. Új pénznemnél EZT
 * bővítsd, ne írj újabb bináris elágazást.
 */
export function currencySymbol(currency: string | null | undefined): string {
  if (currency === "CHF") return "CHF";
  if (currency === "GBP") return "£";
  return "€";
}
