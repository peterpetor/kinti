/**
 * Local-first poszt-kezelés — a felhasználó saját rekord-tokenjeinek
 * tárolása a böngésző localStorage-jában.
 *
 * GDPR-mintae: a szerver SEMMILYEN azonosítót nem köt a felhasználóhoz
 * (email, név, IP-hash csak rate-limit-hez), a manage_token a poszthoz tartozik
 * és kizárólag a felhasználó böngészőjében él. Cserekulcs / sync nélkül a
 * tokenek elveszhetnek — ezt a UX-ben hangsúlyozzuk (export, QR-kód, "tedd el").
 */

const STORAGE_KEY = "kinti.myPosts";
const STORAGE_VERSION = 1;

export type PostType =
  | "event"     // esemény
  | "review"    // vélemény
  | "business"  // vállalkozás (szaknévsor)
  | "spontan";  // spontán mikro-esemény (24-48h)

export interface MyPostEntry {
  type: PostType;
  /** A publikus rekord id-je. */
  id: string;
  /** A manage URL token-je. */
  manageToken: string;
  /** Megjelenítéshez (pl. "Bp → Wien" vagy "Eladó kanapé"). */
  title: string;
  /** A létrehozás ISO timestampje (kliens időpontja). */
  createdAt: string;
  /** Manage URL path. */
  manageUrl: string;
}

export interface MyPostsBackup {
  version: number;
  exportedAt: string;
  items: MyPostEntry[];
}

/** Visszaadja a teljes lokálisan tárolt poszt-listát. Üres tömb ha SSR vagy nincs. */
export function loadMyPosts(): MyPostEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.items)) {
      return parsed.items.filter(isValidEntry);
    }
    // Régi formátum kompatibilitás: {id, manageToken}[]
    if (Array.isArray(parsed)) {
      return parsed
        .filter((it: unknown) => typeof it === "object" && it !== null)
        .filter(isValidEntry);
    }
    return [];
  } catch {
    return [];
  }
}

/** Eltárolja a poszt-listát. */
function saveMyPosts(items: MyPostEntry[]): void {
  if (typeof window === "undefined") return;
  // Csak az utolsó 100-at tartjuk (DoS-védelem helyiprobléma esetére).
  const trimmed = items.slice(-100);
  const wrapped = { version: STORAGE_VERSION, items: trimmed };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapped));
  } catch {
    /* quota / private mode → ignoráljuk */
  }
}

/** Hozzáad vagy frissít egy bejegyzést (azonos type+id felülíródik). */
export function addMyPost(entry: Omit<MyPostEntry, "createdAt"> & { createdAt?: string }): void {
  const list = loadMyPosts();
  const next = list.filter((it) => !(it.type === entry.type && it.id === entry.id));
  next.push({ ...entry, createdAt: entry.createdAt ?? new Date().toISOString() });
  saveMyPosts(next);
}

/** Eltávolít egy bejegyzést. */
export function removeMyPost(type: PostType, id: string): void {
  const list = loadMyPosts();
  saveMyPosts(list.filter((it) => !(it.type === type && it.id === id)));
}

/** Megnézi, hogy a felhasználó az adott posztot tárolja-e (használjuk pl. "saját" jelvényhez). */
export function findMyPost(type: PostType, id: string): MyPostEntry | null {
  return loadMyPosts().find((it) => it.type === type && it.id === id) ?? null;
}

/** Exportál egy backup-objektumot JSON-letöltéshez. */
export function exportBackup(): MyPostsBackup {
  return {
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    items: loadMyPosts(),
  };
}

/** Visszaolvasott backup-ot betölt — merge-eli a meglévővel (azonos id-k felülíródnak). */
export function importBackup(raw: string): { ok: boolean; added: number; error?: string } {
  try {
    const parsed = JSON.parse(raw) as MyPostsBackup;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.items)) {
      return { ok: false, added: 0, error: "Érvénytelen formátum." };
    }
    const valid = parsed.items.filter(isValidEntry);
    const current = loadMyPosts();
    const map = new Map<string, MyPostEntry>();
    for (const it of current) map.set(`${it.type}::${it.id}`, it);
    let added = 0;
    for (const it of valid) {
      const k = `${it.type}::${it.id}`;
      if (!map.has(k)) added++;
      map.set(k, it);
    }
    saveMyPosts([...map.values()]);
    return { ok: true, added };
  } catch (e) {
    return { ok: false, added: 0, error: e instanceof Error ? e.message : "Parser hiba." };
  }
}

/** Letörli MIND, óvatos (a felhasználó kérésére). */
export function clearMyPosts(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

// --- helperek ---------------------------------------------------------------

function isValidEntry(x: unknown): x is MyPostEntry {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.type === "string" &&
    typeof o.id === "string" &&
    typeof o.manageToken === "string" &&
    typeof o.manageUrl === "string" &&
    typeof o.title === "string" &&
    typeof o.createdAt === "string"
  );
}
