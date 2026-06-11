/**
 * Álláshirdetés feketemunka-előszűrő. Determinista kulcsszó-alapú jelzés a
 * be NEM jelentett ("fekete") foglalkoztatás tipikus megfogalmazásaira
 * (magyar + svájci-német + angol). Nem helyettesíti a kézi moderációt és az
 * AI-moderátort — egy gyors, olcsó első védvonal a nyilvánvaló esetekre.
 */

/** Normalizálás: kisbetű + ékezet-mentesítés, hogy a "feketén" ≈ "feketen" is fogjon. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Feketemunkára utaló kifejezések (normalizált formában). */
const BLACK_WORK_PATTERNS = [
  "feketen", "fekete munka", "feketemunka", "feketebe",
  "bejelentes nelkul", "be nem jelentett", "papir nelkul",
  "zsebbe fizet", "kezbe fizet", "keszpenzben a kezbe",
  "ahv nelkul", "ahv-mentes", "tb nelkul",
  "schwarz arbeit", "schwarzarbeit", "schwarz bezahlt", "schwarz auszahl",
  "ohne anmeldung", "ohne papiere", "ohne ausweis", "ohne bewilligung",
  "bar auf die hand", "cash auf die hand",
  "cash in hand", "cash only", "no papers", "without registration", "under the table",
];

/**
 * Tartalmaz-e a szöveg feketemunkára utaló jelet?
 * @returns a megtalált kifejezés, vagy null.
 */
export function blackWorkSignal(text: string | null | undefined): string | null {
  if (!text) return null;
  const n = normalize(text);
  for (const p of BLACK_WORK_PATTERNS) {
    if (n.includes(p)) return p;
  }
  return null;
}

export function hasBlackWorkSignal(text: string | null | undefined): boolean {
  return blackWorkSignal(text) !== null;
}
