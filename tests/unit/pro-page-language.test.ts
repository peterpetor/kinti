import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * A /pro oldal nyelv-alapértelmezésének őre.
 *
 * ⚠️ A JAVÍTOTT HIBA (2026-08-01, user-döntés): a `/pro` a `useLegalLang`
 * IP-detektálását használta, ami nem-magyar IP esetén németre/angolra vált.
 * Csakhogy az app KÖZÖNSÉGE definíció szerint KÜLFÖLDÖN ÉLŐ MAGYAR — az
 * IP-tipp tehát gyakorlatilag MINDIG idegen nyelvet adott. Élesben mérve
 * (DE-ország, hu-HU böngésző): a vásárlás-gomb felirata „Zu Kinti PRO
 * wechseln" volt. Aki addig végig magyar felületet használt, a fizetés előtti
 * pillanatban német oldalt kapott.
 *
 * A LANDING footeréből nyíló jogi oldalak (Impresszum, ÁSZF, Adatvédelem,
 * Visszatérítés) SZÁNDÉKOSAN maradnak IP-detektálósak: oda nem-magyar olvasó
 * (hatóság, partner, helyi ügyfél) is érkezhet.
 */
const HOOK = readFileSync(resolve(process.cwd(), "src/hooks/use-legal-lang.ts"), "utf8");
const PRO = readFileSync(resolve(process.cwd(), "src/app/(app)/pro/page.tsx"), "utf8");

describe("/pro — alapból magyar", () => {
  it("a /pro kikapcsolja az IP-detektálást", () => {
    expect(PRO).toMatch(/useLegalLang\(\s*\{\s*detectByIp:\s*false\s*\}\s*\)/);
  });

  it("a hook alapértelmezése VÁLTOZATLAN (a jogi oldalak miatt)", () => {
    // Ha ez `false`-ra fordulna, a landing footeréből érkező nem-magyar
    // olvasó is magyar ÁSZF-et kapna.
    expect(HOOK).toMatch(/detectByIp\s*=\s*true/);
  });

  it("⚠️ a MENTETT választás mindig erősebb, mint az alapértelmezés", () => {
    // A user kérése: „kivéve ha valaki átváltja a nyelvet és elmenti a
    // localStorage-ba az app, és ha visszajön". A tárolt érték ellenőrzése
    // ezért a `detectByIp` kapu ELŐTT kell fusson.
    const eff = HOOK.slice(HOOK.indexOf("useEffect"));
    const tarolt = eff.indexOf('stored === "hu"');
    const kapu = eff.indexOf("if (!detectByIp)");
    expect(tarolt).toBeGreaterThan(-1);
    expect(kapu).toBeGreaterThan(-1);
    expect(tarolt, "a mentett választást a kapu ELŐTT kell megnézni").toBeLessThan(kapu);
  });

  it("a nyelvváltó továbbra is ott van a /pro oldalon", () => {
    // Alapból magyar — de a váltás lehetősége nem veszhet el.
    expect(PRO).toContain("LegalLangSwitch");
    expect(PRO).toContain("setLang");
  });

  it("a nyelvválasztás menthető marad (localStorage)", () => {
    expect(HOOK).toContain("localStorage.setItem(KEY");
  });
});
