// packages/editor/src/craft-adapter/nodesToSchema.ts
// Converts Craft.js SerializedNodes → Nova Project elements (called on every Craft onChange).
import type { SerializedNodes } from "@craftjs/core";
import type { Element } from "@studio/schema";
import { UNKNOWN_BLOCK_TYPE } from "@studio/registry";

const NODE_ID_RE = /^node_[A-Za-z0-9_-]{8}$/;

// v5.1.0 (ADR-040): Craft now mints conforming `node_<8>` ids at node creation —
// a pinned pnpm patch of `@craftjs/core` createNode (`patches/@craftjs__core@0.2.12.patch`)
// prefixes `"node_" + getRandomId(8)`. So the old `toNovaId()` slice-hack (ADR-012,
// TD-001/002) is gone: every Craft node id already matches ADR-005, and schema-declared
// ids pass through schemaToNodes unchanged. This dev-only guard catches the one failure
// mode — the patch not being applied (e.g. after a Craft upgrade) — without ever
// crashing the canvas in production.
let warnedNonNovaId = false;
function assertNovaId(id: string): void {
  if (process.env.NODE_ENV === "production") return;
  if (!NODE_ID_RE.test(id) && !warnedNonNovaId) {
    warnedNonNovaId = true;
    console.warn(
      `[nodesToSchema] Craft node id "${id}" is not a node_<8> — the @craftjs/core ` +
        `id patch (patches/@craftjs__core@0.2.12.patch, ADR-040) may not be applied. ` +
        `Run \`pnpm install\` to reapply it.`
    );
  }
}

export function nodesToSchema(craftNodes: SerializedNodes): Element[] {
  function buildElement(nodeId: string): Element {
    const node = craftNodes[nodeId];
    if (!node) throw new Error(`Craft node "${nodeId}" not found`);
    // Craft's `type` is `string | { resolvedName: string }` depending on whether
    // the node was created from a resolver name or a raw component.
    const resolvedName =
      typeof node.type === "string" ? node.type : node.type.resolvedName;

    let type = resolvedName;
    let props = node.props as Record<string, unknown>;

    // C5.1: an UnknownBlock fallback carries the original (unresolved) type in
    // `_novaUnknownType`. Restore it verbatim and strip the marker so the save is
    // lossless — the original type name survives the round-trip even while the
    // block stays unregistered.
    if (resolvedName === UNKNOWN_BLOCK_TYPE && typeof props["_novaUnknownType"] === "string") {
      type = props["_novaUnknownType"];
      const { _novaUnknownType: _omit, ...rest } = props;
      props = rest;
    }

    assertNovaId(nodeId);
    return {
      id: nodeId,
      type,
      props,
      children: node.nodes.map((childId) => buildElement(childId)),
    };
  }

  const root = craftNodes["ROOT"];
  if (!root) return [];
  return root.nodes.map((id) => buildElement(id));
}
