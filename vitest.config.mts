import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Tests unitaires : Prisma mocké (vitest-mock-extended), appels HTTP externes
// (Clerk SDK, Resend) mockés via MSW. Pas de vraie DB — voir
// vitest.integration.config.ts pour les tests qui en ont besoin.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.mts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: [
      "**/*.integration.test.{ts,tsx}",
      "node_modules/**",
      ".next/**",
    ],
  },
  resolve: {
    alias: {
      "@": import.meta.dirname,
    },
  },
});
