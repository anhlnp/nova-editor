// src/core/prefixer.ts
var isKeyword = (value, keyword) => {
  if (value.type === "keyword") {
    return value.value === keyword;
  }
  if (value.type === "layers") {
    return value.value.some((layer) => isKeyword(layer, keyword));
  }
  return false;
};
var prefixStyles = (styleMap) => {
  const newStyleMap = /* @__PURE__ */ new Map();
  const backgroundClip = styleMap.get("background-clip");
  const hasTextBackgroundClip = backgroundClip !== void 0 && isKeyword(backgroundClip, "text");
  for (const [property, value] of styleMap) {
    if (property === "background-clip") {
      newStyleMap.set("-webkit-background-clip", value);
    }
    if (property === "user-select") {
      newStyleMap.set("-webkit-user-select", value);
    }
    if (property === "text-size-adjust") {
      newStyleMap.set("-webkit-text-size-adjust", value);
    }
    if (property === "backdrop-filter") {
      newStyleMap.set("-webkit-backdrop-filter", value);
    }
    if (property === "color" && hasTextBackgroundClip && isKeyword(value, "transparent")) {
      newStyleMap.set("-webkit-text-fill-color", value);
    }
    if (property === "view-timeline-name" || property === "scroll-timeline-name" || property === "view-timeline-inset") {
      newStyleMap.set(`--${property}`, value);
    }
    newStyleMap.set(property, value);
  }
  return newStyleMap;
};

// src/css.ts
var cssWideKeywords = /* @__PURE__ */ new Set([
  "initial",
  "inherit",
  "unset",
  "revert",
  "revert-layer"
]);

// src/core/to-value.ts
import { DEFAULT_FONT_FALLBACK, SYSTEM_FONTS } from "@webstudio-is/fonts";
var fallbackTransform = (styleValue2) => {
  if (styleValue2.type !== "fontFamily") {
    return;
  }
  let { value } = styleValue2;
  if (value.length === 0) {
    value = [DEFAULT_FONT_FALLBACK];
  }
  if (value.length === 1) {
    const stack = SYSTEM_FONTS.get(value[0])?.stack;
    value = stack ?? [value[0], DEFAULT_FONT_FALLBACK];
  }
  return {
    type: "fontFamily",
    value: Array.from(new Set(value))
  };
};
var sanitizeCssUrl = (str) => JSON.stringify(str);
var toValue = (styleValue2, transformValue) => {
  if (styleValue2 === void 0) {
    return "";
  }
  const transformedValue = transformValue?.(styleValue2) ?? fallbackTransform(styleValue2);
  const value = transformedValue ?? styleValue2;
  if (value.type === "unit") {
    return value.value + (value.unit === "number" ? "" : value.unit);
  }
  if (value.type === "fontFamily") {
    const families = [];
    for (const family of value.value) {
      families.push(family.includes(" ") ? `"${family}"` : family);
    }
    return families.join(", ");
  }
  if (value.type === "var") {
    if (value.hidden) {
      return "";
    }
    let fallbacksString = "";
    if (value.fallback) {
      fallbacksString = `, ${toValue(value.fallback, transformValue)}`;
    }
    return `var(--${value.value}${fallbacksString})`;
  }
  if (value.type === "keyword") {
    if (value.hidden === true) {
      return "";
    }
    return value.value;
  }
  if (value.type === "invalid") {
    return value.value;
  }
  if (value.type === "unset") {
    return value.value;
  }
  if (value.type === "rgb") {
    return `rgb(${value.r} ${value.g} ${value.b} / ${value.alpha})`;
  }
  if (value.type === "color") {
    let [c1, c2, c3] = value.components;
    const alpha = typeof value.alpha === "number" ? value.alpha : toValue(value.alpha);
    switch (value.colorSpace) {
      case "hex": {
        const toHex = (v) => Math.round(Math.min(Math.max(v, 0), 1) * 255).toString(16).padStart(2, "0");
        const hex = `#${toHex(c1)}${toHex(c2)}${toHex(c3)}`;
        const alphaNum = typeof alpha === "number" ? alpha : 1;
        return alphaNum < 1 ? hex + toHex(alphaNum) : hex;
      }
      case "srgb": {
        c1 = Math.round(c1 * 255);
        c2 = Math.round(c2 * 255);
        c3 = Math.round(c3 * 255);
        return `rgb(${c1} ${c2} ${c3} / ${alpha})`;
      }
      case "hsl":
        return `hsl(${c1} ${c2}% ${c3}% / ${alpha})`;
      case "hwb":
        return `hwb(${c1} ${c2}% ${c3}% / ${alpha})`;
      case "lab":
        return `lab(${c1}% ${c2} ${c3} / ${alpha})`;
      case "lch":
        return `lch(${c1}% ${c2} ${c3} / ${alpha})`;
      case "oklab":
        return `oklab(${c1} ${c2} ${c3} / ${alpha})`;
      case "oklch":
        return `oklch(${c1} ${c2} ${c3} / ${alpha})`;
      // Fall back to color() function for less common color spaces.
      // colorjs uses internal short names that differ from CSS predefined color space identifiers.
      case "p3":
        return `color(display-p3 ${c1} ${c2} ${c3} / ${alpha})`;
      case "a98rgb":
        return `color(a98-rgb ${c1} ${c2} ${c3} / ${alpha})`;
      case "prophoto":
        return `color(prophoto-rgb ${c1} ${c2} ${c3} / ${alpha})`;
      case "srgb-linear":
      case "rec2020":
      case "xyz-d65":
      case "xyz-d50":
      default:
        return `color(${value.colorSpace} ${c1} ${c2} ${c3} / ${alpha})`;
    }
  }
  if (value.type === "image") {
    if (value.hidden || value.value.type !== "url") {
      return "none";
    }
    return `url(${sanitizeCssUrl(value.value.url)})`;
  }
  if (value.type === "unparsed") {
    if (value.hidden === true) {
      return "none";
    }
    return value.value;
  }
  if (value.type === "layers") {
    const valueString = value.value.filter((layer) => layer.hidden !== true).map((layer) => toValue(layer, transformValue)).join(", ");
    return valueString === "" ? "none" : valueString;
  }
  if (value.type === "tuple") {
    if (value.hidden === true) {
      return "none";
    }
    return value.value.filter((value2) => value2.hidden !== true).map((value2) => toValue(value2, transformValue)).join(" ");
  }
  if (value.type === "shadow") {
    let shadow = `${toValue(value.offsetX)} ${toValue(value.offsetY)}`;
    if (value.blur) {
      shadow += ` ${toValue(value.blur)}`;
    }
    if (value.spread) {
      shadow += ` ${toValue(value.spread)}`;
    }
    if (value.color) {
      shadow += ` ${toValue(value.color)}`;
    }
    if (value.position === "inset") {
      shadow += ` inset`;
    }
    return shadow;
  }
  if (value.type === "function") {
    if (value.hidden === true) {
      return "";
    }
    return `${value.name}(${toValue(value.args, transformValue)})`;
  }
  if (value.type === "guaranteedInvalid") {
    return "";
  }
  value;
  return "";
};

