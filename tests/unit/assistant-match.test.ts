import { describe, it, expect } from "vitest";
import { scoreGuides, GUIDE_MIN_SCORE } from "@/lib/assistant-match";

const GUIDES = [
  { slug: "lakberles-jogok", title: "Lakásbérlés és a bérlő jogai", summary: "Kaució, felmondás, javítási kötelezettség — ki fizeti a csőtörést?" },
  { slug: "adobevallas-alapok", title: "Adóbevallás lépésről lépésre", summary: "Határidők, nyomtatványok, visszatérítés." },
  { slug: "at-iskola", title: "Iskolarendszer Ausztriában", summary: "Beiratkozás, tanév, iskolatípusok." },
];

describe("assistant-match", () => {
  it("cím-találat a legerősebb, releváns cikk az első", () => {
    const hits = scoreGuides("hogyan működik az adóbevallás?", GUIDES);
    expect(hits[0]?.slug).toBe("adobevallas-alapok");
  });

  it("összefoglaló-találat is elég (csőtörés → lakásbérlés-cikk)", () => {
    const hits = scoreGuides("csőtörés van a lakásban, ki fizeti a javítást?", GUIDES);
    expect(hits.map((h) => h.slug)).toContain("lakberles-jogok");
  });

  it("irreleváns kérdés → üres (nem erőltetünk találatot)", () => {
    expect(scoreGuides("mennyibe kerül egy kutya oltása?", GUIDES)).toEqual([]);
  });

  it("zaj-szavak önmagukban nem adnak találatot", () => {
    expect(scoreGuides("hogyan kell mit csinálni?", GUIDES)).toEqual([]);
  });

  it("küszöb: a MIN_SCORE alatti pont nem találat", () => {
    // 'tanev' csak a summary-ben (1 pont) — a küszöb (3) alatt marad.
    expect(GUIDE_MIN_SCORE).toBeGreaterThan(1);
    expect(scoreGuides("tanév", GUIDES)).toEqual([]);
  });
});
