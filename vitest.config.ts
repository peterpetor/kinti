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
    // A worker-pool párhuzamos futtatása Windowson instabil (vitest 4.1.7:
    // "Cannot read properties of undefined (reading 'config')"). A suite
    // tisztán szinkron üzleti logika (pár száz ms), így a soros futtatás
    // determinisztikus és gyakorlatilag ingyen van.
    fileParallelism: false,
  },
});
