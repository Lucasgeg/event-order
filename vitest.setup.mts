import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// RTL ne démonte pas automatiquement entre les tests avec Vitest — sans ça,
// les rendus s'accumulent dans le même DOM jsdom d'un test à l'autre.
afterEach(() => {
  cleanup();
});
