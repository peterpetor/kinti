import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { regionPoint } from "../../src/lib/region-point";
import { getRegions } from "../../src/lib/regions";

/**
 * Régió-nézet: térkép-középpont és a „mit néztem utoljára" megjegyzése.
 *
 * Mindkettőt FELHASZNÁLÓI BEJELENTÉS hozta elő:
 *  1. Galiciát választva a térkép MADRIDRA zoomolt (az ES/GB/NL ág hiányzott a
 *     középpont-számításból, pedig a pont-modulok léteztek).
 *  2. Tartomány → „Egész ország" → kilépés → visszatéréskor MEGINT a tartomány
 *     jött fel (az „all" sehova nem íródott).
 */

const ORSZAGOK = ["CH", "AT", "DE", "NL", "GB", "ES"] as const;

describe("térkép-középpont — mind a hat ország", () => {
  it.each(ORSZAGOK)("⚠️ %s: MINDEN régiójához van saját pont", (c) => {
    const regiok = getRegions(c);
    expect(regiok.length, `${c}: nincs régió-lista`).toBeGreaterThan(0);
    const hianyzo = regiok.filter((r) => regionPoint(c, r.code) == null).map((r) => r.code);
    expect(hianyzo, `${c}: nincs térkép-pont ezekhez: ${hianyzo.join(", ")}`).toEqual([]);
  });

  it.each(ORSZAGOK)("%s: a régió-pontok KÜLÖNBÖZNEK egymástól (tényleg mozdul a térkép)", (c) => {
    // Ha több régió ugyanarra a pontra mutatna, a „régióra zoomolás” közülük
    // egyiknél sem vinne a helyes helyre — ez ugyanaz a hiba, más álruhában.
    const regiok = getRegions(c);
    const kulcsok = regiok.map((r) => {
      const p = regionPoint(c, r.code)!;
      return `${p.lat.toFixed(3)},${p.lng.toFixed(3)}`;
    });
    const dup = kulcsok.filter((k, i) => kulcsok.indexOf(k) !== i);
    expect(dup, `${c}: több régió ugyanazon a ponton (${dup.join(" | ")})`).toEqual([]);
    expect(new Set(kulcsok).size).toBe(regiok.length);
  });

  it("⚠️ a régió-pont az adott ORSZÁG határain belül van", () => {
    // Durva ország-dobozok — a lényeg, hogy egy spanyol régió ne Svájcban legyen.
    const DOBOZ: Record<string, [number, number, number, number]> = {
      CH: [45.8, 47.9, 5.9, 10.6], AT: [46.3, 49.1, 9.4, 17.2], DE: [47.2, 55.1, 5.8, 15.1],
      NL: [50.7, 53.6, 3.3, 7.3], GB: [49.8, 56.0, -6.5, 2.0], ES: [27.6, 43.9, -18.2, 4.4], // ⚠️ a Kanári-szigetekkel együtt (ES/CN ~28,1°É, −15,4°K)
    };
    for (const c of ORSZAGOK) {
      const [latMin, latMax, lngMin, lngMax] = DOBOZ[c];
      for (const r of getRegions(c)) {
        const p = regionPoint(c, r.code)!;
        expect(p.lat >= latMin && p.lat <= latMax, `${c}/${r.code}: lat kilóg (${p.lat})`).toBe(true);
        expect(p.lng >= lngMin && p.lng <= lngMax, `${c}/${r.code}: lng kilóg (${p.lng})`).toBe(true);
      }
    }
  });

  it('„all” és ismeretlen kód → null (a hívó az ország közepére esik, NEM Svájcra)', () => {
    for (const c of ORSZAGOK) {
      expect(regionPoint(c, "all")).toBeNull();
      expect(regionPoint(c, null)).toBeNull();
      expect(regionPoint(c, "NINCS-ILYEN")).toBeNull();
    }
    expect(regionPoint("HU", "PE")).toBeNull();
  });

  it("⚠️ a HOLLAND provincia-kódok NEM svájci pontot adnak (kód-ütközés)", () => {
    // ZH/FR/GR/GE mindkét ország kódkészletében szerepel.
    for (const kod of ["ZH", "FR", "GR", "GE"]) {
      const ch = regionPoint("CH", kod);
      const nl = regionPoint("NL", kod);
      if (ch && nl) {
        expect(Math.abs(ch.lat - nl.lat) > 1 || Math.abs(ch.lng - nl.lng) > 1, `${kod}: NL a svájci pontot kapta`).toBe(true);
      }
    }
  });
});

