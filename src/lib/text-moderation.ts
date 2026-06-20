import { runAiChat, extractJsonObject } from "./ai";
import { containsProfanity } from "./profanity";

/**
 * Szöveg-tartalom moderációja. KÖLTSÉG-OPTIMALIZÁLT: előbb egy olcsó, AI-mentes
 * heurisztika fut (`looksSuspicious`); ha NEM talál semmi gyanúsat (a beküldések
 * többsége tiszta), egyáltalán NEM hívunk Workers AI-t. Az AI (drága) csak a
 * gyanús esetekre fut, ahol nüansz kell. A rejtett/nem-egyértelmű rosszat az
 * admin-moderáció + report-rendszer fogja ki (a cég/állás/ajánlás úgyis admin-
 * jóváhagyásra vár).
 *
 * Az AI-moderáció így a hirdetés- és vállalkozó-form-okon szűri:
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

/**
 * Olcsó, AI-mentes elő-szűrő. Ha EZ nem talál semmi gyanúsat → nem kell AI
 * (a tiszta beküldések többsége itt megáll, és átmegy). Csak akkor eszkaláljuk
 * AI-ra, ha valami gyanús (trágárság / sok külső link / scam-/MLM-kulcsszó /
 * azonnali-kapcsolat csali) — ott kell az AI nüansza (block vs review vs allow).
 */
function looksSuspicious(text: string): boolean {
  if (containsProfanity(text).hit) return true;
  const lower = text.toLowerCase();
  // 1 weboldal legit; 2+ külső link már spam-gyanús.
  const linkHits = (text.match(/https?:\/\/|www\.|t\.me\/|wa\.me\/|\.(ru|xyz|top|click|info)\b/gi) || []).length;
  if (linkHits >= 2) return true;
  // Tipikus scam / MLM / befektetés-csali kulcsszavak.
  if (/\b(bitcoin|crypto|forex|garantált hozam|gyors pénz|easy money|hitel azonnal|western union|moneygram|mlm)\b/i.test(lower)) return true;
  // Azonnali-kapcsolat csali: chat-platform + telefonszám.
  if (/(whatsapp|telegram|viber|signal)[^\d]{0,12}\+?\d{6,}/i.test(lower)) return true;
  return false;
}

export async function moderateText(text: string): Promise<TextModerationResult> {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 5) {
    return { action: "allow", reason: "" };
  }
  if (trimmed.length > 4000) {
    return { action: "block", reason: "A szöveg túl hosszú (max 4000 karakter)." };
  }

  // KÖLTSÉG-OPTIMALIZÁLÁS: tiszta szöveg → nincs AI-hívás.
  if (!looksSuspicious(trimmed)) {
    return { action: "allow", reason: "" };
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
