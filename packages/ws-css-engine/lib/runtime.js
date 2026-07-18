// src/core/to-value.ts
import { DEFAULT_FONT_FALLBACK, SYSTEM_FONTS } from "@webstudio-is/fonts";
var fallbackTransform = (styleValue) => {
  if (styleValue.type !== "fontFamily") {
    return;
  }
  let { value } = styleValue;
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
var toValue = (styleValue, transformValue) => {
  if (styleValue === void 0) {
    return "";
  }
  const transformedValue = transformValue?.(styleValue) ?? fallbackTransform(styleValue);
  const value = transformedValue ?? styleValue;
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
export {
  toValue
};
