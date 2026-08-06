import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Az állás-szinkron futásidő-védelme.
 *
 * ⚠️ VALÓS KIESÉSBŐL (2026-08-05). A „Kinti Job Sync (NL)" cron 30 mp-es
 * timeoutra futott, miközben a szokásos futásideje 7–8 mp volt. Két ok
 * adódott össze, és MINDKETTŐT kezelni kell:
 *
 *  1) A szinkron 25 szektort kérdez le KÉT szolgáltatótól (50 külső hívás,
 *     6-os batch-ekben) — és EGYIK fetch-en sem volt időkorlát. Egyetlen
 *     lassan válaszoló forrás elhúzta az egész futást.
 *  2) A batch-ek ideje ÖSSZEADÓDIK: 5 batch × 8 mp worst case = 40 mp, tehát
 *     a per-hívás korlát önmagában kevés.
 *
 * ⚠️ MIÉRT FÁJT: az `upsertExternalJobs` a ciklus UTÁN fut, EGYSZER. A timeout
 * tehát nem „kevesebb állást" jelentett, hanem hogy AZNAP EGYETLEN ÁLLÁS SEM
 * frissült — a részleges munka is elveszett.
 */

const GYOKER = resolve(__dirname, "../..");
const olvas = (p: string) => readFileSync(resolve(GYOKER, p), "utf8").replace(/\r\n/g, "\n");

describe("külső hívások időkorlátja", () => {
  it("⚠️ MINDHÁROM állás-forrás fetch-je időkorlátos", () => {
    // Ha egy új forrás jön és kimarad, ugyanez a kiesés ismétlődik.
    for (const p of ["src/lib/adzuna.ts", "src/lib/jooble.ts", "src/lib/arbeitnow.ts"]) {
      const src = olvas(p);
      expect(src, `${p}: nincs időkorlát a külső hívásán`).toMatch(
        /signal:\s*AbortSignal\.timeout\(/,
      );
    }
  });

  it("az időkorlát a cron-korlát alatt van, de nem irreálisan szűk", () => {
    for (const p of ["src/lib/adzuna.ts", "src/lib/jooble.ts", "src/lib/arbeitnow.ts"]) {
      const m = olvas(p).match(/KULSO_TIMEOUT_MS\s*=\s*(\d+)/);
      expect(m, `${p}: nincs kiolvasható időkorlát`).not.toBeNull();
      const ms = Number(m![1]);
      expect(ms, `${p}: túl szűk, lassú hálózaton hamis hibát adna`).toBeGreaterThanOrEqual(4000);
      expect(ms, `${p}: túl bő, a cron 30 mp-es korlátja alá kell férni`).toBeLessThanOrEqual(12000);
    }
  });
});

describe("a szinkron összesített időkerete", () => {
  const SYNC = olvas("src/lib/job-sync.ts");

  it("⚠️ a batch-ciklus figyeli az eltelt időt", () => {
    expect(SYNC).toMatch(/const KEZDET = Date\.now\(\)/);
    expect(SYNC).toMatch(/Date\.now\(\) - KEZDET > IDOKERET_MS/);
  });

  it("a keret a cron 30 mp-es korlátja alatt marad (a purge-nek is hagyva)", () => {
    const m = SYNC.match(/IDOKERET_MS\s*=\s*([\d_]+)/);
    expect(m).not.toBeNull();
    const ms = Number(m![1].replace(/_/g, ""));
    expect(ms).toBeLessThanOrEqual(25_000);
    expect(ms).toBeGreaterThanOrEqual(10_000);
  });

  it("⚠️ a keret elfogyása NEM dobja el a már összegyűjtött állásokat", () => {
    // Ez a lényeg: `continue` (a további batch-ek kihagyása), NEM `return 0`.
    // Az upsert a ciklus után úgyis lefut a meglévő találatokra.
    const ciklus = SYNC.slice(SYNC.indexOf("const KEZDET"), SYNC.indexOf("const jobs = [...byKey.values()]"));
    expect(ciklus).toContain("continue;");
    expect(ciklus, "a keret elfogyásakor elveszne a részeredmény").not.toMatch(/>\s*IDOKERET_MS[\s\S]{0,120}return 0/);
  });

  it("a kihagyás NEM néma — riasztásra megy", () => {
    // Egy tartósan lassú forrás különben észrevétlenül csonkítaná a listát.
    expect(SYNC).toMatch(/kihagyottBatch > 0/);
    expect(SYNC).toMatch(/safeLogError\(\s*`job-sync/);
  });
});
