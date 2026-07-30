/**
 * lesson-tts.ts — a nyelvlecke felolvasásának NYELV-DÖNTÉSE.
 *
 * User-bejelentés (2026-07-30): „az angolon amikor felolvassa a magyar szöveget
 * angolul, az nagyon rossz." Igaza volt: a felelet-választós kérdések opciói
 * HOL magyarul, HOL a célnyelven vannak (a „Mit jelent: 'I'm not sure'?" típusú
 * kérdésnél magyarul), a hangszóró viszont MINDET a célnyelvi hanggal olvasta.
 * Egy angol hang szájából a „Nem vagyok biztos benne" érthetetlen kása.
 *
 * FÜGGŐSÉG-MENTES tiszta lib (D1/cloudflare/React import TILOS) — vitest-ből
 * közvetlenül tesztelhető.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * MIÉRT NEM EGYSZERŰ NYELVFELISMERÉS
 * ─────────────────────────────────────────────────────────────────────────────
 * A 659 felelet-választós kérdés ~1976 opcióján végigmértem, mit lehet
 * megbízhatóan eldönteni:
 *
 *   • Szólista-alapú „magyarnak látszik" heurisztika MEGBUKOTT: az „Ablak",
 *     „Ajtó", „Parkplatz", „Bueb" típusú EGYSZAVAS opciókon nincs mit fogni.
 *   • A kérdések egy része VALÓBAN VEGYES: két célnyelvi opció mellett egy
 *     magyar meta-válasz áll („Mindkettő tökéletes", „Egyik sem"). Tehát
 *     kérdés-szintű döntés sem elég, opció-szintű kell.
 *   • Viszont VAN egy szerkezeti jel, ami MÉRÉSSEL igazolható: ha a kérdés
 *     szövege a „Mit jelent" fordulatot tartalmazza, akkor a JELENTÉST kérdezi,
 *     tehát az opciók magyarul vannak. 270 ilyen kérdés / 810 opció → NULLA
 *     ellenpélda (egyetlen opción sem volt célnyelvi jelző).
 *     ⚠️ A „Mit mondasz, ha…" fordulat az ELLENKEZŐ irány (célnyelvi opciók) —
 *     az első regexem ezt is beszippantotta, és 15 hamis találatot adott.
 *
 * Ezért a döntés HÁROM jelre épül, és bizonytalanság esetén a célnyelvnél marad
 * (vagyis a mai viselkedésen nem ront, csak a biztos esetekben javít).
 */

/** ő és ű — a szóba jövő nyelvek közül CSAK a magyarban van. */
const HU_UNIQUE = /[őűŐŰ]/;

/**
 * Célnyelvi vétó: ha ezek bármelyike szerepel, a szöveg NEM magyar.
 *
 * ⚠️ EBBŐL KI KELL HAGYNI minden szót, ami magyarban is létezik. Az első
 * változatomban bent volt az „is", és ezért a magyar „Ti is jöttök?" opciót
 * idegennek minősítette. Ugyanígy tilos: „a", „de", „van", „el", „no".
 */
const FOREIGN_MARKER =
  /\b(the|your|i'm|don't|what|how|and|ich|du|sie|der|die|das|nicht|ein|eine|und|ist|mir|mich|isch|ik|je|het|een|niet|que|por|para|con|muy|dias|tardes|hola|gracias|bitte|danke|dank)\b|[ßñ¿¡]/i;

/**
 * Magyar meta-válaszok: nem a célnyelv szavai, hanem a kérdésre adott magyar
 * értékelés. Gyakran állnak célnyelvi opciók MELLETT ugyanabban a kérdésben —
 * ezért kell opció-szintű döntés (42 ilyen opció van a hat kurzusban).
 */
const HU_META =
  /^(mindkett[őo]|mindh[áa]rom|egyik sem|mindegy|semmi|soha|mindig|igen|nem|de igen)\b/i;

/** A kérdés a JELENTÉST kérdezi → az opciók magyarul vannak. */
export function promptAsksForMeaning(prompt: string): boolean {
  // ⚠️ CSAK a „mit jelent". A „mit mondasz / mit mondanak" a másik irány.
  return /mit jelent/i.test(prompt);
}

/**
 * Magyarul van-e ez a felolvasandó szöveg?
 *
 * @param text   a felolvasandó opció/válasz
 * @param prompt a kérdés szövege (a szerkezeti jelhez) — üres is lehet
 */
export function isHungarianLessonText(text: string, prompt = ""): boolean {
  const t = text.trim();
  if (!t) return false;
  // A vétó MINDIG erősebb: célnyelvi jelző esetén nem magyar, bármit is
  // sugalljon a kérdés szövege.
  if (FOREIGN_MARKER.test(t)) return false;
  if (HU_META.test(t)) return true;
  if (HU_UNIQUE.test(t)) return true;
  return promptAsksForMeaning(prompt);
}

/**
 * Melyik TTS-nyelvvel olvassuk fel? Magyar szöveg → magyar hang, egyébként a
 * kurzus célnyelve.
 *
 * ⚠️ SZÁNDÉKOSAN NEM REJTJÜK EL a hangszóró-gombot a magyar opciókon: a gomb
 * megszokott vezérlő, és az elrejtése funkciót vesz el. Csak a HANGOT
 * cseréljük. Ha a készüléken nincs magyar hang, a hívó a célnyelvre esik vissza
 * — az a mai viselkedés, tehát rontani nem tud.
 */
export function lessonTtsLang(text: string, prompt: string, targetLang: string): string {
  return isHungarianLessonText(text, prompt) ? "hu-HU" : targetLang;
}
