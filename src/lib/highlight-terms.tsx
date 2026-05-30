import { Fragment, type ReactNode } from "react";
import { GermanTerm } from "@/components/german-term";

/**
 * Svájci hivatali német kifejezések, amik magyarázandóak a magyar felhasználónak.
 * A `parseWithTerms()` egy szabad szövegben felismeri ezeket (pontos szóhatárokkal,
 * case-insensitive matching) és <GermanTerm>-komponensbe csomagolja őket.
 *
 * A lista bővíthető — a sorrend SZÁMÍT (a hosszabb kifejezések előbb).
 */
const GERMAN_TERMS_BY_LENGTH = [
  // Hosszabb összetett szavak előbb (a legrövidebbet utoljára)
  "Aufenthaltsbewilligung",
  "Schlichtungsbehörde",
  "Vorsorgeauftrag",
  "Patientenverfügung",
  "Arbeitsbewilligung",
  "Niederlassungsbewilligung",
  "Krankenversicherung",
  "Grundversicherung",
  "Pensionskasse",
  "Mietkaution",
  "Mietvertrag",
  "Arbeitsvertrag",
  "Kündigungsfrist",
  "Quellensteuer",
  "Selbstbehalt",
  "Krankenkasse",
  "Nebenkosten",
  "Anmeldung",
  "Steuererklärung",
  "Lohnabrechnung",
  "Sozialhilfe",
  "Familienzulage",
  "Mutterschaftsurlaub",
  "Vaterschaftsurlaub",
  "13. Monatslohn",
  "Säule 3a",
  "Säule 3b",
  "Franchise",
  "Gemeinde",
  "AHV",
  "BVG",
  "ALV",
  "KTG",
  "NBU",
] as const;

// Stop-szavak amik túl gyakori vagy elemző-zaj
const BLOCKLIST = new Set(["A", "az", "is", "vagy", "csak"]);

/**
 * Felismeri a fenti listán szereplő német kifejezéseket egy szabad szövegben,
 * és visszaadja a React-node-okat (string-darabok + <GermanTerm>-komponensek).
 *
 * @param text  a feldolgozandó szabad szöveg
 * @param keyPrefix React-key prefix (egyedi a szülő-context-ben)
 */
export function parseWithTerms(text: string, keyPrefix = "t"): ReactNode[] {
  if (!text) return [text];

  // Egyetlen regex az összes kifejezésre, hosszabbak előbb (greedy match)
  const escaped = GERMAN_TERMS_BY_LENGTH.map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = new RegExp(`(${escaped.join("|")})`, "g");

  const parts = text.split(pattern);
  return parts.map((part, idx) => {
    if (!part) return null;
    const trimmed = part.trim();
    const isMatch =
      GERMAN_TERMS_BY_LENGTH.includes(trimmed as (typeof GERMAN_TERMS_BY_LENGTH)[number]) &&
      !BLOCKLIST.has(trimmed);
    if (isMatch) {
      return (
        <Fragment key={`${keyPrefix}-${idx}`}>
          <GermanTerm>{trimmed}</GermanTerm>
        </Fragment>
      );
    }
    return <Fragment key={`${keyPrefix}-${idx}`}>{part}</Fragment>;
  });
}
