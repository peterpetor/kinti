import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * A „csak Anglia" hatókör-őre az import-pipeline-ban.
 *
 * ⚠️ MIÉRT NÉMA EZ A HIBA: a GB ország az appban **Anglia** néven fut
 * (`countries.ts`), és a `GB_REGIONS` CSAK a 9 angol ONS-régiót ismeri. Egy
 * skót/walesi/észak-ír tétel ezért `canton_code IS NULL`-lal ül bent —
 * megjelenik a teljes listában, de a RÉGIÓ-SZŰRŐ sosem hozza elő. Semmilyen
 * hibaüzenet nem jelzi; csak egy célzott lekérdezés mutatja meg.
 *
 * 2026-08-03: 6 ilyen élő sort kellett kivezetni (Aberdeen, 2× Belfast, és 3
 * edinburgh-i, amit épp aznap vettem fel — a hatókört csak UTÁNA ellenőriztem).
 *
 * ⚠️⚠️ A TESZT MINDKÉT IRÁNYBAN mér. Egy túl mohó regex ANGOL tételeket dobna
 * ki némán, ami rosszabb, mint az eredeti hiba — ezért a „nem szabad kizárnia"
 * eseteket is végigpróbáljuk (Chester/Shrewsbury a határon, Salford az „SA"
 * előtag miatt).
 */
const SCRIPT = readFileSync(resolve(process.cwd(), "scripts/prepare-business-import.mjs"), "utf8");

/** A scriptből kiolvasott élő regex — így a teszt a VALÓDI mintát méri, nem egy másolatot. */
function guardRegex(): RegExp {
  const m = SCRIPT.match(/const NEM_ANGLIA\s*=\s*\n?\s*(\/.+\/);/);
  if (!m) throw new Error("A NEM_ANGLIA őr nem található a prepare-business-import.mjs-ben");
  const [, literal] = m;
  const vege = literal.lastIndexOf("/");
  return new RegExp(literal.slice(1, vege), literal.slice(vege + 1));
}

// ⚠️ A leírás EGYSZERES aposztróffal van határolva: a magyar záró-idézőjel
// („…") ASCII " karaktere kétszeres határolóban LEZÁRNÁ a stringet.
describe('„csak Anglia" import-őr', () => {
  it("létezik, és az import-ciklus tényleg használja", () => {
    expect(SCRIPT).toContain("const NEM_ANGLIA");
    // Nem elég definiálni: a ciklusban KI is kell hagynia a sort.
    expect(SCRIPT).toMatch(/country === "GB" && NEM_ANGLIA\.test/);
  });

  it("KIZÁRJA a skót, walesi és észak-ír irányítószámokat", () => {
    const re = guardRegex();
    const kizarando = [
      "17 Adelphi, Aberdeen AB11 5BL", // Skócia
      "25 Union Street, Edinburgh EH1 3LR", // Skócia
      "20 West Shore Road, Granton, Edinburgh EH5 1QD", // Skócia
      "1A Juniper Park Road, Juniper Green, Edinburgh EH14 5DX", // Skócia
      "100 Great Victoria Street, Belfast BT2 7BE", // Észak-Írország
      "24 Rosemary Street, Belfast BT1 1QD", // Észak-Írország
      "10 Buchanan Street, Glasgow G1 3BA", // Skócia
      "5 Queen Street, Cardiff CF10 2BU", // Wales
      "12 High Street, Newport NP20 1GA", // Wales
      "3 Wind Street, Swansea SA1 1DP", // Wales
    ];
    for (const cim of kizarando) {
      expect(re.test(cim.toUpperCase()), `ki kellett volna zárni: ${cim}`).toBe(true);
    }
  });

  it("⚠️ NEM zárja ki az angol tételeket — a határ menti és előtag-csapdákat sem", () => {
    const re = guardRegex();
    const megtartando = [
      // A CH és SY körzet átnyúlik a határon, de a városok ANGLIÁBAN vannak:
      "The Unity Centre, 17 Cuppin Street, Chester CH1 2BN",
      "12 Wyle Cop, Shrewsbury SY1 1UT",
      // Az „SA" előtag a SALFORD szó elején is felbukkan:
      "1 The Quays, Salford M50 3AZ",
      // A „G" körzet (Glasgow) egybetűs — nem szabad minden G-re illeszkednie:
      "9A Lands Lane, Leeds LS1 6AW",
      "292 Chorley Old Road, Bolton BL1 4JU",
      "Market Place, Doncaster DN1 1NF",
      "58 Alma Vale Road, Clifton, Bristol BS8 2HS",
      "660 High Road, North Finchley, London N12 0NL",
      "2a Humber Drive, Spalding PE11 3WY",
      "48 Chesterton Road, Cambridge CB4 1EN",
      "Cottonmill Lane, St Albans AL1 1HL",
      "184 Sutton New Road, Erdington, Birmingham B23 6QU",
    ];
    for (const cim of megtartando) {
      expect(re.test(cim.toUpperCase()), `NEM lett volna szabad kizárni: ${cim}`).toBe(false);
    }
  });
});
