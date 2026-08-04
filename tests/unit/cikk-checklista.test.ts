import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GUIDE_CHECKLISTS, getChecklist, hasChecklist } from "../../src/lib/guide-checklists";

/**
 * Cikk-teendőlisták — tartalom és haladás-tároló.
 *
 * A lista ÜGYINTÉZÉSI teendőket sorol (határidőkkel), ezért a hibái valódi kárt
 * okoznak: egy nem létező slug némán eltünteti a listát, egy elcsúszott mentés
 * pedig késznek mutat olyan lépést, amit a felhasználó sosem intézett el.
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
  vi.stubGlobal("CustomEvent", class {});
});

async function lib() {
  vi.resetModules();
  return import("../../src/lib/checklist-progress");
}

describe("teendőlisták — tartalom", () => {
  it("⚠️ MINDEN checklista-slug létező cikkre mutat", () => {
    const guides = readFileSync(resolve(process.cwd(), "src/lib/guides.ts"), "utf8");
    const letezo = new Set([...guides.matchAll(/^ {4}slug: "([^"]+)"/gm)].map((m) => m[1]));
    expect(letezo.size, "nem sikerült cikk-slugokat kiolvasni").toBeGreaterThan(100);
    const rossz = Object.keys(GUIDE_CHECKLISTS).filter((s) => !letezo.has(s));
    expect(rossz, `ezek a listák NÉMÁN sosem jelennének meg: ${rossz.join(", ")}`).toEqual([]);
  });

  it("mind a 6 ország kapott teendőlistát", () => {
    const slugok = Object.keys(GUIDE_CHECKLISTS);
    // A CH cikkeknek nincs ország-előtagjuk, a többinek igen.
    const elotag = (s: string) => (/^(at|de|nl|gb|es)-/.test(s) ? s.slice(0, 2).toUpperCase() : "CH");
    const orszagok = new Set(slugok.map(elotag));
    expect([...orszagok].sort()).toEqual(["AT", "CH", "DE", "ES", "GB", "NL"]);
  });

  it("egyetlen lista sem üres, és nincs benne duplikált lépés", () => {
    for (const [slug, lepesek] of Object.entries(GUIDE_CHECKLISTS)) {
      expect(lepesek.length, `${slug}: üres lista`).toBeGreaterThan(0);
      const szovegek = lepesek.map((l) => l.text);
      const dup = szovegek.filter((s, i) => szovegek.indexOf(s) !== i);
      expect(dup, `${slug}: duplikált lépés — a szövegre kulcsolt mentés összeakadna: ${dup.join(", ")}`).toEqual([]);
    }
  });

  it("minden lépés kitöltött és nem abszurd hosszú", () => {
    for (const [slug, lepesek] of Object.entries(GUIDE_CHECKLISTS)) {
      for (const l of lepesek) {
        expect(l.text.trim().length, `${slug}: üres lépés`).toBeGreaterThan(8);
        expect(l.text.length, `${slug}: túl hosszú lépés (mobilon olvashatatlan): ${l.text}`).toBeLessThan(110);
      }
    }
  });

  it("nem létező cikkre üres listát ad, nem hibázik", () => {
    expect(hasChecklist("nincs-ilyen-cikk")).toBe(false);
    expect(getChecklist("nincs-ilyen-cikk")).toEqual([]);
  });
});

describe("teendőlista — haladás tárolása", () => {
  const L = [{ text: "Első" }, { text: "Második" }, { text: "Harmadik" }];

  it("pipál és visszavon (kapcsoló)", async () => {
    const { toggleStep, readDone } = await lib();
    expect(toggleStep("x", "Első")).toBe(true);
    expect(readDone("x")).toEqual(["Első"]);
    expect(toggleStep("x", "Első")).toBe(false);
    expect(readDone("x")).toEqual([]);
  });

  it("a haladás a MOSTANI listához mér", async () => {
    const { toggleStep, haladas } = await lib();
    toggleStep("x", "Első");
    toggleStep("x", "Harmadik");
    expect(haladas("x", L)).toEqual({ kesz: 2, ossz: 3, pct: 67 });
  });

  it("⚠️ az ÁTÍRT lépés nem duzzasztja fel a számlálót („5/4 kész”)", async () => {
    const { toggleStep, haladas } = await lib();
    toggleStep("x", "Egy régi, azóta átfogalmazott lépés");
    toggleStep("x", "Első");
    // A tárolóban 2 tétel van, de a mai listában csak az egyik szerepel.
    expect(haladas("x", L).kesz).toBe(1);
    expect(haladas("x", L).ossz).toBe(3);
  });

  it("⚠️ KÉT CIKK azonos szövegű lépése nem üti ki egymást", async () => {
    const { toggleStep, readDone } = await lib();
    toggleStep("cikk-a", "Nyisd meg a számlát");
    expect(readDone("cikk-b")).toEqual([]);
    toggleStep("cikk-b", "Nyisd meg a számlát");
    expect(readDone("cikk-a")).toEqual(["Nyisd meg a számlát"]);
    expect(readDone("cikk-b")).toEqual(["Nyisd meg a számlát"]);
  });

  it("cikk törlése csak a sajátját viszi", async () => {
    const { toggleStep, resetGuide, readDone } = await lib();
    toggleStep("a", "x");
    toggleStep("b", "y");
    resetGuide("a");
    expect(readDone("a")).toEqual([]);
    expect(readDone("b")).toEqual(["y"]);
  });

  it("⚠️ SÉRÜLT tárolót elnyel, nem dob", async () => {
    const { readDone, haladas } = await lib();
    for (const szemet of ["", "nem json", "[]", '"szöveg"', "null", '{"a":1}', '{"a":[1,2]}', '{"a":["ok",null]}']) {
      tarolo.set("kinti.checklist.v1", szemet);
      expect(() => readDone("a"), `elszállt ezen: ${szemet}`).not.toThrow();
      expect(Array.isArray(readDone("a"))).toBe(true);
      expect(() => haladas("a", L)).not.toThrow();
    }
  });

  it("üres listára 0%-ot ad, nem oszt nullával", async () => {
    const { haladas } = await lib();
    expect(haladas("a", []).pct).toBe(0);
  });
});

/**
 * ⚠️ A komponens hidratálás-biztos kell legyen: a pipák localStorage-ból
 * jönnek, a szerver ezt nem ismeri. Mount előtti renderelésük React #418/#419-et
 * okozna a cikkoldalon (ami force-static, tehát előre renderelt HTML-t küld).
 */
describe("teendőlista — hidratálás", () => {
  it("a komponens mount-kapuval véd", () => {
    const s = readFileSync(resolve(process.cwd(), "src/components/views/cikk-checklista.tsx"), "utf8");
    expect(s).toMatch(/setMounted\(true\)/);
    expect(s, "a haladás mount-kapu nélkül számolódik — hidratálási eltérés").toMatch(/mounted \?\s*haladas\(/);
  });
});
