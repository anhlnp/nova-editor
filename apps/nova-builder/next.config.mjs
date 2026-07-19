import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve a stub file relative to this config (used in webpack aliases).
function stub(name) {
  return path.resolve(__dirname, `src/stubs/${name}`);
}

// Build aliases that force every @babel/runtime helper to its CJS version.
// Without this, the "import" condition in conditionNames routes all helpers to
// helpers/esm/*.js (ESM exports), which webpack wraps as { default: fn }.
// CJS callers like next-auth then call the export as a function and get a crash:
//   "_interopRequireDefault is not a function" / "_typeof is not a function"
// Mapping to the absolute CJS path bypasses the package.json exports map entirely.
function buildBabelRuntimeCjsAliases() {
  // pnpm stores packages in node_modules/.pnpm/@babel+runtime@<ver>/...
  // We search the .pnpm virtual store for the @babel/runtime entry.
  const pnpmStore = path.resolve(__dirname, "../../node_modules/.pnpm");

  let runtimeRoot;
  try {
    const entries = fs.readdirSync(pnpmStore);
    const babelEntry = entries.find((d) => d.startsWith("@babel+runtime@"));
    if (babelEntry) {
      runtimeRoot = path.join(
        pnpmStore,
        babelEntry,
        "node_modules",
        "@babel",
        "runtime"
      );
    }
  } catch {
    // ignore
  }

  if (!runtimeRoot) return {};

  const helpersDir = path.join(runtimeRoot, "helpers");
  const aliases = {};
  try {
    const files = fs.readdirSync(helpersDir);
    for (const file of files) {
      if (!file.endsWith(".js")) continue;
      const helperName = file.replace(/\.js$/, "");
      const absPath = path.join(helpersDir, file);
      // Map both the bare specifier and the .js variant to the absolute CJS path.
      aliases[`@babel/runtime/helpers/${helperName}`] = absPath;
      aliases[`@babel/runtime/helpers/${helperName}.js`] = absPath;
    }
  } catch {
    // ignore
  }
  return aliases;
}

const babelCjsAliases = buildBabelRuntimeCjsAliases();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The floating "N" dev-tools button rendered in BOTH the builder page and the
  // /canvas iframe (two overlapping circles over the canvas/footer) and polluted
  // visual QA screenshots (WS-PARITY-AUDIT §8b V-6). Dev-only; no prod effect.
  devIndicators: false,
  transpilePackages: [
    "@webstudio-is/design-system",
    "next-auth",
    "@webstudio-is/sdk",
    "@webstudio-is/css-engine",
    "@webstudio-is/react-sdk",
    "@webstudio-is/sdk-components-react",
    "@webstudio-is/sdk-components-react-radix",
    "@webstudio-is/sync-client",
    "@webstudio-is/fonts",
    "@webstudio-is/icons",
    "@webstudio-is/image",
    "@webstudio-is/multiplayer-protocol",
    "@webstudio-is/sdk-components-animation",
    "@webstudio-is/css-data",
  ],
  webpack: (config, { isServer }) => {
    // ESM workspace packages use explicit .js specifiers pointing at .ts sources.
    // Without this alias webpack (strict ESM mode) won't find them.
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".jsx": [".tsx", ".jsx"],
      ".mjs": [".mts", ".mjs"],
      ".cjs": [".cts", ".cjs"],
    };
    // Prepend "webstudio" so WS packages prefer their ./src entry while preserving the
    // correct standard conditions for each target. Without the fallback, conditionNames
    // becomes ["webstudio"] only — dropping "import"/"require" and breaking packages
    // (like zod@3.25.76) that rely on those conditions.
    //
    // IMPORTANT: "browser" must NOT appear in the server bundle's conditionNames —
    // packages like @supabase/supabase-js and next-auth have browser-specific exports
    // that break when loaded in Node.js. Server bundles use "require" + "node".
    // Server gets "import" for ESM-only packages (e.g. immerhin, nanostores) but NOT
    // "browser" — that would route @supabase/supabase-js and next-auth to browser
    // bundles which fail in Node.js.
    const defaultConditions = isServer
      ? ["require", "node", "node-addons", "import", "default"]
      : ["browser", "module", "import", "require", "default"];
    config.resolve.conditionNames = [
      "webstudio",
      ...(config.resolve.conditionNames ?? defaultConditions),
    ];
    // Redirect WS template/meta source imports to empty stubs.
    // The WS "webstudio" export condition resolves to .template.tsx files that use
    // ws:style JSX namespace syntax which SWC does not support. Templates are only
    // needed for the component-library drag-to-canvas initial-state feature (Phase 6);
    // the canvas renderer works fine without them.
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      // Force every @babel/runtime helper to its CJS version by pointing directly at
      // the absolute file path. This bypasses the package.json exports map, which would
      // otherwise route helpers to helpers/esm/*.js (ESM) via the "import" condition.
      // ESM helpers get wrapped as { default: fn } by webpack, breaking CJS callers
      // like next-auth with "_interopRequireDefault/typeof is not a function".
      ...babelCjsAliases,
      "@webstudio-is/sdk/core-templates": stub("empty.js"),
      "@webstudio-is/sdk-components-react/templates": stub("empty.js"),
      "@webstudio-is/sdk-components-react-radix/templates": stub("empty.js"),
    };

    return config;
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
