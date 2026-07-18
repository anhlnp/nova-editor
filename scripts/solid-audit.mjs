#!/usr/bin/env node
/**
 * SOLID Principle Audit — Generic, config-driven.
 *
 * All project-specific knowledge lives in the CONFIG block below.
 * Adding a new rule = adding an entry to CONFIG. No code changes required.
 *
 * Run: node scripts/solid-audit.mjs
 * Or:  pnpm solid:audit
 *
 * Exit 0 = no blocking violations; 1 = blocking violations found.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── CONFIG (all project-specific knowledge lives here) ────────────────────────

const CONFIG = {
  // Directories to scan (skipped silently if they don't exist).
  scanDirs: [
    { label: "apps/nova-builder/src", path: join(ROOT, "apps", "nova-builder", "src") },
    { label: "packages/ai/src",       path: join(ROOT, "packages", "ai", "src") },
    { label: "packages/deploy/src",   path: join(ROOT, "packages", "deploy", "src") },
    { label: "packages/git/src",      path: join(ROOT, "packages", "git", "src") },
  ],

  // Subdirectory prefixes that are legacy/deprecated (S1 violations capped at WARN).
  legacyPrefixes: [],

  // S1 thresholds (lines).
  fileSizeWarn: 400,
  fileSizeBlock: 700,

  // S2: write-side-effect markers — if ANY of these appear in a file along with
  // many UI sub-functions, it likely mixes concerns.
  mutationMarkers: ["captureSnapshot("],

  // O2: hub files that should dispatch panels via a registry import rather than
  // hard-coded imports. Pass condition: file imports from registryModule.
  hubs: [
    { file: "StyleInspector.tsx", registryModule: "panelRegistry" },
  ],

  // L1: exported *<suffix> component families and their max required props count.
  interfaceFamilies: [
    { suffix: "Panel", maxRequiredProps: 2 },
  ],

  // D1: function names that must appear in exactly one file (the adapter/lib).
  // Detection is arity-agnostic: matches `function <name>(` with any params.
  duplicateFunctions: ["uid", "ensureSrc", "writeProperty", "writeShadow", "writeTransform", "getSupabase", "getSupabaseAdmin"],
  duplicateFnThresholdWarn: 2,
  duplicateFnThresholdBlock: 4,

  // D3 — platform/tool coupling detection.
  // Files inside adapterGlob paths are the ONLY allowed locations for vendor imports/URLs.
  // Any match outside those paths is flagged.
  adapterGlobs: [
    /apps[/\\]nova-builder[/\\]src[/\\]lib[/\\]/,
    /packages[/\\][^/\\]+[/\\]src[/\\]/,
    /apps[/\\]nova-builder[/\\]src[/\\]app[/\\]api[/\\]/,   // API routes may call vendor APIs
  ],
  // Vendor package prefixes that trigger a D3 flag outside adapter paths.
  vendorPackages: ["@supabase/supabase-js", "resend", "stripe", "@lemonsqueezy", "@payos"],
  // Vendor URL hostnames that trigger a D3 flag outside adapter paths.
  vendorHosts: [
    "api-merchant.payos.vn",
    "lemonsqueezy.com",
    "api.resend.com",
    "cdn.contentful.com",
    "api.airtable.com",
    "api.notion.com",
    "api.vercel.com",
  ],

  // I1: max top-level fields in a *Props type before flagging ISP violation.
  propsMaxFields: 5,

  // I2: flag destructured params never referenced in function body.
  // Only flagged when zero body references (not "less than 2").
  propsMinDestructureLen: 4,
};

// ── Severity labels ───────────────────────────────────────────────────────────

const SEV = { BLOCKING: "🔴 BLOCKING", WARN: "🟡 WARN", INFO: "⚪ INFO" };

// ── Helpers ───────────────────────────────────────────────────────────────────

function isLegacy(relPath) {
  return CONFIG.legacyPrefixes.some(p => relPath.startsWith(p));
}

function isInAdapterLayer(relPath) {
  return CONFIG.adapterGlobs.some(re => re.test(relPath.replace(/\\/g, "/")));
}

function walk(dir, exts = [".ts", ".tsx"]) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory() && !entry.startsWith(".") && entry !== "node_modules") {
      results.push(...walk(full, exts));
    } else if (stat.isFile() && exts.includes(extname(entry))) {
      results.push(full);
    }
  }
  return results;
}

function rel(p) {
  return relative(ROOT, p).replace(/\\/g, "/");
}

// Brace-balanced extraction of the content between the first { and its matching }.
// Returns null when no balanced block is found.
function extractBraceBlock(src, startIdx) {
  let depth = 0;
  let start = -1;
  for (let i = startIdx; i < src.length; i++) {
    if (src[i] === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (src[i] === "}") {
      depth--;
      if (depth === 0 && start !== -1) return src.slice(start + 1, i);
    }
  }
  return null;
}

// Count top-level fields in a type body (skips nested braces).
function countTopLevelFields(typeBody) {
  let depth = 0;
  let count = 0;
  let pos = 0;
  while (pos < typeBody.length) {
    const ch = typeBody[pos];
    if (ch === "{" || ch === "(" || ch === "[") { depth++; pos++; continue; }
    if (ch === "}" || ch === ")" || ch === "]") { depth--; pos++; continue; }
    if (depth === 0) {
      // A field is signalled by an identifier followed by optional ? and :
      const fieldMatch = /^\s*(\w+)\s*\??:/.exec(typeBody.slice(pos));
      if (fieldMatch) {
        count++;
        // Skip past the identifier so we don't double-count
        pos += fieldMatch[0].length;
        continue;
      }
    }
    pos++;
  }
  return count;
}

// ── Checks ────────────────────────────────────────────────────────────────────

function checkS(files) {
  const violations = [];
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    const lines = src.split("\n");
    const r = rel(f);

    // S1: file too large
    if (lines.length > CONFIG.fileSizeWarn) {
      const exports = (src.match(/^export (function|const|class|type|interface)/gm) ?? []).length;
      const legacy = isLegacy(r);
      const sev = (!legacy && lines.length > CONFIG.fileSizeBlock) ? SEV.BLOCKING : SEV.WARN;
      violations.push({
        sev,
        file: r,
        line: null,
        rule: "S1",
        msg: `File is ${lines.length} lines (threshold ${CONFIG.fileSizeWarn}). ${exports} top-level exports.${legacy ? " [legacy — capped at WARN]" : ""}`,
        fix: legacy ? "Legacy — migrate away rather than refactoring." : "Split into focused modules.",
      });
    }

    // S2: mutation markers mixed with many UI sub-functions
    const hasMutation = CONFIG.mutationMarkers.some(m => src.includes(m));
    const uiSubFns = (src.match(/\bfunction \w+(?:Section|Panel|Row|Header)\b/g) ?? []).length;
    if (hasMutation && uiSubFns > 5 && lines.length > CONFIG.fileSizeWarn) {
      violations.push({
        sev: SEV.WARN,
        file: r,
        line: null,
        rule: "S2",
        msg: `Mixes write-path mutation logic with ${uiSubFns} UI sub-components in one file.`,
        fix: "Extract write-path to a shared utility; keep UI files UI-only.",
      });
    }
  }
  return violations;
}

function checkO(files) {
  const violations = [];
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    const lines = src.split("\n");
    const r = rel(f);

    // O1: long inline OR chain checking property names
    const orChains = src.match(/prop\s*===\s*["'][^'"]+["']\s*\|\|\s*prop\s*===\s*["'][^'"]+["']\s*\|\|\s*prop\s*===\s*["'][^'"]+["']/g) ?? [];
    for (const match of orChains) {
      const lineNo = lines.findIndex(l => l.includes(match)) + 1;
      violations.push({
        sev: SEV.WARN,
        file: r,
        line: lineNo,
        rule: "O1",
        msg: `Inline OR chain for property dispatch: "${match.slice(0, 80)}…" — adding a property requires editing this line.`,
        fix: "Replace with a Set so adding an entry doesn't touch dispatch logic.",
      });
    }

    // O2: hub files should render panels via registry import
    for (const hub of CONFIG.hubs) {
      if (!r.endsWith(hub.file)) continue;
      const panelImports = (src.match(/^import \{[^}]*Panel[^}]*\} from "\.\//gm) ?? []).length;
      const usesRegistry = src.includes(hub.registryModule);
      if (panelImports > 0 && !usesRegistry) {
        violations.push({
          sev: SEV.INFO,
          file: r,
          line: null,
          rule: "O2",
          msg: `${hub.file} imports ${panelImports} panel(s) directly. Each new panel still requires code changes here.`,
          fix: `Import panels from ${hub.registryModule} so ${hub.file} stays closed to modification.`,
        });
      }
    }
  }
  return violations;
}

function checkL(files) {
  const violations = [];
  for (const family of CONFIG.interfaceFamilies) {
    const familyFiles = files.filter(f => f.endsWith(".tsx") || f.endsWith(".ts"));
    for (const f of familyFiles) {
      const src = readFileSync(f, "utf8");
      const r = rel(f);
      // Find exported components matching the family suffix
      const exportedMembers = (src.match(new RegExp(`export function \\w+${family.suffix}`, "g")) ?? []);
      if (exportedMembers.length === 0) continue;
      // Find the Props type used by this file
      const propsMatch = src.match(/type\s+\w*Props\s*=\s*\{/);
      if (!propsMatch) continue;
      const bodyStart = src.indexOf("{", propsMatch.index);
      const body = extractBraceBlock(src, bodyStart);
      if (!body) continue;
      // Only count required fields (no ?)
      const requiredFields = (body.match(/\b\w+\s*:/g) ?? []).length;
      if (requiredFields > family.maxRequiredProps) {
        violations.push({
          sev: SEV.WARN,
          file: r,
          line: null,
          rule: "L1",
          msg: `${exportedMembers.map(e => e.replace("export function ", "")).join(", ")} has ${requiredFields} required props (max ${family.maxRequiredProps} for ${family.suffix} family).`,
          fix: `Unify to a shared ${family.suffix}Props interface with ≤${family.maxRequiredProps} required props; derive extras from atoms internally.`,
        });
      }
    }
  }
  return violations;
}

function checkI(files) {
  const violations = [];
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    const lines = src.split("\n");
    const r = rel(f);

    // I1: Props types with too many top-level fields
    const propsTypeRe = /type\s+\w*Props\s*=\s*\{/g;
    let m;
    while ((m = propsTypeRe.exec(src)) !== null) {
      const bodyStart = src.indexOf("{", m.index);
      const body = extractBraceBlock(src, bodyStart);
      if (!body) continue;
      const fields = countTopLevelFields(body);
      if (fields > CONFIG.propsMaxFields) {
        const lineNo = src.slice(0, m.index).split("\n").length;
        violations.push({
          sev: SEV.WARN,
          file: r,
          line: lineNo,
          rule: "I1",
          msg: `Props type has ${fields} top-level fields (threshold ${CONFIG.propsMaxFields}). Consumers may receive props they don't use.`,
          fix: "Group related props into cohesive objects; aim for ≤5 top-level fields.",
        });
      }
    }

    // I2: Destructured params with ZERO body references
    const fnMatch = src.match(/function \w+\(\s*\{([^}]+)\}\s*:/);
    if (!fnMatch) continue;
    const paramNames = fnMatch[1]
      .split(",")
      .map(p => p.trim().split(/[\s:=]/)[0].replace(/\?$/, "").trim())
      .filter(p => p.length > 1);
    if (paramNames.length < CONFIG.propsMinDestructureLen) continue;
    const body = src.slice(src.indexOf(fnMatch[0]) + fnMatch[0].length);
    const unused = paramNames.filter(p => (body.match(new RegExp(`\\b${p}\\b`, "g")) ?? []).length === 0);
    if (unused.length > 0) {
      violations.push({
        sev: SEV.WARN,
        file: r,
        line: null,
        rule: "I2",
        msg: `Params with zero body references: ${unused.join(", ")}. Component forced to accept data it never uses.`,
        fix: "Remove props that have zero references; split component if different callers need different data.",
      });
    }
  }
  return violations;
}

function checkD(files) {
  const violations = [];

  // D1: duplicated function definitions (arity-agnostic)
  const fnOccurrences = {};
  for (const name of CONFIG.duplicateFunctions) fnOccurrences[name] = [];

  for (const f of files) {
    const src = readFileSync(f, "utf8");
    for (const name of CONFIG.duplicateFunctions) {
      const re = new RegExp(`\\bfunction\\s+${name}\\s*\\(`);
      if (re.test(src)) fnOccurrences[name].push(rel(f));
    }
  }

  for (const [name, locs] of Object.entries(fnOccurrences)) {
    if (locs.length >= CONFIG.duplicateFnThresholdWarn) {
      violations.push({
        sev: locs.length >= CONFIG.duplicateFnThresholdBlock ? SEV.BLOCKING : SEV.WARN,
        file: locs.join(", "),
        line: null,
        rule: "D1",
        msg: `"function ${name}(" defined in ${locs.length} files. Each caller depends on its own concrete implementation.`,
        fix: "Extract to a single adapter module in lib/ and import from there.",
      });
    }
  }

  // D3: vendor package/URL coupling outside the adapter layer
  for (const f of files) {
    const r = rel(f);
    if (isInAdapterLayer(r)) continue;

    const src = readFileSync(f, "utf8");
    const isUIComponent = /[/\\](builder|canvas|components)[/\\]/.test(r);

    for (const pkg of CONFIG.vendorPackages) {
      if (src.includes(`from "${pkg}`) || src.includes(`from '${pkg}`)) {
        violations.push({
          sev: isUIComponent ? SEV.BLOCKING : SEV.WARN,
          file: r,
          line: null,
          rule: "D3",
          msg: `Imports vendor package "${pkg}" outside the adapter layer (lib/** or packages/**).`,
          fix: `Move vendor calls to lib/adapters/ and expose a generic interface; import that instead.`,
        });
      }
    }

    for (const host of CONFIG.vendorHosts) {
      if (src.includes(host)) {
        violations.push({
          sev: isUIComponent ? SEV.BLOCKING : SEV.WARN,
          file: r,
          line: null,
          rule: "D3",
          msg: `Hardcoded vendor URL host "${host}" outside the adapter layer.`,
          fix: `Move the fetch call to lib/adapters/ so routes depend on the adapter, not the vendor URL.`,
        });
      }
    }
  }

  return violations;
}

// ── Scoring ───────────────────────────────────────────────────────────────────

function tally(violations) {
  return {
    blocking: violations.filter(v => v.sev === SEV.BLOCKING).length,
    warn:     violations.filter(v => v.sev === SEV.WARN).length,
    info:     violations.filter(v => v.sev === SEV.INFO).length,
  };
}

// ── V: visual-token discipline (ADR-NB-012 / ADR-NB-020) ─────────────────────

function checkV(files) {
  const violations = [];

  // V1: builder/app chrome files declaring a local `const C = {` palette
  // without importing uiTheme. Aggregated into one WARN to keep the report
  // readable — the list is the MV3 migration backlog.
  const offenders = [];
  for (const f of files) {
    const r = rel(f);
    if (!/[/\\](builder|app)[/\\]/.test(r)) continue;
    if (/[/\\]stubs[/\\]/.test(r)) continue;
    const src = readFileSync(f, "utf8");
    if (/^const C = \{/m.test(src) && !src.includes("@/lib/uiTheme")) {
      offenders.push(r);
    }
  }
  if (offenders.length > 0) {
    violations.push({
      sev: SEV.WARN,
      file: `${offenders.length} files (first 8: ${offenders.slice(0, 8).join(", ")})`,
      line: null,
      rule: "V1",
      msg: `Local "const C = {…}" palette without importing uiTheme — ADR-NB-012 declares uiTheme.ts the single token source; ADR-NB-020 requires builder chrome on Nova tokens.`,
      fix: `Import { DARK as C } from "@/lib/uiTheme" (or derive component tokens from DARK). Mass migration tracked as Tier P MV3.`,
    });
  }

  return violations;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const allFiles = [];
for (const { label, path: scanPath } of CONFIG.scanDirs) {
  if (!existsSync(scanPath)) {
    console.log(`  ⚠ Skipping ${label} — directory not found`);
    continue;
  }
  allFiles.push(...walk(scanPath));
}

console.log(`\n${"═".repeat(70)}`);
console.log(`  SOLID Audit — Generic config-driven check`);
console.log(`  Scanned ${allFiles.length} files across ${CONFIG.scanDirs.length} packages`);
console.log(`${"═".repeat(70)}\n`);

const allViolations = [
  ...checkS(allFiles).map(v => ({ ...v, principle: "S — Single Responsibility" })),
  ...checkO(allFiles).map(v => ({ ...v, principle: "O — Open / Closed" })),
  ...checkL(allFiles).map(v => ({ ...v, principle: "L — Liskov Substitution" })),
  ...checkI(allFiles).map(v => ({ ...v, principle: "I — Interface Segregation" })),
  ...checkD(allFiles).map(v => ({ ...v, principle: "D — Dependency Inversion" })),
  ...checkV(allFiles).map(v => ({ ...v, principle: "V — Visual token discipline (ADR-NB-012/020)" })),
];

const byPrinciple = {};
for (const v of allViolations) {
  (byPrinciple[v.principle] ??= []).push(v);
}

let hasBlocking = false;

for (const [principle, violations] of Object.entries(byPrinciple)) {
  const { blocking, warn, info } = tally(violations);
  const badge = blocking > 0 ? "🔴" : warn > 0 ? "🟡" : "✅";
  console.log(`${badge}  ${principle}`);
  console.log(`   ${blocking} blocking · ${warn} warnings · ${info} info\n`);
  for (const v of violations) {
    if (v.sev === SEV.BLOCKING) hasBlocking = true;
    const loc = v.line ? `${v.file}:${v.line}` : v.file;
    console.log(`   ${v.sev}  [${v.rule}]`);
    console.log(`   File: ${loc}`);
    console.log(`   ${v.msg}`);
    console.log(`   → Fix: ${v.fix}`);
    console.log();
  }
}

const totals = tally(allViolations);
console.log(`${"─".repeat(70)}`);
console.log(`  TOTAL: ${totals.blocking} blocking · ${totals.warn} warnings · ${totals.info} info`);
console.log(`${"─".repeat(70)}\n`);

if (totals.blocking > 0 || totals.warn > 0 || totals.info > 0) {
  if (totals.blocking > 0) {
    console.log("❌  Blocking violations found. Fix before next tier starts.\n");
  } else {
    console.log("⚠️   Warnings/info found. Schedule fixes in next phase.\n");
  }
  process.exit(totals.blocking > 0 ? 1 : 0);
} else {
  console.log("✅  No violations found. Perfect SOLID score.\n");
  process.exit(0);
}
