import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Saját Gyűjtemény — a localStorage-tároló logikája.
 *
 * ⚠️ A modul CSAK böngészőben fut, ezért a teszt minimális `window` +
 * `localStorage` cserét ad. A cél nem a DOM szimulálása, hanem hogy a
 * tároló-réteg három valós hibalehetőségét lefedjük:
 *   1. sérült/idegen localStorage-tartalom ne dobjon kivételt (a user is
 *      szerkesztheti, és egy korábbi verzió más alakot írhatott),
 *   2. a mentés/törlés kapcsolóként működjön (kétszeri kattintás = nincs mentve),
 *   3. két KÜLÖNBÖZŐ típus AZONOS azonosítója ne üsse ki egymást.
 */
const tarolo = new Map<string, string>();

beforeEach(() => {
  tarolo.clear();
  vi.stubGlobal("window", {
    dispatchEvent: () => true,
    localStorage: {
      getItem: (k: string) => tarolo.get(k) ?? null,
      setItem: (k: string, v: string) => void tarolo.set(k, v),
      removeItem: (k: string) => void tarolo.delete(k),
    },
  });
  vi.stubGlobal("localStorage", (globalThis as unknown as { window: { localStorage: Storage } }).window.localStorage);
  vi.stubGlobal("CustomEvent", class {});
});

async function lib() {
  vi.resetModules();
  return import("../../src/lib/bookmarks");
}

const CIKK = { kind: "guide" as const, id: "adozas", title: "Adózás", href: "/tudasbazis/adozas" };

describe("Saját Gyűjtemény — tároló", () => {
  it("ment és töröl (kapcsoló)", async () => {
    const { toggleBookmark, isBookmarked } = await lib();
    expect(toggleBookmark(CIKK)).toBe(true);
    expect(isBookmarked("guide", "adozas")).toBe(true);
    expect(toggleBookmark(CIKK)).toBe(false);
    expect(isBookmarked("guide", "adozas")).toBe(false);
  });

  it("⚠️ KÉT TÍPUS azonos azonosítója NEM üti ki egymást", async () => {
    const { toggleBookmark, isBookmarked, readBookmarks } = await lib();
    toggleBookmark({ kind: "guide", id: "x", title: "Cikk", href: "/a" });
    toggleBookmark({ kind: "business", id: "x", title: "Cég", href: "/b" });
    expect(readBookmarks()).toHaveLength(2);
    expect(isBookmarked("guide", "x")).toBe(true);
    expect(isBookmarked("business", "x")).toBe(true);
    // A cikk törlése a céget NEM viheti el:
    toggleBookmark({ kind: "guide", id: "x", title: "Cikk", href: "/a" });
    expect(isBookmarked("guide", "x")).toBe(false);
    expect(isBookmarked("business", "x")).toBe(true);
  });

  it("⚠️ SÉRÜLT tárolót elnyel, nem dob", async () => {
    const { readBookmarks } = await lib();
    for (const szemet of ["", "nem json", "{}", '"szöveg"', "null", '[{"id":1}]', '[{"kind":"nincs-ilyen","id":"a","title":"t","href":"/h"}]']) {
      tarolo.set("kinti.bookmarks.v1", szemet);
      expect(() => readBookmarks(), `elszállt ezen: ${szemet}`).not.toThrow();
      expect(Array.isArray(readBookmarks())).toBe(true);
    }
  });

  it("hiányos mezőjű sort kiszűr, a jót megtartja", async () => {
    const { readBookmarks } = await lib();
    tarolo.set(
      "kinti.bookmarks.v1",
      JSON.stringify([
        { kind: "guide", id: "jo", title: "Jó", href: "/jo", savedAt: 1 },
        { kind: "guide", id: "nincs-cim", href: "/x", savedAt: 2 },
        { kind: "guide", title: "nincs id", href: "/y", savedAt: 3 },
      ]),
    );
    const l = readBookmarks();
    expect(l).toHaveLength(1);
    expect(l[0].id).toBe("jo");
  });

  it("típusonként csoportosít, legújabb elöl", async () => {
    const { groupBookmarks } = await lib();
    const cs = groupBookmarks([
      { kind: "guide", id: "regi", title: "Régi", href: "/1", savedAt: 100 },
      { kind: "job", id: "a", title: "Állás", href: "/2", savedAt: 200 },
      { kind: "guide", id: "uj", title: "Új", href: "/3", savedAt: 300 },
    ]);
    expect(cs.map((c) => c.kind)).toEqual(["guide", "job"]);
    expect(cs[0].items.map((i) => i.id)).toEqual(["uj", "regi"]);
  });
});

/**
 * ⚠️ A meglévő 👍/👎 szavazás a `/api/track` esemény-formátumára épül, ami
 * LEGFELJEBB 40 karaktert enged (`action:` után). A komponens `gfb-up-<slug>`
 * néven küld — vagyis egy 34+ karakteres cikk-slug szavazata NÉMÁN ELVESZNE
 * (a végpont eldobja, hibaüzenet nélkül). Ma a leghosszabb 38 karakter, de egy
 * új, hosszabb slug ezt átlépheti.
 */
describe("útmutató-visszajelzés — esemény-hossz", () => {
  it("MINDEN cikk-slug belefér a track-esemény korlátjába", () => {
    const guides = readFileSync(resolve(process.cwd(), "src/lib/guides.ts"), "utf8");
    const slugs = [...new Set([...guides.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]))];
    expect(slugs.length, "nem sikerült slugokat kiolvasni").toBeGreaterThan(50);
    const track = readFileSync(resolve(process.cwd(), "src/app/api/track/route.ts"), "utf8");
    const limit = Number(track.match(/\{1,(\d+)\}/)?.[1] ?? 40);
    const tullogo = slugs.filter((s) => `gfb-up-${s}`.length > limit);
    expect(tullogo, `ezek szavazata némán elveszne (>${limit} karakter): ${tullogo.join(", ")}`).toEqual([]);
  });
});
