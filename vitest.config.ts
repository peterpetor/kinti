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
  },
});
