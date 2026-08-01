import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

/**
 * Az ÁFA-állítás őre.
 *
 * ⚠️ A JAVÍTOTT HIBA (2026-08-01, jogi átvizsgálás): a fizetési oldalak azt
 * állították, hogy a feltüntetett ár NETTÓ, és „az ÁFÁ-t a pénztár adja hozzá".
 * ÉLESBEN MÉRVE ez VALÓTLAN — a Paddle-árak ÁFÁ-VAL EGYÜTT vannak beállítva:
 *
 *   DE  subtotal €15.97 + tax €3.03 = total €19.00
 *   AT  subtotal €15.83 + tax €3.17 = total €19.00
 *   NL  subtotal €15.70 + tax €3.30 = total €19.00
 *   CH  subtotal €17.58 + tax €1.42 = total €19.00
 *   (állás-kiemelés: €41.18 + €7.82 = €49.00)
 *
 * Vagyis a kijelzett összeg a VÉGÖSSZEG. A régi szöveg drágábbnak mutatta a
 * terméket, mint amennyi — és fogyasztónak amúgy is a végső, ÁFÁ-s árat kell
 * feltüntetni (uniós ár-feltüntetési szabály).
 *
 * ⚠️ HA A PADDLE-BEÁLLÍTÁS VALAHA NETTÓ-ALAPÚRA VÁLT, ez a teszt NEM veszi
 * észre — akkor a SZÖVEGET is vissza kell írni. A Paddle-oldali beállítás és
 * ez a szöveg együtt mozog.
 */
const SRC = resolve(process.cwd(), "src");

function tsx(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) tsx(p, out);
    else if (e.endsWith(".tsx")) out.push(p);
  }
  return out;
}

/** Olyan állítások, amik szerint az ÁFA a feltüntetett ÁRON FELÜL jön. */
const HAMIS_ALLITAS = [
  /Nett[óo] [áa]r\b/i,
  /[ÁA]FA n[ée]lk[üu]l/i,
  /[ÁA]F[ÁA]-t a p[ée]nzt[áa]r/i,
  /Nettopreis/i,
  /ohne MwSt/i,
  /\bNet price\b/i,
  /excl\.?\s*VAT/i,
];

describe("ár-feltüntetés — az ÁFA BENNE van", () => {
  const talalatok: string[] = [];
  for (const f of tsx(SRC)) {
    const lines = readFileSync(f, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      const t = line.trim();
      if (t.startsWith("//") || t.startsWith("*") || t.startsWith("{/*")) return; // komment
      for (const re of HAMIS_ALLITAS) {
        if (re.test(line)) {
          talalatok.push(`${f.replace(SRC, "src").split("\\").join("/")}:${i + 1}  ${t.slice(0, 76)}`);
          break;
        }
      }
    });
  }

  it("egyetlen felület sem állítja, hogy az ÁFA az áron FELÜL jön", () => {
    expect(
      talalatok,
      `A Paddle ÁFÁ-val együtt árazik — ezek a szövegek valótlanok:\n${talalatok.join("\n")}`,
    ).toEqual([]);
  });

  it("a /pro kimondja, hogy az ár tartalmazza az ÁFÁ-t", () => {
    const pro = readFileSync(resolve(SRC, "app/(app)/pro/page.tsx"), "utf8");
    expect(pro).toContain("tartalmazza az ÁFÁ-t");
    expect(pro).toContain("inkl. MwSt");
    expect(pro).toContain("includes VAT");
  });

  it("az automatikus megújulás és az egyszeri díj továbbra is jelölve van", () => {
    // Fogyasztói tájékoztatás: az előfizetés megújul, a kiemelés NEM.
    const pro = readFileSync(resolve(SRC, "app/(app)/pro/page.tsx"), "utf8");
    expect(pro).toContain("Havonta automatikusan megújul");
    expect(pro).toContain("NEM újul meg automatikusan");
  });
});
