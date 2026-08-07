import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * A 2026-08-07-i kisipari bővítés adat-őrei.
 *
 * ⚠️ MIÉRT KELL: a szaknévsor fehérgalléros-torz volt (orvos 311, ügyvéd 182),
 * miközben TIZENHAT mindennapi kisipari kategória NULLÁN állt — tetőfedő,
 * burkoló, parkettás, taxis, kárpitos, temetkezés, ékszerész, kerékpárszerviz,
 * gipszkartonos, házmester. Ez a kör ezeket töltötte fel.
 *
 * A tesztek nem a SORSZÁMOT őrzik (az élő adat változik), hanem a seed-fájl
 * azon tulajdonságait, amelyek egy későbbi, jóhiszemű bővítésnél csendben
 * elromolhatnak.
 */

const GYOKER = resolve(__dirname, "../..");
const olvas = (p: string) => readFileSync(resolve(GYOKER, p), "utf8").replace(/\r\n/g, "\n");

/** A kör három seed-fájlja: Németország, Svájc, Ausztria. */
const FAJLOK = {
  DE: "db/de-kisipar-2026-08-07.sql",
  CH: "db/ch-kisipar-2026-08-07.sql",
  AT: "db/at-kisipar-2026-08-07.sql",
  DE2: "db/de-kisipar-11880-2026-08-07.sql",
} as const;
/** Melyik fájl melyik országkódot használja (a DE2 is német). */
const ORSZAG: Record<string, string> = { DE: "DE", CH: "CH", AT: "AT", DE2: "DE" };

const SQL = olvas(FAJLOK.DE);
/** Csak az INSERT-sorok — a fejléc-komment szándékosan leírja a módszertant. */
const SOROK = SQL.split("\n").filter((s) => s.startsWith("('"));
/** Mindhárom fájl összes adatsora, országkóddal együtt. */
const MIND = Object.entries(FAJLOK).flatMap(([cc, p]) =>
  olvas(p)
    .split("\n")
    .filter((s) => s.startsWith("('"))
    .map((sor) => ({ cc, sor, fajl: p })),
);

describe("kisipari seed — adat-alak", () => {
  it("minden sor a német országkódot és egy tartomány-kódot kap", () => {
    // ⚠️ A canton_code hiánya a régiószűrőben NÉMÁN elnyelné a tételt.
    expect(SOROK.length).toBeGreaterThanOrEqual(50);
    const rossz = SOROK.filter((s) => !/'DE', '[A-Z]{2}'\)$/.test(s.trim()));
    expect(rossz, `tartomány-kód nélküli sor:\n${rossz.join("\n").slice(0, 400)}`).toEqual([]);
  });

  it("⚠️ MINDEN tételnek van telefonszáma — elérhetőség nélkül zsákutca", () => {
    // A tölcsér-mérés szerint a szakadék a kapcsolatfelvételnél van; egy
    // elérhetőség nélküli adatlap pont ott állítja meg a felhasználót.
    const uresTel = SOROK.filter((s) => /,\s*'',\s*'/.test(s));
    expect(uresTel, "telefon nélküli tétel került a seedbe").toEqual([]);
  });

  it("koordináta minden sorban van, és Németország befoglaló dobozában", () => {
    for (const s of SOROK) {
      const m = s.match(/,\s*(4[7-9]\.\d+|5[0-5]\.\d+),\s*(-?\d+\.\d+),\s*50,\s*50,/);
      expect(m, `hiányzó vagy Németországon kívüli koordináta: ${s.slice(0, 70)}`).not.toBeNull();
      const lng = Number(m![2]);
      expect(lng).toBeGreaterThan(5.8);
      expect(lng).toBeLessThan(15.1);
    }
  });
});

