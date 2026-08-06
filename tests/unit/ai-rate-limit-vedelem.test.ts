import { describe, it, expect } from "vitest";
import { readFileSync, globSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Biztonsági őrök az AI-korlát és az admin-védelem köré.
 *
 * Egy 2026-08-07-i átvizsgálásból születtek. A vizsgálat NEM talált kihasználható
 * sebezhetőséget, de két olyan pontot igen, ahol egy későbbi, jóhiszemű
 * egyszerűsítés csendben kinyitná a rendszert. Ezek a tesztek pont azt kötik le.
 *
 * ⚠️ MIÉRT FONTOS AZ AI-KORLÁT: a költséget egy idegen is el tudja égetni. A
 * korlát IP-hez kötött, tehát a megkerülés legkézenfekvőbb módja az, hogy a
 * támadó eléri, hogy ne legyen azonosítható IP-je — ezért kell a hiányzó IP-nek
 * is korlátozottnak lennie.
 */

const GYOKER = resolve(__dirname, "../..");
const olvas = (p: string) => readFileSync(resolve(GYOKER, p), "utf8").replace(/\r\n/g, "\n");
/** Megjegyzések nélkül — a doc-komment épp ezeket a szabályokat magyarázza. */
const kodja = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

describe("AI-korlát: hiányzó IP", () => {
  const AI = olvas("src/lib/ai.ts");
  const AI_KOD = kodja(AI);

  it("⚠️ hiányzó IP esetén KÖZÖS bucket, nem korlátlan (fail-safe)", () => {
    // `key = ipHash || "no-ip"` — mindkét függvényben UGYANAZ a kulcs, különben
    // az ellenőrzés és a naplózás elbeszélne egymás mellett.
    const elofordulas = AI_KOD.match(/ipHash \|\| "no-ip"/g) ?? [];
    expect(elofordulas.length, "az ellenőrzés ÉS a naplózás is kell").toBeGreaterThanOrEqual(2);
  });

  it("⚠️ NINCS korai `return { allowed: true }` hiányzó IP-re", () => {
    // Ez lenne a fail-open ág: ha valaki visszaírja, a korlát megkerülhetővé válik.
    expect(
      AI_KOD,
      "fail-open ág hiányzó IP-re",
    ).not.toMatch(/if\s*\(!ipHash\)[\s\S]{0,120}allowed:\s*true/);
  });

  it("a dokumentáció EGYEZIK a kóddal", () => {
    // A komment korábban az ellenkezőjét állította. Egy biztonsági szabálynál a
    // félrevezető dokumentáció önmagában kockázat.
    const doc = AI.slice(AI.indexOf("@returns true, ha még szabad"), AI.indexOf("export async function checkAiRateLimit"));
    expect(doc).toMatch(/fail-SAFE|fail-safe/);
    expect(doc, "a régi, félrevezető mondat visszatért").not.toMatch(/null[^.]{0,40}ÁTengedünk/);
  });
});

describe("minden AI-végpont korlátozott", () => {
  const VEGPONTOK = [
    ...globSync("src/app/api/ai/**/route.ts", { cwd: GYOKER }),
    ...globSync("src/app/api/asszisztens/route.ts", { cwd: GYOKER }),
  ].map((f) => f.replace(/\\/g, "/"));

  it("legalább néhány AI-végpontot megtalált (a keresés se romolhat el némán)", () => {
    expect(VEGPONTOK.length).toBeGreaterThanOrEqual(5);
  });

  it("⚠️ MIND hívja ÉS ellenőrzi a korlátot, és foglalja a helyet", () => {
    const vetkesek: string[] = [];
    for (const f of VEGPONTOK) {
      const kod = kodja(olvas(f));
      if (!kod.includes("checkAiRateLimit(")) {
        vetkesek.push(`${f} — nem hívja a korlátot`);
        continue;
      }
      // ⚠️ A HÍVÁS ÖNMAGÁBAN KEVÉS — de KÉT helyes minta van, és mindkettőt el
      // kell fogadni. (a) elutasítás 429-cel; (b) az AI-hívás a `rl.allowed`
      // feltétel MÖGÉ zárva, és korlát felett egyszerűen AI nélkül válaszol —
      // ezt csinálja az asszisztens, mert a heurisztika úgyis lefutott, és a
      // felhasználónak jobb egy gyengébb válasz, mint egy hibaüzenet.
      // A lényeg mindkettőnél ugyanaz: a korlát felett NEM indul AI-hívás.
      const elutasit = /checkAiRateLimit\([\s\S]{0,400}?429/.test(kod);
      const feltetelMoge = /await checkAiRateLimit\([\s\S]{0,160}?\.allowed\)/.test(kod);
      if (!elutasit && !feltetelMoge) {
        vetkesek.push(`${f} — hívja, de a korlát felett is futhat AI`);
      }
      // A slot LEFOGLALÁSA (naplózás) nélkül párhuzamos kérések átcsúsznának.
      if (!kod.includes("logAiRateLimit(")) {
        vetkesek.push(`${f} — nem foglalja le a helyet (logAiRateLimit)`);
      }
    }
    expect(vetkesek, vetkesek.join("\n")).toEqual([]);
  });
});

describe("admin API-k védelme", () => {
  const ADMIN = globSync("src/app/api/admin/**/route.ts", { cwd: GYOKER }).map((f) =>
    f.replace(/\\/g, "/"),
  );

  it("megtalálta az admin-route-okat", () => {
    expect(ADMIN.length).toBeGreaterThanOrEqual(20);
  });

  it("⚠️ MINDEGYIK saját maga is ellenőrzi az admin-jogot", () => {
    // ⚠️ A middleware `auth.protect()`-je CSAK BEJELENTKEZÉST követel meg, NEM
    // admin-jogot. Vagyis a route-szintű `getAdminUserId()` az egyetlen, ami a
    // sima felhasználót kizárja — enélkül bárki belépett fiók elérné az admin
    // műveleteket. Ez a teszt lényegi tétje.
    const vetkesek: string[] = [];
    for (const f of ADMIN) {
      const kod = kodja(olvas(f));
      if (!kod.includes("getAdminUserId(")) {
        vetkesek.push(`${f} — nincs admin-ellenőrzés`);
        continue;
      }
      // A hívás UTÁN 401/403 kell — a puszta hívás nem véd.
      if (!/getAdminUserId\(\)[\s\S]{0,300}?(401|403)/.test(kod)) {
        vetkesek.push(`${f} — hívja, de nem utasít el`);
      }
    }
    expect(vetkesek, vetkesek.join("\n")).toEqual([]);
  });
});

describe("felhasználói adat: tulajdonjog-kötés", () => {
  it("⚠️ a lead-státusz írása a SAJÁT céghez van kötve az SQL-ben", () => {
    // Klasszikus IDOR-pont: ha a WHERE csak a lead id-jére szűrne, bárki
    // átírhatná más cég megkereséseit a sajátjáéra hivatkozva.
    const src = olvas("src/lib/repo-leads.ts");
    expect(src).toMatch(/UPDATE business_leads SET status = \? WHERE id = \? AND business_id = \?/);
  });

  it("a lista-vetület NEM tartalmaz telefonszámot (scrape-védelem)", () => {
    const t = olvas("src/lib/types.ts");
    const blokk = t.slice(t.indexOf("export type ListBusiness"), t.indexOf("export type ListBusiness") + 700);
    expect(blokk, "a nyers telefon bekerült a bulk listába").not.toMatch(/\|\s*"phone"/);
  });
});
