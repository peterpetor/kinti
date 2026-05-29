/**
 * Főbb svájci határátkelők — magyaroknak releváns útvonalak (DE/AT/IT/FR).
 *
 * Statikus lista a térkép-megjelenítéshez és a közösségi jelentés-rendszerhez.
 */

export interface BorderCrossing {
  id: string;
  name: string;
  /** Másik oldal országa (ISO). */
  country: "DE" | "AT" | "IT" | "FR" | "LI";
  /** Kanton CH oldalon. */
  canton: string;
  lat: number;
  lng: number;
  /** "autópálya" / "főút" / "kisebb út". */
  type: "highway" | "main" | "minor";
  /** Tipikus relevancia magyar utazóknak. */
  popular: boolean;
}

export const BORDER_CROSSINGS: BorderCrossing[] = [
  // CH-DE — fontos a magyaroknak Bécs-Münchenen át jövőknek
  { id: "basel-weil", name: "Basel / Weil am Rhein", country: "DE", canton: "BS", lat: 47.601, lng: 7.620, type: "highway", popular: true },
  { id: "thayngen", name: "Thayngen (SH)", country: "DE", canton: "SH", lat: 47.747, lng: 8.701, type: "main", popular: true },
  { id: "bargen", name: "Bargen / Singen", country: "DE", canton: "SH", lat: 47.793, lng: 8.609, type: "highway", popular: true },
  { id: "kreuzlingen", name: "Kreuzlingen / Konstanz", country: "DE", canton: "TG", lat: 47.651, lng: 9.176, type: "main", popular: true },

  // CH-AT — fontos magyar útvonal Bécs felől
  { id: "stmargrethen", name: "St. Margrethen / Höchst", country: "AT", canton: "SG", lat: 47.451, lng: 9.624, type: "highway", popular: true },
  { id: "diepoldsau", name: "Diepoldsau / Hohenems", country: "AT", canton: "SG", lat: 47.392, lng: 9.674, type: "main", popular: true },
  { id: "buchs-sg", name: "Buchs SG / Schaanwald", country: "AT", canton: "SG", lat: 47.165, lng: 9.476, type: "main", popular: false },
  { id: "martina", name: "Martina (GR) / Nauders", country: "AT", canton: "GR", lat: 46.890, lng: 10.461, type: "minor", popular: false },

  // CH-LI (Liechtenstein)
  { id: "schaanwald", name: "Schaanwald (LI/AT)", country: "LI", canton: "SG", lat: 47.218, lng: 9.564, type: "main", popular: false },

  // CH-IT — délről jövő/menő
  { id: "chiasso", name: "Chiasso / Como", country: "IT", canton: "TI", lat: 45.835, lng: 9.034, type: "highway", popular: true },
  { id: "stabio", name: "Stabio (TI)", country: "IT", canton: "TI", lat: 45.847, lng: 8.917, type: "main", popular: false },
  { id: "gondo", name: "Gondo / Simplon", country: "IT", canton: "VS", lat: 46.196, lng: 8.139, type: "main", popular: false },

  // CH-FR — francia oldalra
  { id: "bardonnex", name: "Bardonnex / Saint-Julien", country: "FR", canton: "GE", lat: 46.137, lng: 6.106, type: "highway", popular: true },
  { id: "moillesulaz", name: "Moillesulaz (GE)", country: "FR", canton: "GE", lat: 46.193, lng: 6.197, type: "main", popular: false },
  { id: "basel-fr", name: "Basel-EuroAirport", country: "FR", canton: "BS", lat: 47.589, lng: 7.530, type: "highway", popular: false },
];

export const COUNTRY_FLAGS: Record<BorderCrossing["country"], string> = {
  DE: "🇩🇪",
  AT: "🇦🇹",
  IT: "🇮🇹",
  FR: "🇫🇷",
  LI: "🇱🇮",
};

export function getCrossingById(id: string): BorderCrossing | null {
  return BORDER_CROSSINGS.find((c) => c.id === id) ?? null;
}
