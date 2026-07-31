/**
 * check-http-only-websites.mjs — CSAK HTTP-n élő weboldalak felderítése.
 *
 * ⚠️ MIÉRT FONTOS, NEM CSAK A MÉRÉS MIATT: a `lib/contact-links.ts` a protokoll
 * nélküli webcím elé MINDIG `https://`-t tesz. Ha a cég oldala csak HTTP-n él
 * (sok kis egyesületi/magánoldal ilyen), akkor a felhasználó a „Weboldal"
 * gombra kattintva IDŐTÚLLÉPÉST kap — vagyis a link látszólag megvan, a
 * valóságban zsákutca.
 *
 * Ez a szkript a második körben is időtúllépő címeket próbálja meg HTTP-vel.
 */
import { readFileSync, writeFileSync } from "node:fs";

const raw = JSON.parse(readFileSync("website-recheck.json", "utf8"));
const seen = new Map();
for (const o of raw) if (!seen.has(o.id)) seen.set(o.id, o);
const targets = [...seen.values()].filter((o) => o.verdict2 === "timeout-ismet");
console.log(`HTTP-próba: ${targets.length} tétel\n`);

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) kinti.app-linkcheck";
async function probe(url) {
  try {
    const res = await fetch(url, {
      method: "GET", redirect: "follow",
      headers: { "user-agent": UA, accept: "text/html,*/*" },
      signal: AbortSignal.timeout(20000),
    });
    return { status: res.status, finalUrl: res.url };
  } catch (e) {
    return { status: 0, err: String(e?.cause?.code || e?.name || e) };
  }
}

const out = [];
const queue = [...targets];
async function worker() {
  while (queue.length) {
    const o = queue.shift();
    const httpUrl = o.url.replace(/^https:\/\//i, "http://");
    const r = await probe(httpUrl);
    out.push({ ...o, httpStatus: r.status, httpFinal: r.finalUrl ?? null, httpErr: r.err ?? null });
  }
}
await Promise.all(Array.from({ length: 5 }, worker));
writeFileSync("website-http.json", JSON.stringify(out, null, 2));

const live = out.filter((o) => o.httpStatus >= 200 && o.httpStatus < 400);
console.log(`CSAK HTTP-n él: ${live.length} / ${targets.length}`);
for (const o of live) console.log(`  ${o.httpStatus}  ${o.url}  →  ${o.httpFinal}`);
console.log(`\nTényleg elérhetetlen: ${out.length - live.length}`);
