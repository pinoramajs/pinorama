import { defineConfig } from "vitest/config"

// the app itself has no tests; this keeps vitest from loading vite.config.ts
export default defineConfig({
  test: {
    include: ["tests/**/*.test.mjs"],
    testTimeout: 20_000
  }
})