// src/core/merger.ts
var isLonghandValue = (value) => {
  if (value === void 0) {
    return false;
  }
  if (value.type === "keyword" && cssWideKeywords.has(value.value)) {
    return false;
  }
  if (value.type === "var") {
    const fallback = value.fallback;
    if (fallback?.type === "keyword" && cssWideKeywords.has(fallback.value)) {
      return false;
    }
  }
  return true;
};
var mergeBorder = (styleMap, base) => {
  const width = styleMap.get(`${base}-width`);
  const style = styleMap.get(`${base}-style`);
  const color2 = styleMap.get(`${base}-color`);
  if (isLonghandValue(width) && isLonghandValue(style) && isLonghandValue(color2)) {
    styleMap.delete(`${base}-width`);
    styleMap.delete(`${base}-style`);
    styleMap.delete(`${base}-color`);
    styleMap.set(base, { type: "tuple", value: [width, style, color2] });
  }
};
var mergeBox = (styleMap, base) => {
  const topValue = styleMap.get(`${base}-top`);
  const top = toValue(topValue);
  const right = toValue(styleMap.get(`${base}-right`));
  const bottom = toValue(styleMap.get(`${base}-bottom`));
  const left = toValue(styleMap.get(`${base}-left`));
  if (isLonghandValue(topValue) && top === right && top === bottom && top === left) {
    styleMap.delete(`${base}-top`);
    styleMap.delete(`${base}-right`);
    styleMap.delete(`${base}-bottom`);
    styleMap.delete(`${base}-left`);
    styleMap.set(base, topValue);
  }
};
var mergeWhiteSpaceAndTextWrap = (styleMap) => {
  const collapseValue = styleMap.get("white-space-collapse");
  const collapse = toValue(collapseValue);
  const modeValue = styleMap.get("text-wrap-mode");
  const mode = toValue(modeValue);
  const styleValue2 = styleMap.get("text-wrap-style");
  const style = toValue(styleValue2);
  styleMap.delete("text-wrap-mode");
  styleMap.delete("text-wrap-style");
  if (collapse === "collapse" || collapse === "initial" || mode === "wrap" || mode === "initial") {
    styleMap.set("white-space", { type: "keyword", value: "normal" });
  }
  if (mode === "nowrap") {
    styleMap.set("white-space", { type: "keyword", value: "nowrap" });
  }
  if (collapse === "preserve") {
    if (mode === "nowrap") {
      styleMap.set("white-space", { type: "keyword", value: "pre" });
    } else {
      styleMap.set("white-space", { type: "keyword", value: "pre-wrap" });
    }
  }
  if (collapse === "preserve-breaks") {
    styleMap.set("white-space", { type: "keyword", value: "pre-line" });
  }
  if (collapse === "break-spaces") {
    styleMap.set("white-space", { type: "keyword", value: "break-spaces" });
  }
  if (style === "auto") {
    styleMap.set("text-wrap", modeValue ?? { type: "keyword", value: "wrap" });
  }
  if (style === "balance" || style === "stable" || style === "pretty") {
    styleMap.set("text-wrap", { type: "keyword", value: style });
  }
  const textWrap = (styleValue2?.type !== "keyword" ? styleValue2 : void 0) ?? (modeValue?.type !== "keyword" ? modeValue : void 0);
  if (textWrap) {
    styleMap.set("text-wrap", textWrap);
  }
  if (collapseValue) {
    styleMap.delete("white-space-collapse");
    styleMap.set("white-space-collapse", collapseValue);
  }
};
var mergeBackgroundPosition = (styleMap) => {
  const x = styleMap.get("background-position-x");
  const y = styleMap.get("background-position-y");
  if (x?.type === "layers" && y?.type === "layers" && x.value.length === y.value.length) {
    const position = x.value.map((xValue, index) => {
      const yValue = y.value[index];
      return {
        type: "tuple",
        value: [xValue, yValue]
      };
    });
    styleMap.delete("background-position-x");
    styleMap.delete("background-position-y");
    styleMap.set("background-position", {
      type: "layers",
      value: position
    });
  }
};
var mergeStyles = (styleMap) => {
  const newStyle = new Map(styleMap);
  mergeBorder(newStyle, "border-top");
  mergeBorder(newStyle, "border-right");
  mergeBorder(newStyle, "border-bottom");
  mergeBorder(newStyle, "border-left");
  mergeBorder(newStyle, "border");
  mergeBorder(newStyle, "outline");
  mergeBox(newStyle, "border");
  mergeBox(newStyle, "margin");
  mergeBox(newStyle, "padding");
  mergeWhiteSpaceAndTextWrap(newStyle);
  mergeBackgroundPosition(newStyle);
  return newStyle;
};

