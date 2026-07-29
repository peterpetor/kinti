import { describe, it, expect } from "vitest";
import {
  getRoads,
  getSpeedUnit,
  speedUnitLabel,
  calculateFine,
  calculateFineAT,
  calculateFineDE,
  calculateFineNL,
  calculateFineGB,
  calculateFineES,
  ES_PRONTO_PAGO_RATE,
  ES_PRONTO_PAGO_DAYS,
  type RoadType,
} from "@/lib/speeding-fine";
import { COUNTRIES } from "@/lib/countries";
import { isFeatureAvailable } from "@/lib/feature-availability";

const ROAD_TYPES: RoadType[] = ["city", "rural", "highway"];

describe("bírság-becslő — ország-lefedettség", () => {
  it("MINDEN app-országhoz van úttípus-készlet, mindhárom típussal", () => {
    for (const c of COUNTRIES) {
      const roads = getRoads(c.code);
      expect(roads.length, `${c.code}`).toBe(3);
      for (const t of ROAD_TYPES) {
        expect(roads.map((r) => r.type), `${c.code}`).toContain(t);
      }
    }
  });

  it("⚠️ egyik ország sem a SVÁJCI limiteket kapja (a CH kivételével)", () => {
    const swiss = JSON.stringify(getRoads("CH"));
    for (const c of COUNTRIES) {
      if (c.code === "CH") continue;
      expect(JSON.stringify(getRoads(c.code)), `${c.code}`).not.toBe(swiss);
    }
  });

  it("az alapértelmezett limit szerepel a választható limitek között", () => {
    for (const c of COUNTRIES) {
      for (const r of getRoads(c.code)) {
        expect(r.speedLimits, `${c.code}/${r.type}`).toContain(r.defaultSpeedLimit);
      }
    }
  });

  it("a bírság-becslő MINDEN app-országban elérhető", () => {
    for (const c of COUNTRIES) {
      expect(isFeatureAvailable("bussen", c.code), c.code).toBe(true);
    }
  });
});

/**
 * ⚠️ EZ A LEGSÚLYOSABB HIBALEHETŐSÉG EBBEN A MODULBAN.
 *
 * Angliában a táblák, a bírság és a jogszabály MÉRFÖLD/ÓRÁBAN mérnek. Ha a
 * felület „km/h"-t írna a brit 30/60/70 mellé, az számszerűen hamis lenne
 * (30 mph ≈ 48 km/h), és a felhasználó ROSSZ sebességnél hinné magát
 * biztonságban — vagyis a becslő pont az ellenkezőjét érné el a céljának.
 */
describe("⚠️ mértékegység", () => {
  it("CSAK Anglia mérföldes, minden más km/h", () => {
    expect(getSpeedUnit("GB")).toBe("mph");
    expect(speedUnitLabel("GB")).toBe("mph");
    for (const c of COUNTRIES) {
      if (c.code === "GB") continue;
      expect(getSpeedUnit(c.code), c.code).toBe("kmh");
      expect(speedUnitLabel(c.code), c.code).toBe("km/h");
    }
  });

  it("ismeretlen ország km/h-t kap (nem mérföldet)", () => {
    expect(getSpeedUnit("XX")).toBe("kmh");
    expect(getSpeedUnit(null)).toBe("kmh");
  });

  /**
   * ⚠️ A brit limitek MÉRFÖLDBEN értendők, ezért SZÁMSZERŰEN kisebbek, mint a
   * kontinentálisak. Ha valaki jóhiszeműen „javítaná" őket km/h-ra (70 → 112),
   * a becslő némán hibás lenne — ez a teszt ezt megakadályozza.
   */
  it("a brit limitek a mérföldes értékek (30/60/70), nem km/h-ra váltva", () => {
    const byType = Object.fromEntries(getRoads("GB").map((r) => [r.type, r.defaultSpeedLimit]));
    expect(byType.city).toBe(30);
    expect(byType.rural).toBe(60);
    expect(byType.highway).toBe(70);
  });
});

