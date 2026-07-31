import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * A cégadatlap ELSŐ KÉPERNYŐJÉNEK őre.
 *
 * ⚠️ A JAVÍTOTT HIBA (2026-08-01, első-látogató végigjárás): a „Tiéd ez a
 * vállalkozás?" claim-kártya a cím ALATT állt, tehát a kapcsolat-gombok ELŐTT.
 * Élesben mérve iPhone 13-on: 197px magas, a 664px-es képernyő 30%-a, és a
 * telefon-gomb emiatt y=521-re, a TabBar-hoz szorulva jelent meg.
 *
 * Ez nem esztétikai kérdés: a kártya a TULAJDONOSNAK szól, a látogató viszont
 * kapcsolatot keres — és 2248 látható cégből MINDÖSSZE 3 az átvett, vagyis a
 * kártya a lapok 99,9%-án ott volt. Pontosan a mért tölcsér-szakadék helye
 * (100 adatlap-megnyitás → 1 hívás).
 *
 * Ezek a tesztek FORRÁSSORRENDET néznek — ez a leggyengébb, de a legolcsóbb
 * jelzés arra, hogy valaki visszahúzza a kártyát a lap tetejére.
 */
const PAGE = readFileSync(
  resolve(process.cwd(), "src/app/(app)/szaknevsor/[id]/page.tsx"),
  "utf8",
);
const CARD = readFileSync(
  resolve(process.cwd(), "src/components/views/business-claim-card.tsx"),
  "utf8",
);

describe("cégadatlap — a kapcsolatfelvétel megy elöl", () => {
  it("a claim-kártya a telefon-gomb UTÁN áll a forrásban", () => {
    const claim = PAGE.indexOf("<BusinessClaimCard");
    const phone = PAGE.indexOf("<PhoneReveal");
    expect(claim, "BusinessClaimCard eltűnt az adatlapról").toBeGreaterThan(-1);
    expect(phone, "PhoneReveal eltűnt az adatlapról").toBeGreaterThan(-1);
    expect(claim).toBeGreaterThan(phone);
  });

  it("a claim-kártya a címsor (h1) és a meta-sor után áll", () => {
    const claim = PAGE.indexOf("<BusinessClaimCard");
    expect(claim).toBeGreaterThan(PAGE.indexOf("<h1"));
    expect(claim).toBeGreaterThan(PAGE.indexOf("{/* meta sor */}"));
  });

  it("⚠️ a kártya nem állít adatminőségi kételyt a régi felirattal", () => {
    // 2221 látható cégnél EGYSZERRE volt igaz a „Nem megerősített lista" felirat
    // és az „Ellenőrizve — 2026. július" jel, egymástól 300px-re. A látogató a
    // kettőt nem tudja összeegyeztetni; a claim-kártya a TULAJDONLÁSRÓL szól,
    // nem az adat helyességéről.
    expect(CARD).not.toContain("Nem megerősített lista");
    expect(CARD).toContain("Tiéd a");
  });

  it("a kártya megtartja az adat eredetére vonatkozó átláthatóságot", () => {
    // A szöveg RÖVIDÜLT, de nem tűnhet el: jogilag és etikailag is meg kell
    // mondanunk, hogy a tétel a tulajdonos regisztrációja nélkül került fel.
    expect(CARD).toContain("nyilvános adatokból listáztuk");
    expect(CARD).toContain("még nem vette át");
  });
});
