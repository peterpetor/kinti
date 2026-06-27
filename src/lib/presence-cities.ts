/**
 * presence-cities.ts — a „Ki költözött melléd?" hőtérkép VÁROS-szintű listája.
 * Függőség-mentes (kliens + szerver közös): a beküldő legördülő, a szerver-validáció
 * és a város-buborék-térkép forrása. A `region` a lib/regions.ts ország-kódjaira
 * mutat (a CH-mappel kompatibilis aggregáláshoz). A `name` egyedi az országon belül,
 * egyben az azonosító (id).
 */

export interface PresenceCity {
  name: string;        // egyedi az országon belül; ez az id is
  region: string;      // kanton/Bundesland/provincia kód (lib/regions.ts)
  lat: number;
  lng: number;
}

export const PRESENCE_CITIES: Record<string, PresenceCity[]> = {
  CH: [
    { name: "Zürich", region: "ZH", lat: 47.3769, lng: 8.5417 },
    { name: "Winterthur", region: "ZH", lat: 47.5001, lng: 8.7501 },
    { name: "Genf (Genève)", region: "GE", lat: 46.2044, lng: 6.1432 },
    { name: "Basel", region: "BS", lat: 47.5596, lng: 7.5886 },
    { name: "Bern", region: "BE", lat: 46.9480, lng: 7.4474 },
    { name: "Lausanne", region: "VD", lat: 46.5197, lng: 6.6323 },
    { name: "Luzern", region: "LU", lat: 47.0502, lng: 8.3093 },
    { name: "St. Gallen", region: "SG", lat: 47.4245, lng: 9.3767 },
    { name: "Lugano", region: "TI", lat: 46.0037, lng: 8.9511 },
    { name: "Zug", region: "ZG", lat: 47.1662, lng: 8.5155 },
    { name: "Aarau", region: "AG", lat: 47.3909, lng: 8.0455 },
    { name: "Fribourg", region: "FR", lat: 46.8065, lng: 7.1619 },
    { name: "Neuchâtel", region: "NE", lat: 46.9899, lng: 6.9293 },
  ],
  AT: [
    { name: "Bécs (Wien)", region: "W", lat: 48.2082, lng: 16.3738 },
    { name: "Graz", region: "STM", lat: 47.0707, lng: 15.4395 },
    { name: "Linz", region: "OOE", lat: 48.3064, lng: 14.2861 },
    { name: "Salzburg", region: "SBG", lat: 47.8095, lng: 13.0550 },
    { name: "Innsbruck", region: "TIR", lat: 47.2692, lng: 11.4041 },
    { name: "Klagenfurt", region: "KTN", lat: 46.6247, lng: 14.3050 },
    { name: "Wels", region: "OOE", lat: 48.1575, lng: 14.0289 },
    { name: "Villach", region: "KTN", lat: 46.6111, lng: 13.8558 },
    { name: "St. Pölten", region: "NOE", lat: 48.2047, lng: 15.6256 },
    { name: "Dornbirn", region: "VBG", lat: 47.4125, lng: 9.7417 },
    { name: "Bregenz", region: "VBG", lat: 47.5031, lng: 9.7471 },
    { name: "Eisenstadt", region: "BGL", lat: 47.8457, lng: 16.5278 },
  ],
  DE: [
    { name: "Berlin", region: "BE", lat: 52.5200, lng: 13.4050 },
    { name: "München", region: "BY", lat: 48.1351, lng: 11.5820 },
    { name: "Hamburg", region: "HH", lat: 53.5511, lng: 9.9937 },
    { name: "Köln", region: "NW", lat: 50.9375, lng: 6.9603 },
    { name: "Frankfurt am Main", region: "HE", lat: 50.1109, lng: 8.6821 },
    { name: "Stuttgart", region: "BW", lat: 48.7758, lng: 9.1829 },
    { name: "Düsseldorf", region: "NW", lat: 51.2277, lng: 6.7735 },
    { name: "Nürnberg", region: "BY", lat: 49.4521, lng: 11.0767 },
    { name: "Hannover", region: "NI", lat: 52.3759, lng: 9.7320 },
    { name: "Bremen", region: "HB", lat: 53.0793, lng: 8.8017 },
    { name: "Leipzig", region: "SN", lat: 51.3397, lng: 12.3731 },
    { name: "Dresden", region: "SN", lat: 51.0504, lng: 13.7373 },
    { name: "Mannheim", region: "BW", lat: 49.4875, lng: 8.4660 },
    { name: "Karlsruhe", region: "BW", lat: 49.0069, lng: 8.4037 },
    { name: "Essen", region: "NW", lat: 51.4556, lng: 7.0116 },
    { name: "Dortmund", region: "NW", lat: 51.5136, lng: 7.4653 },
    { name: "Augsburg", region: "BY", lat: 48.3705, lng: 10.8978 },
    { name: "Wiesbaden", region: "HE", lat: 50.0782, lng: 8.2398 },
    { name: "Münster", region: "NW", lat: 51.9607, lng: 7.6261 },
    { name: "Bonn", region: "NW", lat: 50.7374, lng: 7.0982 },
  ],
  NL: [
    { name: "Amszterdam", region: "NH", lat: 52.3676, lng: 4.9041 },
    { name: "Rotterdam", region: "ZH", lat: 51.9244, lng: 4.4777 },
    { name: "Hága (Den Haag)", region: "ZH", lat: 52.0705, lng: 4.3007 },
    { name: "Utrecht", region: "UT", lat: 52.0907, lng: 5.1214 },
    { name: "Eindhoven", region: "NB", lat: 51.4416, lng: 5.4697 },
    { name: "Groningen", region: "GR", lat: 53.2194, lng: 6.5665 },
  ],
};

export function getPresenceCities(country: string): PresenceCity[] {
  return PRESENCE_CITIES[country] ?? [];
}

export function findPresenceCity(country: string, name: string): PresenceCity | null {
  return getPresenceCities(country).find((c) => c.name === name) ?? null;
}
