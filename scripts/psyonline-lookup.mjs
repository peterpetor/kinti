/**
 * psyonline-lookup.mjs — elérhetőség-pótlás a PsyOnline.at regiszterből.
 *
 * MIÉRT: az osztrák pszichológus-tételeink egy hatósági/kamarai listából jöttek,
 * ami NEVET és PONTOS CÍMET közöl, telefont NEM. A PsyOnline.at (Ausztria
 * legnagyobb pszichoterápiás portálja) ugyanezekre a szakemberekre KÖZLI a
 * telefont és a weboldalt.
 *
 * ⚠️ EZ NEM FELFEDEZÉS, HANEM PÓTLÁS: csak MÁR MEGLÉVŐ, magyar kötődés miatt
 * korábban felvett tételekhez keresünk kontaktot. Új tételt NEM veszünk fel
 * innen — a PsyOnline MINDEN osztrák terapeutát listáz, a magyar nyelvtudás
 * onnan nem derül ki (ld. a „Kiss"-csapda a filter-hu-candidates.mjs-ben).
 *
 * ⚠️⚠️ A TALÁLATOT A CÍM HITELESÍTI, nem a név — a listaoldal ki is írja a
 * címet, ezért az egyezés közvetlenül ellenőrizhető
 * (`scripts/match-verified-phones.mjs` → `cimEgyezik`).
 *
 * A HASZNÁLT URL-MINTA (a találati lap „Eintrag anzeigen" gombja mögötti cím —
 * a gomb NEM sima <a href>, ezért kattintással kellett felderíteni):
 *   go.asp?sektion=personen&aktion=view&berufsgruppe=<pth|psy>&stichwort=<NÉV>
 * Ez EGY lapon adja a nevet, címet, telefont és weboldalt — nem kell a
 * profil-aloldalra navigálni.
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const sorok = JSON.parse(readFileSync(process.argv[2], "utf8"));
const KI = process.argv[3] || "psy-out.json";

/** ⚠️ ÉKEZET NÉLKÜLI VEZETÉKNÉV: a regiszter ékezet nélkül tárol („Noemi”). */
const keresoszo = (nev) =>
  nev.normalize("NFD").replace(/[̀-ͯ]/g, "").split(/\s+/)[0].replace(/[^A-Za-z-]/g, "");

const url = (nev, csoport) =>
  `https://www.psyonline.at/go.asp?sektion=personen&aktion=view&berufsgruppe=${csoport}` +
  `&stichwort=${encodeURIComponent(nev)}&bereich_id=9001&subbereich_id=0`;

const b = await chromium.launch();
const ctx = await b.newContext({ locale: "de-AT", viewport: { width: 1400, height: 1000 } });
const p = await ctx.newPage();
const out = [];

for (let i = 0; i < sorok.length; i++) {
  const t = sorok[i];
  const szo = keresoszo(t.nev);
  let tal = null;
  // ⚠️ KÉT szakmacsoport: `pth` = pszichoterapeuta, `psy` = klinikai pszichológus.
  // A tételeink mindkettőből vannak, ezért ha az egyik üres, a másikat is nézzük.
  for (const csoport of ["pth", "psy"]) {
    try {
      await p.goto(url(szo, csoport), { waitUntil: "domcontentloaded", timeout: 40000 });
      await p.waitForTimeout(2400);

      // Van-e egyáltalán találat erre a névre ebben a szakmacsoportban?
      const vanTalalat = await p.evaluate((szoKeres) =>
        document.body.innerText.toLowerCase().includes(szoKeres.toLowerCase()), szo);
      if (!vanTalalat) continue;

      /**
       * ⚠️ A TELEFON NEM A TALÁLATI LAPON VAN. Az alap (ingyenes) profiloknál a
       * listaoldal csak a nevet és a címet mutatja, a kontakt a „Kontaktdaten"
       * fül mögött van (`rkarte=infodetails`). Csak a BŐVÍTETT (fizetős)
       * profilok írják ki a mobilt már a listában — emiatt tűnt először úgy,
       * hogy 5-ből csak 1-nek van telefonja.
       */
      const k = p.locator("text=/Kontaktdaten/i").first();
      if (await k.count()) {
        await k.click({ timeout: 12000 }).catch(() => {});
        await p.waitForTimeout(2800);
      }

      const d = await p.evaluate(() => {
        const txt = document.body.innerText.replace(/\s+/g, " ");
        /**
         * ⚠️ KÉT helyről olvasunk, ebben a sorrendben:
         *   1. „Detail-Infos…" blokk (a Kontaktdaten fül) — az alap profiloknál
         *      itt van a mobil,
         *   2. ha az üres, a TALÁLATI lista blokkja — a bővített profiloknál
         *      már ott ki van írva a mobil (Medgyesy esete).
         * Egyik sem elég önmagában.
         */
        const blokkok = [];
        const di = txt.indexOf("Detail-Infos");
        if (di >= 0) blokkok.push(txt.slice(di, di + 460));
        const ei = txt.indexOf("Einträge:");
        if (ei >= 0) blokkok.push(txt.slice(ei, ei + 700));
        let tel = null, web = null, nyers = "";
        for (const resz of blokkok) {
          nyers = nyers || resz.slice(0, 200);
          tel = tel || (resz.match(/(?:Mobil|Telefon|Tel)[:.\s]*([\d][\d\s\-/()]{6,})/i) || [])[1]?.trim() || null;
          web = web || (resz.match(/((?:https?:\/\/)?www\.[^\s]+)/) || [])[1] || null;
          if (tel) break;
        }
        /**
         * ⚠️ MINDEN címet összegyűjtünk, nem csak az elsőt: egy szakembernek
         * TÖBB rendelője is lehet (Giselbrecht Brigitta: 1020 Wien Große
         * Mohrengasse ÉS 1220 Wien Pogrelzstraße). Ha csak az elsőt néznénk, a
         * cím-egyeztető tévesen elutasítaná a valódi találatot.
         */
        const cimek = [...txt.matchAll(/(\d{4}\s+[A-ZÄÖÜ][^,]{2,30},\s*[^,]{3,40}?)(?=\s+(?:Karte|Kontaktdaten|Mobil|Telefon|Tel|eMail|www|Info|\d{4}\s))/g)]
          .map((m) => m[1].trim());
        return { tel, web, cimek: [...new Set(cimek)].slice(0, 4), cim: cimek[0] || null, nyers };
      });
      if (d && (d.tel || d.web)) { tal = { ...d, csoport }; break; }
      if (d && !tal) tal = { ...d, csoport };
    } catch (e) {
      /* a másik csoportot még megpróbáljuk */
    }
  }
  out.push({ ...t, ...(tal || { nincs: true }) });
  console.log(`${tal?.tel ? "✓" : "·"} [${i + 1}/${sorok.length}] ${t.nev.slice(0, 28).padEnd(30)} ${(tal?.tel || "—").padEnd(18)} ${(tal?.cim || "—").slice(0, 40)}`);
  await p.waitForTimeout(700);
}

writeFileSync(KI, JSON.stringify(out, null, 1), "utf8");
console.log(`\n${out.filter((x) => x.tel).length} / ${out.length} telefonnal`);
await b.close();
