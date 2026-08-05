import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * A napi „lead-digest" cron időkerete.
 *
 * ⚠️ VALÓS HIBÁBÓL (2026-08-05): az ütemező „Failed (timeout)"-tal jelölte a
 * jobot. A route ugyanis idővel ÖT független feladat gyűjtőhelye lett, és a
 * névadó munka — a lead-digest e-mailek — MINDEGYIK UTÁN jön. Vagyis a
 * félbevágott futásból pont az e-mail-küldés maradt ki, miközben a mellékes
 * lépések elvitték az időt.
 *
 * A tesztek azt őrzik, ami a hibát visszahozná:
 *   1. a mellék-lépések időkeret NÉLKÜL futnának,
 *   2. a keret akkora, hogy nem marad idő a lead-digestre,
 *   3. a kereső-index (a leghosszabb, hátralék-függő lépés) újra BLOKKOLNA.
 */

const SRC = readFileSync(
  resolve(__dirname, "../../src/app/api/cron/send-lead-digests/route.ts"),
  "utf8",
);

describe("lead-digest cron — időkeret", () => {
  it("minden mellék-lépés időkeret mögött van", () => {
    for (const lepes of [
      "processRadarDigests",
      "processDeadlineReminders",
      "processReviewNudges",
      "cleanupOldAiRateLimitLogs",
      "purgeExpiredBlocklist",
    ]) {
      const i = SRC.indexOf(lepes);
      expect(i, `${lepes} nincs a route-ban`).toBeGreaterThan(-1);
      // A megelőző ~400 karakterben ott kell lennie az őrnek.
      expect(SRC.slice(Math.max(0, i - 400), i), `${lepes} időkeret nélkül fut`).toContain("vanIdo(");
    }
  });

  it("a keret hagy időt a lead-digestre (a 60 mp-es ütemező-korláton belül)", () => {
    const m = SRC.match(/MELLEK_IDOKERET_MS\s*=\s*([\d_]+)/);
    expect(m).not.toBeNull();
    const ms = Number(m![1].replace(/_/g, ""));
    // Nem lehet olyan tág, hogy a mellékes munka elvigye a teljes 60 mp-et.
    expect(ms).toBeLessThanOrEqual(35_000);
    expect(ms).toBeGreaterThan(5_000);
  });

  it("a kihagyott lépések a VÁLASZBAN látszanak (nem némán maradnak ki)", () => {
    expect(SRC).toContain("kihagyva");
    // Minden visszatérési ág vigye magával.
    const valaszok = SRC.match(/Response\.json\(\{ ok: true[^)]*\)/g) ?? [];
    expect(valaszok.length).toBeGreaterThan(0);
    for (const v of valaszok) expect(v).toContain("kihagyva");
  });
});

describe("lead-digest cron — a kereső-index nem blokkolhat", () => {
  it("waitUntil-lel, a válasz UTÁN fut", () => {
    const i = SRC.indexOf("indexPendingBusinessVectors");
    expect(i).toBeGreaterThan(-1);
    expect(SRC.slice(i, i + 400)).toContain("waitUntil");
  });

  it("⚠️ EGY kör, nem többszörös backfill", () => {
    // A 4×500-as változat pont ezt a timeoutot okozta volna; a nagy backfillnek
    // saját végpontja van (/api/cron/reindex-search).
    const blokk = SRC.slice(SRC.indexOf("Szemantikus kereső-index"), SRC.indexOf("Karbantartás: régi rate-limit"));
    expect(blokk).not.toMatch(/for\s*\(/);
    expect(blokk).toMatch(/indexPendingBusinessVectors\(\d+\)/);
  });
});
