import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getRegions } from "@/lib/regions";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

/**
 * ⚠️ A SPANYOL SZAKNÉVSOR ELSŐ TARTALMA (2026-07-30).
 *
 * User-kérés: „kezd el a spanyol szaknévsor feltöltését olyan foglalkozásokkal
 * amikre van nagy igény, fontos a pontos cím és elérhetőség." A szaknévsor
 * addig 0 spanyol tétellel indult.
 *
 * A tesztek a `db/seed-data/es-organizations.json`-t (a forrás-JSON-t, NEM az
 * élő D1-et) védik — ugyanazokat az invariánsokat, amiket a
 * `scripts/gen-es-seed.mjs` a generálás ELŐTT ellenőriz, csak itt a CI-ban is
 * kikényszerítve, ne csak futtatáskor derüljön ki egy hiba.
 */

interface Org {
  name: string;
  type?: string;
  category?: string;
  city: string;
  region: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  lat: number;
  lng: number;
  hours?: string;
  sharedAddress?: string;
  _comment?: string;
}

const DATA = JSON.parse(read("db/seed-data/es-organizations.json")) as {
  country: string;
  organizations: Org[];
};

const VALID_CATEGORIES = new Set([
  "magyar-kozosseg", "fordito", "forditasszak", "ugyved", "jogtanacsado",
  "fogorvos", "orvos", "borgyogyasz", "konyveles", "penzugyi_tanacsado",
  "ingatlan", "etterem", "elelmiszer", "cukrasz", "autoszer", "fodrasz",
  "pszichiater", "pszichologus", "dietetikus",
]);

/** ⚠️ business.ts `isSpanishCoord` tükre — a két doboznak IDE is egyeznie kell. */
function isSpanishCoord(lat: number, lng: number): boolean {
  const peninsula = lat >= 35.1 && lat <= 43.9 && lng >= -9.4 && lng <= 4.4;
  const canarias = lat >= 27.5 && lat <= 29.5 && lng >= -18.3 && lng <= -13.3;
  return peninsula || canarias;
}

const nameKey = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const addrKey = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

