"use client";
// M4 — Data binding runtime.
//
// A bound prop is stored as `{ type: "expression", value }` where `value` is an
// encoded expression string that references data sources by their encoded name
// (`$ws$dataSource$<id>`), exactly like Webstudio. This module turns that encoded
// expression into a value at render time by:
//   1. building a variable-value scope from the current $dataSources map, and
//   2. transpiling the encoded expression into an executable one whose identifiers
//      are the scope's safe JS names, then evaluating it with those values.
//
// The SDK owns the parsing/encoding primitives (ADR-NB-007 — never import from
// reference/); this file is the thin Nova-side runtime that composes them. It has
// no React and no atom writes, so both canvas and builder can call it (DIP).

import {
  createScope,
  generateExpression,
  transpileExpression,
  encodeDataVariableId,
  decodeDataVariableId,
  getExpressionIdentifiers,
  systemParameter,
  SYSTEM_VARIABLE_ID,
  type DataSource,
  type DataSources,
} from "@webstudio-is/sdk";

export { encodeDataVariableId, decodeDataVariableId };

// Current value of a single data source. Variables carry their own value;
// parameters/resources resolve to whatever the caller injected (or undefined).
const dataSourceValue = (
  ds: DataSource,
  injected: Map<string, unknown> | undefined
): unknown => {
  if (injected?.has(ds.id)) return injected.get(ds.id);
  if (ds.type === "variable") return ds.value.value;
  return undefined;
};

// Evaluate one encoded expression against the current data sources.
// Never throws: an invalid/partial expression yields `undefined` so the canvas
// keeps rendering (parity with Webstudio's optional-chaining transpile).
export const evaluateExpression = (
  encodedExpression: string,
  dataSources: DataSources,
  injectedValues?: Map<string, unknown>
): unknown => {
  const scope = createScope([]);
  const usedDataSources: DataSources = new Map();
  let executable: string;
  try {
    executable = generateExpression({
      expression: encodedExpression,
      dataSources,
      usedDataSources,
      scope,
    });
  } catch {
    return undefined;
  }

  // Map each used data source's scoped JS name → its current value.
  const names: string[] = [];
  const values: unknown[] = [];
  for (const ds of usedDataSources.values()) {
    names.push(scope.getName(ds.id, ds.name));
    values.push(dataSourceValue(ds, injectedValues));
  }
  // The system parameter may be referenced even when absent from dataSources.
  if (encodedExpression.includes("$ws$system")) {
    const sysName = scope.getName(systemParameter.id, systemParameter.name);
    if (!names.includes(sysName)) {
      names.push(sysName);
      values.push(injectedValues?.get(SYSTEM_VARIABLE_ID));
    }
  }

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(...names, `return (${executable});`);
    return fn(...values);
  } catch {
    return undefined;
  }
};

// Which data source ids does this encoded expression depend on?
// Used for usage tracking and for cleaning up bindings when a variable is deleted.
export const getExpressionDependencies = (
  encodedExpression: string
): Set<string> => {
  const deps = new Set<string>();
  for (const identifier of getExpressionIdentifiers(encodedExpression)) {
    const id = decodeDataVariableId(identifier);
    if (id !== undefined) deps.add(id);
  }
  return deps;
};

// Build a fresh encoded expression that references a single variable by id.
// This is the common case for the binding popover ("bind this prop to <var>").
export const encodeVariableReference = (dataSourceId: string): string =>
  encodeDataVariableId(dataSourceId);

// Turn an encoded expression (`$ws$dataSource$<id>`) into the human form the user
// edits (variable names), by replacing each encoded identifier with its name.
export const decodeExpression = (
  encodedExpression: string,
  dataSources: DataSources
): string => {
  if (encodedExpression.trim().length === 0) return "";
  try {
    return transpileExpression({
      expression: encodedExpression,
      replaceVariable: (identifier) => {
        const id = decodeDataVariableId(identifier);
        if (id === undefined) return undefined;
        return dataSources.get(id)?.name ?? identifier;
      },
    });
  } catch {
    return encodedExpression;
  }
};

// Inverse of decodeExpression: turn the human form (variable names) the user typed
// back into the encoded form for storage. Unknown names are left as-is so the
// linter can flag them.
export const encodeExpression = (
  humanExpression: string,
  dataSources: DataSources
): string => {
  if (humanExpression.trim().length === 0) return "";
  const idByName = new Map<string, string>();
  for (const ds of dataSources.values()) idByName.set(ds.name, ds.id);
  try {
    return transpileExpression({
      expression: humanExpression,
      replaceVariable: (identifier) => {
        const id = idByName.get(identifier);
        return id ? encodeDataVariableId(id) : undefined;
      },
    });
  } catch {
    return humanExpression;
  }
};
