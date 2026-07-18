// M9 — Publish codegen: resolve bound props to literal values.
//
// At publish time there is no live builder scope, so a prop bound to a variable
// or expression is baked to the current value of its data sources. This closes
// the audit-#6 gap "expressions dropped in output": the old exporter emitted the
// raw prop.value (an encoded expression string) as the attribute. Now bound props
// resolve to their computed value, matching what the canvas paints.
//
// Pure — reuses the M4 evaluator (ADR-NB-021). ADR-NB-023.

import type { Prop, DataSources } from "@webstudio-is/sdk";
import { evaluateExpression } from "@/lib/expression";

// Resolve one prop to its published value. Non-bound props pass through unchanged.
export function resolvePropValue(prop: Prop, dataSources: DataSources): unknown {
  if (prop.type === "expression") {
    return evaluateExpression(prop.value, dataSources);
  }
  if (prop.type === "parameter") {
    const ds = dataSources.get(prop.value);
    return ds?.type === "variable" ? ds.value.value : undefined;
  }
  return prop.value;
}

// Build instanceId → { propName: resolvedValue } for an entire project.
export function resolveProps(
  props: Map<string, Prop>,
  dataSources: DataSources
): Map<string, Record<string, unknown>> {
  const byInstance = new Map<string, Record<string, unknown>>();
  for (const prop of props.values()) {
    const resolved = resolvePropValue(prop, dataSources);
    if (resolved === undefined) continue;
    const bag = byInstance.get(prop.instanceId) ?? {};
    bag[prop.name] = resolved;
    byInstance.set(prop.instanceId, bag);
  }
  return byInstance;
}
