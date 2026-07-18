# EXHAUSTIVE Audit Report - Cluster 10: Data Contracts & Migrations

This final cluster is the absolute core of the Nova Editor: the JSON Schema definitions (`packages/schema/src`). The audit reveals strictness bugs that prevent developers from building complex blocks, and fragility in how old projects are upgraded.

---

## 1. Comprehensive Issue Identification

### A. The `PropsSchema` "Array of Objects" Ban
1. **The Flaw:** In `props.schema.ts`, the schema dictates exactly what can be saved into a block's properties. It defines values as either a primitive, an array of primitives (`SerializableArray`), or a flat record of primitives. 
2. **The Consequence:** Because of this strict Zod union, a developer **cannot build a block that accepts an array of objects**. For example, if a developer builds a `TestimonialCarousel` block and wants its props to be `testimonials: [{ author: "John", text: "Great!" }]`, Zod will violently crash when saving the project. The `PropsSchema` effectively outlaws complex, nested data structures, severely limiting the power of custom blocks.

### B. In-Place Mutation in Migrations
1. **The Flaw:** In `runner.ts`, the migration scripts (e.g., `"1.0→1.1"`) directly mutate the `data` object passed into them:
   ```typescript
   for (const page of pages) {
     if (!page["seo"]) page["seo"] = {}; // MUTATION
   }
   ```
2. **The Consequence:** While the outer shell of the project is cloned (`return { ...data }`), the inner arrays and objects are mutated by reference. If a component passes an immutable Zustand state object into `migrateToLatest()`, this mutation will trigger a strict-mode violation or silent state pollution in the frontend memory. 

### C. Missing Base Validation Before Migration
1. **The Flaw:** `migrateToLatest(raw: unknown)` blindly casts `raw` to an object and assumes `schemaVersion` exists. If a user uploads a completely random JSON file (e.g., a package.json file), the migration runner attempts to read `data["schemaVersion"]`, gets `undefined`, and crashes with an unhelpful system error `No migration found from schema version "undefined"`.
2. **The Consequence:** Poor UX and unhandled exceptions. The system should gracefully reject non-Nova JSON files *before* attempting to run complex array migrations on them.

---

## 2. Architectural Decisions & Recommendations

### Issue A: `PropsSchema` Restrictions
**Option A: Fully Recursive JSON Schema**
- **Concept:** Define `PropsValueSchema` as a fully recursive JSON type that allows infinite nesting of arrays and records.
- **Pros:** Total freedom for developers to define any prop structure.
- **Cons:** Harder to statically type-check at the TypeScript level without relying on `any`.

**Option B: Explicit Level-2 Nesting**
- **Concept:** Expand the union to explicitly support `z.array(z.record(SerializableLeaf))`, but stop there.
- **Pros:** Keeps Zod performance high while unlocking the most common complex type (array of objects).
- **Cons:** Still arbitrary limitations.

🏆 **Recommendation for v2.0:** **Option A**. A no-code builder must support arbitrary JSON props. Zod has a standard pattern for recursive JSON schemas (`z.lazy()`); it should be implemented here to unleash custom block developers.

### Issue B & C: Migration Runner Fragility
**Option A: Pre-validation with `BaseSchema` & Deep Cloning**
- **Concept:** Create a `BaseProjectSchema` that only checks for `schemaVersion`. Parse the file through this *first*. Then, `structuredClone(data)` before passing it through the migration chain to guarantee pure functions.
- **Pros:** 100% pure, functional migrations with friendly error messages for invalid files.
- **Cons:** Negligible performance hit for the deep clone.

🏆 **Recommendation for v2.0:** **Option A**. Safe state management requires pure functions. Deep cloning the input object before migration ensures we never accidentally pollute active application state.
