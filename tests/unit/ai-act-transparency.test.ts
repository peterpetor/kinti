import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * EU AI Act 50. cikk (átláthatóság) őre — 2026-08-02-től alkalmazandó.
 *
 * Két konkrét hiányosságot rögzít, amit a 2026-08-03-i átvizsgálás talált:
 *
 * 1. ⚠️ 50. cikk (1) — CHATBOT-TÁJÉKOZTATÁS IDŐZÍTÉSE. Az „AI-alapú
 *    asszisztens" mondat korábban CSAK az első válasz mellett jelent meg, azaz
 *    a user már elküldte a kérdését, mire megtudta, hogy géppel beszél. A
 *    jelzésnek MÁR A BEVITELNÉL látszania kell.
 *
 * 2. ⚠️ AZ ÁTLÁTHATÓSÁGI LAP PONTOSSÁGA. A lap azt állította, hogy a „Napi szó"
 *    kiejtését „Beszédszintézis-modell (Cloudflare Workers AI)" készíti — a kód
 *    viszont a BÖNGÉSZŐ beépített `speechSynthesis`-ét hívja, szerverhívás és
 *    AI-modell nélkül. A túlzó állítás ugyanúgy pontatlan tájékoztatás, mint a
 *    hiányzó.
 */
const ASSISTANT = readFileSync(resolve(process.cwd(), "src/components/kinti-assistant.tsx"), "utf8");
const TRANSPARENCY = readFileSync(
  resolve(process.cwd(), "src/app/(app)/ai-atlathatosag/ai-atlathatosag-body.tsx"),
  "utf8",
);
const NAPI_SZO = readFileSync(resolve(process.cwd(), "src/components/napi-szo-card.tsx"), "utf8");

describe("AI Act 50. cikk — átláthatóság", () => {
  it("az asszisztens MÁR A BEVITELNÉL jelzi, hogy AI (nem csak a válasz mellett)", () => {
    const urlapVege = ASSISTANT.indexOf("</form>");
    const elsoEredmenyBlokk = ASSISTANT.indexOf("{result && (");
    expect(urlapVege, "nem található a beviteli űrlap").toBeGreaterThan(0);
    expect(elsoEredmenyBlokk, "nem található az eredmény-blokk").toBeGreaterThan(urlapVege);

    // Az űrlap ÉS az eredmény-blokk KÖZÖTT kell lennie AI-jelzésnek.
    const kozotte = ASSISTANT.slice(urlapVege, elsoEredmenyBlokk);
    expect(kozotte).toMatch(/[Mm]esterséges intelligencia/);
    expect(kozotte, "a jelzésből vezessen link az átláthatósági lapra").toContain("/ai-atlathatosag");
  });

  it("⚠️ az átláthatósági lap NEM állít AI-modellt a böngésző-alapú kiejtésre", () => {
    // A kód tényleg a böngésző TTS-ét használja:
    expect(NAPI_SZO).toMatch(/speechSynthesis/);
    // …ezért a lap nem mondhatja rá, hogy Cloudflare Workers AI:
    const hangBlokkok = [...TRANSPARENCY.matchAll(/emoji: "🔊",[\s\S]{0,600}?\},/g)].map((m) => m[0]);
    expect(hangBlokkok.length, "nem található a kiejtés-blokk").toBeGreaterThanOrEqual(3);
    for (const b of hangBlokkok) {
      expect(b, `a kiejtésnél nem szabad AI-modellt állítani:\n${b}`).not.toMatch(/Workers AI/);
    }
  });

  it("minden AI-funkció fel van sorolva mindhárom nyelven", () => {
    for (const lang of ["hu:", "de:", "en:"]) {
      expect(TRANSPARENCY, `hiányzó nyelv az átláthatósági lapon: ${lang}`).toContain(lang);
    }
  });
});
