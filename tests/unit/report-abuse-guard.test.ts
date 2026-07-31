import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

/**
 * A BEJELENTÉS-VISSZAÉLÉS elleni védelem szerkezeti őre.
 *
 * ⚠️ A HELYZET: egyetlen névtelen bejelentés AZONNAL elrejti a tartalmat
 * (DSA Art. 16 notice-and-action). A 2026-07-31-i biztonsági átvizsgálás
 * kimutatta, hogy a végponton NEM VOLT bot-védelem — egy script végigmehetett
 * volna a 2353 vállalkozás azonosítóján, és forgatott IP-kről az egész
 * szaknévsort eltüntethette volna.
 *
 * HÁROM RÉTEG védi, és mindhárom kell:
 *   1. Turnstile — a scripteket állítja meg (ez hiányzott).
 *   2. Per-IP órás korlát — a Turnstile-t megkerülő, böngészőt automatizáló
 *      támadó sebességét fogja.
 *   3. Automatikus-rejtés küszöbe — aki a küszöb fölött jelent, annak a
 *      bejelentését ELFOGADJUK és rögzítjük (jogszabályi kötelezettség), de a
 *      tartalom NEM tűnik el magától; emberi döntésre vár.
 *
 * ⚠️ EZ A TESZT SZÁNDÉKOSAN A FORRÁST OLVASSA: a végpont importja behúzná a
 * teljes Cloudflare/D1-környezetet, ami egy szerkezeti szabályhoz aránytalan.
 * A cél nem a viselkedés szimulálása, hanem hogy a HÁROM RÉTEG egyike se
 * tűnhessen el észrevétlenül egy későbbi átírásban.
 */
const route = readFileSync("src/app/api/report/route.ts", "utf8");
const button = readFileSync("src/components/report-button.tsx", "utf8");

describe("bejelentés — visszaélés elleni védelem", () => {
  it("1. réteg: a végpont ELLENŐRZI a Turnstile-tokent", () => {
    expect(route).toMatch(/verifyTurnstile\s*\(/);
    // …és elutasít, ha nem jó (fail-closed).
    expect(route).toMatch(/captcha\.ok/);
  });

  it("1. réteg: az űrlap KÜLDI is a tokent (különben minden bejelentés elhalna)", () => {
    expect(button).toMatch(/TurnstileWidget/);
    expect(button).toMatch(/turnstileToken/);
  });

  it("2. réteg: per-IP órás korlát megvan", () => {
    expect(route).toMatch(/REPORTS_PER_HOUR/);
    expect(route).toMatch(/countRecentReports\s*\(/);
  });

  it("3. réteg: az automatikus rejtés KÜSZÖBHÖZ kötött", () => {
    expect(route).toMatch(/AUTO_HIDE_LIMIT_PER_HOUR/);
    expect(route).toMatch(/const autoHide\s*=/);
  });

  it("⚠️ MINDEN rejtő hívás a küszöb mögött van (egy kimaradó ág = kiskapu)", () => {
    // A rejtő műveletek neve; mindegyiknek `if (autoHide)` mögött kell állnia.
    const hideCalls = [
      "setBusinessHidden(contentId, true)",
      "setReviewHidden(contentId, true)",
      "hideSosAlert(contentId)",
      'setB2bProjectStatus(contentId, "closed")',
      "setStoryPublicVisibility(contentId, false)",
      "setServiceRequestVisibility(contentId, false)",
      "setHousingListingVisibility(contentId, false)",
    ];
    for (const call of hideCalls) {
      const i = route.indexOf(call);
      expect(i, `nincs meg a hívás: ${call}`).toBeGreaterThan(-1);
      // Az azt megelőző ~200 karakterben szerepelnie kell az `autoHide` feltételnek.
      const before = route.slice(Math.max(0, i - 200), i);
      expect(before, `${call} NINCS az autoHide feltétel mögött`).toMatch(/autoHide/);
    }
  });

  it("a bejelentés akkor is RÖGZÜL, ha nem rejtettünk (a fogadás kötelezettség)", () => {
    // A createContentReport hívása nem lehet az autoHide ágban.
    const i = route.indexOf("createContentReport({");
    expect(i).toBeGreaterThan(-1);
    const before = route.slice(Math.max(0, i - 400), i);
    expect(before).not.toMatch(/if\s*\(autoHide\)\s*\{[^}]*$/);
  });
});
