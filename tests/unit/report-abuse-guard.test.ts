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

/**
 * A HELYREÁLLÍTÁSI oldal őre.
 *
 * ⚠️ MIÉRT KELL: a rejtés-szabályt szándékosan NEM gyengítettük (DSA Art. 16),
 * a kockázatot az ellensúlyozza, hogy a helyreállítás azonnali és tömeges.
 * Ha az admin-áttekintő vagy a tömeges visszaállító elhal, a védelmi terv
 * FELE tűnik el — pontosan ez történt egyszer már: a lekérdezések megvoltak,
 * de egyetlen felület sem hívta őket (halott kód), miközben az admin-menüben
 * egy MAKETT dashboard volt kilinkelve valódi adat nélkül.
 */
const adminPage = readFileSync(
  "src/app/admin/moderation/abuse-dashboard/page.tsx",
  "utf8",
);
const bulkRestore = readFileSync(
  "src/app/api/admin/reports/restore-by-reporter/route.ts",
  "utf8",
);

describe("bejelentés — helyreállítás (admin-áttekintő + tömeges visszaállítás)", () => {
  it("az admin-áttekintő VALÓDI adatot kérdez le (nem makett)", () => {
    expect(adminPage).toMatch(/listContentReports\s*\(/);
    // A korábbi makett jellemzői — ezek NEM térhetnek vissza.
    expect(adminPage).not.toMatch(/Implementation Roadmap/);
    expect(adminPage).not.toMatch(/value:\s*"—"/);
  });

  it("az áttekintő CSOPORTOSÍT bejelentő szerint (a kampány-mintázat így látszik)", () => {
    expect(adminPage).toMatch(/reporterIpHash/);
    expect(adminPage).toMatch(/RestoreReporterButton/);
  });

  it("a tömeges visszaállító admin-hitelesítés mögött van", () => {
    expect(bulkRestore).toMatch(/getAdminUserId\s*\(/);
    expect(bulkRestore).toMatch(/forbidden/);
  });

  it("a tömeges visszaállító a KÖZÖS restore-modult hívja (nem saját elágazást)", () => {
    // Egy második, saját tartalomtípus-elágazás némán elavulna egy új típusnál.
    expect(bulkRestore).toMatch(/restoreReportedContent\s*\(/);
    expect(bulkRestore).toMatch(/listOpenReportsByReporter\s*\(/);
  });

  it("a visszaállítás LEZÁRJA a bejelentést (különben örökre 'open' maradna)", () => {
    expect(bulkRestore).toMatch(/updateContentReportStatus\s*\(/);
    expect(bulkRestore).toMatch(/"kept"/);
  });

  it("egy hibás sor NEM akasztja meg a többi visszaállítását", () => {
    // A ciklusban try/catch kell — részleges helyreállítás > semmi.
    const loop = bulkRestore.slice(bulkRestore.indexOf("for (const report"));
    expect(loop).toMatch(/try\s*\{/);
    expect(loop).toMatch(/catch/);
  });
});
