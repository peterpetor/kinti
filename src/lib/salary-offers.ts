/**
 * "Ajánlataim" — interjún kapott svájci bér-ajánlatok lokális mentése +
 * összehasonlítás. Csak böngésző-localStorage-ban él (PII-mentes, nincs
 * szerverre küldés).
 *
 * Tipikus flow:
 *   1) user beír egy ajánlatot a Bérkalkulátorba
 *   2) "Ajánlat mentése" → SalaryOffer rekord a listába
 *   3) /berkalkulator/ajanlataim oldalon összehasonlítja a többi ajánlattal
 *
 * Verziózott, hogy a JSON-séma későbbi módosítása (új mező) ne ütközzön
 * a meglévő rekordokkal.
 */

const STORAGE_KEY = "kinti_salary_offers_v1";

export interface SalaryOfferInput {
  gross: number;
  period: "month" | "year";
  canton: string;
  age: "<25" | "25-34" | "35-44" | "45-54" | "55-65";
  civil: "A" | "B" | "C";
  kids: number;
  churchTax: boolean;
  months: number;
}

export interface SalaryOfferComputed {
  grossMonthly: number;
  grossYearly: number;
  netMonthly: number;
  netYearly: number;
  totalDeductions: number;
  qstAmount: number;
  socialDeductions: number;
}

export interface SalaryOffer {
  /** Stabil id (Date.now()-tól származó). */
  id: string;
  /** Felhasználói címke — "ABB Zürich", "Migros Bern", stb. */
  label: string;
  /** ISO timestamp. */
  createdAt: string;
  input: SalaryOfferInput;
  computed: SalaryOfferComputed;
}

function safeRead(): SalaryOffer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SalaryOffer[]) : [];
  } catch {
    return [];
  }
}

function safeWrite(offers: SalaryOffer[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
  } catch {
    // Quota miatt sose törje meg az appot — csendben hagyjuk.
  }
}

export function listSalaryOffers(): SalaryOffer[] {
  return safeRead().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function saveSalaryOffer(
  label: string,
  input: SalaryOfferInput,
  computed: SalaryOfferComputed,
): SalaryOffer {
  const offer: SalaryOffer = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: label.trim().slice(0, 60) || "Névtelen ajánlat",
    createdAt: new Date().toISOString(),
    input,
    computed,
  };
  const all = safeRead();
  all.push(offer);
  safeWrite(all);
  return offer;
}

export function deleteSalaryOffer(id: string): void {
  const filtered = safeRead().filter((o) => o.id !== id);
  safeWrite(filtered);
}

export function clearSalaryOffers(): void {
  safeWrite([]);
}
