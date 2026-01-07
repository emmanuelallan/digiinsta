import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 30000, // Allow time for 100+ iterations in property tests
    include: ["__tests__/**/*.test.ts", "__tests__/**/*.property.test.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
