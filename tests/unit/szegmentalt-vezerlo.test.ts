import { describe, it, expect } from "vitest";
import { readFileSync, globSync } from "node:fs";
import { resolve } from "node:path";
import {
  szegmensGeometria,
  szegmensInsetOsztaly,
  szegmensPaddingOsztaly,
  SZEGMENS_PADDING_REM,
} from "@/lib/segmented-geometria";

/**
 * Szegmentált vezérlő (SegmentedControl) — csúszó kapszula.
 *
 * A kapszula fizikailag átcsúszik az egyik opció alól a másik alá. A mozgás
 * KÖTI ÖSSZE a két állapotot: a szem követni tudja, honnan hová került a
 * kijelölés. A pillanatszerű színcserénél ez az információ elvész.
 */

const GYOKER = resolve(__dirname, "../..");
const CSS = readFileSync(resolve(GYOKER, "src/app/globals.css"), "utf8").replace(/\r\n/g, "\n");
const KOMP = readFileSync(resolve(GYOKER, "src/components/ui/segmented-control.tsx"), "utf8");

/**
 * ⚠️ A megjegyzések nélküli forrás. Ez a teszt tiltott alakokat keres, és a
 * fájl doc-kommentje ÉPP AZOKAT MAGYARÁZZA („a `flex-1` csak teljes szélességű
 * konténerben…") — az őr tehát a saját indoklására illeszkedett volna, és
 * mindig pirosat mutat, függetlenül a kódtól. Ugyanez fordítva is igaz: egy
 * kommentben említett helyes alak zölddé tehet egy rossz kódot.
 */
const KOD = KOMP.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

/** A rem-értéket px-re váltja (1rem = 16px), hogy számolni lehessen. */
const remPx = (rem: number) => rem * 16;

describe("kapszula-geometria", () => {
  it("a szélesség a BELSŐ szélességből jön (teljes − 2×padding)", () => {
    for (const meret of ["sm", "md"] as const) {
      const { width } = szegmensGeometria(3, 0, meret);
      const levonas = SZEGMENS_PADDING_REM[meret] * 2;
      expect(width).toBe(`calc((100% - ${levonas}rem) / 3)`);
    }
  });

  it("⚠️ a szélső szegmensnél a kapszula PONTOSAN a kereten belül ér véget", () => {
    // Ez a néma hiba: ha a padding-levonás és a padding-osztály elcsúszik, a
    // kapszula kilóg vagy alatta marad — de CSAK a szélső fülön, és csak az
    // egyik méretben. Számoljuk ki px-ben, több konténer-szélességre.
    //
    // ⚠️ A KIMENETET ÉRTELMEZZÜK, nem a bemenő konstansot. Ha a `calc(...)`
    // stringet a konstansból raknám össze itt is, a teszt önmagára hivatkozna:
    // egy elrontott levonás a tesztben is elromlana, és zöld maradna. Ezért a
    // `width`-et a függvény VISSZAADOTT stringjéből parse-oljuk, a paddingot
    // pedig a Tailwind-osztály nevéből — két független forrás.
    for (const meret of ["sm", "md"] as const) {
      const paddingRem = Number(szegmensPaddingOsztaly(meret).replace("p-", ""));
      const padding = remPx(paddingRem / 4); // Tailwind: p-1 = 0,25rem
      for (const teljesSzelesseg of [320, 375, 428, 640]) {
        for (const n of [2, 3, 4]) {
          const { width, transform } = szegmensGeometria(n, n - 1, meret);
          const m = width.match(/calc\(\(100% - ([\d.]+)rem\) \/ (\d+)\)/);
          expect(m, `${meret}: váratlan width-alak: ${width}`).not.toBeNull();
          const kapszula = (teljesSzelesseg - remPx(Number(m![1]))) / Number(m![2]);
          const szazalek = Number(transform.match(/translateX\((\d+)%\)/)![1]) / 100;
          const jobb = padding + szazalek * kapszula + kapszula;
          expect(
            jobb,
            `${meret} · ${teljesSzelesseg}px · ${n} szegmens: a kapszula jobb széle ${jobb}px, a keret belső határa ${teljesSzelesseg - padding}px`,
          ).toBeCloseTo(teljesSzelesseg - padding, 6);
        }
      }
    }
  });

  it("az inset- és padding-osztály ugyanabból a méretből jön", () => {
    // Egy forrás: ha valaki csak az egyiket írja át, a másik követi.
    expect(szegmensPaddingOsztaly("sm")).toBe("p-0.5");
    expect(szegmensPaddingOsztaly("md")).toBe("p-1");
    expect(szegmensInsetOsztaly("sm")).toContain("left-0.5");
    expect(szegmensInsetOsztaly("md")).toContain("left-1");
    // A Tailwind skálája: p-0.5 = 0,125rem, p-1 = 0,25rem — a levonás ezzel egyezik.
    expect(SZEGMENS_PADDING_REM.sm).toBe(0.125);
    expect(SZEGMENS_PADDING_REM.md).toBe(0.25);
  });

  it("nem lép ki a tartományból hibás bemenetre sem", () => {
    // 0 szegmens → 0-val osztás, `calc(… / 0)` NaN, amit a böngésző CSENDBEN
    // eldob: a kapszula eltűnne, hibaüzenet nélkül.
    expect(szegmensGeometria(0, 0, "md").width).toContain("/ 1)");
    expect(szegmensGeometria(3, 99, "md").transform).toBe("translateX(200%)");
    expect(szegmensGeometria(3, -5, "md").transform).toBe("translateX(0%)");
  });
});

