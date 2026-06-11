import { describe, it, expect } from "vitest";
import { blackWorkSignal, hasBlackWorkSignal } from "@/lib/job-screening";

describe("blackWorkSignal", () => {
  it("tiszta, legális hirdetés → nincs jel", () => {
    expect(blackWorkSignal("Pincért keresünk teljes munkaidőben, bejelentett állás, AHV.")).toBeNull();
    expect(hasBlackWorkSignal("Takarító kolléga, kollektív szerződés szerint.")).toBe(false);
  });

  it("magyar feketemunka-megfogalmazás → jel", () => {
    expect(hasBlackWorkSignal("Fizetés feketén, kézbe.")).toBe(true);
    expect(hasBlackWorkSignal("Bejelentés nélkül is lehet dolgozni.")).toBe(true);
  });

  it("ékezet-érzéketlen (feketén ≈ feketen)", () => {
    expect(hasBlackWorkSignal("FEKETÉN fizetünk")).toBe(true);
  });

  it("német Schwarzarbeit-jelek → jel", () => {
    expect(hasBlackWorkSignal("Arbeit ohne Anmeldung möglich")).toBe(true);
    expect(hasBlackWorkSignal("Bar auf die Hand, schwarz bezahlt")).toBe(true);
  });

  it("angol jelek → jel", () => {
    expect(hasBlackWorkSignal("Cash in hand, no papers needed")).toBe(true);
  });

  it("üres/null input → nincs jel", () => {
    expect(blackWorkSignal("")).toBeNull();
    expect(blackWorkSignal(null)).toBeNull();
    expect(blackWorkSignal(undefined)).toBeNull();
  });
});
