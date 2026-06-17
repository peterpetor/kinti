import { describe, it, expect } from "vitest";
import {
  heuristicSpamScore,
  SPAM_BLOCK_THRESHOLD,
  SPAM_REVIEW_THRESHOLD,
} from "@/lib/spam-score";

/**
 * A heurisztikus mag tesztjei (AI nélkül). Az `assessSpam` AI-ágát szándékosan
 * nem teszteljük itt — az Workers AI bindinget igényel; a heurisztika a
 * fail-safe alap, és önállóan is véd.
 */
describe("heuristicSpamScore", () => {
  it("üres / nullás bemenet → 0", () => {
    expect(heuristicSpamScore("").score).toBe(0);
    expect(heuristicSpamScore(null).score).toBe(0);
    expect(heuristicSpamScore(undefined).score).toBe(0);
  });

  it("valódi, tiszta magyar vélemény → alacsony (queue-küszöb alatt)", () => {
    const r = heuristicSpamScore(
      "Nagyon kedves volt a fodrász, pontos időpont, tiszta szalon. Mindenkinek ajánlom, legközelebb is hozzá megyek.",
    );
    expect(r.score).toBeLessThan(SPAM_REVIEW_THRESHOLD);
  });

  it("link-farm → magas (blokk-küszöb felett)", () => {
    const r = heuristicSpamScore("Nézd meg: https://olcso-shop.top és www.akcio.online meg bit.ly/xyz123 !!!");
    expect(r.score).toBeGreaterThanOrEqual(SPAM_BLOCK_THRESHOLD);
    expect(r.signals.some((s) => s.startsWith("link"))).toBe(true);
  });

  it("szerencsejáték + ingyen-pénz kulcsszavak → legalább gyanús (queue)", () => {
    const r = heuristicSpamScore("INGYEN PÉNZ a legjobb online casino jackpot oldalon, nyerőgép bónusz!");
    expect(r.score).toBeGreaterThanOrEqual(SPAM_REVIEW_THRESHOLD);
  });

  it("crypto-scam + WhatsApp kontakt-terelés → gyanús sávba esik", () => {
    const r = heuristicSpamScore("Garantált befektetés bitcoin trading, írj WhatsApp +36301234567");
    expect(r.score).toBeGreaterThanOrEqual(SPAM_REVIEW_THRESHOLD);
  });

  it("telefonszám-ledobás önmagában jelez, de nem blokkol", () => {
    const r = heuristicSpamScore("Hívj a +41 79 123 45 67 számon");
    expect(r.signals).toContain("telefonszám");
    expect(r.score).toBeLessThan(SPAM_BLOCK_THRESHOLD);
  });

  it("csupa nagybetűs kiabálás jelet ad", () => {
    const r = heuristicSpamScore("EZ EGY NAGYON HANGOS HIRDETMÉNY MINDENKINEK FIGYELEM");
    expect(r.signals).toContain("csupa-nagybetű");
  });

  it("a pont 0–100 közé van vágva", () => {
    const r = heuristicSpamScore(
      "casino jackpot bitcoin forex viagra ingyen pénz https://a.top www.b.online bit.ly/c +36301112222 !!!!!",
    );
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.score).toBeGreaterThanOrEqual(0);
  });
});
