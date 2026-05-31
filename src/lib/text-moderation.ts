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
  /**
   * allow: biztonságos, mehet
   * block: egyértelműen sértő/veszélyes, azonnal 400 Bad Request
   * review: határeset / nem egyértelmű, a poszt létrejön, de admin jóváhagyásig rejtett marad (quarantine)
   * null: AI nem tudott dönteni / nem elérhető (fail-open -> allow)
   */
  action: "allow" | "block" | "review" | null;
  /** Ha action !== 'allow' → rövid magyarázat magyarul; egyébként üres string. */
  reason: string;
}

const SYSTEM = `Te a kinti.app tartalom-moderátor AI-ja vagy.
A felhasználó egy hirdetést vagy vállalkozói leírást küld be magyar nyelven.
A feladatod eldönteni: közzétehető-e?

Három döntést hozhatsz ("action"):
1) "allow": Biztonságos.
2) "block": Egyértelműen BIZTONSÁGTALAN. Tartalmaz PII-t (más adatait), rágalmazó/gyűlöletkeltő/fenyegető/trágár, pornográf/szexuális, tiltott termék (drog/fegyver/gyógyszer), egyértelmű csalás/MLM.
3) "review": HATÁRESET. Nem vagy benne 100%-ig biztos, hogy sértő-e, lehet hogy csak kontextusból fakadó szleng, vagy gyanús, de nem egyértelmű spam. Ilyenkor a rendszer nem blokkolja a felhasználót, hanem "shadowban" karanténba teszi admin jóváhagyásig.

KIZÁRÓLAG egy JSON objektummal válaszolj (semmi más, semmi magyarázat előtte/utána):
{
  "action": "allow",
  "reason": ""
}
VAGY:
{
  "action": "block" | "review",
  "reason": "<rövid magyar indok max 80 karakter>"
}`;

export async function moderateText(text: string): Promise<TextModerationResult> {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 5) {
    return { action: "allow", reason: "" };
  }
  if (trimmed.length > 4000) {
    return { action: "block", reason: "A szöveg túl hosszú (max 4000 karakter)." };
  }

  const ai = await runAiChat({
    system: SYSTEM,
    user: `Vizsgálandó szöveg: """${trimmed}"""`,
    maxTokens: 120,
    temperature: 0.1,
  });

  if (!ai.ok) {
    // Fail-open: ha az AI nem elérhető, ne blokkoljuk a feladást
    return { action: null, reason: "" };
  }

  const parsed = extractJsonObject<{ action?: unknown; reason?: unknown }>(ai.text);
  if (!parsed || (parsed.action !== "allow" && parsed.action !== "block" && parsed.action !== "review")) {
    return { action: null, reason: "" };
  }

  return {
    action: parsed.action as "allow" | "block" | "review",
    reason:
      typeof parsed.reason === "string" ? parsed.reason.slice(0, 160) : "",
  };
}
