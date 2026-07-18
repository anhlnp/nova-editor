// Stub for css-tree — used by @webstudio-is/css-data
// The WS source files use: import * as csstree from "css-tree"
// and then use csstree.CssNode, csstree.parse, etc.
declare module "css-tree" {
  // Types
  export type CssNode = any;
  export type FunctionNode = any;
  export type Value = any;

  // Runtime values
  export const parse: (...args: any[]) => any;
  export const generate: (...args: any[]) => any;
  export const walk: (...args: any[]) => any;
  export const lexer: any;
  export const tokenize: (...args: any[]) => any;
  export const tokenTypes: any;
  export const definitionSyntax: any;
  export const List: any;
}
