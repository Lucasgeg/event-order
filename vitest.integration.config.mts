import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

// Tests d'intégration : vraie DB Postgres (Docker Compose, voir
// docker-compose.yml + .env.test), pour l'invariant le plus critique
// (scoping tenant) que le mock Prisma ne peut pas garantir.
dotenv.config({ path: ".env.test" });

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.integration.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
    testTimeout: 15_000,
  },
  resolve: {
    alias: {
      "@": import.meta.dirname,
    },
  },
});
