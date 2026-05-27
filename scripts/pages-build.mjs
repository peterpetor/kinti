#!/usr/bin/env node
/**
 * Cross-platform build script Cloudflare Pages-re.
 *
 * Egyenesen Node-ból fut, így a Cloudflare Linux build-konténerében
 * és lokál Windowson is működik (előbbi a `git push`-os auto-deploy,
 * utóbbi a `npm run deploy` manuális útvonal).
 *
 * Két lépés:
 *   1) `vercel build` — Next.js-t Vercel-formátumra építi (.vercel/output/)
 *   2) `@cloudflare/next-on-pages --skip-build` — átalakítja Cloudflare
 *      Pages Worker-bundle-re (.vercel/output/static/)
 *
 * A `scripts/patch-symlink.js` preload csak Windowson tesz dolgát
 * (EPERM-hibák symlink-másoláshoz), Linuxon észrevétlen átfut.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWindows = process.platform === "win32";

/**
 * A `@cloudflare/next-on-pages` `bash`-t hív. Linuxon (Cloudflare build)
 * ez alapból elérhető; Windowson a Git Bash-t kell a PATH elejére tenni.
 * Több szokásos telepítési helyet megpróbálunk.
 */
function ensureBashOnWindows() {
  if (!isWindows) return;
  const candidates = [
    "C:\\Program Files\\Git\\bin",
    "C:\\Program Files\\Git\\usr\\bin",
    "C:\\Program Files (x86)\\Git\\bin",
    "C:\\Program Files (x86)\\Git\\usr\\bin",
  ];
  const found = candidates.filter((p) => existsSync(path.join(p, "bash.exe")));
  if (found.length) {
    process.env.PATH = `${found.join(";")};${process.env.PATH}`;
    console.log(`› Git Bash hozzáadva a PATH-hoz: ${found[0]}`);
  } else {
    console.warn(
      "⚠ Git Bash nem található a szokásos helyeken — a next-on-pages elhasalhat.\n" +
        "  Telepítsd: https://git-scm.com/download/win",
    );
  }
}

/** Egy parancsot futtat, NODE_OPTIONS-szel a symlink-patchhez. */
function run(cmd, args, { tolerateFail = false } = {}) {
  return new Promise((resolve, reject) => {
    const patchPath = path.join(__dirname, "patch-symlink.js").replace(/\\/g, "/");
    const env = {
      ...process.env,
      VERCEL_ORG_ID: process.env.VERCEL_ORG_ID || "dummy",
      VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID || "dummy",
      NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ""} -r ${patchPath}`.trim(),
    };
    const child = spawn(cmd, args, {
      stdio: "inherit",
      env,
      shell: isWindows, // Windows-on a `.cmd` shim-ek miatt kell
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0 || tolerateFail) resolve(code);
      else reject(new Error(`${cmd} ${args.join(" ")} exited ${code}`));
    });
  });
}

async function main() {
  ensureBashOnWindows();

  // 1) vercel build — Windowson symlink-EPERM lehet, ezért toleráljuk,
  //    de utána ellenőrizzük, hogy az output létrejött-e.
  console.log("\n› Step 1: vercel build");
  await run("npx", ["vercel", "build", "--yes"], { tolerateFail: true });

  if (!existsSync(".vercel/output/static")) {
    console.error("\n✖ vercel build failed and .vercel/output/static is missing.");
    process.exit(1);
  }

  // 2) next-on-pages — Workers-bundle generálás
  console.log("\n› Step 2: @cloudflare/next-on-pages --skip-build");
  await run("npx", ["@cloudflare/next-on-pages", "--skip-build"]);

  console.log("\n✔ Pages build complete — .vercel/output/static/ ready.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
