"use client";
// P44 / M4 — Data binding: page variables (DataSource "variable") + resource
// endpoints (Resource) + prop bindings (Prop "expression"). All mutations run
// inside updateData transactions (M1) — undoable across the full atom set and
// synced to the canvas.

import type { DataSource, Prop, Resource } from "@webstudio-is/sdk";
import { updateData } from "./transactions";
import { getExpressionDependencies, encodeVariableReference } from "./expression";
import { uid } from "./uid";

export type VariableType = "string" | "number" | "boolean" | "json";

export function createVariable(name: string, type: VariableType): DataSource {
  const id = uid("var_");
  let value: DataSource extends { value: infer V } ? V : never;
  switch (type) {
    case "number": value = { type: "number", value: 0 } as typeof value; break;
    case "boolean": value = { type: "boolean", value: false } as typeof value; break;
    case "json": value = { type: "json", value: {} } as typeof value; break;
    default: value = { type: "string", value: "" } as typeof value;
  }
  const ds: DataSource = { type: "variable", id, name: name.trim() || "variable", value };
  updateData(({ dataSources }) => {
    dataSources.set(id, ds);
  });
  return ds;
}

export function updateVariableValue(id: string, raw: string): void {
  updateData(({ dataSources }) => {
    const ds = dataSources.get(id);
    if (!ds || ds.type !== "variable") return;
    let value = ds.value;
    switch (ds.value.type) {
      case "number": value = { type: "number", value: Number(raw) || 0 }; break;
      case "boolean": value = { type: "boolean", value: raw === "true" }; break;
      case "json": {
        try { value = { type: "json", value: JSON.parse(raw) }; } catch { /* keep prior */ }
        break;
      }
      default: value = { type: "string", value: raw };
    }
    dataSources.set(id, { ...ds, value });
  });
}

export function renameVariable(id: string, name: string): void {
  updateData(({ dataSources }) => {
    const ds = dataSources.get(id);
    if (!ds) return;
    dataSources.set(id, { ...ds, name: name.trim() || ds.name });
  });
}

export function deleteVariable(id: string): void {
  updateData(({ dataSources, props }) => {
    dataSources.delete(id);
    // Detach any prop bound to (or depending on) this variable so the canvas
    // does not evaluate a dangling reference.
    for (const [propId, prop] of props) {
      if (prop.type === "expression" && getExpressionDependencies(prop.value).has(id)) {
        props.delete(propId);
      } else if (prop.type === "parameter" && prop.value === id) {
        props.delete(propId);
      }
    }
  });
}

// ── Prop bindings (M4) ────────────────────────────────────────────────────────

// Bind a prop to a raw encoded expression (advanced editor path).
export function bindPropExpression(instanceId: string, name: string, encodedExpression: string): void {
  updateData(({ props }) => {
    const allProps = props as Map<string, Prop>;
    const existingId = [...allProps.values()].find(
      (p) => p.instanceId === instanceId && p.name === name
    )?.id;
    const id = existingId ?? uid("prop_");
    allProps.set(id, { id, instanceId, name, type: "expression", value: encodedExpression });
  });
}

// Bind a prop directly to a single variable (the common popover path).
export function bindPropToVariable(instanceId: string, name: string, dataSourceId: string): void {
  bindPropExpression(instanceId, name, encodeVariableReference(dataSourceId));
}

// Remove any binding on a prop, reverting it to a plain (unset) prop.
export function unbindProp(instanceId: string, name: string): void {
  updateData(({ props }) => {
    for (const [propId, prop] of props) {
      if (prop.instanceId === instanceId && prop.name === name) {
        props.delete(propId);
      }
    }
  });
}

// Usage tracking: how many props across the project bind to a given variable.
export function countVariableUsage(dataSourceId: string, props: Map<string, Prop>): number {
  let count = 0;
  for (const prop of props.values()) {
    if (prop.type === "expression" && getExpressionDependencies(prop.value).has(dataSourceId)) count++;
    else if (prop.type === "parameter" && prop.value === dataSourceId) count++;
  }
  return count;
}

export type HttpMethod = "get" | "post" | "put" | "delete";

export function createResource(name: string, url: string, method: HttpMethod): Resource {
  const id = uid("res_");
  const cleanName = name.trim() || "resource";
  const res: Resource = { id, name: cleanName, url, method, headers: [] };
  // Also create a matching "resource" data source so the resource can be bound to
  // props and resolved by the runtime loader (M5). The data source id is what
  // expressions reference; it points at the resource via resourceId.
  const dsId = uid("var_");
  updateData(({ resources, dataSources }) => {
    resources.set(id, res);
    dataSources.set(dsId, {
      type: "resource",
      id: dsId,
      name: cleanName,
      resourceId: id,
    } as DataSource);
  });
  return res;
}

export function updateResource(id: string, patch: Partial<Pick<Resource, "name" | "url" | "method" | "headers" | "body">>): void {
  updateData(({ resources }) => {
    const res = resources.get(id);
    if (!res) return;
    resources.set(id, { ...res, ...patch });
  });
}

export function deleteResource(id: string): void {
  updateData(({ resources, dataSources, props }) => {
    resources.delete(id);
    // Remove the linked resource data source + detach any prop that referenced it.
    for (const [dsId, ds] of dataSources) {
      if (ds.type === "resource" && ds.resourceId === id) {
        dataSources.delete(dsId);
        for (const [propId, prop] of props) {
          if (
            (prop.type === "expression" && getExpressionDependencies(prop.value).has(dsId)) ||
            (prop.type === "parameter" && prop.value === dsId)
          ) {
            props.delete(propId);
          }
        }
      }
    }
  });
}
