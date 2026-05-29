/**
 * Form-prefs — a felhasználó utoljára használt mezőértékeinek tárolása a
 * böngésző localStorage-jában, hogy ne kelljen minden alkalommal újra
 * begépelnie (pl. kanton, megjelenő név, telefon).
 *
 * NEM ad át adatot a szervernek — kizárólag kliensoldali UX-segéd.
 */

const STORAGE_KEY = "kinti.formPrefs";

export interface FormPrefs {
  /** Utoljára használt kanton (pl. "ZH"). */
  cantonCode?: string;
  /** Utoljára használt megjelenő név / poster. */
  posterName?: string;
  /** Utoljára használt telefonszám. */
  phone?: string;
  /** Utoljára használt WhatsApp szám (külön, ha eltér). */
  whatsapp?: string;
  /** Utoljára használt email. */
  email?: string;
}

/** Lemented prefereciák betöltése; üres objektum ha SSR vagy nincs. */
export function loadFormPrefs(): FormPrefs {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as FormPrefs;
    }
    return {};
  } catch {
    return {};
  }
}

/** Frissít egy vagy több mezőt (merge); a megadottakat felülírja. */
export function saveFormPrefs(prefs: Partial<FormPrefs>): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadFormPrefs();
    const next = { ...current, ...prefs };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode / quota → ignoráljuk */
  }
}
