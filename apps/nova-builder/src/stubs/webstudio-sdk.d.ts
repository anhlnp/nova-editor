// Stubs for @webstudio-is/sdk (main index)
// Types based on actual WS schema usage in our code.

type InstanceId = string;
type PropId = string;
type StyleSourceId = string;
type BreakpointId = string;
type AssetId = string;
type PageId = string;
type FolderId = string;
type DataSourceId = string;
type ResourceId = string;
type StyleDeclKey = string;

export interface Instance {
  type: "instance";
  id: InstanceId;
  component: string;
  tag?: string;
  label?: string;
  children: Array<
    | { type: "id"; value: InstanceId }
    | { type: "text"; value: string }
    | { type: "expression"; value: string }
  >;
}

export type Instances = Map<InstanceId, Instance>;

// Prop is a discriminated union based on `type`.
// For our stub we keep it as a flat interface that accepts any value structure.
export type Prop = {
  id: PropId;
  instanceId: InstanceId;
  name: string;
  required?: boolean;
} & (
  | { type: "string"; value: string }
  | { type: "number"; value: number }
  | { type: "boolean"; value: boolean }
  | { type: "json"; value: unknown }
  | { type: "string[]"; value: string[] }
  | { type: "number[]"; value: number[] }
  | { type: "asset"; value: string }
  | { type: "page"; value: string }
  | { type: "id"; value: string }
  | { type: "action"; value: unknown[] }
  | { type: "expression"; value: string }
  | { type: "parameter"; value: string }
);

export type Props = Map<PropId, Prop>;

export interface Breakpoint {
  id: BreakpointId;
  label: string;
  minWidth?: number;
  maxWidth?: number;
  condition?: string;
}

export type Breakpoints = Map<BreakpointId, Breakpoint>;

export type StyleDecl = any;
// Styles in WS is a Map, not an array (confirmed by schema.ts new Map() usage).
export type Styles = Map<StyleDeclKey, StyleDecl>;
export type StyleSource = any;
export type StyleSources = Map<StyleSourceId, StyleSource>;
export type StyleSourceSelection = any;
export type StyleSourceSelections = Map<InstanceId, StyleSourceSelection>;

export type Asset = any;
export type Assets = Map<AssetId, Asset>;

export type DataSourceVariableValue =
  | { type: "number"; value: number }
  | { type: "string"; value: string }
  | { type: "boolean"; value: boolean }
  | { type: "string[]"; value: string[] }
  | { type: "json"; value: unknown };

export type DataSource =
  | {
      type: "variable";
      id: DataSourceId;
      scopeInstanceId?: string;
      name: string;
      value: DataSourceVariableValue;
    }
  | {
      type: "parameter";
      id: DataSourceId;
      scopeInstanceId?: string;
      name: string;
    }
  | {
      type: "resource";
      id: DataSourceId;
      scopeInstanceId?: string;
      name: string;
      resourceId: string;
    };
export type DataSources = Map<DataSourceId, DataSource>;

export type Resource = {
  id: ResourceId;
  name: string;
  url: string;
  method: "get" | "post" | "put" | "delete";
  headers: Array<{ name: string; value: string }>;
  body?: unknown;
};
export type Resources = Map<ResourceId, Resource>;

// ── Expression toolkit (M4 data binding) ──────────────────────────────────────
export declare const SYSTEM_VARIABLE_ID: string;
export declare const systemParameter: DataSource;
export type Scope = { getName(id: string, preferredName: string): string };
export declare const createScope: (occupiedIdentifiers?: string[]) => Scope;
export type Diagnostic = {
  from: number;
  to: number;
  severity: "error" | "hint" | "info" | "warning";
  message: string;
};
export declare const lintExpression: (options: {
  expression: string;
  availableVariables?: Set<string>;
  allowAssignment?: boolean;
  variableValues?: ReadonlyMap<string, unknown> | Readonly<Record<string, unknown>>;
}) => Diagnostic[];
export declare const getExpressionIdentifiers: (expression: string) => Set<string>;
export declare const transpileExpression: (options: {
  expression: string;
  executable?: boolean;
  replaceVariable?: (identifier: string, assignee: boolean) => string | undefined | void;
}) => string;
export declare const generateExpression: (options: {
  expression: string;
  dataSources: DataSources;
  usedDataSources: DataSources;
  scope: Scope;
}) => string;
export declare const executeExpression: (expression: undefined | string) => unknown;
export declare const encodeDataVariableId: (id: string) => string;
export declare const decodeDataVariableId: (name: string) => string | undefined;
export declare const isLiteralExpression: (expression: string) => boolean;

export interface Page {
  id: PageId;
  name: string;
  path: string;
  title?: string;
  rootInstanceId: InstanceId;
  meta?: any;
  homePageId?: string;
}

export type Folder = any;

export interface Pages {
  homePageId: string;
  rootFolderId?: string;
  meta?: any;
  compiler?: any;
  redirects?: any[];
  pages: Map<PageId, Page>;
  folders: Map<FolderId, Folder>;
  pageTemplates?: Map<string, any>;
}

export type WsComponentMeta = {
  category?: string;
  label?: string;
  icon?: string;
  presetStyle?: Record<string, any[]>;
  states?: any[];
  initialProps?: string[];
  props?: Record<string, any>;
  type?: string;
  template?: any;
  aiHints?: string;
  [key: string]: any;
};

export type Components = Map<string, any>;
export type AnyComponent = any;

export interface WebstudioData {
  instances: Instances;
  props: Props;
  breakpoints: Breakpoints;
  styles: Styles;
  styleSources: StyleSources;
  styleSourceSelections: StyleSourceSelections;
  assets: Assets;
  pages: Pages;
  dataSources: DataSources;
  resources: Resources;
}

export declare const coreMetas: Record<string, WsComponentMeta>;
export declare const idAttribute: string;
export declare const componentAttribute: string;
export declare const selectorIdAttribute: string;
export declare const showAttribute: string;

// css helpers (M-S1 canvas style rendering)
export declare const rootComponent: string;
export declare const addFontRules: (options: {
  sheet: any;
  assets: Assets;
  assetBaseUrl: string;
}) => void;
// Returns a css-engine TransformValue: replacement StyleValue or undefined.
export declare const createImageValueTransformer: (
  assets: Assets,
  options: { assetBaseUrl: string }
) => (styleValue: any) => any;
