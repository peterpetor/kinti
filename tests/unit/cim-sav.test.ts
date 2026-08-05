import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Beúszó cím-sáv (ScrollTitleBar) — a nagy cím kigörgésekor egy áttetsző sáv
 * ereszkedik le a lap tetejére.
 *
 * ⚠️ NEM DÍSZÍTÉS, KÉT VALÓS RÉST ZÁR BE (mindkettő az adatlapon a legélesebb,
 * ami az app leghosszabb oldala, és ahová a látogatók java keresőből érkezik):
 *   1) a cím eltűnésével elvész, MELYIK vállalkozásnál járunk;
 *   2) a vissza-gomb a lap tetején ül, tehát pont akkor nem elérhető, amikor a
 *      felhasználó a legmélyebben van a tartalomban.
 */

const GYOKER = resolve(__dirname, "../..");
const olvas = (p: string) => readFileSync(resolve(GYOKER, p), "utf8").replace(/\r\n/g, "\n");
const CSS = olvas("src/app/globals.css");
const SAV = olvas("src/components/ui/scroll-title-bar.tsx");
const FEJLEC = olvas("src/components/ui/headers.tsx");
const ADATLAP = olvas("src/app/(app)/szaknevsor/[id]/page.tsx");

/** Megjegyzések nélküli forrás — a doc-komment épp a tiltott alakokat magyarázza. */
const kodja = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
const SAV_KOD = kodja(SAV);
const FEJLEC_KOD = kodja(FEJLEC);