describe("elrendezés", () => {
  it("⚠️ GRID, nem FLEX — különben `fill={false}` esetén elcsúszik", () => {
    // A `flex-1` csak teljes szélességű konténerben ad egyenlő szegmenseket.
    // Tartalom-szélességű változatban a feliratok hossza szerint méreteződne,
    // a kapszula viszont továbbra is index×100%-ra ugrana.
    expect(KOD).toContain("grid-flow-col");
    expect(KOD).toContain("auto-cols-fr");
    expect(KOD, "flex-1 visszacsúszott a szegmensekre").not.toContain("flex-1");
  });

  it("⚠️ NINCS gap a konténeren", () => {
    // A gap a szegmens-szélességbe nem számít bele, a kapszula eltolása viszont
    // a saját szélességének a többszöröse — n>2-nél fokozatosan elcsúsznának.
    const kontener = KOD.slice(KOD.indexOf('role="tablist"'), KOD.indexOf("kinti-seg-thumb"));
    expect(kontener).not.toMatch(/\bgap-\d/);
  });

  it("a felirat a kapszula FÖLÖTT ül", () => {
    expect(KOD).toContain("relative z-[1]");
  });
});

describe("mozgás", () => {
  it("a kapszula rugóval csúszik", () => {
    const blokk = CSS.slice(CSS.indexOf(".kinti-seg-thumb {"), CSS.indexOf(".kinti-seg-thumb {") + 200);
    expect(blokk).toContain("var(--kinti-spring-pop)");
  });

  it("van reduced-motion ág", () => {
    const i = CSS.indexOf(".kinti-seg-thumb {");
    expect(CSS.slice(i, i + 400)).toContain("prefers-reduced-motion");
  });
});

