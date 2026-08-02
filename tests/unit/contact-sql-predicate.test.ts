import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { extractContactFromBlurb } from "@/lib/contact-links";

/**
 * A „van-e elérhetőség" SQL-közelítés őre.
 *
 * ⚠️⚠️ EZ A HIBA MÁR KÉTSZER MEGTÖRTÉNT — másodszor 2026-08-02-án, ÁLTALAM,
 * annak ellenére, hogy a runbook figyelmeztet rá.
 *
 * A weboldal a `blurb` végén PROTOKOLL NÉLKÜL áll („… · maosz.org.uk"), ezért
 * egy `blurb NOT LIKE '%http%' AND blurb NOT LIKE '%www.%'` szűrő a weboldalas
 * cégeket is ZSÁKUTCÁNAK számolja. Mérve: 307-et jelentettem 175 helyett —
 * 132 cégnyi, 75%-os túlbecslés, amire majdnem egy egész fejlesztési irányt
 * alapoztunk.
 *
 * A HELYES közelítés:
 *   (phone IS NULL OR phone='') AND (contact_email IS NULL OR contact_email='')
 *   AND blurb NOT LIKE '% · %.%'
 *
 * A `% · %.%` azt nézi, hogy az utolsó ` · ` szegmensben van-e pont (domain
 * vagy e-mail) — ez egyezik a MEGJELENÍTÉS igazságával
 * (`lib/contact-links.ts` → `extractContactFromBlurb`).
 */
const REPO_RAW = readFileSync(resolve(process.cwd(), "src/lib/repo-business.ts"), "utf8");

/**
 * ⚠️ KOMMENTEK NÉLKÜL: a repo MAGYARÁZÓ kommentje IDÉZI a hibás mintát (épp
 * ezt a csapdát dokumentálja), így egy nyers „nincs benne" állítás a
 * dokumentáción bukna el. Ez a munkamenetben HARMADSZOR fordult elő.
 */
const REPO = REPO_RAW.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/** A dokumentált, helyes SQL-töredék. */
const HELYES_SQL = "blurb LIKE '% · %.%'";

/** A tipikus HIBÁS minták, amiket audit-lekérdezésben ne használj. */
const HIBAS_MINTAK = ["blurb LIKE '%http%'", "blurb LIKE '%www.%'"];

describe("elérhetőség — az SQL-közelítés egyezik a megjelenítéssel", () => {
  it("a repo a HELYES mintát használja", () => {
    expect(REPO, "a rendezési feltétel eltért a dokumentálttól").toContain(HELYES_SQL);
  });

  it("⚠️ a repo NEM használ protokoll-alapú mintát", () => {
    for (const rossz of HIBAS_MINTAK) {
      expect(REPO, `${rossz} — a protokoll nélküli weboldalt zsákutcának venné`).not.toContain(rossz);
    }
  });
});

describe("⚠️ a csapda, ami kétszer megfogott: protokoll nélküli weboldal", () => {
  /** Valós alakok a szaknévsorból. */
  const ELERHETO = [
    "Magyar egyesület · Salzburg · magyaregylet.at",
    "50+ éves családi autószerelő műhely Texel szigetén, BOVAG-tag. · www.garagenagy.nl",
    "Fordítóiroda Luganóban · kosmostranslations.com",
    "Magyar kozmetikus · info@pelda.de",
    "Magyar bolt · http://pelda-bolt.de",
  ];
  const NEM_ELERHETO = [
    "Magyar élelmiszerbolt Zirndorfban (Nürnberg mellett).",
    "Családi receptes lángos-büfé Grazban (nőtulajdonos); friss tésztából.",
    "FMH-szakvizsgás pszichiáter és pszichoterapeuta.",
  ];

  for (const blurb of ELERHETO) {
    it(`ELÉRHETŐ: ${blurb.slice(0, 46)}…`, () => {
      const c = extractContactFromBlurb(blurb);
      expect(c.website ?? c.email, "a megjelenítés szerint van kontakt").toBeTruthy();
      // A helyes SQL-közelítés is elérhetőnek látja (van pont az utolsó szegmensben).
      const utolso = blurb.split(" · ").pop() ?? "";
      expect(blurb.includes(" · ") && utolso.includes(".")).toBe(true);
    });
  }

  for (const blurb of NEM_ELERHETO) {
    it(`ZSÁKUTCA: ${blurb.slice(0, 46)}…`, () => {
      const c = extractContactFromBlurb(blurb);
      expect(c.website, "nem lehet weboldala").toBeNull();
      expect(c.email, "nem lehet e-mailje").toBeNull();
    });
  }

  it("⚠️⚠️ a HIBÁS protokoll-szűrő tévesen zsákutcának venné a weboldalasokat", () => {
    // Ez a teszt magát a TÉVEDÉST rögzíti, hogy soha ne írjuk vissza.
    const protokollNelkuli = "Magyar egyesület · Salzburg · magyaregylet.at";
    const hibasSzuro =
      !protokollNelkuli.includes("http") &&
      !protokollNelkuli.includes("www.") &&
      !protokollNelkuli.includes("@");
    expect(hibasSzuro, "a hibás szűrő szerint zsákutca…").toBe(true);
    expect(extractContactFromBlurb(protokollNelkuli).website, "…pedig VAN weboldala").toBeTruthy();
  });
});
