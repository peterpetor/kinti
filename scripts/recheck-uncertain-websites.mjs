/**
 * recheck-uncertain-websites.mjs — a BIZONYTALAN találatok második köre.
 *
 * ⚠️ Egyetlen próbából nem törlünk adatot. Az első kör három osztálya kétes:
 *   • timeout  — lehet lassú szerver, ideiglenes hálózati hiba, vagy rate-limit
 *   • notfound — a domain ÉL, csak a mély útvonal rossz → a GYÖKÉR még jó lehet
 *   • http-5xx — átmeneti szerverhiba
 *
 * Ez a kör lassabb (hosszabb időkorlát, kisebb párhuzamosság), és a 404-eseket
 * a domain GYÖKERÉN is megpróbálja — ha az él, a linket nem törölni, hanem
 * a gyökérre rövidíteni kell.
 */
import { readFileSync, writeFileSync } from "node:fs";

const all = JSON.parse(readFileSync("website-check.json", "utf8"));
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) kinti.app-linkcheck";
const uncertain = all.filter((o) => ["timeout", "notfound", "http-503", "http-500"].includes(o.verdict));
console.log(`újramérés: ${uncertain.length} bizonytalan tétel\n`);

async function probe(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": UA, accept: "text/html,*/*" },
      signal: AbortSignal.timeout(30000),
    });
    return { status: res.status, err: null };
  } catch (e) {
    return { status: 0, err: String(e?.cause?.code || e?.name || e?.message || e) };
  }
}

const out = [];
const CONC = 5;
let done = 0;
async function worker(queue) {
  while (queue.length) {
    const o = queue.shift();
    const first = await probe(o.url);
    let rootStatus = null;
    // 404-nél: él-e a domain gyökere?
    if (first.status === 404 || first.status === 410 || o.verdict === "notfound") {
      try {
        const root = new URL(o.url).origin;
        const r = await probe(root);
        rootStatus = r.status;
      } catch { /* rossz URL */ }
    }
    const dnsDead = /ENOTFOUND|EAI_AGAIN/i.test(first.err ?? "");
    const alive = first.status >= 200 && first.status < 400;
    const verdict =
      alive ? "ok-masodikra"
      : dnsDead ? "dns-dead"
      : rootStatus && rootStatus >= 200 && rootStatus < 400 ? "gyoker-el"
      : first.status === 403 || first.status === 401 || first.status === 429 ? "protected"
      : first.status === 0 ? "timeout-ismet"
      : `http-${first.status}`;
    out.push({ ...o, second: first.status, secondErr: first.err, rootStatus, verdict2: verdict });
    done++;
    if (done % 20 === 0) console.log(`  … ${done}/${uncertain.length}`);
  }
}
// ⚠️ EGY közös sor, nem dolgozónként másolat — különben minden dolgozó
// végigmenne a TELJES listán, és minden domaint CONC-szor kérdeznénk le.
const queue = [...uncertain];
await Promise.all(Array.from({ length: CONC }, () => worker(queue)));
writeFileSync("website-recheck.json", JSON.stringify(out, null, 2));

const by = {};
for (const o of out) by[o.verdict2] = (by[o.verdict2] ?? 0) + 1;
console.log("\n=== második kör ===");
for (const [k, v] of Object.entries(by).sort((a, b) => b[1] - a[1])) console.log(`${String(v).padStart(4)}  ${k}`);
