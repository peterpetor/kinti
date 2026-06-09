import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Vitest — gyors unit-tesztek a tiszta üzleti logikára (mapper-ek, validátorok,
 * kalkulátorok). Node környezet, nincs böngésző. Futtatás: `npm test`.
 * A `@/...` alias a tsconfig paths-szal egyezik.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // A vitest 4.1.7 worker-pool spawn-ja Windowson FLAKY: néha az első
    // futásnál minden fájl elhasal ("Cannot read properties of undefined
    // (reading 'config')"). A suite tisztán szinkron üzleti logika (pár száz
    // ms), ezért egyetlen forkban, izoláció nélkül futtatjuk — ez
    // determinisztikus és gyakorlatilag ingyen van.
    fileParallelism: false,
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
    isolate: false,
  },
});
