import { describe, it, expect } from "vitest";
import { isoWeek, pickWeeklyGuides, buildNewsletterText } from "@/lib/newsletter-draft";

describe("isoWeek", () => {
  it("ismert dátumok ISO-hete", () => {
    expect(isoWeek(new Date(Date.UTC(2026, 0, 1)))).toEqual({ year: 2026, week: 1 }); // 2026-01-01 csütörtök
    expect(isoWeek(new Date(Date.UTC(2026, 6, 10)))).toEqual({ year: 2026, week: 28 });
    // Év-átnyúlás: 2027-01-01 péntek → még a 2026-os év 53. hete
    expect(isoWeek(new Date(Date.UTC(2027, 0, 1)))).toEqual({ year: 2026, week: 53 });
  });
});

describe("pickWeeklyGuides", () => {
  it("determinisztikus és hétről hétre változik", () => {
    const a1 = pickWeeklyGuides("DE", 100).map((g) => g.slug);
    const a2 = pickWeeklyGuides("DE", 100).map((g) => g.slug);
    const b = pickWeeklyGuides("DE", 101).map((g) => g.slug);
    expect(a1).toEqual(a2);
    expect(a1).not.toEqual(b);
    expect(a1.length).toBe(2);
  });
});

describe("buildNewsletterText", () => {
  const base = {
    countryCode: "DE",
    countryName: "Németország",
    weekLabel: "2026/28. hét",
    newBusinesses: [{ name: "Kovács Kft.", categoryLabel: "Fodrász" }],
    newBusinessTotal: 3,
    newJobs: [{ title: "Villanyszerelő", location: "München" }],
    guides: [{ title: "Nyugdíj (Rente)", slug: "de-nyugdij" }],
  };

  it("minden szekció megjelenik, adattal", () => {
    const { subject, body } = buildNewsletterText(base);
    expect(subject).toContain("3 új vállalkozás");
    expect(subject).toContain("1 friss állás");
    expect(body).toContain("Kovács Kft. — Fodrász");
    expect(body).toContain("Villanyszerelő — München");
    expect(body).toContain("https://kinti.app/tudasbazis/de-nyugdij");
    // A leiratkozó-linket a küldő-route fűzi hozzá — a vázlatban NEM szerepelhet.
    expect(body).not.toContain("leiratkoz");
  });

  it("üres szekciók kimaradnak, a tárgy alkalmazkodik", () => {
    const { subject, body } = buildNewsletterText({ ...base, newBusinesses: [], newBusinessTotal: 0, newJobs: [] });
    expect(subject).toContain("a hét útmutatói");
    expect(body).not.toContain("ÚJ A SZAKNÉVSORBAN");
    expect(body).not.toContain("FRISS ÁLLÁSOK");
    expect(body).toContain("A HÉT ÚTMUTATÓI");
  });
});
