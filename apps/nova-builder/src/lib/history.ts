// Undo/redo — transaction-based since v21.0.0 (Tier P M1, ADR-NB-019 p1;
// supersedes the ADR-NB-006 5-atom snapshot stack, which restored inconsistent
// halves when pages/breakpoints/dataSources/resources/assets were mutated).
//
// This module re-exports the transaction layer so existing import paths keep
// working. captureSnapshot() is intentionally GONE: mutations must run inside
// lib/transactions.ts updateData() — a leftover captureSnapshot caller is a
// compile error, not a silent undo hole.

export { undo, redo, $canUndo, $canRedo } from "./transactions";