describe("akadálymentesség", () => {
  it("roving tabindex (a Tab a vezérlőre lép, a nyilak lépkednek benne)", () => {
    expect(KOD).toMatch(/tabIndex=\{aktiv \? 0 : -1\}/);
    expect(KOD).toContain("ArrowRight");
    expect(KOD).toContain("ArrowLeft");
    expect(KOD).toContain('e.key === "Home"');
    expect(KOD).toContain('e.key === "End"');
  });

  it("a fókusz követi a kijelölést", () => {
    // Enélkül a képernyőolvasó a régi fülön marad, miközben a nézet váltott.
    expect(KOD).toMatch(/gombok\?\.\[uj\]\?\.focus\(\)/);
  });

  it("a kapszula aria-rejtett (az állapotot az aria-selected hordozza)", () => {
    const thumb = KOD.slice(KOD.indexOf("kinti-seg-thumb") - 200, KOD.indexOf("kinti-seg-thumb"));
    expect(thumb).toContain("aria-hidden");
    expect(KOD).toContain("aria-selected={aktiv}");
  });

  it("ugyanarra a fülre koppintás nem vált ki visszajelzést", () => {
    expect(KOD).toMatch(/if \(id === value\) return;/);
  });
});

describe("nincs ad-hoc fül-váltó", () => {
  /**
   * ⚠️ REGRESSZIÓS ŐR. Három külön, kézzel írt `role="tablist"` blokk élt a
   * repóban, ugyanazzal a stílussal, mind csúszó kapszula nélkül. Ha egy
   * negyedik születik, ez elbukik, és nem kell észrevenni.
   */
  it("minden tablist a közös komponensből jön", () => {
    const fajlok = globSync("src/**/*.tsx", { cwd: GYOKER }).map((f) => f.replace(/\\/g, "/"));
    const vetkesek: string[] = [];
    for (const f of fajlok) {
      if (f.endsWith("ui/segmented-control.tsx")) continue;
      const src = readFileSync(resolve(GYOKER, f), "utf8");
      if (/role="tablist"/.test(src)) vetkesek.push(f);
    }
    expect(vetkesek, `használd a SegmentedControl-t: ${vetkesek.join(", ")}`).toEqual([]);
  });

  it("a három korábbi hívóhely tényleg átállt", () => {
    for (const p of [
      "src/app/(app)/piacter/piacter-tabs.tsx",
      "src/components/views/explore-view.tsx",
      "src/app/(app)/tudasbazis/kikoltozes/page.tsx",
    ]) {
      expect(readFileSync(resolve(GYOKER, p), "utf8"), p).toContain("SegmentedControl");
    }
  });
});

describe("szűk hely három szegmenstől", () => {
  /**
   * ⚠️ MÉRT HIBÁBÓL. A Piactéren a „Lakbér-kalkulátor" felirat 24 px-szel
   * lógott ki a szegmensből (élesben, 390 px-es nézet), tehát
   * „Lakbér-kalkulá…"-ként jelent meg. 390 px-en három szegmensre 121 px jut,
   * mínusz 16 px belső padding = 105 px a feliratnak; az ikon + köz ebből 19-et
   * visz el, a 12,5 px-es félkövér felirat 17 karakteren ~110 px.
   */
  it("háromtól elmarad az ikon (19 px-et szabadít fel)", () => {
    expect(KOD).toMatch(/const szuk = options\.length >= 3/);
    expect(KOD).toMatch(/\{o\.icon && !szuk &&/);
  });

  it("háromtól kisebb a betű", () => {
    expect(KOD).toMatch(/szuk \? "text-\[11\.5px\]" : "text-\[12\.5px\]"/);
  });

  it("a `truncate` MEGMARAD biztonsági hálónak", () => {
    // A számítás egy adott képernyőre igaz; egy hosszabb felirat vagy egy
    // negyedik szegmens újra szűkös lehet — akkor csúnyán levágódjon, ne
    // lógjon ki.
    expect(KOD).toContain('className="truncate"');
  });

  it("a felirathoz NEM nyúlunk (az tartalmi döntés)", () => {
    const src = readFileSync(
      resolve(GYOKER, "src/app/(app)/piacter/piacter-tabs.tsx"),
      "utf8",
    );
    expect(src).toContain("Lakbér-kalkulátor");
  });
});
