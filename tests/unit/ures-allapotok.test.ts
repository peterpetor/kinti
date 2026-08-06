import { describe, it, expect } from "vitest";
import { readFileSync, globSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Üres állapotok — „nincs itt semmi", de van következő lépés.
 *
 * Az üres képernyő a legrosszabb pillanat: a felhasználó megtette, amit kellett,
 * és nem történt semmi. Az EmptyState ezért nem csak ikont és szöveget ad, hanem
 * egy CSELEKVÉSI GOMBOT is — de csak ott, ahol a gomb tényleg elvisz valahová.
 */

const GYOKER = resolve(__dirname, "../..");
const olvas = (p: string) => readFileSync(resolve(GYOKER, p), "utf8").replace(/\r\n/g, "\n");

const TSX = globSync("src/**/*.tsx", { cwd: GYOKER }).map((f) => f.replace(/\\/g, "/"));

describe("a cselekvési gombok célja", () => {
  /**
   * ⚠️ EZ A TESZT EGY SAJÁT, ÉLES HIBÁBÓL SZÜLETETT. A B2B-hírfolyam üres
   * állapotához „Írj ki egy projektet" gombot tettem `/b2b/uj` címre — az
   * útvonal NEM LÉTEZIK (a kiíró űrlap ugyanazon az oldalon, a hírfolyam
   * fölött ül). Semmi nem jelezte volna: a build átmegy, a típusellenőrzés
   * átmegy, és a gomb csak akkor derül ki halottnak, ha valaki pont abban az
   * üres állapotban rákoppint — ami definíció szerint ritka.
   */
  it("⚠️ minden EmptyState `href` LÉTEZŐ útvonalra mutat", () => {
    const utvonalak = new Set(
      globSync("src/app/**/page.tsx", { cwd: GYOKER })
        .map((f) => f.replace(/\\/g, "/"))
        // src/app/(app)/szaknevsor/[id]/page.tsx → /szaknevsor/[id]
        .map((f) =>
          f
            .replace(/^src\/app/, "")
            .replace(/\/page\.tsx$/, "")
            .replace(/\/\([^/]+\)/g, ""),
        )
        .map((u) => u || "/"),
    );
    expect(utvonalak.size, "nem találtam route-okat").toBeGreaterThan(50);

    /** Illeszkedik-e a hivatkozás valamelyik route-ra (a dinamikus szegmens bármit elfogad)? */
    const letezik = (href: string) => {
      const tiszta = href.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
      if (utvonalak.has(tiszta)) return true;
      const reszek = tiszta.split("/");
      for (const u of utvonalak) {
        const ur = u.split("/");
        if (ur.length !== reszek.length) continue;
        if (ur.every((r, i) => r.startsWith("[") || r === reszek[i])) return true;
      }
      return false;
    };

    const rosszak: string[] = [];
    for (const f of TSX) {
      const src = olvas(f);
      if (!src.includes("<EmptyState")) continue;
      // Minden EmptyState-blokk `href: "..."` értéke.
      for (const m of src.matchAll(/<EmptyState[\s\S]{0,1400}?\/>/g)) {
        for (const h of m[0].matchAll(/href:\s*"(\/[^"]*)"/g)) {
          // Sablon-literálos (dinamikus) hivatkozást nem tudunk itt ellenőrizni.
          if (!letezik(h[1])) rosszak.push(`${f} → ${h[1]}`);
        }
      }
    }
    expect(rosszak, `halott EmptyState-hivatkozás: ${rosszak.join(", ")}`).toEqual([]);
  });

  it("a route-felismerés tényleg működik (kétirányú próba)", () => {
    // Egy elrontott útvonal-normalizálás mindent „létezőnek" látna, és az őr
    // némán zöld maradna.
    const utvonalak = globSync("src/app/**/page.tsx", { cwd: GYOKER })
      .map((f) => f.replace(/\\/g, "/").replace(/^src\/app/, "").replace(/\/page\.tsx$/, "").replace(/\/\([^/]+\)/g, ""))
      .map((u) => u || "/");
    expect(utvonalak).toContain("/szaknevsor");
    expect(utvonalak).toContain("/berkalkulator");
    expect(utvonalak).not.toContain("/b2b/uj");
  });
});

describe("az átállított nézetek", () => {
  /** Ezek korábban ad-hoc, kézzel írt üres blokkot használtak. */
  const ATALLITVA = [
    "src/components/views/bookmarks-section.tsx",
    "src/components/views/lead-inbox.tsx",
    "src/components/views/b2b-feed.tsx",
    "src/components/views/salary-offers-view.tsx",
    "src/components/views/jobs-browser.tsx",
    "src/components/guide-search.tsx",
  ];

  it("mind a közös komponenst használja", () => {
    for (const p of ATALLITVA) {
      expect(olvas(p), `${p}: visszacsúszott ad-hoc üres állapotra`).toContain("<EmptyState");
    }
  });

  it("⚠️ a SZŰRŐS üres állapot a szűrőt oldja fel, nem mást ajánl", () => {
    // Ez volt a lényegi hiba: aki állást KERES és a szűrője nem ad találatot,
    // annak a „Hirdesd meg az állásod" gomb nem segít — ő nem munkát kínál.
    for (const p of ["src/components/views/jobs-browser.tsx", "src/components/views/b2b-feed.tsx"]) {
      const src = olvas(p);
      const blokk = src.slice(src.indexOf("<EmptyState"), src.indexOf("<EmptyState") + 1600);
      expect(blokk, `${p}: nincs szűrő-törlő kiút`).toContain("Szűrők törlése");
    }
  });
});

describe("az EmptyState komponens", () => {
  const SRC = olvas("src/components/ui/empty-state.tsx");

  it("a hiba és az üresség NEM ugyanaz a hangnem", () => {
    // Az üres állapot azt mondja, minden rendben, csak nincs tartalom; a hiba
    // azt, hogy elromlott valami. Egyforma zöld halóval a hiba észrevétlen marad.
    expect(SRC).toMatch(/tone\?:\s*"primary"\s*\|\s*"accent"/);
    expect(SRC).toContain("bg-accent/10");
  });

  it("`role=\"status\"` — a képernyőolvasó is megtudja, hogy üres lett a lista", () => {
    expect(SRC).toContain('role="status"');
  });

  it("nincs benne hook (szerver-fában is használható)", () => {
    // Az onClick-es változatot csak kliens-szülő adhatja át; maga a komponens
    // állapot nélküli, tehát szerver-komponensből is renderelhető.
    expect(SRC).not.toContain('"use client"');
    expect(SRC).not.toMatch(/\buseState\b|\buseEffect\b/);
  });
});