describe("ES szaknévsor seed-adat", () => {
  it("country: ES, és nem üres", () => {
    expect(DATA.country).toBe("ES");
    expect(DATA.organizations.length).toBeGreaterThan(15);
  });

  it("minden tétel érvényes régió-kódot kap (regions.ts ES_REGIONS)", () => {
    const valid = new Set(getRegions("ES").map((r) => r.code));
    for (const o of DATA.organizations) {
      expect(valid.has(o.region), `${o.name}: „${o.region}" nem érvényes ES-régió`).toBe(true);
    }
  });

  it("minden category érvényes, ismert kategória-id", () => {
    for (const o of DATA.organizations) {
      if (!o.category) continue;
      expect(VALID_CATEGORIES.has(o.category), `${o.name}: „${o.category}" ismeretlen kategória`).toBe(true);
    }
  });

  /**
   * ⚠️ A USER KIFEJEZETTEN A PONTOS CÍMET ÉS ELÉRHETŐSÉGET KÉRTE. Ez a teszt
   * azt védi, hogy a bejegyzés minimum EGY elérhetőségi csatornát adjon
   * (cím/telefon/e-mail/weboldal) — ugyanaz a küszöb, amit a generátor is
   * megkövetel a seedelés előtt.
   */
  it("⚠️ minden tételnek van legalább egy elérhetősége (cím/telefon/e-mail/web)", () => {
    for (const o of DATA.organizations) {
      const hasContact = !!(o.address || o.phone || o.email || o.website);
      expect(hasContact, `${o.name}: nincs semmilyen elérhetőség`).toBe(true);
    }
  });

  it("a koordináták Spanyolország (félsziget VAGY Kanári-szigetek) határain belül vannak", () => {
    for (const o of DATA.organizations) {
      expect(
        isSpanishCoord(o.lat, o.lng),
        `${o.name}: (${o.lat}, ${o.lng}) Spanyolországon kívül esik`,
      ).toBe(true);
    }
  });

  it("⚠️ nincs névduplikátum", () => {
    const seen = new Map<string, string>();
    for (const o of DATA.organizations) {
      const k = nameKey(o.name);
      expect(seen.has(k), `„${o.name}" ≈ „${seen.get(k)}" (névduplikátum)`).toBe(false);
      seen.set(k, o.name);
    }
  });

  /**
   * ⚠️ A `sharedAddress` KIVÉTEL, NEM HIBA — de csak akkor, ha az ÉRTÉKE a
   * magyarázat (string). Két magyar orvos (fogorvos+bőrgyógyász) ugyanabban a
   * rendelőben, illetve az Amigo Húngaro két irodája egy-egy üzleti központban
   * jogosan oszt címet — de ezt dokumentálni kell, nem csendben átengedni.
   */
  it("⚠️ cím-duplikátum csak dokumentált sharedAddress-szel fordulhat elő", () => {
    const seen = new Map<string, string>();
    for (const o of DATA.organizations) {
      if (!o.address || o.sharedAddress) continue;
      const k = addrKey(o.address);
      expect(seen.has(k), `„${o.name}" ≈ „${seen.get(k)}" azonos címen, sharedAddress nélkül (${o.address})`).toBe(false);
      seen.set(k, o.name);
    }
  });

  it("a sharedAddress mező, ahol van, string (a kivétel oka), nem puszta true", () => {
    for (const o of DATA.organizations) {
      if (o.sharedAddress === undefined) continue;
      expect(typeof o.sharedAddress, `${o.name}: a sharedAddress nem string`).toBe("string");
      expect(o.sharedAddress.length, `${o.name}: üres sharedAddress`).toBeGreaterThan(3);
    }
  });

  /**
   * ⚠️ A MAEC HITES FORDÍTÓK KÖZÖTT NINCS BUDAPESTI CÍM. Az arkadasi.hu-jegyzék
   * Budapest-székhelyű ügyvédeit tudatosan kihagytuk (a GB-szaknévsornál már
   * dokumentált „Budapest-HQ" strukturális kizárás) — ez a teszt megakadályozza,
   * hogy egy jövőbeli bővítés visszahozza őket.
   */
  it("⚠️ egyetlen tétel címe/városa sem Budapest (strukturális kizárás)", () => {
    for (const o of DATA.organizations) {
      const hay = `${o.city} ${o.address ?? ""}`.toLowerCase();
      expect(hay.includes("budapest"), `${o.name}: budapesti elérhetőség`).toBe(false);
    }
  });

  it("minden e-mail formailag valós (nincs example.com/ejemplo.com placeholder)", () => {
    for (const o of DATA.organizations) {
      if (!o.email) continue;
      expect(o.email, `${o.name}`).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(o.email.toLowerCase(), `${o.name}: placeholder e-mail`).not.toMatch(/ejemplo|example\.com|test@|dummy/);
    }
  });

  it("legalább 3 különböző régió lefedett (nem egyetlen városra korlátozott induló tartalom)", () => {
    const regions = new Set(DATA.organizations.map((o) => o.region));
    expect(regions.size).toBeGreaterThanOrEqual(3);
  });

  it("legalább 3 különböző szakmai kategória lefedett a közösségi szervezeteken túl", () => {
    const cats = new Set(DATA.organizations.map((o) => o.category).filter((c): c is string => !!c && c !== "magyar-kozosseg"));
    expect(cats.size).toBeGreaterThanOrEqual(3);
  });
});

describe("gen-es-seed.mjs generátor", () => {
  const SRC = read("scripts/gen-es-seed.mjs");

  it("a generált SQL minden sora country_code='ES'-t ír", () => {
    expect(SRC).toContain("'ES'");
  });

  it("⚠️ a generátor ELUTASÍTJA a Spanyolországon kívüli koordinátát (fail-closed)", () => {
    expect(SRC).toContain("isSpanishCoord");
    expect(SRC).toContain("Spanyolországon KÍVÜL esik");
  });

  it("a generátor UPDATE-et is ír minden sorhoz (utólagos pontosítás ne vesszen el)", () => {
    expect(SRC).toMatch(/UPDATE businesses SET/);
    expect(SRC).toContain("claimed = 0 AND source");
  });
});
