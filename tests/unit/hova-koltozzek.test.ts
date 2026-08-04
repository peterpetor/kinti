import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ORSZAG_TENYEK, SZEMPONTOK, ertekel, osszPont, csoportosit, type Szempont,
} from "../../src/lib/hova-koltozzek";
import { OSSZEHASONLITO_ORSZAGOK } from "../../src/lib/orszag-osszehasonlito";

/**
 * „Hová költözzek?” döntési mátrix.
 *
 * A mátrix RANGSOROL országokat egy élet-döntéshez, ezért a hibái nem
 * kozmetikaiak. Két hibaosztályt kell kizárni:
 *   1. a HIÁNYZÓ adat rossz adatként viselkedik (az ország alulra esne, mintha
 *      MÉRTÜK volna, hogy rossz — pedig csak nem tudjuk),
 *   2. a kurált tény ELCSÚSZIK attól, amit a saját cikkünk mond (a mátrix mást
 *      állítana, mint az útmutató, amire hivatkozik).
 */

const SZAMOK = { maradPct: 40, alberletPct: 35, nettoArany: 0.72 };

describe("hiányzó adat kezelése", () => {
  it("⚠️ a „nincs adatunk” NEM nulla pont, hanem null", () => {
    // GB-re a cikkeink nem mondják ki az állampolgársági éveket.
    expect(ORSZAG_TENYEK.GB.allampolgarsagEv).toBeNull();
    const e = ertekel("gyors_allampolgarsag", "GB", SZAMOK);
    expect(e.pont).toBeNull();
    expect(e.ertek).toBe("nincs adatunk");
  });

  it("⚠️ a hiányzó szempont KIMARAD az átlagból, nem húzza le", () => {
    // Két szempont: az egyiket tudjuk (megtakarítás), a másikat GB-re nem.
    const szempontok: Szempont[] = ["megtakaritas", "gyors_allampolgarsag"];
    const gb = osszPont(szempontok, "GB", SZAMOK);
    const de = osszPont(szempontok, "DE", SZAMOK);

    // GB pontja CSAK a megtakarításból jön — nem felezi meg egy 0-s tétel.
    expect(gb.ertekelt).toBe(1);
    expect(gb.ossz).toBe(2);
    expect(gb.pont).toBeCloseTo(ertekel("megtakaritas", "GB", SZAMOK).pont!, 6);

    // Ha nullaként számolnánk, GB pontja feleakkora lenne — ezt zárjuk ki.
    const hibasan = (ertekel("megtakaritas", "GB", SZAMOK).pont! + 0) / 2;
    expect(gb.pont).not.toBeCloseTo(hibasan, 6);

    expect(de.ertekelt, "DE-re mindkét szempontot tudjuk").toBe(2);
  });

  it("ha EGYETLEN szempontot sem tudunk értékelni, a pont null (nem 0)", () => {
    const csakIsmeretlen: Szempont[] = ["gyors_allampolgarsag", "ketto_allampolgarsag"];
    const gb = osszPont(csakIsmeretlen, "GB", SZAMOK);
    expect(gb.pont).toBeNull();
    expect(gb.ertekelt).toBe(0);
  });

  it("üres szempont-listára sem dob", () => {
    expect(osszPont([], "DE", SZAMOK).pont).toBeNull();
  });
});

/**
 * ⚠️ A HIÁNYZÓ ADAT MINDKÉT IRÁNYBAN TORZÍT. Az első változatom csak a
 * „ne húzza le" irányt kezelte — és Anglia a 3. helyre került, mert a nem
 * tudott szempontja kimaradt az átlagából, így csak a jó szempontja számított.
 */
describe("csoportosítás — a hiányos adat FELFELÉ sem torzíthat", () => {
  const sor = (nev: string, ertekelt: number, ossz: number) => ({ nev, pont: { ertekelt, ossz } });

  it("csak a teljesen értékelt ország kerül a rangsorba", () => {
    const { rangsorolhato, hianyos } = csoportosit([
      sor("DE", 2, 2),
      sor("GB", 1, 2),
      sor("CH", 2, 2),
    ]);
    expect(rangsorolhato.map((x) => x.nev)).toEqual(["DE", "CH"]);
    expect(hianyos.map((x) => x.nev)).toEqual(["GB"]);
  });

  it("⚠️ a részben értékelt ország NEM előzheti meg a teljesen értékeltet", () => {
    // GB-nek magasabb a (hiányos) átlaga, mégsem kaphat helyezést.
    const { rangsorolhato } = csoportosit([sor("GB", 1, 2), sor("DE", 2, 2)]);
    expect(rangsorolhato.map((x) => x.nev), "hiányos adatú ország került a rangsorba").toEqual(["DE"]);
  });

  it("nulla szempontnál senki nem rangsorolható", () => {
    const { rangsorolhato, hianyos } = csoportosit([sor("DE", 0, 0), sor("CH", 0, 0)]);
    expect(rangsorolhato).toEqual([]);
    expect(hianyos).toHaveLength(2);
  });

  it("egyetlen ország sem vész el a két csoport között", () => {
    const be = [sor("A", 1, 2), sor("B", 2, 2), sor("C", 0, 2)];
    const { rangsorolhato, hianyos } = csoportosit(be);
    expect(rangsorolhato.length + hianyos.length).toBe(be.length);
  });
});

