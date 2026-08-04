/**
 * Saját Gyűjtemény — a felhasználó elmentett cikkei, szakemberei, állásai és
 * szavai.
 *
 * ⚠️ KIZÁRÓLAG KLIENSOLDALI, localStorage-ban. Ez nem kényelmi döntés, hanem
 * az app adatvédelmi alapelve: a Kinti szerveren NINCS per-user azonosító
 * (ld. [[privacy-no-server-identity]]). Ha a gyűjtemény szerverre kerülne,
 * onnantól a szerver tudná, KI mit olvas — pont az, amit az app nem akar
 * tudni. Cserébe a lista eszközhöz kötött; a `/sajatjaim` oldal ezt ki is
 * mondja, és van rá export/e-mail mentés.
 *
 * ⚠️ A `/sajatjaim` oldal `force-static` — ez a modul EZÉRT nem hívhat
 * szervert: egy fetch ott edge-route-ot fogyasztana (ld. a ~205-ös
 * deploy-plafont a [[deploy-edge-route-ceiling]] memóriában).
 */

/** Amit menteni lehet. Új típusnál a `BOOKMARK_LABEL`-t is bővítsd. */
export type BookmarkKind = "guide" | "business" | "job" | "word";

export interface Bookmark {
  kind: BookmarkKind;
  /** Típuson belül egyedi (guide-slug, business-id, job-id, szó). */
  id: string;
  /** Amit a listában mutatunk. */
  title: string;
  /** Halvány másodsoros infó (város, cég, kategória) — opcionális. */
  subtitle?: string;
  /** Ahová a kártya visz. */
  href: string;
  /** Mentés ideje (ms) — a lista ezzel rendez, legújabb elöl. */
  savedAt: number;
}

export const BOOKMARK_LABEL: Record<BookmarkKind, { title: string; emoji: string }> = {
  guide: { title: "Útmutatók", emoji: "📚" },
  business: { title: "Szakemberek", emoji: "🧰" },
  job: { title: "Állások", emoji: "💼" },
  word: { title: "Szavak", emoji: "📖" },
};

const KEY = "kinti.bookmarks.v1";

/**
 * ⚠️ FELSŐ KORLÁT. A localStorage kvótája böngészőnként ~5 MB, és ha egy írás
 * túllépi, a `setItem` KIVÉTELT DOB — ami némán elnyelve azt jelentené, hogy a
 * mentés „megtörtént", de nem maradt meg. A legrégebbieket ezért levágjuk.
 */
const MAX = 300;

/** Típus + azonosító együtt azonosít — két típusban lehet ugyanaz az id. */
export function bookmarkKey(kind: BookmarkKind, id: string): string {
  return `${kind}:${id}`;
}

export function readBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // ⚠️ Védekező szűrés: a localStorage tartalmát a user is szerkesztheti, és
    // egy régebbi verzió más alakot írhatott. Hiányos sor ne törje a listát.
    return parsed.filter(
      (b): b is Bookmark =>
        !!b &&
        typeof b === "object" &&
        typeof (b as Bookmark).id === "string" &&
        typeof (b as Bookmark).title === "string" &&
        typeof (b as Bookmark).href === "string" &&
        (b as Bookmark).kind in BOOKMARK_LABEL,
    );
  } catch {
    return [];
  }
}

function write(list: Bookmark[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* private mode / betelt kvóta — a mentés ilyenkor nem marad meg */
  }
  // A többi nyitott fül és a /sajatjaim lista frissüljön azonnal.
  try {
    window.dispatchEvent(new CustomEvent("kinti:bookmarks"));
  } catch {
    /* SSR / régi böngésző */
  }
}

export function isBookmarked(kind: BookmarkKind, id: string): boolean {
  const k = bookmarkKey(kind, id);
  return readBookmarks().some((b) => bookmarkKey(b.kind, b.id) === k);
}

/** Ment vagy töröl. Visszaadja az ÚJ állapotot (true = mentve). */
export function toggleBookmark(item: Omit<Bookmark, "savedAt">): boolean {
  const k = bookmarkKey(item.kind, item.id);
  const list = readBookmarks();
  const meglevo = list.findIndex((b) => bookmarkKey(b.kind, b.id) === k);
  if (meglevo >= 0) {
    list.splice(meglevo, 1);
    write(list);
    return false;
  }
  write([{ ...item, savedAt: Date.now() }, ...list]);
  return true;
}

export function removeBookmark(kind: BookmarkKind, id: string): void {
  const k = bookmarkKey(kind, id);
  write(readBookmarks().filter((b) => bookmarkKey(b.kind, b.id) !== k));
}

/** Típusonként csoportosítva, mindegyiken belül legújabb elöl. */
export function groupBookmarks(list: Bookmark[]): { kind: BookmarkKind; items: Bookmark[] }[] {
  return (Object.keys(BOOKMARK_LABEL) as BookmarkKind[])
    .map((kind) => ({
      kind,
      items: list.filter((b) => b.kind === kind).sort((a, b) => b.savedAt - a.savedAt),
    }))
    .filter((g) => g.items.length > 0);
}
