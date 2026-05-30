/**
 * JSON-LD biztonsagos szerializalas a <script type="application/ld+json"> tagbe.
 *
 * A JSON.stringify NEM escape-eli a `<`-ot. Egy user-input mezo tartalmazhat
 * </script><script>... reszletet, ami kitorne a script-tagbol es XSS-t okozna.
 *
 * Cserelt karakterek:
 *   <  >  &  '
 *   U+2028 LINE SEPARATOR
 *   U+2029 PARAGRAPH SEPARATOR
 *
 * Forras: OWASP Cheat Sheet - Output Encoding for JavaScript Contexts.
 */
const LS_REGEX = new RegExp(String.fromCharCode(0x2028), "g");
const PS_REGEX = new RegExp(String.fromCharCode(0x2029), "g");

export function safeJsonLdStringify(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\u003c")
    .replace(/>/g, "\u003e")
    .replace(/&/g, "\u0026")
    .replace(/'/g, "\u0027")
    .replace(LS_REGEX, "\u2028")
    .replace(PS_REGEX, "\u2029");
}
