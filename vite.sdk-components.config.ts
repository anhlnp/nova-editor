import { defineConfig } from "vite";
import { existsSync } from "node:fs";
import path from "node:path";

const entry: string[] = [];

// Add files if they exist in the current working directory
const files = [
  "src/index.ts",
  "src/components.ts",
  "src/metas.ts",
  "src/hooks.ts",
  "src/templates.ts",
];

for (const file of files) {
  if (existsSync(path.join(process.cwd(), file))) {
    entry.push(file);
  }
}

const isBareImport = (id: string) =>
  id.startsWith("@") || id.includes(".") === false;

export default defineConfig({
  build: {
    lib: {
      entry,
      formats: ["es"],
    },
    rollupOptions: {
      external: isBareImport,
      output: {
        dir: "lib",
      },
    },
  },
});
