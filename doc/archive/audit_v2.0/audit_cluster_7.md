# EXHAUSTIVE Audit Report - Cluster 7: Renderer & Code Generation

This cluster converts the internal JSON schema into a deployable Next.js (React) codebase. The audit reveals critical code-generation bugs that will cause the exported Next.js app to fail to compile or silently destroy formatting.

---

## 1. Comprehensive Issue Identification

### A. The Invalid Identifier Build Crash
1. **Unsafe Component Naming:** In `pageFile.ts`, the Next.js page component name is generated dynamically from the user's page name:
   ```typescript
   const componentName = page.name.split(/[\s/]+/).map(...).join("") + "Page";
   ```
2. **The Consequence:** If a user names their page "404 Error" or "100% Free Trial", the generator creates `export default function 404ErrorPage() {` or `export default function 100%FreeTrialPage() {`. Both of these are fatal SyntaxErrors in JavaScript/TypeScript. The Vercel deployment will immediately crash with a compilation error.

### B. The Multiline String JSX Bug
1. **Raw String Attributes:** In `propsToJSX.ts`, string properties are serialized using double quotes: `return \`\${key}="\${escaped}"\`;`.
2. **The Consequence:** If a user enters a multi-line paragraph in a `TextBlock` ("Hello\nWorld"), the generator outputs `text="Hello\nWorld"`. In React/JSX, `\n` inside double quotes is completely ignored and treated as a standard space. All of the user's hard-earned text formatting, line breaks, and paragraph spacing will be instantly wiped out on the live site. To pass a literal string containing newlines in JSX, it *must* be wrapped in curly braces: `text={"Hello\nWorld"}`.

### C. Missing Dependency Verification
1. **Blind Imports:** `pageFile.ts` blindly generates an import statement for every `type` used on the page: `import { Button } from "@/components/blocks/Button";`.
2. **The Consequence:** `index.ts` only writes block files if they exist in the hardcoded `BLOCK_SOURCES` dictionary. If the user somehow places an unknown block (or a legacy block that was removed from `BLOCK_SOURCES`), `index.ts` skips writing the file, but `pageFile.ts` still generates the `import`. Next.js will crash at build time with a `Module not found` error. The generator must either bundle a fallback component or refuse to generate imports for missing files.

### D. Layout.tsx & Global CSS Rigidity
1. **Hardcoded Wrappers:** The `pageFile.ts` wraps every page in a `<main className="min-h-screen flex flex-col">`. This hardcoded constraint prevents users from creating specialized pages (like a full-screen canvas app, a modal page, or a page with a sticky sidebar that relies on a different flex direction). 

---

## 2. Architectural Decisions & Recommendations

The Code Generator currently treats JavaScript AST generation as simple string concatenation, leading to severe edge-case crashes.

### Option A: Continue with Regex/String Replacement
- **Concept:** Patch the individual bugs by adding more regexes (e.g., regex to sanitize component names, regex to check for newlines in strings).
- **Pros:** Fast to implement in the short term.
- **Cons:** Whack-a-mole. String-based AST generation is historically prone to injection attacks and endless syntax bugs.

### Option B: The "Proper AST" Approach
- **Concept:** Use Babel (`@babel/types` and `@babel/generator`) or `ts-morph` to generate the React components programmatically instead of concatenating raw strings.
- **Pros:** 100% guaranteed syntactically valid TypeScript output. Impossible to generate invalid component names or broken JSX attributes.
- **Cons:** Significantly increases the bundle size of the `@studio/renderer` package.

### 🏆 Recommendation for Nova v2.0
**Adopt Option B for long-term stability, but apply immediate patches for v2.0.**
- **Action 1 (Component Naming):** Immediately patch `pageFile.ts` to strip all non-alphabetic starting characters and non-alphanumeric trailing characters: `name.replace(/^[^a-zA-Z]+/, "").replace(/[^a-zA-Z0-9]/g, "")`. Fall back to `"Page"` if the result is empty.
- **Action 2 (JSX Strings):** Patch `propsToJSX.ts` to ALWAYS use `JSON.stringify()` for strings. Replace the custom escaping logic with `return \`\${key}={\${JSON.stringify(value)}}\`;` which correctly preserves newlines and handles all escaping perfectly via JSON standard.
- **Action 3 (Build Safety):** Add a validation step in `generateAll` that aborts the build and shows an error toast to the user if a required block dependency is missing from `BLOCK_SOURCES`. Do not allow the Vercel deployment to start if the code is known to be broken.
