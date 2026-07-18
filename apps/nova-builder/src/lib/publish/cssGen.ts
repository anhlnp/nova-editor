// M9 — Publish codegen: full-fidelity CSS generation.
//
// The old exporters walked $styles and kept only base-breakpoint, no-state
// declarations (WS-PARITY-AUDIT #6 — media queries, pseudo-states and the source
// cascade were all silently dropped). This module reuses the *same* css-engine
// the canvas uses (`canvas/styles.ts`) but headlessly: it builds a RegularStyleSheet
// from WebstudioData and reads `.cssText` — no DOM, so it runs server-side in the
// export/publish route. Output therefore carries @media rules per breakpoint,
// pseudo-state selectors, and correct source-order cascade via applyMixins.
//
// Pure (no React, no atoms) — callers pass a plain WebstudioData. ADR-NB-023.

import {
  addFontRules,
  createImageValueTransformer,
  rootComponent,
  type StyleDecl,
  type WebstudioData,
  type WsComponentMeta,
} from "@webstudio-is/sdk";
import { createRegularStyleSheet, type TransformValue } from "@webstudio-is/css-engine";
import { legacyColorToRgb } from "@/lib/styleValueConversion";

// Stable public attribute names (mirror of @webstudio-is/react-sdk's idAttribute /
// componentAttribute). Redeclared locally so this server-side codegen does not
// import the react-sdk client barrel (which pulls in createContext).
const idAttribute = "data-ws-id";
const componentAttribute = "data-ws-component";

// Instance selector used by the generated rules — the published markup carries the
// same data-ws-id attribute so these selectors match.
const getInstanceSelector = (instanceId: string) => `[${idAttribute}="${instanceId}"]`;

const getPresetStyleSelector = (component: string, tag: string) => {
  if (component === rootComponent) return ":root";
  const effectiveTag = component === "Body" && tag === "body" ? "div" : tag;
  return `${effectiveTag}:where([${componentAttribute}="${component}"])`;
};

const toDeclarationParams = (styleDecl: StyleDecl) => ({
  breakpoint: styleDecl.breakpointId,
  selector: styleDecl.state ?? "",
  property: styleDecl.property,
});

export type GeneratedCss = {
  /** @font-face rules for uploaded fonts. */
  fonts: string;
  /** component preset styles (Box/Heading/etc. defaults). */
  presets: string;
  /** user styles — media queries per breakpoint, states, source cascade. */
  user: string;
};

// Build the value transformer: resolve image assets + tolerate legacy color shape.
const makeTransformer = (data: WebstudioData, assetBaseUrl: string): TransformValue => {
  const imageTransformer = createImageValueTransformer(data.assets, { assetBaseUrl });
  return (styleValue) => legacyColorToRgb(styleValue) ?? imageTransformer(styleValue);
};

/**
 * Generate full-fidelity CSS from a project's WebstudioData.
 * `metas` supplies component preset styles (same map the canvas registers).
 */
export function generateCss(
  data: WebstudioData,
  metas: Map<string, WsComponentMeta>,
  assetBaseUrl = ""
): GeneratedCss {
  const transformer = makeTransformer(data, assetBaseUrl);

  // ── Fonts ──────────────────────────────────────────────────────────────────
  const fontsSheet = createRegularStyleSheet({ name: "fonts" });
  addFontRules({ sheet: fontsSheet as never, assets: data.assets, assetBaseUrl });

  // ── Presets (component defaults) ─────────────────────────────────────────────
  const presetSheet = createRegularStyleSheet({ name: "presets" });
  presetSheet.addMediaRule("presets");
  for (const [component, meta] of metas) {
    for (const [tag, styles] of Object.entries(meta.presetStyle ?? {})) {
      const rule = presetSheet.addNestingRule(getPresetStyleSelector(component, tag));
      for (const declaration of styles as StyleDecl[]) {
        rule.setDeclaration({
          breakpoint: "presets",
          selector: declaration.state ?? "",
          property: declaration.property,
          value: declaration.value,
        });
      }
    }
  }
  presetSheet.setTransformer(transformer);

  // ── User styles (breakpoints → @media, states, source cascade) ───────────────
  const userSheet = createRegularStyleSheet({ name: "user" });
  // One @media rule per breakpoint (base breakpoint has no min/max → no wrapper).
  for (const [id, breakpoint] of data.breakpoints) {
    userSheet.addMediaRule(id, breakpoint);
  }
  // One mixin rule per style source, carrying its declarations across breakpoints/states.
  for (const styleDecl of data.styles.values()) {
    const rule = userSheet.addMixinRule((styleDecl as StyleDecl).styleSourceId);
    rule.setDeclaration({
      ...toDeclarationParams(styleDecl as StyleDecl),
      value: (styleDecl as StyleDecl).value,
    });
  }
  // Apply the source mixins per instance in selection (cascade) order.
  for (const { instanceId, values } of data.styleSourceSelections.values()) {
    const rule = userSheet.addNestingRule(getInstanceSelector(instanceId));
    rule.applyMixins(values);
  }
  userSheet.setTransformer(transformer);

  return {
    fonts: fontsSheet.cssText,
    presets: presetSheet.cssText,
    user: userSheet.cssText,
  };
}
