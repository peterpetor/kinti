import { runAiChat, extractJsonObject } from "./ai";

/**
 * Szöveg-tartalom AI-moderációja a Workers AI Llama modell-jével. Beküldés
 * előtt fut le a hirdetés- és vállalkozó-form-okon, hogy szűrjük:
 *   • idegen természetes személy PII-jét (GDPR-kockázat)
 *   • toxic / rágalmazó tartalmat
 *   • engedélyköteles tevékenységek jogosulatlan ajánlatát
 *   • spamot, scammet, MLM-et
 *
 * NEM helyettesíti az emberi moderációt, csak elő-szűr. A modell visszaadja
 * hogy biztonságos-e + ha nem, mi az ok (rövid magyar magyarázat).
 *
 * A használója kötelességed kezelni a `safe === null` esetet (AI nem
 * elérhető / hibázott) — fail-open: NE blokkold a feladást ha az AI nem
 * tudott válaszolni.
 */

export interface TextModerationResult {
  /** true: biztonságos; false: nem biztonságos; null: nem tudtuk eldönteni */
  safe: boolean | null;
  /** Ha unsafe → rövid magyarázat magyarul; egyébként üres string. */
  reason: string;
}

const SYSTEM = `Te a kinti.app tartalom-moderátor AI-ja vagy.
A felhasználó egy hirdetést vagy vállalkozói leírást küld be magyar nyelven.
A feladatod eldönteni: biztonságos-e közzétenni?

NEM BIZTONSÁGOS (unsafe), ha tartalmaz BÁRMELYIKET:
- IDEGEN személy adatát (más telefonszámát, lakcímét, email-jét) hozzájárulás nélkül;
- rágalmazó, gyűlöletkeltő, diszkriminatív, fenyegető szöveget;
- pornográf, szexuális szolgáltatást, kísérőszolgáltatást;
- gyógyászati / gyógyszerészeti termék / dohány / lőfegyver / drog hirdetést;
- pénzügyi piramist (MLM, készpénzkölcsön, befektetési csalás);
- jogosulatlan szakmai (orvos / ügyvéd / pszichológus) tanácsadási ajánlatot
  hatósági engedélyszám említése nélkül;
- nyilvánvaló spam / scam vagy ismétlődő reklámmondatokat;
- politikai propagandát.

KIZÁRÓLAG egy JSON objektummal válaszolj (semmi más, semmi magyarázat előtte/utána):
{
  "safe": true,
  "reason": ""
}
VAGY:
{
  "safe": false,
  "reason": "<rövid magyar indok max 80 karakter, mit kell javítani>"
}`;

export async function moderateText(text: string): Promise<TextModerationResult> {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 5) {
    return { safe: true, reason: "" };
  }
  if (trimmed.length > 4000) {
    return { safe: false, reason: "A szöveg túl hosszú (max 4000 karakter)." };
  }

  const ai = await runAiChat({
    system: SYSTEM,
    user: `Vizsgálandó szöveg: """${trimmed}"""`,
    maxTokens: 120,
    temperature: 0.1,
  });

  if (!ai.ok) {
    // Fail-open: ha az AI nem elérhető, ne blokkoljuk a feladást
    return { safe: null, reason: "" };
  }

  const parsed = extractJsonObject<{ safe?: unknown; reason?: unknown }>(ai.text);
  if (!parsed || typeof parsed.safe !== "boolean") {
    return { safe: null, reason: "" };
  }

  return {
    safe: parsed.safe,
    reason:
      typeof parsed.reason === "string" ? parsed.reason.slice(0, 160) : "",
  };
}
