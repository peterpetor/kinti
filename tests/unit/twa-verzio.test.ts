import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Az Android-kiadás verziószámainak őre.
 *
 * ⚠️ MIÉRT: a `twa-manifest.json` a FORRÁS-IGAZSÁG — a `build.gradle` és az
 * AndroidManifest ebből GENERÁLÓDIK a `bubblewrap build` során, és a repóban
 * nincs is követve (az `android/*` gitignore-olt, két kivétellel). Ha viszont
 * a fájlon belüli KÉT verzió-mező elcsúszik egymástól, az némán rossz kiadást
 * eredményez, és csak a Play Console-on derül ki.
 *
 * ⚠️ A Play minden feltöltésnél SZIGORÚAN NAGYOBB `versionCode`-ot követel.
 * Ha egy kiadás már fent van, a következőhöz KÖTELEZŐ emelni — különben a
 * feltöltés visszautasításra kerül.
 */

const GYOKER = resolve(__dirname, "../..");
const TWA = JSON.parse(readFileSync(resolve(GYOKER, "android/twa-manifest.json"), "utf8"));

describe("TWA verziószámok", () => {
  it("⚠️ a két verziónév-mező EGYEZIK egymással", () => {
    // A `appVersionName` és az `appVersion` ugyanazt a kiadást írja le;
    // ha elcsúsznak, a generált app más nevet visel, mint amit itt látsz.
    expect(TWA.appVersion, "appVersion ≠ appVersionName").toBe(TWA.appVersionName);
  });

  it("a versionCode pozitív egész", () => {
    expect(Number.isInteger(TWA.appVersionCode)).toBe(true);
    expect(TWA.appVersionCode).toBeGreaterThan(0);
  });

  it("⚠️ a versionName VERZIÓSZÁM-alakú — nem szöveg, nem parancs", () => {
    // ⚠️ VALÓS HIBA 2026-08-07: a `bubblewrap update` interaktívan bekérte az
    // új verziónevet, és a beillesztett szöveg (egy parancssor) került bele.
    // Az `.aab` ezzel a névvel épült meg, és a Play a boltban ezt mutatta
    // volna verziónévként. A `twa:update` azóta `--skipVersionUpgrade`-del fut,
    // tehát NEM kérdez — a verziót itt, a fájlban kell emelni.
    for (const kulcs of ["appVersionName", "appVersion"]) {
      expect(TWA[kulcs], `${kulcs} nem verziószám: ${TWA[kulcs]}`).toMatch(/^\d+\.\d+(\.\d+)?$/);
    }
  });

  it("⚠️ a versionCode NEM csökkent a legutóbb kiadott alá", () => {
    // A Play szigorúan növekvő versionCode-ot vár. Ez az alsó korlát a
    // legutóbb kiadott verzió; ha új kiadás megy ki, EZT A SZÁMOT IS emeld,
    // hogy a védelem tovább működjön. (1.6/9 → ikon-javítás, 1.7/10 → az
    // ikon-javítás, ami a CDN-cache miatt először nem jutott ki, 1.8/11 →
    // átlátszó splash [HIBÁS javítás], 1.9/12 → a natív splash KIKAPCSOLVA.)
    expect(TWA.appVersionCode).toBeGreaterThanOrEqual(12);
  });

  it("az ikon-URL-ek az éles domainre mutatnak (a build onnan tölti le)", () => {
    // ⚠️ A bubblewrap NEM a lokális fájlt használja, hanem letölti ezekről az
    // URL-ekről — ezért az ikon-változást ELŐBB deployolni kell.
    for (const kulcs of ["iconUrl", "maskableIconUrl"]) {
      expect(TWA[kulcs], `${kulcs} hiányzik`).toBeTruthy();
      expect(TWA[kulcs], `${kulcs} nem a kinti.app-ra mutat`).toMatch(/^https:\/\/kinti\.app\//);
    }
  });
});
