import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const t = JSON.parse(readFileSync(process.argv[2],"utf8"))[0];
const b = await chromium.launch();
const p = await (await b.newContext({ locale:"es-ES", viewport:{width:1300,height:950} })).newPage();
await p.goto("https://www.google.com/maps/search/"+encodeURIComponent(t.q), {waitUntil:"domcontentloaded",timeout:40000});
await p.waitForTimeout(1000);
const c = p.locator('button:has-text("Aceptar todo"), button:has-text("Accept all")').first();
if (await c.count()) { await c.click({timeout:4000}).catch(()=>{}); await p.waitForTimeout(1800); }
await p.waitForTimeout(3500);
const txt = await p.evaluate(()=>document.body.innerText.replace(/\s+/g," "));
console.log("NÉV/KAT:", (await p.evaluate(()=>document.querySelector("h1")?.textContent)) || "—");
for (const k of ["húngar","hungar","magyar","goulash","gulyás","paprika","langos","lángos"]) {
  const i = txt.toLowerCase().indexOf(k);
  if (i>=0) console.log(`  ⭐ "${k}": …${txt.slice(Math.max(0,i-70), i+90)}…`);
}
console.log("kategória-jel:", (txt.match(/Restaurante [a-záéíóúñ]+/i)||["—"])[0]);
await b.close();
