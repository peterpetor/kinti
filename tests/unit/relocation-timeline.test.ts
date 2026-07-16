import { describe, it, expect } from "vitest";
import {
  moveOffsetLabel,
  moveBucket,
  taskDeadline,
  TASK_DEADLINES,
  getPhases,
} from "@/lib/relocation";

describe("moveOffsetLabel — természetes nyelvű T-eltolás", () => {
  it("a költözés napja külön eset", () => {
    expect(moveOffsetLabel(0)).toBe("A költözés napján");
  });
  it("negatív = költözés előtt, abszolút értékkel", () => {
    expect(moveOffsetLabel(-30)).toBe("30 nappal a költözés előtt");
    expect(moveOffsetLabel(-1)).toBe("1 nappal a költözés előtt");
  });
  it("pozitív = költözés után", () => {
    expect(moveOffsetLabel(14)).toBe("14 nappal a költözés után");
  });
});

describe("moveBucket — idővonal-szakaszok határai", () => {
  it("a negatív eltolás a 'költözés előtt' szakaszba esik", () => {
    expect(moveBucket(-90).id).toBe("before");
    expect(moveBucket(-1).id).toBe("before");
  });
  it("0–7 nap az érkezés hete", () => {
    expect(moveBucket(0).id).toBe("arrival");
    expect(moveBucket(7).id).toBe("arrival");
  });
  it("8–30 az első hónap, 31–90 az 1–3 hónap, utána 'később'", () => {
    expect(moveBucket(8).id).toBe("first-month");
    expect(moveBucket(30).id).toBe("first-month");
    expect(moveBucket(31).id).toBe("settle");
    expect(moveBucket(90).id).toBe("settle");
    expect(moveBucket(91).id).toBe("later");
    expect(moveBucket(120).id).toBe("later");
  });
});

describe("idővonal-integritás — minden roadmap-feladatnak van T-eltolása", () => {
  // Az idővonal-nézet CSAK azokat a feladatokat tudja elhelyezni, amelyek
  // szerepelnek a TASK_DEADLINES-ban. Ha egy roadmap-feladat kimarad, az
  // némán eltűnik az idővonalról — ezt a tesztet őrként tartjuk.
  for (const country of ["CH", "AT", "DE"] as const) {
    it(`${country}: minden feladat-id szerepel a TASK_DEADLINES-ban`, () => {
      const ids = getPhases(country).flatMap((p) => p.tasks.map((t) => t.id));
      const missing = ids.filter((id) => !(id in TASK_DEADLINES));
      expect(missing).toEqual([]);
    });
  }
});

describe("taskDeadline — a T-eltolás a költözés dátumához kötődik", () => {
  it("a 'napok a mától' a költözés-dátumtól és az eltolástól függ", () => {
    // Költözés pontosan ma → a T+14-es feladat 14 nap múlva esedékes.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const anyPlus14 = Object.entries(TASK_DEADLINES).find(([, d]) => d.days === 14);
    expect(anyPlus14).toBeTruthy();
    const [id] = anyPlus14!;
    const dl = taskDeadline(id, today);
    expect(dl).not.toBeNull();
    expect(dl!.days).toBe(14);
  });
  it("ismeretlen id vagy hiányzó dátum → null", () => {
    expect(taskDeadline("nincs-ilyen", new Date())).toBeNull();
    expect(taskDeadline("bank", null)).toBeNull();
  });
});