describe("általános invariánsok mind a hat kalkulátorban", () => {
  const calcs: [string, (i: { roadType: RoadType; speedLimit: number; actualSpeed: number }) => { severity: string; effectiveOverage: number; estimatedFineChf: number }][] = [
    ["CH", (i) => calculateFine({ ...i, monthlyNetIncomeChf: 5500 })],
    ["AT", calculateFineAT],
    ["DE", calculateFineDE],
    ["NL", calculateFineNL],
    ["GB", (i) => calculateFineGB({ ...i, monthlyNetIncome: 2500 })],
    ["ES", calculateFineES],
  ];

  it("limiten belüli sebességre nincs büntetés", () => {
    for (const [cc, calc] of calcs) {
      const r = calc({ roadType: "highway", speedLimit: 70, actualSpeed: 70 });
      expect(r.severity, `${cc}`).toBe("no-fine");
      expect(r.estimatedFineChf, cc).toBe(0);
    }
  });

  it("a tolerancián belüli túllépésre sem jár büntetés", () => {
    for (const [cc, calc] of calcs) {
      const r = calc({ roadType: "city", speedLimit: 30, actualSpeed: 31 });
      expect(r.severity, `${cc}: 1 egység túllépés`).toBe("no-fine");
    }
  });

  it("a hatékony túllépés sosem negatív, és nő a sebességgel", () => {
    for (const [cc, calc] of calcs) {
      let prev = -1;
      for (const speed of [60, 80, 100, 130, 170]) {
        const r = calc({ roadType: "highway", speedLimit: 60, actualSpeed: speed });
        expect(r.effectiveOverage, `${cc}@${speed}`).toBeGreaterThanOrEqual(0);
        expect(r.effectiveOverage, `${cc}@${speed}`).toBeGreaterThanOrEqual(prev);
        prev = r.effectiveOverage;
      }
    }
  });

  it("extrém túllépés a legsúlyosabb sávot adja mindenhol", () => {
    for (const [cc, calc] of calcs) {
      const r = calc({ roadType: "city", speedLimit: 30, actualSpeed: 160 });
      expect(["schwer", "raser"], `${cc}: ${r.severity}`).toContain(r.severity);
    }
  });
});

describe("Anglia — FPN és a Sentencing Council sávjai", () => {
  const gb = (limit: number, speed: number, income = 2600) =>
    calculateFineGB({ roadType: "city", speedLimit: limit, actualSpeed: speed, monthlyNetIncome: income });

  /**
   * ⚠️ EZ A TESZT EGY SAJÁT MODELLEZÉSI HIBÁMAT FOGTA MEG. Az első változat
   * csak a Sentencing Council A/B/C sávjait használta — de azok CSAK a
   * bírósági ügyre vonatkoznak, és a Band A alsó határa (30-as limitnél
   * 31 mph) a tolerancia-küszöb ALATT van. Emiatt a fix bírság (FPN) ága
   * ELÉRHETETLEN volt, pedig a túllépések nagy része pont oda esik.
   * A rendszer kétlépcsős: FPN a limit + 10% + 9 mph-ig, felette bíróság.
   */
  it("⚠️ kis túllépés = fix bírság (FPN), nem bírósági sáv", () => {
    // 30-as limit: tolerancia 35-ig, FPN 36–42, bíróság 43-tól.
    for (const speed of [36, 40, 42]) {
      const r = gb(30, speed);
      expect(r.severity, `${speed} mph`).toBe("ordnungsbusse");
      expect(r.estimatedFineChf, `${speed} mph`).toBe(100);
    }
  });

  it("az FPN felső határa fölött már bírósági sáv jön", () => {
    expect(gb(30, 43).severity).not.toBe("ordnungsbusse");
    // 70-es limitnél az FPN 86-ig tart (70 + 7 + 9).
    const gbMotorway = (speed: number) =>
      calculateFineGB({ roadType: "highway", speedLimit: 70, actualSpeed: speed, monthlyNetIncome: 2600 });
    expect(gbMotorway(86).severity).toBe("ordnungsbusse");
    expect(gbMotorway(87).severity).not.toBe("ordnungsbusse");
  });

  it("az FPN-ág kimondja a tanfolyam-alternatívát (pont nélkül)", () => {
    const note = gb(30, 40).legalNote;
    expect(note).toContain("Speed Awareness Course");
    expect(note).toContain("EGYSZER");
  });

  it("⚠️ a Band C eltiltást ad, nem csak pontot", () => {
    const r = gb(30, 55); // 51+ mph = Band C
    expect(r.severity).toBe("raser");
    expect(r.licenseSuspension).toContain("eltiltás");
  });

  it("a bírósági sávok a HETI jövedelem arányában nőnek", () => {
    const a = gb(30, 38).estimatedFineChf; // Band A (31–40)
    const b = gb(30, 45).estimatedFineChf; // Band B (41–50)
    const c = gb(30, 60).estimatedFineChf; // Band C (51+)
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });

  /**
   * ⚠️ A brit bírságnak TÖRVÉNYI FELSŐ KORLÁTJA van: 1 000 £, autópályán
   * 2 500 £. Enélkül egy magas jövedelmű felhasználónak a becslő
   * fantázia-összeget mutatna.
   */
  it("⚠️ a bírság nem lépi túl a törvényi felső korlátot", () => {
    const rich = calculateFineGB({ roadType: "city", speedLimit: 30, actualSpeed: 60, monthlyNetIncome: 40000 });
    expect(rich.estimatedFineChf).toBeLessThanOrEqual(1000);
    const motorway = calculateFineGB({ roadType: "highway", speedLimit: 70, actualSpeed: 110, monthlyNetIncome: 40000 });
    expect(motorway.estimatedFineChf).toBeLessThanOrEqual(2500);
  });

  it("kimondja a két legfontosabb brit szabályt (14 napos NIP, új vezető 6 pont)", () => {
    const note = gb(30, 45).legalNote;
    expect(note).toContain("14 nap");
    expect(note.toLowerCase()).toContain("új vezető");
  });
});

