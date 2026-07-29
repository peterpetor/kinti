import { describe, it, expect } from "vitest";
import { getPhases, TASK_DEADLINES, taskVisible, type RoadmapTask } from "@/lib/relocation";
import { COUNTRIES } from "@/lib/countries";

/**
 * ⚠️ EZT A TESZTET EGY VALÓDI, USER ÁLTAL JELENTETT HIBA SZÜLTE (2026-07-29).
 *
 * A kiköltözési teendő-lista (`getPhases`) csak CH/AT/DE-t ismerte, a lánc végén
 * pedig a SVÁJCI lista állt. Az NL, a GB és az ES mind oda esett — a hollandiai
 * felhasználó „Svájci önéletrajz (CV) elkészítése", „Kreisbüro", „Krankenkasse",
 * „Quellensteuer" teendőket kapott, „célkantonod" szöveggel.
 *
 * A teszt ezért NEM egy országra kérdez rá, hanem VÉGIGMEGY a `COUNTRIES`
 * listán — így a 7. ország felvételekor is elbukik, mielőtt élesbe kerül.
 */

/**
 * ⚠️ CSAK olyan szavak, amik KIZÁRÓLAG a svájci listában helyesek.
 * A „Krankenkasse" SZÁNDÉKOSAN NINCS itt: Németországban és Ausztriában is ez a
 * helyes megnevezés — markerként hamis riasztást adna. A cél a svájci szöveg
 * ÁTSZIVÁRGÁSÁNAK kiszűrése, nem a német szavaké.
 */
const SWISS_MARKERS = [
  "Svájci",
  "svájci",
  "Kreisbüro",
  "Quellensteuer",
  "kanton",
  "Kanton",
];

describe("kiköltözési teendők — minden ország saját listát kap", () => {
  it("⚠️ EGYETLEN ország sem kap SVÁJCI teendőket (a CH kivételével)", () => {
    for (const c of COUNTRIES) {
      if (c.code === "CH") continue;
      const text = JSON.stringify(getPhases(c.code));
      for (const marker of SWISS_MARKERS) {
        expect(text.includes(marker), `${c.code}: svájci szöveg a teendőkben — „${marker}"`).toBe(
          false,
        );
      }
    }
  });

  it("⚠️ minden ország listája KÜLÖNBÖZIK a svájcitól", () => {
    const swiss = JSON.stringify(getPhases("CH"));
    for (const c of COUNTRIES) {
      if (c.code === "CH") continue;
      expect(JSON.stringify(getPhases(c.code)), `${c.code} a svájci listát kapta`).not.toBe(swiss);
    }
  });

  it("minden országnak van 4 szakasza, mindegyikben legalább egy teendővel", () => {
    for (const c of COUNTRIES) {
      const phases = getPhases(c.code);
      expect(phases.length, `${c.code}: szakaszok`).toBe(4);
      for (const ph of phases) {
        expect(ph.tasks.length, `${c.code}/${ph.id}`).toBeGreaterThan(0);
        expect(ph.title.trim(), `${c.code}/${ph.id} cím`).not.toBe("");
      }
    }
  });

  /**
   * ⚠️ A teendő-azonosító EGYSZERRE kulcs a határidő-táblában ÉS a
   * localStorage-ban tárolt „kipipálva" állapotban. Egy ütköző id két ország
   * közt azt jelentené, hogy a felhasználó egy másik ország teendőjét pipálja ki.
   */
  it("⚠️ nincs ütköző teendő-azonosító két ország között", () => {
    const seen = new Map<string, string>();
    for (const c of COUNTRIES) {
      for (const ph of getPhases(c.code)) {
        for (const t of ph.tasks) {
          const prev = seen.get(t.id);
          if (prev && prev !== c.code) {
            expect.fail(`ütköző teendő-id „${t.id}": ${prev} ÉS ${c.code}`);
          }
          seen.set(t.id, c.code);
        }
      }
    }
  });

  it("minden teendőhöz tartozik határidő (különben nem jelenik meg az idővonalon)", () => {
    for (const c of COUNTRIES) {
      for (const ph of getPhases(c.code)) {
        for (const t of ph.tasks) {
          expect(TASK_DEADLINES[t.id], `${c.code}: „${t.id}" hiányzik a határidő-táblából`).toBeDefined();
        }
      }
    }
  });

  it("a belső linkek abszolút útvonalak (nem törött relatív hivatkozás)", () => {
    for (const c of COUNTRIES) {
      for (const ph of getPhases(c.code)) {
        for (const t of ph.tasks) {
          if (t.linkHref) {
            expect(t.linkHref.startsWith("/"), `${c.code}: ${t.id} → ${t.linkHref}`).toBe(true);
            expect(t.linkLabel?.trim(), `${c.code}: ${t.id} linkLabel`).toBeTruthy();
          }
        }
      }
    }
  });

  /**
   * ⚠️ A CV-teendő országonként MÁS készítőre kell mutasson — ez ugyanaz a
   * szabály, amit a CV_FEATURE_COUNTRIES tábla kényszerít ki a menüben.
   * A holland felhasználónak német (vagy svájci) CV-t ajánlani érdemi hiba.
   */
  it("⚠️ a CV-teendő az ORSZÁGHOZ ILLŐ készítőre mutat", () => {
    const expected: Record<string, string> = {
      NL: "/holland-oneletrajz",
      GB: "/angol-oneletrajz",
      ES: "/spanyol-oneletrajz",
    };
    for (const [code, href] of Object.entries(expected)) {
      const tasks = getPhases(code).flatMap((p) => p.tasks);
      const cv = tasks.find((t) => t.id.endsWith("-cv"));
      expect(cv, `${code}: nincs CV-teendő`).toBeDefined();
      expect(cv!.linkHref, `${code}: rossz CV-készítő`).toBe(href);
    }
  });

  it("a feltételes teendők a profil szerint szűrődnek", () => {
    const family: RoadmapTask = { id: "x", title: "t", description: "d", tags: ["family"] };
    const noneu: RoadmapTask = { id: "y", title: "t", description: "d", tags: ["noneu"] };
    expect(taskVisible(family, { family: true, eu: true })).toBe(true);
    expect(taskVisible(family, { family: false, eu: true })).toBe(false);
    expect(taskVisible(noneu, { family: false, eu: true })).toBe(false);
    expect(taskVisible(noneu, { family: false, eu: false })).toBe(true);
  });
});
