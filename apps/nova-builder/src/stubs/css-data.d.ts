// Stub for @webstudio-is/css-data
// The real source imports css-tree which triggers TypeScript 5.8 inference issues.
export type StyleValue = any;
export type CssProperty = string;
export type StyleProperty = any;
export type ShorthandProperty = any;
export declare const parseCssValue: (property: string, value: string) => any;
export declare const parseCssVar: (value: string) => any;
export declare const isValidCustomPropertyValue: (value: string) => boolean;
export declare const expandShorthands: (declarations: any[]) => any[];
export declare const parseMediaQuery: (value: string) => any;