describe("Spanyolország — DGT sávok, pronto pago és a büntetőjogi határ", () => {
  const es = (roadType: RoadType, limit: number, speed: number) =>
    calculateFineES({ roadType, speedLimit: limit, actualSpeed: speed });

  it("a bírságsávok a hivatalos 100/300/400/500/600 € szintek", () => {
    const seen = new Set<number>();
    for (const speed of [65, 75, 85, 95, 115]) {
      seen.add(es("city", 50, speed).estimatedFineChf);
    }
    for (const v of seen) expect([100, 300, 400, 500, 600]).toContain(v);
  });

  it("a pontlevonás 0/2/4/6 és a bírsággal együtt nő", () => {
    let prevPoints = -1;
    for (const speed of [65, 80, 90, 100, 115]) {
      const r = es("city", 50, speed);
      expect([0, 2, 4, 6]).toContain(r.penaltyPoints);
      expect(r.penaltyPoints).toBeGreaterThanOrEqual(prevPoints);
      prevPoints = r.penaltyPoints;
    }
  });

  /**
   * ⚠️ EZ A LEGHASZNOSABB SPANYOL TUDÁS: 20 napon belüli fizetésnél a bírság
   * FELE. Aki nem tudja, kétszer annyit fizet. A becslő mindkét összeget kiírja.
   */
  it("⚠️ a pronto pago pontosan a bírság felét adja", () => {
    expect(ES_PRONTO_PAGO_RATE).toBe(0.5);
    expect(ES_PRONTO_PAGO_DAYS).toBe(20);
    const r = es("city", 50, 80);
    expect(r.discountedFineEur).toBe(r.estimatedFineChf / 2);
    expect(r.legalNote).toContain("PRONTO PAGO");
  });

  /**
   * ⚠️ BÜNTETŐJOGI HATÁR (Código Penal 379. cikk): városban +60, egyéb úton
   * +80 km/h fölött már BŰNCSELEKMÉNY — börtön/közmunka és KÖTELEZŐ 1–4 év
   * eltiltás. Ha a becslő itt csak bírságot mutatna, súlyosan félrevezetne.
   */
  it("⚠️ városban +60 km/h fölött BŰNCSELEKMÉNY, kötelező eltiltással", () => {
    const r = es("city", 50, 120); // tolerancia után +65
    expect(r.severity).toBe("raser");
    expect(r.prisonInfo, "nincs börtön-információ").toBeTruthy();
    expect(r.licenseSuspension).toContain("1–4 év");
    expect(r.description).toContain("BŰNCSELEKMÉNY");
  });

  it("⚠️ országúton a büntetőjogi határ MAGASABB (+80), nem +60", () => {
    // +65 túllépés: városban már bűncselekmény, országúton még nem.
    const city = es("city", 50, 120);
    const rural = es("rural", 90, 160);
    expect(city.severity).toBe("raser");
    expect(rural.severity).not.toBe("raser");
  });

  it("a bűncselekmény-sávban NINCS pronto pago kedvezmény", () => {
    const r = es("city", 50, 130);
    expect(r.discountedFineEur).toBe(0);
    expect(r.legalNote).toContain("NEM alkalmazható");
  });

  it("a legkisebb sáv pontlevonás NÉLKÜLI (infracción leve)", () => {
    const r = es("city", 50, 65);
    expect(r.penaltyPoints).toBe(0);
    expect(r.estimatedFineChf).toBe(100);
  });

  it("kimondja a fordított pontrendszert (12 ponttal indulsz)", () => {
    expect(es("city", 50, 85).legalNote).toContain("12 pont");
  });
});
