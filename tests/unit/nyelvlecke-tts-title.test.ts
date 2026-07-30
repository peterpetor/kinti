import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { COUNTRIES } from "@/lib/countries";
import {
  isHungarianLessonText,
  lessonTtsLang,
  promptAsksForMeaning,
} from "@/lib/lesson-tts";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

/**
 * ⚠️ KÉT USER-BEJELENTÉS (2026-07-30, képernyőképpel):
 *   1. „Itt vagyok a spanyol nyelvleckén és Schwyzerdütsch ír ki."
 *   2. „Az angolon amikor felolvassa a magyar szöveget angolul, az nagyon rossz."
 */

describe("nyelvlecke: kurzus-cím országonként", () => {
  const SRC = read("src/app/(app)/nyelvlecke/page.tsx");

  function table(name: string): Record<string, string> {
    // ⚠️ NEM `[^=]*`: a COURSE_LOADER típusa `Record<string, () => Promise<…>>`,
    // és a benne lévő `=>` miatt a nem-egyenlőségjel-osztály korán megáll.
    // Egy soron belül a LEGUTOLSÓ `=` az értékadás.
    const m = new RegExp(`const ${name}[^\\n]*=\\s*\\{([\\s\\S]*?)\\n\\};`).exec(SRC);
    expect(m, `nem találom a ${name} táblát`).not.toBeNull();
    const out: Record<string, string> = {};
    for (const g of m![1].matchAll(/([A-Z]{2}):\s*(?:"([^"]*)"|\(\))/g)) {
      out[g[1]] = g[2] ?? "loader";
    }
    return out;
  }

  it("⚠️ MIND a hat országnak van saját kurzus-neve", () => {
    const titles = table("COURSE_TITLE");
    for (const c of COUNTRIES) {
      expect(titles[c.code], `${c.code} (${c.name}): nincs kurzus-név`).toBeTruthy();
    }
  });

  /**
   * ⚠️ EZ VOLT A HIBA: a spanyol leckén „Schwyzerdütsch" állt, mert a cím egy
   * ternárius-lánc volt, aminek a VÉGÉN a svájci név szerepelt — a hatodik
   * ország csendben odaesett. A tartalom közben helyesen spanyol volt, ezért
   * ránézésre nem tűnt fel.
   */
  it("⚠️ a svájci kurzus-név CSAK Svájchoz tartozik", () => {
    const titles = table("COURSE_TITLE");
    for (const [cc, title] of Object.entries(titles)) {
      expect(title === "Schwyzerdütsch", `${cc}: „${title}"`).toBe(cc === "CH");
    }
  });

  it("minden ország kurzus-neve KÜLÖNBÖZŐ (nincs átvett név)", () => {
    const titles = Object.values(table("COURSE_TITLE"));
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("⚠️ MIND a hat országnak van adat-betöltője, és tábla dönt (nem lánc)", () => {
    const loaders = table("COURSE_LOADER");
    for (const c of COUNTRIES) {
      expect(loaders[c.code], `${c.code}: nincs kurzus-betöltő`).toBeTruthy();
    }
    expect(SRC, "visszakerült a ternárius ország-lánc").not.toMatch(/country === "AT"\s*\n?\s*\?/);
  });
});

describe("nyelvlecke: felolvasás nyelve", () => {
  /**
   * ⚠️ A VALÓS ADATBÓL VETT ESETEK. Ezek nem kitalált példák: a hat kurzus
   * 659 felelet-választós kérdésének átvizsgálásából jöttek, és mindegyik egy
   * külön csapdát képvisel.
   */
  const HUNGARIAN: [string, string][] = [
    // „Mit jelent" kérdés → az opciók a JELENTÉST adják, tehát magyarok.
    // Ezeken nincs semmilyen tipográfiai jel, csak a kérdés szerkezete árulja el.
    ["Nem vagyok biztos benne", "Mit jelent: 'I'm not sure'?"],
    ["két hét", "Mit jelent: 'a fortnight'?"],
    ["Ablak", "Mit jelent a 'Fäster' szó?"],
    ["Ti is jöttök?", "Mit jelent: 'Chömed ihr au?'"],
    // Magyar meta-válasz CÉLNYELVI opciók MELLETT — ezért kell opció-szintű döntés.
    ["Mindkettő tökéletes", "Hogyan köszönöd meg a visszajárót?"],
    ["Egyik sem", "Melyik a helyes?"],
    // ő/ű: a szóba jövő nyelvek közül csak a magyarban van.
    ["Szőnyeg", "Melyik a helyes?"],
  ];

  const FOREIGN: [string, string][] = [
    // „Hogy mondod" → célnyelvi opciók.
    ["What's your name?", "Hogy kérdezed udvariasan: 'Hogy hívnak?'"],
    ["Take care", "Melyik a leghétköznapibb brit búcsúzás?"],
    ["Parkplatz", "Hogy mondják a 'parkolóhely' szót?"],
    ["Buenos días", "Hogy köszönsz délelőtt?"],
    ["Hasta luego", "Hogy búcsúzol?"],
    // ⚠️ A LEGFONTOSABB CSAPDA: „Mit mondasz, ha…" az ELLENKEZŐ irány —
    // a válasz CÉLNYELVI. Az első regexem ezt is beszippantotta.
    ["Das isch mir Wurscht", "Mit mondasz, ha valami egyáltalán nem érdekel (szlengben)?"],
    ["Ich ha en mega Chater", "Mit mondasz, ha fáj a fejed a buli után?"],
    ["D Suppe isch z chalt", "Mit mondasz, ha a leves túl hideg?"],
  ];

  it.each(HUNGARIAN)("MAGYAR: %s", (text, prompt) => {
    expect(isHungarianLessonText(text, prompt)).toBe(true);
    expect(lessonTtsLang(text, prompt, "en-GB")).toBe("hu-HU");
  });

  it.each(FOREIGN)("CÉLNYELVI: %s", (text, prompt) => {
    expect(isHungarianLessonText(text, prompt)).toBe(false);
  });

  it("a célnyelvi szöveg a kurzus nyelvét kapja, nem magyart", () => {
    expect(lessonTtsLang("Take care", "Melyik a helyes?", "en-GB")).toBe("en-GB");
    expect(lessonTtsLang("Buenos días", "Hogy köszönsz?", "es-ES")).toBe("es-ES");
    expect(lessonTtsLang("Grüezi", "Hogy köszönsz?", "de-CH")).toBe("de-CH");
  });

  /**
   * ⚠️ A VÉTÓ ERŐSEBB A SZERKEZETI JELNÉL. Ha egy „Mit jelent" kérdés opciója
   * mégis célnyelvi jelzőt tartalmaz, akkor NEM magyarnak vesszük — inkább
   * maradjon a mai viselkedés, mint hogy célnyelvi szöveget olvassunk fel
   * magyar hanggal.
   */
  it("⚠️ a célnyelvi jelző LEGYŐZI a „Mit jelent” szerkezeti jelet", () => {
    expect(isHungarianLessonText("Ich bin müde", "Mit jelent: 'X'?")).toBe(false);
    expect(isHungarianLessonText("¿Qué tal?", "Mit jelent: 'X'?")).toBe(false);
    expect(isHungarianLessonText("het huis", "Mit jelent: 'X'?")).toBe(false);
  });

  /**
   * ⚠️ A VÉTÓ-LISTÁBAN NEM LEHET OLYAN SZÓ, AMI MAGYARBAN IS LÉTEZIK. Az első
   * változatomban bent volt az „is", és ezért a magyar „Ti is jöttök?" opciót
   * idegennek minősítette. Ugyanez a csapda: a, de, van, el, no.
   */
  it("⚠️ a magyar–idegen homonimák NEM vétóznak", () => {
    for (const [text, prompt] of [
      ["Ti is jöttök?", "Mit jelent: 'X'?"],
      ["a piros autó", "Mit jelent: 'X'?"],
      ["de nem tudom", "Mit jelent: 'X'?"],
      ["van egy kérdésem", "Mit jelent: 'X'?"],
      ["el kell menni", "Mit jelent: 'X'?"],
    ] as [string, string][]) {
      expect(isHungarianLessonText(text, prompt), text).toBe(true);
    }
  });

  it("üres szöveg nem magyar (nem is olvasunk fel semmit)", () => {
    expect(isHungarianLessonText("", "Mit jelent: 'X'?")).toBe(false);
    expect(isHungarianLessonText("   ", "Mit jelent: 'X'?")).toBe(false);
  });

  it("a jelentés-kérdés felismerése CSAK a „mit jelent” fordulatra lép", () => {
    expect(promptAsksForMeaning("Mit jelent: 'sorry'?")).toBe(true);
    expect(promptAsksForMeaning("mit jelent a Fäster szó")).toBe(true);
    expect(promptAsksForMeaning("Mit mondasz, ha éhes vagy?")).toBe(false);
    expect(promptAsksForMeaning("Hogy mondod: 'köszönöm'?")).toBe(false);
    expect(promptAsksForMeaning("Melyik a helyes?")).toBe(false);
  });
});

/**
 * ⚠️ A HÍVÓ OLDAL is része a javításnak: a `playAudio`-nak MEG KELL KAPNIA a
 * kérdés szövegét, különben a szerkezeti jel elveszik, és a magyar opciókat
 * megint a célnyelvi hang olvassa fel.
 */
describe("nyelvlecke: a lecke-oldal átadja a kérdés szövegét", () => {
  const SRC = read("src/app/(app)/nyelvlecke/[lessonId]/page.tsx");

  it("⚠️ a playAudio megkapja a question.prompt-ot az opcióknál", () => {
    expect(SRC).toContain("playAudio(opt.text, e, question.prompt)");
  });

  it("a nyelv-döntés a lesson-tts libből jön", () => {
    expect(SRC).toContain("lessonTtsLang");
  });

  /**
   * ⚠️ Ha magyar hangot kértünk, de a készüléken nincs, INKÁBB NE olvassuk fel:
   * egy angol hang szájából a magyar szöveg pont az a „nagyon rossz" élmény,
   * amit ez a javítás megszüntet.
   */
  it("⚠️ magyar hang hiányában NEM olvas fel idegen hanggal", () => {
    expect(SRC).toContain('if (!voice && langPrefix === "hu") return;');
  });
});
