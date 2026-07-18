// M9 — Assemble the full component-meta map for publish/export.
// Same libraries the canvas registers (core + base + radix + nova), flattened
// into one Map so cssGen can emit component preset styles server-side.

import { coreMetas, type WsComponentMeta } from "@webstudio-is/sdk";
import * as baseComponentMetas from "@webstudio-is/sdk-components-react/metas";
import * as radixComponentMetas from "@webstudio-is/sdk-components-react-radix/metas";

const RADIX_NAMESPACE = "@webstudio-is/sdk-components-react-radix";

export function getExportMetas(): Map<string, WsComponentMeta> {
  const metas = new Map<string, WsComponentMeta>();

  for (const [name, meta] of Object.entries(coreMetas as Record<string, WsComponentMeta>)) {
    metas.set(name, meta);
  }
  for (const [name, meta] of Object.entries(baseComponentMetas as Record<string, WsComponentMeta>)) {
    metas.set(name, meta);
  }
  // Radix metas are namespaced in the registry — match the canvas registration.
  for (const [name, meta] of Object.entries(radixComponentMetas as Record<string, WsComponentMeta>)) {
    metas.set(`${RADIX_NAMESPACE}:${name}`, meta);
  }

  return metas;
}
