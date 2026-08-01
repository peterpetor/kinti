import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * A CSP és a FIZETÉS-SZOLGÁLTATÓ összekötésének őre.
 *
 * ⚠️⚠️ A JAVÍTOTT HIBA (2026-08-01-i audit): a `public/_headers` CSP-je nem
 * engedte a `cdn.paddle.com`-ot, így a **/pro oldalon** a `paddle.js` betöltése
 * `csp` indokkal megszakadt (élesben mérve: `requestfailed` → `errorText:
 * "csp"`, és `window.Paddle === undefined`), a `Paddle.Checkout.open()` overlay
 * pedig nem nyílt meg. A CSP 2026-05-30 óta soha nem tartalmazta a
 * fizetés-szolgáltatót; a Paddle-re váltás 2026-06-22-én történt.
 *
 * ⚠️ A HATÓKÖR PONTOSAN — ELŐSZÖR TÚLBECSÜLTEM: ez a fejléc a STATIKUSAN
 * kiszolgált oldalakra vonatkozik (/pro, /gyik, /berkalkulator…), a
 * dinamikusan renderelt útvonalakon a middleware megengedőbb CSP-je megy
 * (nincs `script-src`). Ezért NEM igaz, hogy senki nem tudott vásárolni —
 * 2026-06-29-én és 07-02-án született előfizetés. A FŐ ÁRAZÓ OLDAL útja volt
 * zárva, nem mindegyik. Tanulság: mielőtt „X hete törött" állítást teszel,
 * nézd meg, cáfolja-e az ADAT (itt: a subscriptions tábla dátumai).
 *
 * ⚠️ MIÉRT NEM DERÜLT KI: a `public/_headers` CSAK Cloudflare Pages-en él —
 * helyi `next dev`-ben nincs ilyen fejléc. A fizetés lokálisan tökéletesen
 * működik, és kizárólag élesben bukik. Erre ADDIG NEM VOLT SEMMILYEN TESZT.
 *
 * Ez a teszt a KÓD és a FEJLÉC összhangját nézi: ha valaki fizetés-szolgáltatót
 * cserél, a CSP-t is módosítania kell, különben ez elhasal.
 */
const HEADERS = readFileSync(resolve(process.cwd(), "public/_headers"), "utf8");
const PADDLE_CLIENT = readFileSync(
  resolve(process.cwd(), "src/lib/paddle-client.ts"),
  "utf8",
);

/** A `/*` blokk CSP-sora (ez vonatkozik minden válaszra). */
const CSP =
  HEADERS.split(/\r?\n/).find(
    (l) => l.trim().startsWith("Content-Security-Policy:") && !l.includes("Report-Only"),
  ) ?? "";

/** Egy direktíva értéke a CSP-ből. */
function directive(name: string): string {
  const m = new RegExp(`(?:^|;)\\s*${name}\\s([^;]*)`).exec(CSP);
  return m ? m[1].trim() : "";
}

describe("CSP — a fizetés-szolgáltató engedélyezve van", () => {
  it("a kódban használt paddle.js hosztja szerepel a script-src-ben", () => {
    // A hosztot a KÓDBÓL olvassuk ki: ha a szolgáltató URL-je változik, a teszt
    // automatikusan az újat követeli meg — nem egy bemásolt konstanst.
    const m = /https:\/\/([a-z0-9.-]+)\/paddle\/v2\/paddle\.js/.exec(PADDLE_CLIENT);
    expect(m, "nem találom a paddle.js URL-t a paddle-client.ts-ben").toBeTruthy();
    const host = m![1];
    expect(
      directive("script-src"),
      `a script-src nem engedi a(z) ${host} hosztot → a fizetés élesben elhasal`,
    ).toContain(host);
  });

  it("a fizető-overlay iframe-je engedélyezett (frame-src)", () => {
    // `Paddle.Checkout.open()` egy iframe-et nyit a buy.paddle.com-ra.
    expect(PADDLE_CLIENT.length).toBeGreaterThan(0);
    expect(directive("frame-src")).toContain("paddle.com");
  });

  it("a Paddle API-hívások engedélyezettek (connect-src)", () => {
    expect(directive("connect-src")).toContain("paddle.com");
  });

  it("a checkout overlay CSS-e betölthet (style-src)", () => {
    // Élesben mérve a script-src javítása UTÁN: a `paddle.css` külön `csp`
    // hibával elhasalt → a fizetőablak stílus nélkül jelent volna meg.
    expect(directive("style-src")).toContain("cdn.paddle.com");
  });

  it("⚠️ a ProfitWell követő-szkript SZÁNDÉKOSAN blokkolva marad", () => {
    // Paddle opcionális megtartás-analitikája: a fizetéshez nem kell
    // (ellenőrizve), és harmadik feles követő. A visszaengedése legyen TUDATOS
    // döntés, ne egy CSP-lazítás mellékhatása.
    expect(CSP).not.toContain("profitwell.com");
  });

  it("a form-action engedi a Paddle-t", () => {
    expect(directive("form-action")).toContain("paddle.com");
  });

  it("⚠️ a Permissions-Policy nem tiltja le teljesen a fizetést", () => {
    // A `payment=()` az Apple Pay / Google Pay-t is megölné a checkout-ban.
    const pp = HEADERS.split(/\r?\n/).find((l) => l.trim().startsWith("Permissions-Policy:")) ?? "";
    expect(pp, "nincs Permissions-Policy sor").toBeTruthy();
    expect(pp).not.toMatch(/payment=\(\)/);
    expect(pp).toContain("paddle.com");
  });
});

describe("CSP — a többi külső függőség sem veszhet el", () => {
  it("a checkout overlay-t ténylegesen overlay-ként hívjuk (nem átirányítás)", () => {
    // Ha valaki átállna hosztolt fizetőoldalra (redirect), a frame-src/script-src
    // követelmény változna — ez a teszt akkor szándékosan elbukik, hogy a CSP-t
    // is átgondolják.
    const useCheckout = readFileSync(
      resolve(process.cwd(), "src/hooks/useCheckout.ts"),
      "utf8",
    );
    expect(useCheckout).toContain("Checkout.open");
  });

  it("a bot-védelem (Turnstile) és a belépés (Clerk) is engedélyezett maradt", () => {
    expect(directive("script-src")).toContain("challenges.cloudflare.com");
    expect(directive("script-src")).toContain("clerk.kinti.app");
  });
});
