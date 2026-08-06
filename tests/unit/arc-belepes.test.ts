import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Jelszó nélküli belépés (WebAuthn platform-hitelesítő / passkey).
 *
 * ⚠️ EZ A VEZÉRLŐ HÁROM FELTÉTELTŐL FÜGG, ÉS MINDHÁRMAT ELLENŐRIZNI KELL:
 *   1) be van-e lépve (kulcsot csak létező fiókhoz lehet kötni);
 *   2) van-e az ESZKÖZBEN beépített hitelesítő (FaceID / ujjlenyomat) —
 *      asztali gépen jellemzően nincs, ott a felajánlás értelmetlen;
 *   3) engedélyezve van-e a szolgáltató (Clerk) oldalán — ⚠️ EZT KÓDBÓL NEM
 *      LEHET ELŐRE LEKÉRDEZNI, csak a tényleges hívás derít rá fényt.
 *
 * A minta ugyanaz, mint a rezgés-kapcsolónál: egy vezérlő, ami nem csinál
 * semmit, rosszabb a hiányánál — a felhasználó azt hiszi, ő rontott el valamit.
 */

const GYOKER = resolve(__dirname, "../..");
const olvas = (p: string) => readFileSync(resolve(GYOKER, p), "utf8").replace(/\r\n/g, "\n");
const SRC = olvas("src/components/arc-belepes-kapcsolo.tsx");
/** Megjegyzések nélkül — a doc-komment épp a tiltott alakokat magyarázza. */
const KOD = SRC.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
const MENU = olvas("src/components/ui/dropdown-menu.tsx");

describe("a három feltétel", () => {
  it("kilépve nem jelenik meg", () => {
    expect(KOD).toMatch(/if \(!isLoaded \|\| !isSignedIn \|\| !user\) return null;/);
  });

  it("⚠️ beépített hitelesítő NÉLKÜLI eszközön sem jelenik meg", () => {
    // `isUserVerifyingPlatformAuthenticatorAvailable` — ez mondja meg, hogy van-e
    // FaceID / TouchID / ujjlenyomat-olvasó. Enélkül a gomb egy rendszer-
    // párbeszédet nyitna, amit a felhasználó nem tud teljesíteni.
    expect(KOD).toContain("isUserVerifyingPlatformAuthenticatorAvailable");
    expect(KOD).toMatch(/if \(eszkozTamogat !== true \|\| kikapcsolva\) return null;/);
  });

  it("a támogatás-vizsgálat hibája is „nem támogatott”-ként végződik", () => {
    // Ha a promise elszáll, `null`-ban ragadna az állapot, és a vezérlő
    // örökre láthatatlan maradna — vagy ami rosszabb, félig működne.
    expect(KOD).toMatch(/\.catch\(\(\) => \{[\s\S]{0,80}setEszkozTamogat\(false\)/);
  });

  it("a szolgáltató-oldali tiltás után elrejti magát a munkamenetre", () => {
    expect(KOD).toContain("setKikapcsolva(true)");
  });
});

describe("a felhasználó megszakítása NEM hiba", () => {
  it("⚠️ `NotAllowedError` / `AbortError` esetén nincs hibaüzenet", () => {
    // Ha valaki bezárja a FaceID-panelt, pontosan azt tette, amit akart —
    // hibaüzenetet mutatni rá sértő, és azt sugallná, hogy elromlott valami.
    expect(KOD).toMatch(/nev === "NotAllowedError" \|\| nev === "AbortError"/);
    // A megszakítás-ág a hiba-toast ELŐTT lép ki.
    const i = KOD.indexOf("NotAllowedError");
    const j = KOD.indexOf("setKikapcsolva(true)");
    expect(i, "a megszakítás-vizsgálat a hibakezelés UTÁN van").toBeLessThan(j);
    expect(KOD.slice(i, j)).toContain("return");
  });
});

describe("törlés", () => {
  it("⚠️ megerősítés mögött van (nem egy koppintás)", () => {
    // A kulcs törlése után csak jelszóval lehet belépni — visszafordíthatatlan
    // kényelmetlenség, ha véletlen.
    expect(KOD).toContain("confirmDialog");
    expect(KOD).toContain("destructive: true");
  });

  it("a megerősítő szöveg megmondja a KÖVETKEZMÉNYT", () => {
    expect(SRC).toMatch(/újra jelszóval kell belépned/);
  });

  it("MINDEN kulcsot töröl, nem csak az elsőt", () => {
    expect(KOD).toMatch(/for \(const k of kulcsok\) await k\.delete\(\)/);
  });
});

describe("integráció", () => {
  it("a menü Beállítások szekciójában ül", () => {
    expect(MENU).toContain("ArcBelepesKapcsolo");
    const beallitasok = MENU.slice(MENU.indexOf('id: "beallitasok"'), MENU.indexOf('id: "kovess"'));
    expect(beallitasok, "nem a Beállítások szekcióban van").toContain("arc-belepes");
  });

  it("⚠️ a Clerk API-n megy, nincs nyers WebAuthn-hívás", () => {
    // A nyers `navigator.credentials.create` megkerülné a szerver-oldali
    // kihívás-ellenőrzést (challenge) — az a hitelesítés lényege.
    expect(KOD).toContain("user.createPasskey()");
    expect(KOD, "nyers WebAuthn-hívás").not.toContain("navigator.credentials");
  });

  it("a művelet után újratölti a felhasználót (különben a lista elavul)", () => {
    expect((KOD.match(/user\.reload\(\)/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it("nincs angol szó a felhasználónak szóló feliratokban", () => {
    // UI-szabály: a „passkey" technikai név nem kerülhet a felületre.
    const feliratok = SRC.match(/>[^<>{}\n]{4,}</g) ?? [];
    for (const f of feliratok) {
      expect(f.toLowerCase(), `angol szó a feliratban: ${f}`).not.toContain("passkey");
    }
  });
});