describe("pontozás értelmessége", () => {
  it("minden pont a 0–1 sávban van", () => {
    for (const c of OSSZEHASONLITO_ORSZAGOK) {
      for (const sz of SZEMPONTOK) {
        for (const szamok of [
          { maradPct: 0, alberletPct: 100, nettoArany: 0.4 },
          { maradPct: 55, alberletPct: 20, nettoArany: 0.9 },
          { maradPct: 100, alberletPct: 0, nettoArany: 1 },
        ]) {
          const p = ertekel(sz.id, c, szamok).pont;
          if (p == null) continue;
          expect(p, `${c} / ${sz.id}`).toBeGreaterThanOrEqual(0);
          expect(p, `${c} / ${sz.id}`).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("kevesebb év állampolgárság = több pont", () => {
    const de = ertekel("gyors_allampolgarsag", "DE", SZAMOK).pont!; // 5 év
    const at = ertekel("gyors_allampolgarsag", "AT", SZAMOK).pont!; // 10 év
    expect(de).toBeGreaterThan(at);
  });

  it("a megtartható magyar állampolgárság 1 pont, a lemondás 0", () => {
    expect(ertekel("ketto_allampolgarsag", "DE", SZAMOK).pont).toBe(1);
    expect(ertekel("ketto_allampolgarsag", "AT", SZAMOK).pont).toBe(0);
  });

  it("drágább lakhatás = kevesebb pont", () => {
    const olcso = ertekel("olcso_alberlet", "DE", { ...SZAMOK, alberletPct: 20 }).pont!;
    const draga = ertekel("olcso_alberlet", "DE", { ...SZAMOK, alberletPct: 70 }).pont!;
    expect(olcso).toBeGreaterThan(draga);
  });

  it("a szempont-választás TÉNYLEG megváltoztatja a sorrendet", () => {
    const rangsor = (szempontok: Szempont[]) =>
      OSSZEHASONLITO_ORSZAGOK.map((c) => ({ c, p: osszPont(szempontok, c, SZAMOK).pont ?? -1 }))
        .sort((a, b) => b.p - a.p)
        .map((x) => x.c)
        .join(",");
    // A „gyors állampolgárság” DE-t és NL-t hozza előre (5 év), a
    // „magyar megtartható” DE-t és CH-t — a kettő nem adhat azonos sorrendet.
    expect(rangsor(["gyors_allampolgarsag"])).not.toBe(rangsor(["ketto_allampolgarsag"]));
  });
});

/**
 * ⚠️ A LEGFONTOSABB TESZT. A mátrix cellái a saját cikkeink tömörítései —
 * ha valaki átírja a cikket (vagy a mátrixot), a kettő némán ellentmondana
 * egymásnak, és a felhasználó két különböző számot látna ugyanarra.
 */
describe("a kurált tények egyeznek a forrás-cikkekkel", () => {
  const guides = readFileSync(resolve(process.cwd(), "src/lib/guides.ts"), "utf8");
  const bank = readFileSync(resolve(process.cwd(), "src/lib/einburgerung-bank.ts"), "utf8");

  it("minden forrás-slug létező cikkre mutat", () => {
    const letezo = new Set([...guides.matchAll(/^ {4}slug: "([^"]+)"/gm)].map((m) => m[1]));
    for (const [c, t] of Object.entries(ORSZAG_TENYEK)) {
      expect(letezo.has(t.forrasSlug), `${c}: nem létező forrás-slug (${t.forrasSlug})`).toBe(true);
    }
  });

  it("AT: 10 év, különleges esetben 6, és LE KELL mondani a magyarról", () => {
    expect(guides).toMatch(/10 év \(különleges esetben 6\) → Staatsbürgerschaft/);
    expect(guides).toMatch(/le kell mondani a magyar állampolgárságról/);
    expect(ORSZAG_TENYEK.AT.allampolgarsagEv).toBe(10);
    expect(ORSZAG_TENYEK.AT.kettosAllampolgarsag).toBe(false);
  });

  it("DE: 5 év, és a kettős állampolgárság ENGEDÉLYEZETT", () => {
    expect(guides).toMatch(/Állampolgárság a 2024-es reform óta már 5 év után/);
    expect(guides).toMatch(/KETTŐS állampolgárság ENGEDÉLYEZETT/);
    expect(ORSZAG_TENYEK.DE.allampolgarsagEv).toBe(5);
    expect(ORSZAG_TENYEK.DE.kettosAllampolgarsag).toBe(true);
  });

  it("NL: 5 év, A2 inburgering, fő szabályként lemondás", () => {
    expect(guides).toMatch(/naturalisatie\) 5 év után, inburgering \(A2 nyelv \+ KNM\)/);
    expect(ORSZAG_TENYEK.NL.allampolgarsagEv).toBe(5);
    expect(ORSZAG_TENYEK.NL.kettosAllampolgarsag).toBe(false);
    expect(ORSZAG_TENYEK.NL.nyelvSzint).toMatch(/A2/);
  });

  it("ES: 10 év, DELE A2 + CCSE, és Magyarország NEM kivétel a lemondás alól", () => {
    expect(guides).toMatch(/jellemzően 10 év jogszerű, folyamatos/);
    expect(guides).toMatch(/DELE A2 nyelvvizsga/);
    expect(ORSZAG_TENYEK.ES.allampolgarsagEv).toBe(10);
    expect(ORSZAG_TENYEK.ES.kettosAllampolgarsag).toBe(false);
    expect(ORSZAG_TENYEK.ES.nyelvSzint).toMatch(/DELE A2/);
  });

  it("CH: 10 év, és a kettős állampolgárság engedélyezett (kvízbank)", () => {
    expect(bank).toMatch(/Általában 10 év \(2018 óta\)/);
    expect(bank).toMatch(/kettős állampolgárság engedélyezett/);
    expect(ORSZAG_TENYEK.CH.allampolgarsagEv).toBe(10);
    expect(ORSZAG_TENYEK.CH.kettosAllampolgarsag).toBe(true);
  });

  it("⚠️ GB-re NEM tippelünk értéket (Brexit óta más a rendszer)", () => {
    const t = ORSZAG_TENYEK.GB;
    expect(t.allampolgarsagEv).toBeNull();
    expect(t.kettosAllampolgarsag).toBeNull();
    expect(t.nyelvSzint).toBeNull();
  });

  it("a bejelentkezési határidők a cikkek MEGFOGALMAZÁSÁT követik (nem pontosítanak)", () => {
    // A CH és AT cikk konkrét napot mond; a DE és NL szándékosan hedgel.
    expect(guides).toMatch(/14 napon belül jelentkezz be/);
    expect(ORSZAG_TENYEK.CH.bejelentkezesHatarido).toMatch(/14 nap/);
    expect(guides).toMatch(/3 napon belül jelentkezz be a Meldeamtnál/);
    expect(ORSZAG_TENYEK.AT.bejelentkezesHatarido).toMatch(/3 nap/);
    expect(guides).toMatch(/általában 1-2 héten belül/);
    expect(ORSZAG_TENYEK.DE.bejelentkezesHatarido, "a DE cikk hedgel — a mátrix se legyen határozottabb").toMatch(/1–2 hét/);
    expect(guides).toMatch(/a beköltözéstől néhány napon belül/);
    expect(ORSZAG_TENYEK.NL.bejelentkezesHatarido, "az NL cikk sem mond napot").toMatch(/pár nap/);
  });
});

/**
 * A csekklisták ugyanezt a fegyelmet követik: ne mondjanak a cikknél
 * határozottabbat. (Ezt korábban elrontottam — a DE „14 nap" és az NL „5 nap"
 * pontosabb volt a forrásnál.)
 */
describe("a teendőlisták sem pontosítanak a forrás mögé", () => {
  it("a DE és NL bejelentkezés-lépés nem mond konkrét napszámot", () => {
    const cl = readFileSync(resolve(process.cwd(), "src/lib/guide-checklists.ts"), "utf8");
    const deSor = cl.match(/"de-bejelentkezes":[\s\S]*?\n {2}\],/)?.[0] ?? "";
    const nlSor = cl.match(/"nl-bejelentkezes":[\s\S]*?\n {2}\],/)?.[0] ?? "";
    expect(deSor, "nem sikerült kiolvasni a DE listát").toContain("Anmeldung");
    expect(deSor).not.toMatch(/Jelentkezz be 14 napon belül/);
    expect(nlSor, "nem sikerült kiolvasni az NL listát").toContain("BRP");
    expect(nlSor).not.toMatch(/Jelentkezz be 5 napon belül/);
  });
});
