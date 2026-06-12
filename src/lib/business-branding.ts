/**
 * Szaknévsor PRO custom branding — előre definiált accent színek.
 * Csak ezekből a hex-értékekből fogadunk el (nincs tetszőleges CSS-injekció).
 */
export interface AccentColor {
  id: string;
  /** Üres = alapértelmezett (nincs egyedi szín). */
  hex: string;
  label: string;
}

export const BUSINESS_ACCENT_COLORS: AccentColor[] = [
  { id: "default", hex: "", label: "Alap" },
  { id: "orange", hex: "#ff9600", label: "Narancs" },
  { id: "blue", hex: "#2563eb", label: "Kék" },
  { id: "green", hex: "#1d8a4e", label: "Zöld" },
  { id: "purple", hex: "#7c3aed", label: "Lila" },
  { id: "red", hex: "#e11d48", label: "Piros" },
  { id: "teal", hex: "#0d9488", label: "Türkiz" },
];

const VALID_HEXES = new Set(BUSINESS_ACCENT_COLORS.map((c) => c.hex).filter(Boolean));

/** Érvényes (előre definiált) accent hex? */
export function isValidAccentColor(value: unknown): value is string {
  return typeof value === "string" && VALID_HEXES.has(value);
}
