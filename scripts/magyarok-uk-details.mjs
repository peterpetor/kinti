/**
 * magyarok-uk-details.mjs — a magyarok.co.uk cégjegyzék EGYEDI adatlapjainak
 * kiolvasása (cím, telefon, weboldal).
 *
 * ⚠️ A jegyzék önbevallásos: a tételek elavulhattak. A kimenetet ezért a
 * telefon/weboldal MÉRÉSÉVEL kell hitelesíteni, mielőtt bármi bekerül.
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const rows = JSON.parse(readFileSync("uk-new.json", "utf8"));
const b = await chromium.launch();
const p = await (await b.newContext({ locale: "hu-HU", viewport: { width: 1300, height: 950 } })).newPage();
const out = [];

for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  try {
    await p.goto(r.href, { waitUntil: "domcontentloaded", timeout: 40000 });
    await p.waitForTimeout(3200);
    const d = await p.evaluate(() => {
      const txt = document.body.innerText.replace(/\r/g, "");
      const tel = (txt.match(/(\+44\s?[\d\s]{9,}|\b0\d{2,4}\s?\d{3}\s?\d{3,4}\b|\b07\d{3}\s?\d{6}\b)/) || [])[1] || null;
      const mail = (txt.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/) || [])[0] || null;
      const web =
        [...document.querySelectorAll("a[href^='http']")]
          .map((a) => a.getAttribute("href"))
          .find((h) => h && !/magyarok\.co\.uk|facebook\.com\/magyarok|google|wordpress|gravatar/i.test(h)) || null;
      // cím: postcode-mintás sor
      const cim =
        txt.split("\n").map((s) => s.trim())
          .find((s) => /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b/.test(s) && s.length < 120) || null;
      return { tel, mail, web, cim };
    });
    out.push({ ...r, ...d });
    console.log(`${d.tel || d.web || d.mail ? "✓" : "·"} [${i + 1}/${rows.length}] ${r.nev.slice(0, 34).padEnd(36)} ${d.tel || "—"} | ${(d.cim || "—").slice(0, 34)}`);
  } catch (e) {
    console.log(`! ${r.nev.slice(0, 30)} — ${String(e).slice(0, 40)}`);
  }
  await p.waitForTimeout(700);
}
writeFileSync("uk-details.json", JSON.stringify(out, null, 1), "utf8");
console.log(`\n${out.filter((x) => x.tel || x.web || x.mail).length} / ${out.length} kontakttal`);
await b.close();