/* ─── „mit néztem utoljára" tároló ────────────────────────────────────────── */

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
  return import("../../src/lib/canton-pref");
}

describe("utoljára nézett régió", () => {
  it('⚠️ az „Egész ország” (all) IS megjegyződik', async () => {
    const { setCantonView, readCantonView } = await lib();
    setCantonView("all");
    expect(readCantonView(), "az „all” elveszett — visszatéréskor a régi tartomány jönne fel").toBe("all");
  });

  it("valódi régiót is megjegyez", async () => {
    const { setCantonView, readCantonView } = await lib();
    setCantonView("ZH");
    expect(readCantonView()).toBe("ZH");
  });

  it("⚠️ a NÉZET és a LAKHELY külön él", async () => {
    const { setCantonView, readCantonView, setPreferredCanton, readPreferredCanton } = await lib();
    setPreferredCanton("ZH");       // „itt lakom”
    setCantonView("all");            // „most az egész országot nézem”
    expect(readCantonView()).toBe("all");
    expect(readPreferredCanton(), "az „Egész ország” kiütötte a lakhely-preferenciát").toBe("ZH");
  });

  it("sérült tárolót elnyel, nem dob", async () => {
    const { readCantonView } = await lib();
    for (const szemet of ["", "nem json", "[]", '"szöveg"', "null", '{"CH":123}', '{"CH":""}']) {
      tarolo.set("kinti.cantonViewByCountry", szemet);
      expect(() => readCantonView(), `elszállt ezen: ${szemet}`).not.toThrow();
    }
  });

  it("érvénytelenné vált kódot nem ad vissza", async () => {
    const { readCantonView } = await lib();
    tarolo.set("kinti.cantonViewByCountry", JSON.stringify({ CH: "NINCS-ILYEN" }));
    expect(readCantonView()).toBeNull();
  });
});

/** Szerkezeti őr: a nézet-mentés és a közös pont-feloldó ne essen ki. */
describe("szerkezeti őr", () => {
  const view = readFileSync(resolve(process.cwd(), "src/components/views/explore-view.tsx"), "utf8");

  it("a régió-választás menti a NÉZETET is", () => {
    expect(view, "a setCantonView hívás eltűnt — visszatér a jelentett hiba").toMatch(/setCantonView\(c\.code\)/);
  });

  it("a kezdő szűrő ELŐBB a nézetet nézi, csak utána a lakhelyet", () => {
    expect(view).toMatch(/readCantonView\(\)/);
    const nezetIdx = view.indexOf("readCantonView()");
    const prefIdx = view.indexOf("readPreferredCanton()", nezetIdx);
    expect(nezetIdx, "nincs meg a nézet-olvasás").toBeGreaterThan(0);
    expect(prefIdx, "a lakhely-olvasás a nézet ELÉ került — felülírná").toBeGreaterThan(nezetIdx);
  });

  it("⚠️ a térkép-közép a KÖZÖS feloldót használja, nem saját elágazást", () => {
    expect(view).toMatch(/regionPoint\(country, canton\)/);
    expect(view, "visszakerült a saját ország-elágazás — az ES/GB/NL megint kimaradhat").not.toMatch(
      /country === "DE"\s*\)\s*\{\s*const p = dePoint/,
    );
  });
});