// src/core/to-property.ts
var hyphenateProperty = (property) => property.replace(
  /[A-Z]/g,
  (match) => "-" + match.toLowerCase()
);

// src/core/rules.ts
var mapGroupBy = (array, getKey) => {
  const groups = /* @__PURE__ */ new Map();
  for (const item of array) {
    const key = getKey(item);
    let group = groups.get(key);
    if (group === void 0) {
      group = [];
      groups.set(key, group);
    }
    group.push(item);
  }
  return groups;
};
var mergeDeclarations = (declarations) => {
  const newDeclarations = [];
  const groups = mapGroupBy(
    declarations,
    (declaration) => declaration.breakpoint + declaration.selector
  );
  for (const groupDeclarations of groups.values()) {
    const { breakpoint, selector } = groupDeclarations[0];
    const merged = mergeStyles(
      new Map(
        groupDeclarations.map((item) => [item.property, item.value])
      )
    );
    for (const [property, value] of merged) {
      newDeclarations.push({
        breakpoint,
        selector,
        property,
        value
      });
    }
  }
  return newDeclarations;
};
var generateStyleMap = (style, {
  indent = 0,
  transformValue
} = {}) => {
  const spaces = " ".repeat(indent);
  let lines = "";
  for (const [property, value] of style) {
    const propertyString = hyphenateProperty(property);
    const valueString = toValue(value, transformValue);
    const line = `${spaces}${propertyString}: ${valueString}`;
    lines += lines === "" ? line : `;
${line}`;
  }
  return lines;
};
var normalizeDeclaration = (declaration) => ({
  ...declaration,
  property: hyphenateProperty(declaration.property)
});
var getDeclarationKey = (declaraionKey) => {
  const { breakpoint, selector, property } = declaraionKey;
  return `${breakpoint}:${selector}:${property}`;
};
var MixinRule = class {
  // use map to avoid duplicated properties
  #declarations = /* @__PURE__ */ new Map();
  #dirtyBreakpoints = /* @__PURE__ */ new Set();
  /*
   * check if breakpoint was updated
   */
  isDirtyBreakpoint(breakpoint) {
    return this.#dirtyBreakpoints.has(breakpoint);
  }
  /**
   * reset breakpoints invalidation
   */
  clearBreakpoints() {
    this.#dirtyBreakpoints.clear();
  }
  setDeclaration(declaration) {
    declaration = normalizeDeclaration(declaration);
    this.#declarations.set(getDeclarationKey(declaration), declaration);
    this.#dirtyBreakpoints.add(declaration.breakpoint);
  }
  deleteDeclaration(declaration) {
    declaration = normalizeDeclaration(declaration);
    this.#declarations.delete(getDeclarationKey(declaration));
    this.#dirtyBreakpoints.add(declaration.breakpoint);
  }
  getDeclarations() {
    return this.#declarations.values();
  }
};
var NestingRule = class {
  #selector;
  #descendantSuffix;
  #mixinRules = /* @__PURE__ */ new Map();
  #mixins = /* @__PURE__ */ new Set();
  // use map to avoid duplicated properties
  #declarations = /* @__PURE__ */ new Map();
  // cached generated rule by breakpoint
  #cache = /* @__PURE__ */ new Map();
  constructor(mixinRules, selector, descendantSuffix) {
    this.#selector = selector;
    this.#descendantSuffix = descendantSuffix;
    this.#mixinRules = mixinRules;
  }
  getSelector() {
    return this.#selector;
  }
  setSelector(selector) {
    this.#selector = selector;
    this.#cache.clear();
  }
  getDescendantSuffix() {
    return this.#descendantSuffix;
  }
  addMixin(mixin) {
    this.#mixins.add(mixin);
    this.#cache.clear();
  }
  applyMixins(mixins) {
    this.#mixins = new Set(mixins);
    this.#cache.clear();
  }
  setDeclaration(declaration) {
    declaration = normalizeDeclaration(declaration);
    this.#declarations.set(getDeclarationKey(declaration), declaration);
    this.#cache.delete(declaration.breakpoint);
  }
  deleteDeclaration(declaration) {
    declaration = normalizeDeclaration(declaration);
    this.#declarations.delete(getDeclarationKey(declaration));
    this.#cache.delete(declaration.breakpoint);
  }
  #getDeclarations() {
    const declarations = /* @__PURE__ */ new Map();
    for (const mixin of this.#mixins) {
      const rule = this.#mixinRules.get(mixin);
      if (rule === void 0) {
        continue;
      }
      for (const declaration of rule.getDeclarations()) {
        declarations.set(getDeclarationKey(declaration), declaration);
      }
    }
    for (const declaration of this.#declarations.values()) {
      declarations.set(getDeclarationKey(declaration), declaration);
    }
    return declarations.values();
  }
  getMergedDeclarations() {
    return mergeDeclarations(this.#getDeclarations());
  }
  toString({
    breakpoint,
    indent = 0,
    transformValue
  }) {
    for (const mixin of this.#mixins) {
      const rule = this.#mixinRules.get(mixin);
      if (rule?.isDirtyBreakpoint(breakpoint)) {
        this.#cache.delete(breakpoint);
      }
    }
    const cached = this.#cache.get(breakpoint);
    if (cached && cached.indent === indent && cached.transformValue === transformValue) {
      return cached.generated;
    }
    const styleBySelector = /* @__PURE__ */ new Map();
    for (const declaration of this.getMergedDeclarations()) {
      if (declaration.breakpoint !== breakpoint) {
        continue;
      }
      let nestedSelector = declaration.selector;
      if (nestedSelector === ":local-link") {
        nestedSelector = "[aria-current=page]";
      }
      const selector = this.#selector + this.#descendantSuffix + nestedSelector;
      let style = styleBySelector.get(selector);
      if (style === void 0) {
        style = /* @__PURE__ */ new Map();
        styleBySelector.set(selector, style);
      }
      style.set(declaration.property, declaration.value);
    }
    const spaces = " ".repeat(indent);
    const generated = Array.from(styleBySelector).sort(
      ([leftSelector], [rightSelector]) => leftSelector.localeCompare(rightSelector)
    ).map(([selector, style]) => {
      const content = generateStyleMap(prefixStyles(style), {
        indent: indent + 2,
        transformValue
      });
      return `${spaces}${selector} {
${content}
${spaces}}
`;
    }).join("").trimEnd();
    this.#cache.set(breakpoint, { generated, indent, transformValue });
    return generated;
  }
};
var MediaRule = class {
  #name;
  options;
  rules;
  constructor(name, options = {}) {
    this.#name = name;
    this.options = options;
    this.rules = /* @__PURE__ */ new Map();
  }
  insertRule(rule) {
    this.rules.set(rule.cssText, rule);
    return rule;
  }
  get cssText() {
    return this.toString();
  }
  toString() {
    return this.generateRule({ nestingRules: [] });
  }
  generateRule({
    nestingRules,
    transformValue
  }) {
    if (this.rules.size === 0 && nestingRules.length === 0) {
      return "";
    }
    const rules = [];
    for (const rule of this.rules.values()) {
      rules.push(rule.toString());
    }
    for (const rule of nestingRules) {
      const generatedRule = rule.toString({
        breakpoint: this.#name,
        indent: 2,
        transformValue
      });
      if (generatedRule !== "") {
        rules.push(generatedRule);
      }
    }
    if (rules.length === 0) {
      return "";
    }
    let conditionText = "";
    const { minWidth, maxWidth, condition, mediaType = "all" } = this.options;
    if (condition !== void 0) {
      conditionText = ` and (${condition})`;
    } else {
      if (minWidth !== void 0) {
        conditionText = ` and (min-width: ${minWidth}px)`;
      }
      if (maxWidth !== void 0) {
        conditionText += ` and (max-width: ${maxWidth}px)`;
      }
    }
    return `@media ${mediaType}${conditionText} {
${rules.join("\n")}
}`;
  }
};
var PlaintextRule = class {
  cssText;
  constructor(cssText) {
    this.cssText = cssText;
  }
  toString() {
    return this.cssText;
  }
};
var FontFaceRule = class {
  #cached;
  #options;
  constructor(options) {
    this.#options = options;
  }
  get cssText() {
    return this.toString();
  }
  toString() {
    if (this.#cached) {
      return this.#cached;
    }
    const decls = [];
    const { fontFamily, fontStyle, fontWeight, fontDisplay, src } = this.#options;
    const value = toValue(
      { type: "fontFamily", value: [fontFamily] },
      // Avoids adding a fallback automatically which needs to happen for font family in general but not for font face.
      (value2) => value2
    );
    decls.push(`font-family: ${value}`);
    decls.push(`font-style: ${fontStyle}`);
    decls.push(`font-weight: ${fontWeight}`);
    decls.push(`font-display: ${fontDisplay}`);
    decls.push(`src: ${src}`);
    this.#cached = `@font-face {
  ${decls.join("; ")};
}`;
    return this.#cached;
  }
};

// src/core/compare-media.ts
var isSimulatedCondition = (options) => options.mediaType !== void 0 && options.condition === void 0 && options.minWidth === void 0 && options.maxWidth === void 0;
var isCondition = (options) => options.condition !== void 0 || isSimulatedCondition(options);
var compareMedia = (optionA, optionB) => {
  const aIsCondition = isCondition(optionA);
  const bIsCondition = isCondition(optionB);
  if (aIsCondition && bIsCondition) {
    return (optionA.condition ?? "").localeCompare(optionB.condition ?? "");
  }
  if (aIsCondition) {
    if (optionB.minWidth === void 0 && optionB.maxWidth === void 0) {
      return 1;
    }
    return -1;
  }
  if (bIsCondition) {
    if (optionA.minWidth === void 0 && optionA.maxWidth === void 0) {
      return -1;
    }
    return 1;
  }
  if (optionA.minWidth === void 0 && optionA.maxWidth === void 0) {
    return -1;
  }
  if (optionB.minWidth === void 0 && optionB.maxWidth === void 0) {
    return 1;
  }
  if (optionA.minWidth !== void 0 && optionB.minWidth !== void 0) {
    return optionA.minWidth - optionB.minWidth;
  }
  if (optionA.maxWidth !== void 0 && optionB.maxWidth !== void 0) {
    return optionB.maxWidth - optionA.maxWidth;
  }
  return "minWidth" in optionA ? 1 : -1;
};

// src/core/style-element.ts
var StyleElement = class {
  #element;
  #name;
  constructor(name = "") {
    this.#name = name;
  }
  get isMounted() {
    return this.#element?.parentElement != null;
  }
  mount() {
    if (this.isMounted === false) {
      this.#element = document.createElement("style");
      this.#element.setAttribute("data-webstudio", this.#name);
      document.head.appendChild(this.#element);
    }
  }
  unmount() {
    if (this.isMounted) {
      this.#element?.parentElement?.removeChild(this.#element);
      this.#element = void 0;
    }
  }
  render(cssText) {
    if (this.#element) {
      this.#element.textContent = cssText;
    }
  }
  setAttribute(name, value) {
    if (this.#element) {
      this.#element.setAttribute(name, value);
    }
  }
  getAttribute(name) {
    if (this.#element) {
      return this.#element.getAttribute(name);
    }
  }
};
var FakeStyleElement = class {
  get isMounted() {
    return false;
  }
  mount() {
  }
  unmount() {
  }
  render(_cssText) {
  }
  setAttribute(_name, _value) {
  }
  getAttribute(_name) {
    return;
  }
};

// src/core/style-sheet.ts
var StyleSheet = class {
  #cssText = "";
  #mediaRules = /* @__PURE__ */ new Map();
  #plainRules = /* @__PURE__ */ new Map();
  #mixinRules = /* @__PURE__ */ new Map();
  nestingRules = /* @__PURE__ */ new Map();
  #fontFaceRules = [];
  #transformValue;
  #element;
  constructor(element) {
    this.#element = element;
  }
  setTransformer(transformValue) {
    this.#transformValue = transformValue;
  }
  addMediaRule(id, options) {
    let mediaRule = this.#mediaRules.get(id);
    if (mediaRule === void 0) {
      mediaRule = new MediaRule(id, options);
      this.#mediaRules.set(id, mediaRule);
      return mediaRule;
    }
    if (options) {
      mediaRule.options = options;
    }
    if (mediaRule === void 0) {
      throw new Error("No media rule found");
    }
    return mediaRule;
  }
  addPlaintextRule(cssText) {
    const rule = this.#plainRules.get(cssText);
    if (rule !== void 0) {
      return rule;
    }
    return this.#plainRules.set(cssText, new PlaintextRule(cssText));
  }
  addMixinRule(name) {
    let rule = this.#mixinRules.get(name);
    if (rule === void 0) {
      rule = new MixinRule();
      this.#mixinRules.set(name, rule);
    }
    return rule;
  }
  addNestingRule(selector, descendantSuffix = "") {
    const key = selector + descendantSuffix;
    let rule = this.nestingRules.get(key);
    if (rule === void 0) {
      rule = new NestingRule(this.#mixinRules, selector, descendantSuffix);
      this.nestingRules.set(key, rule);
    }
    return rule;
  }
  addFontFaceRule(options) {
    return this.#fontFaceRules.push(new FontFaceRule(options));
  }
  generateWith({
    nestingRules,
    transformValue
  }) {
    const css = [];
    css.push(...this.#fontFaceRules.map((rule) => rule.cssText));
    for (const plaintextRule of this.#plainRules.values()) {
      css.push(plaintextRule.cssText);
    }
    const sortedMediaRules = Array.from(this.#mediaRules.values()).sort(
      (ruleA, ruleB) => compareMedia(ruleA.options, ruleB.options)
    );
    for (const mediaRule of sortedMediaRules) {
      const cssText = mediaRule.generateRule({
        nestingRules,
        transformValue
      });
      if (cssText !== "") {
        css.push(cssText);
      }
    }
    for (const rule of this.#mixinRules.values()) {
      rule.clearBreakpoints();
    }
    this.#cssText = css.join("\n");
    return this.#cssText;
  }
  get cssText() {
    return this.generateWith({
      nestingRules: Array.from(this.nestingRules.values()),
      transformValue: this.#transformValue
    });
  }
  clear() {
    this.#mediaRules.clear();
    this.#mixinRules.clear();
    this.nestingRules.clear();
    this.#plainRules.clear();
    this.#fontFaceRules = [];
  }
  render() {
    this.#element.mount();
    this.#element.render(this.cssText);
  }
  unmount() {
    this.#element.unmount();
  }
  setAttribute(name, value) {
    this.#element.setAttribute(name, value);
  }
  getAttribute(name) {
    return this.#element.getAttribute(name);
  }
};

// src/core/style-sheet-regular.ts
var StyleSheetRegular = class extends StyleSheet {
};

// src/core/create-style-sheet.ts
var createRegularStyleSheet = (options) => {
  const element = options?.element ?? new StyleElement(options?.name);
  return new StyleSheetRegular(element);
};

// src/core/match-media.ts
var matchMedia = (options, width) => {
  const minWidth = options.minWidth ?? Number.MIN_SAFE_INTEGER;
  const maxWidth = options.maxWidth ?? Number.MAX_SAFE_INTEGER;
  return width >= minWidth && width <= maxWidth;
};

// src/core/equal-media.ts
var equalMedia = (left, right) => {
  return left.minWidth === right.minWidth && left.maxWidth === right.maxWidth && left.condition === right.condition;
};

// src/core/find-applicable-media.ts
var findApplicableMedia = (media, width) => {
  const sortedMedia = [...media].sort(compareMedia).reverse();
  for (const options of sortedMedia) {
    if (matchMedia(options, width)) {
      return options;
    }
  }
};

// src/core/atomic.ts
import hash from "@emotion/hash";
var generateAtomic = (sheet, options) => {
  const { getKey, transformValue } = options;
  const atomicRules = /* @__PURE__ */ new Map();
  const classes = options.classes ?? /* @__PURE__ */ new Map();
  for (const rule of sheet.nestingRules.values()) {
    const descendantSuffix = rule.getDescendantSuffix();
    const groupKey = getKey(rule);
    if (groupKey === void 0) {
      atomicRules.set(rule.getSelector(), rule);
      continue;
    }
    let classList = classes.get(groupKey);
    if (classList === void 0) {
      classList = [];
      classes.set(groupKey, classList);
    }
    for (const declaration of rule.getMergedDeclarations()) {
      const atomicHash = hash(
        descendantSuffix + declaration.breakpoint + declaration.selector + declaration.property + toValue(declaration.value, transformValue)
      );
      const className = `c${atomicHash}`;
      let atomicRule = atomicRules.get(atomicHash);
      if (atomicRule === void 0) {
        atomicRule = new NestingRule(
          /* @__PURE__ */ new Map(),
          `.${className}`,
          descendantSuffix
        );
        atomicRule.setDeclaration(declaration);
        atomicRules.set(atomicHash, atomicRule);
      }
      classList.push(className);
    }
  }
  const cssText = sheet.generateWith({
    nestingRules: Array.from(atomicRules.values()),
    transformValue
  });
  return { cssText, classes };
};

// src/schema.ts
import { z } from "zod";
var unit = z.string();
var unitValue = z.object({
  type: z.literal("unit"),
  unit,
  value: z.number(),
  hidden: z.boolean().optional()
});
var keywordValue = z.object({
  type: z.literal("keyword"),
  // @todo use exact type
  value: z.string(),
  hidden: z.boolean().optional()
});
var unparsedValue = z.object({
  type: z.literal("unparsed"),
  value: z.string(),
  // For the builder we want to be able to hide background-image
  hidden: z.boolean().optional()
});
var fontFamilyValue = z.object({
  type: z.literal("fontFamily"),
  value: z.array(z.string()),
  hidden: z.boolean().optional()
});
var rgbValue = z.object({
  type: z.literal("rgb"),
  r: z.number(),
  g: z.number(),
  b: z.number(),
  alpha: z.number(),
  hidden: z.boolean().optional()
});
var colorValue = z.object({
  type: z.literal("color"),
  // all these color spaces are defined by design tokens specification
  colorSpace: z.union([
    z.literal("hex"),
    z.literal("srgb"),
    z.literal("p3"),
    z.literal("srgb-linear"),
    z.literal("hsl"),
    z.literal("hwb"),
    z.literal("lab"),
    z.literal("lch"),
    z.literal("oklab"),
    z.literal("oklch"),
    z.literal("a98rgb"),
    z.literal("prophoto"),
    z.literal("rec2020"),
    z.literal("xyz-d65"),
    z.literal("xyz-d50")
  ]),
  components: z.tuple([z.number(), z.number(), z.number()]),
  alpha: z.union([z.number(), z.lazy(() => varValue)]),
  hidden: z.boolean().optional()
});
var functionValue = z.object({
  type: z.literal("function"),
  name: z.string(),
  args: z.lazy(() => styleValue),
  hidden: z.boolean().optional()
});
var imageValue = z.object({
  type: z.literal("image"),
  value: z.union([
    z.object({ type: z.literal("asset"), value: z.string() }),
    // url is not stored in db and only used by css-engine transformValue
    // to prepare image value for rendering
    z.object({ type: z.literal("url"), url: z.string() })
  ]),
  // For the builder we want to be able to hide images
  hidden: z.boolean().optional()
});
var guaranteedInvalidValue = z.object({
  type: z.literal("guaranteedInvalid"),
  hidden: z.boolean().optional()
});
var invalidValue = z.object({
  type: z.literal("invalid"),
  value: z.string(),
  hidden: z.boolean().optional()
});
var unsetValue = z.object({
  type: z.literal("unset"),
  value: z.literal(""),
  hidden: z.boolean().optional()
});
var varFallback = z.union([
  unparsedValue,
  keywordValue,
  unitValue,
  colorValue,
  rgbValue
]);
var toVarFallback = (styleValue2, transformValue) => {
  if (styleValue2.type === "unparsed" || styleValue2.type === "keyword" || styleValue2.type === "unit" || styleValue2.type === "color" || styleValue2.type === "rgb") {
    return styleValue2;
  }
  styleValue2;
  return { type: "unparsed", value: toValue(styleValue2, transformValue) };
};
var varValue = z.object({
  type: z.literal("var"),
  value: z.string(),
  fallback: varFallback.optional(),
  hidden: z.boolean().optional()
});
var tupleValueItem = z.union([
  unitValue,
  keywordValue,
  unparsedValue,
  imageValue,
  colorValue,
  rgbValue,
  functionValue,
  varValue
]);
var tupleValue = z.object({
  type: z.literal("tuple"),
  value: z.array(tupleValueItem),
  hidden: z.boolean().optional()
});
var shadowValue = z.object({
  type: z.literal("shadow"),
  hidden: z.boolean().optional(),
  position: z.union([z.literal("inset"), z.literal("outset")]),
  offsetX: z.union([unitValue, varValue]),
  offsetY: z.union([unitValue, varValue]),
  blur: z.union([unitValue, varValue]).optional(),
  spread: z.union([unitValue, varValue]).optional(),
  color: z.union([colorValue, rgbValue, keywordValue, varValue]).optional()
});
var layerValueItem = z.union([
  unitValue,
  keywordValue,
  unparsedValue,
  imageValue,
  tupleValue,
  shadowValue,
  colorValue,
  rgbValue,
  invalidValue,
  functionValue,
  varValue
]);
var layersValue = z.object({
  type: z.literal("layers"),
  value: z.array(layerValueItem),
  hidden: z.boolean().optional()
});
var styleValue = z.union([
  imageValue,
  layersValue,
  unitValue,
  keywordValue,
  fontFamilyValue,
  colorValue,
  rgbValue,
  unparsedValue,
  tupleValue,
  functionValue,
  guaranteedInvalidValue,
  invalidValue,
  unsetValue,
  varValue,
  shadowValue
]);

// src/color.ts
import * as colorjs from "colorjs.io/fn";
colorjs.ColorSpace.register(colorjs.sRGB);
colorjs.ColorSpace.register(colorjs.sRGB_Linear);
colorjs.ColorSpace.register(colorjs.HSL);
colorjs.ColorSpace.register(colorjs.HWB);
colorjs.ColorSpace.register(colorjs.Lab);
colorjs.ColorSpace.register(colorjs.LCH);
colorjs.ColorSpace.register(colorjs.OKLab);
colorjs.ColorSpace.register(colorjs.OKLCH);
colorjs.ColorSpace.register(colorjs.P3);
colorjs.ColorSpace.register(colorjs.A98RGB);
colorjs.ColorSpace.register(colorjs.ProPhoto);
colorjs.ColorSpace.register(colorjs.REC_2020);
colorjs.ColorSpace.register(colorjs.XYZ_D65);
colorjs.ColorSpace.register(colorjs.XYZ_D50);
colorjs.ColorSpace.registry["display-p3"] = colorjs.P3;
colorjs.ColorSpace.registry["a98-rgb"] = colorjs.A98RGB;
colorjs.ColorSpace.registry["prophoto-rgb"] = colorjs.ProPhoto;
var color = colorjs;
var registeredSpaces = /* @__PURE__ */ new Map([
  [colorjs.sRGB, "srgb"],
  [colorjs.sRGB_Linear, "srgb-linear"],
  [colorjs.HSL, "hsl"],
  [colorjs.HWB, "hwb"],
  [colorjs.Lab, "lab"],
  [colorjs.LCH, "lch"],
  [colorjs.OKLab, "oklab"],
  [colorjs.OKLCH, "oklch"],
  [colorjs.P3, "p3"],
  [colorjs.A98RGB, "a98rgb"],
  [colorjs.ProPhoto, "prophoto"],
  [colorjs.REC_2020, "rec2020"],
  [colorjs.XYZ_D65, "xyz-d65"],
  [colorjs.XYZ_D50, "xyz-d50"]
]);
var toColorSpace = (space) => {
  const id = registeredSpaces.get(space);
  if (id === void 0) {
    throw new Error(`Unregistered color space: ${space.id}`);
  }
  return id;
};
var toColorComponent = (value) => Math.round((value ?? 0) * 1e4) / 1e4;
var srgbColor = (r, g, b, alpha = 1) => ({
  space: colorjs.sRGB,
  coords: [r, g, b],
  alpha
});
var transparentColor = srgbColor(0, 0, 0, 0);
var whiteColor = srgbColor(1, 1, 1, 1);
var resolveColorViaCanvas = (colorString) => {
  if (typeof document === "undefined") {
    return;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  ctx.fillStyle = colorString;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return srgbColor(
    (r ?? 0) / 255,
    (g ?? 0) / 255,
    (b ?? 0) / 255,
    (a ?? 255) / 255
  );
};
var parseColor = (cssString) => {
  try {
    return colorjs.to(cssString, "srgb");
  } catch {
    return resolveColorViaCanvas(cssString) ?? transparentColor;
  }
};
var colorDistance = (a, b) => {
  const [ar, ag, ab] = a.coords;
  const [br, bg, bb] = b.coords;
  return Math.sqrt(
    ((ar ?? 0) - (br ?? 0)) ** 2 + ((ag ?? 0) - (bg ?? 0)) ** 2 + ((ab ?? 0) - (bb ?? 0)) ** 2 + ((a.alpha ?? 1) - (b.alpha ?? 1)) ** 2
  );
};
var lerpColor = (a, b, ratio) => {
  const lerp = (start, end, t) => start * (1 - t) + end * t;
  return {
    space: a.space,
    coords: [
      lerp(a.coords[0] ?? 0, b.coords[0] ?? 0, ratio),
      lerp(a.coords[1] ?? 0, b.coords[1] ?? 0, ratio),
      lerp(a.coords[2] ?? 0, b.coords[2] ?? 0, ratio)
    ],
    alpha: lerp(a.alpha ?? 1, b.alpha ?? 1, ratio)
  };
};
var serializeColor = (color2) => {
  const [r, g, b] = color2.coords;
  const red = Math.round((r ?? 0) * 255);
  const green = Math.round((g ?? 0) * 255);
  const blue = Math.round((b ?? 0) * 255);
  const alpha = color2.alpha ?? 1;
  if (alpha < 1) {
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }
  return `rgb(${red}, ${green}, ${blue})`;
};
export {
  FakeStyleElement,
  color,
  colorDistance,
  colorValue,
  compareMedia,
  createRegularStyleSheet,
  cssWideKeywords,
  equalMedia,
  findApplicableMedia,
  functionValue,
  generateAtomic,
  generateStyleMap,
  guaranteedInvalidValue,
  hyphenateProperty,
  imageValue,
  invalidValue,
  keywordValue,
  layersValue,
  lerpColor,
  matchMedia,
  mergeStyles,
  parseColor,
  prefixStyles,
  serializeColor,
  shadowValue,
  srgbColor,
  styleValue,
  toColorComponent,
  toColorSpace,
  toValue,
  toVarFallback,
  transparentColor,
  tupleValue,
  tupleValueItem,
  unitValue,
  unparsedValue,
  varFallback,
  whiteColor
};
