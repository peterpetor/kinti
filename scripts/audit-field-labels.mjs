/**
 * audit-field-labels.mjs — űrlapmezők HOZZÁFÉRHETŐ NEVÉNEK ellenőrzése.
 *
 * ⚠️ MIT KERES: olyan `<input>` / `<textarea>`, amelynek VAN `placeholder`-e, de
 * NINCS hozzáférhető neve (`aria-label`, `aria-labelledby` vagy `id`, amire egy
 * `<label htmlFor>` mutathat).
 *
 * ⚠️ MIÉRT BAJ A CSAK-HELYKITÖLTŐ: a placeholder gépeléskor ELTŰNIK, halvány a
 * kontrasztja, és a képernyőolvasók nem egységesen jelentik be címkeként.
 * WCAG 2.1 A szint, 3.3.2 („Labels or Instructions").
 *
 * Ugyanezt a függvényt használja a `tests/unit/field-labels.test.ts` racsni-
 * tesztje, hogy a szám csak CSÖKKENHESSEN.
 *
 * Futtatás:  node scripts/audit-field-labels.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

/**
 * A nyitó JSX-tag kiolvasása KAPCSOS-ZÁRÓJEL-MÉLYSÉG szerint.
 *
 * ⚠️ NAIV REGEXSZEL NEM MEGY, és ezt majdnem elrontottam: a `<input …[^>]*>`
 * minta elakad az `onChange={(e) => …}` NYILÁN, mert abban is van `>`. Így a
 * mérés 15 mezőt talált a valódi 160 helyett. A tagot ezért karakterenként
 * olvassuk, és csak a 0 mélységben álló `>` zárja.
 */
function readTags(src, tagName) {
  const out = [];
  const open = `<${tagName}`;
  let i = 0;
  while ((i = src.indexOf(open, i)) !== -1) {
    const after = src[i + open.length];
    if (after && /[A-Za-z0-9_-]/.test(after)) {
      i += open.length;
      continue;
    }
    let depth = 0;
    let j = i + open.length;
    for (; j < src.length; j++) {
      const c = src[j];
      if (c === "{") depth++;
      else if (c === "}") depth--;
      else if (c === ">" && depth === 0) break;
    }
    out.push(src.slice(i, j + 1));
    i = j + 1;
  }
  return out;
}

/** @returns {{ total: number, missing: number, perFile: Record<string, number> }} */
export function auditFieldLabels(root = "src") {
  const perFile = {};
  let total = 0;
  let missing = 0;

  for (const file of walk(root)) {
    const src = readFileSync(file, "utf8");
    for (const tag of [...readTags(src, "input"), ...readTags(src, "textarea")]) {
      if (/type="hidden"|aria-hidden/.test(tag)) continue; // rejtett / honeypot
      if (!/placeholder=/.test(tag)) continue;
      total++;
      if (!/aria-label|aria-labelledby|\bid=/.test(tag)) {
        missing++;
        const key = file.split(/[\\/]/).join("/").replace(`${root}/`, "");
        perFile[key] = (perFile[key] ?? 0) + 1;
      }
    }
  }
  return { total, missing, perFile };
}

// CLI
if (process.argv[1]?.endsWith("audit-field-labels.mjs")) {
  const { total, missing, perFile } = auditFieldLabels();
  console.log(`helykitöltős mező összesen: ${total}`);
  console.log(`ebből NINCS hozzáférhető neve: ${missing}`);
  console.log("\nlegtöbbet érintett fájlok:");
  for (const [f, n] of Object.entries(perFile).sort((a, b) => b[1] - a[1]).slice(0, 14)) {
    console.log(`  ${String(n).padStart(3)}  ${f}`);
  }
}