describe("⚠️ blurb = PUBLIKUS szöveg", () => {
  /**
   * ⚠️ A blurb a felhasználónak megjelenő mondat. TILOS benne:
   *  - a seed-módszertan („a Google Maps szerint”, „a cégjegyzékből”),
   *  - IDEGEN pontszám vagy értékelés („5,0 csillag”, „4.7”),
   *  - bármi, ami magyar nyelvű kiszolgálást ÁLLÍT, mert azt nem ellenőriztük.
   * Ld. blurb-public-text-rules — egyszer 13 tételt kellett kitakarítani.
   */
  const blurbok = SOROK.map((s) => (s.match(/, '([^']*környékén\.)'/) || [])[1]).filter(Boolean);

  it("minden sorból kiolvasható a blurb (a minta nem romlott el)", () => {
    expect(blurbok.length).toBe(SOROK.length);
  });

  it("nincs benne idegen pontszám vagy értékelés", () => {
    for (const b of blurbok) {
      expect(b, `pontszám a blurb-ben: ${b}`).not.toMatch(/\d[.,]\d\s*(csillag|star)|értékelés|vélemény/i);
    }
  });

  it("nincs benne seed-módszertan", () => {
    for (const b of blurbok) {
      expect(b, `módszertan a blurb-ben: ${b}`).not.toMatch(
        /google|maps|cégjegyzék|aranyoldal|gelbeseiten|keres[őo]sz[óo]|adatbázis/i,
      );
    }
  });

  it("⚠️ NEM állítja, hogy magyarul beszélnek — ez nincs ellenőrizve", () => {
    // A bizonyíték csak ennyi: magyar vezetéknév + magyar keresztnév egy német
    // cégjegyzékben, plusz élő Google Maps-tétel. Ez erős valószínűség, NEM
    // igazolt nyelvi kiszolgálás — a szöveg ezért nem ígérhet ilyet.
    for (const b of blurbok) {
      expect(b, `nyelvi ígéret a blurb-ben: ${b}`).not.toMatch(/magyarul|magyar nyelv|beszél/i);
    }
  });
});

describe("mindhárom ország seedje (DE + CH + AT)", () => {
  it("mindhárom fájlban van adat", () => {
    for (const cc of Object.keys(FAJLOK)) {
      expect(MIND.filter((x) => x.cc === cc).length, `${cc}: üres seed`).toBeGreaterThan(0);
    }
  });

  it("⚠️ a sor országkódja EGYEZIK a fájléval — a bináris ország-fallthrough itt is fáj", () => {
    // Ha egy CH-sor 'DE'-ként kerül be, a régiószűrő NÉMÁN elnyeli a tételt,
    // és a felhasználó soha nem találja meg. Ld. binary-country-fallthrough.
    for (const { cc, sor, fajl } of MIND) {
      const vart = ORSZAG[cc];
      expect(sor, `${fajl}: nem ${vart} országkód`).toMatch(new RegExp(`'${vart}', '[A-Z]{1,3}'\\)$`));
    }
  });

  it("⚠️ elavult tételt CSAK elrejteni szabad, törölni SOHA", () => {
    // A `hidden = 1` visszafordítható és megőrzi az előzményt; a DELETE nem.
    // Ld. business-dedup — a szabály az egész szaknévsorra érvényes.
    for (const p of Object.values(FAJLOK)) {
      const sql = olvas(p);
      expect(sql, `${p}: DELETE került a seedbe`).not.toMatch(/\bDELETE\s+FROM\s+businesses\b/i);
    }
  });

  it("⚠️ MINDEN tétel elérhető — telefon nélküli sor egyik országban sincs", () => {
    const ures = MIND.filter((x) => /,\s*'',\s*'/.test(x.sor) || /,\s*NULL,\s*'/.test(x.sor));
    expect(ures.map((x) => x.fajl), "telefon nélküli tétel").toEqual([]);
  });

  it("⚠️ a magyar nyelvű kiszolgálás EGYIK ország blurb-jében sincs ÁLLÍTVA", () => {
    // Mindhárom kör bizonyítéka ugyanaz: magyar név egy helyi cégjegyzékben,
    // plusz élő Maps-tétel. Ez nem igazolt nyelvi kiszolgálás.
    for (const { sor, fajl } of MIND) {
      const blurb = (sor.match(/, '([^']*környékén\.[^']*)'/) || [])[1];
      if (!blurb) continue;
      expect(blurb, `${fajl}: nyelvi ígéret — ${blurb}`).not.toMatch(/magyarul|magyar nyelv|beszél/i);
    }
  });

  it("egyik tétel sem indul „ellenőrizve” állapotban, és egyik sincs elrejtve", () => {
    // A `source` előtti négy oszlop: moderation_status, claimed, hidden, verified.
    // moderation_status = 1 (jóváhagyva, hogy látszódjon), a másik három 0:
    // a tétel NEM igényelt, NEM rejtett, és NEM ellenőrzött — a bizonyíték
    // erős valószínűség, nem igazolás.
    for (const { sor, fajl } of MIND) {
      expect(sor, `${fajl}: rossz moderálási/verified állapot`).toMatch(/, 1, 0, 0, 0, 'seed-/);
    }
  });
});

describe("a seed dokumentálja, amit a következő kör nem tudhat magától", () => {
  it("⚠️ leírja, hogy a magyar nyelvű kiszolgálás NINCS ellenőrizve", () => {
    expect(SQL).toMatch(/NINCS ELLEN[ŐO]RIZVE/i);
  });

  it("⚠️ leírja a bukott módszert is, ne kelljen újra megmérni", () => {
    // A negatív eredmény ugyanolyan értékes: a Maps „magyar <szakma>" keresés
    // kimérten nem működik kisiparra.
    expect(SQL).toMatch(/AMI NEM M[ŰU]K[ÖO]D[ÖO]TT/i);
  });
});