describe("figyelés", () => {
  it("⚠️ IntersectionObserver, NEM scroll-esemény", () => {
    // A scroll-listener minden képkockán lefut (60–120×/mp) és a fő szálon
    // számol pozíciót; az IO csak a keresztezés pillanatában szól.
    expect(SAV_KOD).toContain("IntersectionObserver");
    expect(SAV_KOD, "scroll-listener csúszott vissza").not.toMatch(
      /addEventListener\(\s*["']scroll["']/,
    );
  });

  it("leiratkozik (különben route-váltásnál szivárog)", () => {
    expect(SAV_KOD).toContain("io.disconnect()");
  });

  it("hiányzó IntersectionObserver esetén nem dob hibát", () => {
    expect(SAV_KOD).toMatch(/typeof IntersectionObserver === "undefined"/);
  });

  it("külön őrszem-elem van, nem magát a címet figyeli", () => {
    // A cím magassága oldalanként más (egy- vagy kétsoros), a küszöb így
    // kiszámíthatatlan lenne.
    expect(SAV_KOD).toContain("orszemRef");
    expect(SAV_KOD).toMatch(/rootMargin/);
  });
});

describe("rejtett állapot", () => {
  it("⚠️ `visibility`, nem csak `opacity`", () => {
    // A puszta `opacity: 0` elem TOVÁBBRA IS fogja a koppintásokat: a
    // felhasználó a lap tetején egy láthatatlan sávra koppintana a tartalom
    // helyett. Ez az a hiba, amit ránézésre nem lehet észrevenni.
    const ki = CSS.slice(CSS.indexOf(".kinti-title-bar-ki {"), CSS.indexOf(".kinti-title-bar-be {"));
    expect(ki).toContain("visibility: hidden");
    expect(ki).toContain("opacity: 0");
  });

  it("a `visibility` átmenete lépcsős, nem fade-el együtt az opacityvel", () => {
    const blokk = CSS.slice(
      CSS.indexOf(".kinti-title-bar {"),
      CSS.indexOf(".kinti-title-bar-ki {"),
    );
    // Késleltetett `visibility` — különben az eltűnés teljes ideje alatt
    // kattintható maradna.
    expect(blokk).toMatch(/visibility 0s linear 0\.\d+s/);
  });

  it("⚠️ NEM `display: none` (az nem animálható)", () => {
    const teljes = CSS.slice(
      CSS.indexOf(".kinti-title-bar {"),
      CSS.indexOf(".kinti-title-bar {") + 1200,
    );
    expect(teljes).not.toContain("display: none");
  });

  it("billentyűzetnek és képernyőolvasónak is rejtett", () => {
    // A cím és a vissza-gomb MÁR ott van a lapon — a sáv csak megismétli.
    expect(SAV_KOD).toMatch(/aria-hidden=\{!latszik \|\| undefined\}/);
    expect(SAV_KOD).toContain("inert");
  });
});

describe("rétegzés", () => {
  it("⚠️ a notch-scrim (z-80) FÖLÖTT, de a toast (z-95) és a dialógus (z-130) ALATT", () => {
    const m = SAV_KOD.match(/z-\[(\d+)\]/);
    expect(m, "nincs explicit z-index a sávon").not.toBeNull();
    const z = Number(m![1]);
    expect(z, "a PWA notch-scrim gradiense a sávra esne").toBeGreaterThan(80);
    expect(z, "a toast a sáv alá kerülne").toBeLessThan(95);
  });

  it("a tartalom-szélességhez igazodik (nem a teljes viewporthoz)", () => {
    expect(SAV_KOD).toContain("max-w-md");
    expect(SAV_KOD).toContain("mx-auto");
  });

  it("a notch alá is benyúlik", () => {
    expect(SAV_KOD).toContain("env(safe-area-inset-top)");
  });
});

describe("üveg-réteg", () => {
  it("⚠️ a sáv TÖMÖREBB üveget kap, mint a TabBar", () => {
    // A 0,5-ös alapérték mellett a mögötte elgörgő tartalom belelógna a betűkbe.
    const blokk = CSS.slice(CSS.indexOf(".kinti-title-bar {"), CSS.indexOf(".kinti-title-bar-ki"));
    const m = blokk.match(/--glass-a:\s*([\d.]+)/);
    expect(m, "a sáv nem írja felül az üveg átlátszóságát").not.toBeNull();
    expect(Number(m![1])).toBeGreaterThan(0.5);
  });

  it("a `.glass` felülírható változóval dolgozik", () => {
    // Layer-független: a `.glass` a components layerben él, egy base-layerbeli
    // háttér-felülírás nem tudná legyőzni.
    expect(CSS).toMatch(/\.glass\s*\{[\s\S]{0,160}var\(--glass-a, 0\.5\)/);
  });

  it("a homályosítás megmarad (az átlátszóság önmagában csak halványítana)", () => {
    expect(CSS).toMatch(/\.glass\s*\{[\s\S]{0,120}backdrop-blur/);
    expect(SAV_KOD).toContain("glass");
  });
});

describe("mozgás", () => {
  it("rugóval ereszkedik le", () => {
    const blokk = CSS.slice(CSS.indexOf(".kinti-title-bar {"), CSS.indexOf(".kinti-title-bar-ki"));
    expect(blokk).toContain("var(--kinti-spring)");
  });

  it("van reduced-motion ág, és ott nincs elmozdulás", () => {
    const i = CSS.indexOf(".kinti-title-bar-be {");
    const utana = CSS.slice(i, i + 500);
    expect(utana).toContain("prefers-reduced-motion");
    expect(utana).toMatch(/transform:\s*none/);
  });
});

describe("a ScreenHeader szabálya", () => {
  it("⚠️ a sáv CSAK al-oldalon jelenik meg (szimmetrikus a menü-szabállyal)", () => {
    // Root-oldalon a navigációt a TabBar adja, a cím pedig görgetés közben nem
    // hordoz információt — ott a sáv csak elvenné a képernyő tetejét.
    expect(FEJLEC_KOD).toMatch(/const sav = stickyTitle \?\? Boolean\(back\)/);
    expect(FEJLEC_KOD).toMatch(/if \(!sav\) return header;/);
  });

  it("⚠️ a menü NEM kerül a sávba", () => {
    // Két DropdownMenu-példány két külön nyitott állapotot és két
    // billentyű-figyelőt jelentene ugyanarra a parancsra.
    const savBlokk = FEJLEC_KOD.slice(FEJLEC_KOD.indexOf("<ScrollTitleBar"));
    expect(savBlokk).not.toContain("DropdownMenu");
    expect(savBlokk).toContain("actions={back}");
  });

  it("felülbírálható propal", () => {
    expect(FEJLEC_KOD).toContain("stickyTitle");
  });
});

describe("adatlap", () => {
  it("a szaknévsor-adatlap saját sávot kapott", () => {
    expect(ADATLAP).toContain("ScrollTitleBar");
    expect(ADATLAP).toContain("title={b.name}");
  });

  it("⚠️ a visszaút FIX cél, nem böngésző-előzmény", () => {
    // Mély-linkkel (keresőből) érkezőnél nincs értelmes előzmény, a
    // `router.back()` a keresőbe dobná vissza.
    const blokk = ADATLAP.slice(ADATLAP.indexOf("<ScrollTitleBar"), ADATLAP.indexOf("<ScrollTitleBar") + 700);
    expect(blokk).toContain('href="/szaknevsor"');
    expect(blokk).toMatch(/aria-label="Vissza/);
  });
});
