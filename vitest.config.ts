import { defineConfig } from "vitest/config";

// resolve webstudio condition in tests (mirrors reference/webstudio/vitest.config.ts).
// Conditions are vite 6 defaults + "webstudio"; inlined because `vite` itself is not
// resolvable from package dirs under pnpm strict node_modules.
export default defineConfig({
  resolve: {
    conditions: ["webstudio", "module", "browser", "development|production"],
  },
  ssr: {
    resolve: {
      conditions: ["webstudio", "module", "node", "development|production"],
    },
  },
});
