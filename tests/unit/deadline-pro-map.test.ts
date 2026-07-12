import { describe, it, expect } from "vitest";
import {
  pickDeadlineTopic,
  DEADLINE_TOPICS,
  WINDOW_BEFORE_DAYS,
  WINDOW_AFTER_DAYS,
} from "@/lib/deadline-pro-map";

describe("deadline-pro-map", () => {
  it("adó-témájú határidőre könyvelő/adótanácsadó párt ad", () => {
    const r = pickDeadlineTopic([{ title: "Adóbevallás (Steuererklärung)", daysLeft: 14 }]);
    expect(r?.topic.cats).toContain("konyveles");
    expect(r?.topic.cats).toContain("adotanacsado");
  });

  it("a 4 ország sablon-címei közül az adósak mind illeszkednek", () => {
    const taxTitles = [
      "Adóbevallás (Steuererklärung)",       // CH
      "Arbeitnehmerveranlagung (adó)",        // AT
      "Steuererklärung (adóbevallás)",        // DE
      "Belastingaangifte (adóbevallás)",      // NL
    ];
    for (const title of taxTitles) {
      expect(pickDeadlineTopic([{ title, daysLeft: 10 }])?.topic.cats).toContain("konyveles");
    }
  });

  it("engedély-témára ügyvédet ajánl (sablon + kézi cím)", () => {
    for (const title of [
      "Tartózkodási engedély megújítása (B/L)",
      "Aufenthaltstitel megújítása",
      "Verblijfsvergunning megújítása",
    ]) {
      expect(pickDeadlineTopic([{ title, daysLeft: 30 }])?.topic.cats).toEqual(["ugyved"]);
    }
  });

  it("nem-párosított téma (biztosítás, autó) → null (nem erőltetünk)", () => {
    expect(
      pickDeadlineTopic([
        { title: "Krankenkasse-váltás határideje", daysLeft: 5 },
        { title: "TÜV (műszaki) / KFZ-biztosítás", daysLeft: 3 },
      ]),
    ).toBeNull();
  });

  it("az ablakon kívüli határidő nem triggerel", () => {
    expect(
      pickDeadlineTopic([{ title: "Adóbevallás", daysLeft: WINDOW_BEFORE_DAYS + 1 }]),
    ).toBeNull();
    expect(
      pickDeadlineTopic([{ title: "Adóbevallás", daysLeft: -(WINDOW_AFTER_DAYS + 1) }]),
    ).toBeNull();
  });

  it("röviddel lejárt adó-határidő MÉG triggerel (pont ilyenkor kell a könyvelő)", () => {
    expect(pickDeadlineTopic([{ title: "Adóbevallás", daysLeft: -3 }])).not.toBeNull();
  });

  it("több illő közül a legsürgősebbet választja", () => {
    const r = pickDeadlineTopic([
      { title: "Adóbevallás", daysLeft: 40 },
      { title: "Aufenthaltstitel megújítása", daysLeft: 6 },
    ]);
    expect(r?.deadline.daysLeft).toBe(6);
    expect(r?.topic.cats).toEqual(["ugyved"]);
  });

  it("a kurált párok kategória-id-i validak (az ajanlo API CAT_RE-je)", () => {
    for (const t of DEADLINE_TOPICS) {
      expect(t.cats.length).toBeGreaterThan(0);
      expect(t.cats.length).toBeLessThanOrEqual(4); // az ajanlo API cats-plafonja
      for (const c of t.cats) expect(c).toMatch(/^[a-z0-9_]{1,64}$/);
      expect(t.lead.length).toBeGreaterThan(10);
    }
  });
});
