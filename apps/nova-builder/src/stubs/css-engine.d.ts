// Stub for @webstudio-is/css-engine
// The real source has TypeScript 5.8 never[] inference issues in rules.ts/to-value.ts.
// Used: compareMedia, toValue + the stylesheet API (M-S1 canvas style rendering).

export type Unit = string;
export type CssProperty = string;
export type StyleValue = any;
export type HyphenatedProperty = string;
// Value transformer: returns a replacement StyleValue or undefined to keep the original.
export type TransformValue = (value: any) => any;

export interface MediaRuleOptions {
  minWidth?: number;
  maxWidth?: number;
  condition?: string;
  mediaType?: string;
}

export interface Declaration {
  breakpoint: string;
  selector: string;
  property: string;
  value: any;
}

export interface MixinRule {
  setDeclaration(declaration: Declaration): void;
  deleteDeclaration(declaration: Omit<Declaration, "value">): void;
  clearBreakpoints(): void;
}

export interface NestingRule {
  getSelector(): string;
  setSelector(selector: string): void;
  addMixin(mixin: string): void;
  applyMixins(mixins: string[]): void;
  setDeclaration(declaration: Declaration): void;
  deleteDeclaration(declaration: Omit<Declaration, "value">): void;
}

export interface StyleSheetRegular {
  addMediaRule(id: string, options?: MediaRuleOptions): unknown;
  addPlaintextRule(cssText: string): unknown;
  addMixinRule(name: string): MixinRule;
  addNestingRule(selector: string, descendantSuffix?: string): NestingRule;
  addFontFaceRule(options: Record<string, unknown>): number;
  setTransformer(transformValue: TransformValue): void;
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | undefined;
  readonly cssText: string;
  render(): void;
  clear(): void;
  unmount(): void;
}

export declare const createRegularStyleSheet: (options?: {
  name?: string;
}) => StyleSheetRegular;

export declare const compareMedia: (a: MediaRuleOptions, b: MediaRuleOptions) => number;
export declare const toValue: (value: any, transformValue?: TransformValue) => string;
export declare const hyphenateProperty: (property: string) => string;
