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

/**
 * ⚠️ A magyarázó kommentek IDÉZIK a kivezetett feliratokat (hogy egy későbbi
 * olvasó értse, mi volt a hiba) — ezért a „nincs benne" jellegű állításokat a
 * kommentektől MEGTISZTÍTOTT forráson kell nézni, különben a dokumentáció
 * buktatja meg a saját tesztjét.
 */
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const PAGE_CODE = stripComments(PAGE);
const CARD_CODE = stripComments(CARD);

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
    expect(CARD_CODE).not.toContain("Nem megerősített lista");
    expect(CARD).toContain("Tiéd a");
  });

  it("⚠️ a lábjegyzet nem mondja ellent a frissesség-jelnek", () => {
    // Ugyanaz a hibaosztály: a lap egyszerre állította, hogy „Ellenőrizve —
    // 2026. július" ÉS hogy „frissességüket az üzemeltető nem ellenőrzi".
    expect(PAGE_CODE).not.toContain("frissességüket az üzemeltető nem ellenőrzi");
    // A tulajdonos-feltöltés csak az ÁTVETT (claimed) tételekre igaz — 3 db.
    expect(PAGE).toContain("b.claimed");
    expect(PAGE).toContain("nyilvános forrásokból állítottuk össze");
  });

  it("a jogilag lényeges kitétel MINDEN ágon megmarad", () => {
    // Bármelyik ágra fut a lábjegyzet, a hatósági megerősítés kérése kimarad
    // nem lehet — ez nem stílus, hanem felelősség-korlátozás.
    expect(PAGE).toContain("közvetlenül a hatóságoknál erősíts meg");
  });

  it("a kártya megtartja az adat eredetére vonatkozó átláthatóságot", () => {
    // A szöveg RÖVIDÜLT, de nem tűnhet el: jogilag és etikailag is meg kell
    // mondanunk, hogy a tétel a tulajdonos regisztrációja nélkül került fel.
    expect(CARD).toContain("nyilvános adatokból listáztuk");
    expect(CARD).toContain("még nem vette át");
  });
});
