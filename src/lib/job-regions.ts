/**
 * job-regions.ts — tartomány/megye-lista a közvetítő-kereséshez (AT/DE/NL).
 *
 * A `name` az, amit az állás-API-knak átadunk helyszín-szűrőként (Adzuna `where`,
 * Jooble `location`) — ezért a HELYI nyelvű, hivatalos tartomány-nevet használjuk
 * (német/holland), amit az API-k felismernek.
 */
export interface JobRegion {
  /** Az API-knak átadott helyszín-string (= hivatalos név). */
  code: string;
  /** Megjelenített címke (magyar zárójeles segítséggel). */
  label: string;
}

export const JOB_REGIONS: Record<string, JobRegion[]> = {
  AT: [
    { code: "Wien", label: "Bécs (Wien)" },
    { code: "Niederösterreich", label: "Alsó-Ausztria (NÖ)" },
    { code: "Oberösterreich", label: "Felső-Ausztria (OÖ)" },
    { code: "Steiermark", label: "Stájerország (Steiermark)" },
    { code: "Tirol", label: "Tirol" },
    { code: "Kärnten", label: "Karintia (Kärnten)" },
    { code: "Salzburg", label: "Salzburg" },
    { code: "Vorarlberg", label: "Vorarlberg" },
    { code: "Burgenland", label: "Burgenland" },
  ],
  DE: [
    { code: "Baden-Württemberg", label: "Baden-Württemberg" },
    { code: "Bayern", label: "Bajorország (Bayern)" },
    { code: "Berlin", label: "Berlin" },
    { code: "Brandenburg", label: "Brandenburg" },
    { code: "Bremen", label: "Bréma (Bremen)" },
    { code: "Hamburg", label: "Hamburg" },
    { code: "Hessen", label: "Hessen" },
    { code: "Mecklenburg-Vorpommern", label: "Mecklenburg-Elő-Pomeránia" },
    { code: "Niedersachsen", label: "Alsó-Szászország (Niedersachsen)" },
    { code: "Nordrhein-Westfalen", label: "Észak-Rajna-Vesztfália (NRW)" },
    { code: "Rheinland-Pfalz", label: "Rajna-vidék-Pfalz" },
    { code: "Saarland", label: "Saar-vidék (Saarland)" },
    { code: "Sachsen", label: "Szászország (Sachsen)" },
    { code: "Sachsen-Anhalt", label: "Szász-Anhalt" },
    { code: "Schleswig-Holstein", label: "Schleswig-Holstein" },
    { code: "Thüringen", label: "Türingia (Thüringen)" },
  ],
  NL: [
    { code: "Drenthe", label: "Drenthe" },
    { code: "Flevoland", label: "Flevoland" },
    { code: "Friesland", label: "Frízföld (Friesland)" },
    { code: "Gelderland", label: "Gelderland" },
    { code: "Groningen", label: "Groningen" },
    { code: "Limburg", label: "Limburg" },
    { code: "Noord-Brabant", label: "Észak-Brabant (Noord-Brabant)" },
    { code: "Noord-Holland", label: "Észak-Holland (Noord-Holland)" },
    { code: "Overijssel", label: "Overijssel" },
    { code: "Utrecht", label: "Utrecht" },
    { code: "Zeeland", label: "Zeeland" },
    { code: "Zuid-Holland", label: "Dél-Holland (Zuid-Holland)" },
  ],
};

export function getJobRegions(country: string): JobRegion[] {
  return JOB_REGIONS[country.toUpperCase()] ?? [];
}
