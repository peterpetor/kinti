/**
 * chunk-error.ts — a DEPLOY-KÖZBENI hiba felismerése és kezelése.
 *
 * ⚠️ MIÉRT KELL — ÉLESBEN MEGTÖRTÉNT (2026-07-31). Egy deploy után a JS-darabok
 * (chunkok) neve megváltozik. Aki közben NYITVA tartotta az oldalt, annak a
 * lapja még a RÉGI nevekre hivatkozik — és amikor egy lusta (lazy) darab
 * betöltésére kerülne sor, az 404-et ad, a React pedig a hiba-határra esik.
 *
 * ⚠️⚠️ ÉS ITT VOLT A VALÓDI HIBA: a hiba-határ gombja `reset()`-et hívott, ami
 * CSAK ÚJRARENDEREL — ugyanazzal a hiányzó fájllal. Vagyis a gomb, amin
 * „Újratöltés" állt, ennél a hibatípusnál SOSEM tudott segíteni; a felhasználó
 * addig kattintgatott volna, amíg magától rá nem jön az F5-re.
 *
 * A megoldás: chunk-hibánál VALÓDI oldal-újratöltés (`location.reload()`), mert
 * az friss HTML-t kér, benne az ÚJ darab-nevekkel.
 *
 * ⚠️ HUROK-VÉDELEM: ha az újratöltés után is ugyanez jön (tehát tényleg törött a
 * deploy), NEM töltünk újra megint — sessionStorage-jelzővel egyszer próbálunk.
 * Enélkül a felhasználó végtelen újratöltésben ragadna.
 */

const RELOAD_FLAG = "kinti_chunk_reload";

/** Deploy-közbeni darab-betöltési hiba? (böngészőnként más a szöveg) */
export function isChunkLoadError(error: unknown): boolean {
  const e = error as { name?: unknown; message?: unknown } | null | undefined;
  const text = `${typeof e?.name === "string" ? e.name : ""} ${typeof e?.message === "string" ? e.message : ""}`;
  return /ChunkLoadError|Loading chunk \d+ failed|dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    text,
  );
}

/**
 * Egyszeri, automatikus újratöltés chunk-hibánál.
 * @returns true, ha elindította az újratöltést (ilyenkor a hívó ne csináljon mást).
 */
export function tryReloadOnChunkError(error: unknown): boolean {
  if (typeof window === "undefined" || !isChunkLoadError(error)) return false;
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return false; // már próbáltuk
    sessionStorage.setItem(RELOAD_FLAG, "1");
  } catch {
    // Privát mód / tiltott tárhely: nem tudjuk megjegyezni, ezért NEM töltünk
    // újra automatikusan (hurok-kockázat) — marad a kézi gomb.
    return false;
  }
  window.location.reload();
  return true;
}

/** A kézi gomb chunk-hibánál: VALÓDI újratöltés, nem `reset()`. */
export function hardReload(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
    /* nem baj */
  }
  window.location.reload();
}
