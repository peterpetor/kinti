import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isFeatureAvailable, REMOVED_FEATURES } from "@/lib/feature-availability";
import { COUNTRIES } from "@/lib/countries";
import { APP_DESTINATIONS } from "@/lib/app-destinations";

/**
 * ⚠️ KIVEZETETT FUNKCIÓK — a visszaéledés ellen.
 *
 * User-kérés (2026-07-30): „Az akciókat töröld ki mindenhonnét, mert már nincs
 * ilyen." A funkció tábláit már a 0123-as migráció eldobta, és route sem volt
 * hozzá — a KULCSA viszont továbbra is „elérhetőnek" számított a megengedő
 * CH/AT/DE/NL ágon. Vagyis egy elszórt csempe vagy `isFeatureAvailable` hívás
 * CSENDBEN visszaélesíthetett volna egy nem létező funkciót, 404-re mutató
 * linkkel.
 *
 * Ez a teszt azt védi, hogy a kivezetés VÉGLEGES maradjon.
 */
describe("kivezetett funkciók", () => {
  it("⚠️ EGYETLEN országban SEM elérhetők", () => {
    for (const feature of REMOVED_FEATURES) {
      for (const c of COUNTRIES) {
        expect(
          isFeatureAvailable(feature, c.code),
          `„${feature}" újraéledt ${c.code}-ban`,
        ).toBe(false);
      }
      // Ismeretlen/üres ország sem élesítheti újra.
      expect(isFeatureAvailable(feature, null), feature).toBe(false);
      expect(isFeatureAvailable(feature, "XX"), feature).toBe(false);
    }
  });

  it("az akciók (akció-térkép) szerepel a kivezetett halmazban", () => {
    expect(REMOVED_FEATURES.has("akciok")).toBe(true);
  });

  /**
   * ⚠️ A kereső/menü/rács belépési pontjai az APP_DESTINATIONS-ból jönnek.
   * Ha egy kivezetett funkció ide visszakerülne, a felhasználó rákeresve
   * kapna egy találatot, ami 404-re visz.
   */
  it("⚠️ egyik kivezetett funkció sem szerepel belépési pontként", () => {
    for (const d of APP_DESTINATIONS) {
      const seg = d.href.replace(/^\//, "").split("/")[0];
      expect(REMOVED_FEATURES.has(seg), `${d.href} kivezetett funkcióra mutat`).toBe(false);
      if (d.feature) {
        expect(REMOVED_FEATURES.has(d.feature), `${d.href} feature-kulcsa kivezetett`).toBe(false);
      }
    }
  });

  /**
   * ⚠️ AZ ADATVÉDELMI SZAKASZ SZÁNDÉKOSAN MARAD. A 2.13 pont mindhárom nyelven
   * dokumentálja, milyen adatot gyűjtött a megszűnt funkció, és hogy azt
   * töröltük — ez jogi nyilatkozat, nem elfelejtett maradvány. Ráadásul a
   * szakaszszámokra kód hivatkozik, tehát átszámozni sem szabad.
   * Ez a teszt megakadályozza, hogy egy jövőbeli „takarítás" kivegye.
   */
  it("⚠️ az adatvédelmi tájékoztató MEGTARTJA a megszűnés-nyilatkozatot", () => {
    const cases: [string, string][] = [
      ["src/app/adatvedelem/adatvedelem-hu.tsx", "MEGSZŰNT"],
      ["src/app/adatvedelem/adatvedelem-en.tsx", "DISCONTINUED"],
      ["src/app/adatvedelem/adatvedelem-de.tsx", "EINGESTELLT"],
    ];
    for (const [file, marker] of cases) {
      const src = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(src, `${file}: eltűnt a 2.13 szakasz`).toContain("2.13");
      expect(src, `${file}: eltűnt a megszűnés-jelölés`).toContain(marker);
    }
  });
});
