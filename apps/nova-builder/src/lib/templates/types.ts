// Template schema types and primitive builder helpers.
// No imports — pure data shapes so data.ts can import them without cycles.

export const BASE_BP = "__BASE_BP__";

export type TChild = { type: "id"; value: string } | { type: "text"; value: string };
export type TInstance = { type: "instance"; id: string; component: string; label: string; children: TChild[] };
export type TProp = { id: string; instanceId: string; name: string; value: { type: string; value: unknown } };
export type TStyleDecl = { styleSourceId: string; breakpointId: string; state: string; property: string; value: Record<string, unknown> };
export type TStyleSource = { id: string; type: string };
export type TStyleSourceSelection = { instanceId: string; values: string[] };

export type Template = {
  id: string;
  name: string;
  description: string;
  previewIcon: string;
  instances: TInstance[];
  props: TProp[];
  styles: TStyleDecl[];
  styleSources: TStyleSource[];
  styleSourceSelections: TStyleSourceSelection[];
  rootIds: string[];
};

export function ref(id: string): TChild { return { type: "id", value: id }; }
export function txt(v: string): TChild { return { type: "text", value: v }; }
export function inst(id: string, component: string, label: string, children: TChild[]): TInstance {
  return { type: "instance", id, component, label, children };
}
export function src(id: string): TStyleSource { return { id, type: "local" }; }
export function sel(instanceId: string, srcId: string): TStyleSourceSelection {
  return { instanceId, values: [srcId] };
}
export function sd(srcId: string, property: string, value: Record<string, unknown>): TStyleDecl {
  return { styleSourceId: srcId, breakpointId: BASE_BP, state: "", property, value };
}
export function unit(v: number, u: string) { return { type: "unit", value: v, unit: u }; }
export function kw(v: string) { return { type: "keyword", value: v }; }
export function rgb(r: number, g: number, b: number, a = 1) { return { type: "rgb", r, g, b, alpha: a }; }
