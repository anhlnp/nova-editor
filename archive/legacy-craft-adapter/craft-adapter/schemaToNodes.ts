// packages/editor/src/craft-adapter/schemaToNodes.ts
// Converts Nova Project elements → Craft.js SerializedNodes (used on editor load).
import type { SerializedNodes } from "@craftjs/core";
import type { Element } from "@studio/schema";
import { INSTANCE_TYPE } from "@studio/schema";
import { registry, UNKNOWN_BLOCK_TYPE } from "@studio/registry";

export function schemaToNodes(elements: Element[]): SerializedNodes {
  // ROOT must use a resolvedName that IS registered in the Craft resolver.
  // "div" is not a registered component → resolver["div"] === undefined → crash.
  // NovaRootCanvas is registered in CraftProvider's editorResolver.
  const nodes: SerializedNodes = {
    ROOT: {
      type: { resolvedName: "NovaRootCanvas" },
      props: {},
      parent: null as unknown as string,
      displayName: "Page",
      custom: {},
      isCanvas: true,
      // Filled in below — only elements that resolve to a registered block.
      nodes: [],
      linkedNodes: {},
      hidden: false,
    },
  };

  // Defense in depth: an element whose `type` is not in the registry would emit a
  // node with `resolvedName` the Craft resolver can't resolve, and Craft's
  // `toNode` crashes the ENTIRE canvas (destructuring `type` of undefined) — not
  // just that one node. The migration layer should normally prevent unknown types.
  //
  // C5.1: a renamed/removed block must NEVER silently delete the user's content.
  // Previously unknown types (AND their whole subtree) were skipped — so renaming
  // a container block dropped every valid child inside it. Now an unknown type is
  // rendered as the `UnknownBlock` fallback: it still recurses into and mounts the
  // children, and the original type is round-tripped back on save (see
  // nodesToSchema) so nothing is lost.
  function processChildren(children: Element[], parentId: string): string[] {
    const emitted: string[] = [];
    for (const child of children) {
      processElement(child, parentId);
      emitted.push(child.id);
    }
    return emitted;
  }

  function processElement(el: Element, parentId: string) {
    // Instance elements carry masterId+overrides and have no Craft children (non-enterable).
    // Emit them directly so they are resolved by the registered InstanceBlock in the resolver
    // and never fall through to the UnknownBlock path (which would bake _novaUnknownType
    // and lose the Instance convention on the next nodesToSchema save).
    if (el.type === INSTANCE_TYPE) {
      nodes[el.id] = {
        type: { resolvedName: INSTANCE_TYPE },
        props: el.props,
        parent: parentId,
        displayName: "Instance",
        custom: {},
        isCanvas: false,
        nodes: [],
        linkedNodes: {},
        hidden: false,
      };
      return;
    }

    const blockConfig = registry[el.type];

    // Process children first so this node's `nodes` array references its children.
    const childIds = processChildren(el.children, el.id);

    if (blockConfig === undefined) {
      console.warn(
        `[schemaToNodes] Unknown block type "${el.type}" (id ${el.id}) — rendering ` +
          `as UnknownBlock and preserving its ${childIds.length} child(ren). Likely a ` +
          `removed/renamed block that wasn't migrated.`
      );
      nodes[el.id] = {
        type: { resolvedName: UNKNOWN_BLOCK_TYPE },
        // Keep the original props and remember the original type so save restores it.
        props: { ...el.props, _novaUnknownType: el.type },
        parent: parentId,
        displayName: `Unknown: ${el.type}`,
        custom: {},
        isCanvas: true,
        nodes: childIds,
        linkedNodes: {},
        hidden: false,
      };
      return;
    }

    nodes[el.id] = {
      type: { resolvedName: el.type },
      props: el.props,
      parent: parentId,
      displayName: blockConfig.craftConfig.displayName ?? el.type,
      custom: {},
      isCanvas: blockConfig.craftConfig.isCanvas ?? false,
      nodes: childIds,
      linkedNodes: {},
      hidden: false,
    };
  }

  const rootIds = processChildren(elements, "ROOT");
  nodes.ROOT!.nodes = rootIds;

  return nodes;
}
