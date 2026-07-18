"use client";
// Canvas style rendering (Tier P M-S1 — fixes WSA-1: StyleDecls never painted).
//
// Ported/simplified from:
//   reference/webstudio/apps/builder/app/canvas/shared/styles.ts
// Kept: sheet order (fonts → presets → user → state → helpers), user sheet built
//   from @media rules per breakpoint + mixin rule per styleSource + nesting rule
//   per instance with applyMixins (source-order cascade), states as nested
//   selectors, selected-state preview sheet, design-mode helper styles.
// Omitted (later Tier P phases): ephemeral var() fast-path (M3), descendant
//   component selectors (M5), condition-breakpoint simulation (M3),
//   content-edit mode helpers (M10).

import { useLayoutEffect } from "react";
import { computed } from "nanostores";
import { useStore } from "@nanostores/react";
import {
  addFontRules,
  createImageValueTransformer,
  rootComponent,
  type StyleDecl,
} from "@webstudio-is/sdk";
import { idAttribute, componentAttribute } from "@webstudio-is/react-sdk";
import {
  createRegularStyleSheet,
  type TransformValue,
} from "@webstudio-is/css-engine";
import {
  $assets,
  $breakpoints,
  $styles,
  $styleSourceSelections,
} from "@/lib/data-stores";
import {
  $registeredComponentMetas,
  $selectedInstanceSelector,
  $selectedState,
  $isPreviewMode,
  assetBaseUrl,
} from "@/lib/nano-states";
import { legacyColorToRgb } from "@/lib/styleValueConversion";

const fontsSheet = createRegularStyleSheet({ name: "nova-fonts" });
const presetSheet = createRegularStyleSheet({ name: "nova-presets" });
const userSheet = createRegularStyleSheet({ name: "nova-user-styles" });
const stateSheet = createRegularStyleSheet({ name: "nova-state-styles" });
const helpersSheet = createRegularStyleSheet({ name: "nova-helpers" });

// Maintain stylesheet order in <head>; must run before any subscription renders.
export const mountStyles = () => {
  fontsSheet.render();
  presetSheet.render();
  userSheet.render();
  stateSheet.render();
  helpersSheet.render();
};

const setDifference = <T,>(a: Set<T>, b: Set<T>): Set<T> => {
  const result = new Set<T>();
  for (const item of a) {
    if (b.has(item) === false) result.add(item);
  }
  return result;
};

// Image asset resolution + legacy Nova color-shape tolerance (pre-v20 documents).
const $transformValue = computed($assets, (assets): TransformValue => {
  const imageTransformer = createImageValueTransformer(assets, {
    assetBaseUrl,
  });
  return (styleValue) => legacyColorToRgb(styleValue) ?? imageTransformer(styleValue);
});

const getInstanceSelector = (instanceId: string) =>
  `[${idAttribute}="${instanceId}"]`;

// The canvas renders the Body component as <div> (ADR-NB-008), so its preset
// styles must target div, not body, or they never match.
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

/**
 * Track added/deleted styles and style-source selections and keep the user
 * stylesheet in sync. Renders on rAF (timeout fallback in background tabs,
 * where rAF is throttled).
 */
export const subscribeStyles = () => {
  let renderJob:
    | undefined
    | { type: "raf"; id: number }
    | { type: "timeout"; id: ReturnType<typeof setTimeout> };

  const cancelScheduledRender = () => {
    if (renderJob === undefined) return;
    if (renderJob.type === "raf") cancelAnimationFrame(renderJob.id);
    if (renderJob.type === "timeout") clearTimeout(renderJob.id);
    renderJob = undefined;
  };

  const renderUserSheetInTheNextFrame = () => {
    cancelScheduledRender();
    const render = () => {
      renderJob = undefined;
      userSheet.setTransformer($transformValue.get());
      userSheet.render();
    };
    // rAF only when the tab is visible — background tabs throttle rAF, which
    // would delay style updates until the window regains focus.
    const canUseRaf =
      typeof document !== "undefined" &&
      document.visibilityState === "visible" &&
      typeof requestAnimationFrame === "function";
    if (canUseRaf) {
      renderJob = { type: "raf", id: requestAnimationFrame(render) };
      return;
    }
    renderJob = { type: "timeout", id: setTimeout(render, 50) };
  };

  const unsubscribeBreakpoints = $breakpoints.subscribe((breakpoints) => {
    for (const [id, breakpoint] of breakpoints) {
      userSheet.addMediaRule(id, breakpoint);
    }
    renderUserSheetInTheNextFrame();
  });

  const unsubscribeTransformValue = $transformValue.subscribe(() => {
    renderUserSheetInTheNextFrame();
  });

  // add/delete declarations in mixins (one mixin rule per styleSource)
  let prevStylesSet = new Set<StyleDecl>();
  const unsubscribeStyles = $styles.subscribe((styles) => {
    const stylesSet = new Set(styles.values());
    const addedStyles = setDifference(stylesSet, prevStylesSet);
    const deletedStyles = setDifference(prevStylesSet, stylesSet);
    prevStylesSet = stylesSet;
    // delete before adding declarations with the same key
    for (const styleDecl of deletedStyles) {
      const rule = userSheet.addMixinRule(styleDecl.styleSourceId);
      rule.deleteDeclaration(toDeclarationParams(styleDecl));
    }
    for (const styleDecl of addedStyles) {
      const rule = userSheet.addMixinRule(styleDecl.styleSourceId);
      rule.setDeclaration({
        ...toDeclarationParams(styleDecl),
        value: styleDecl.value,
      });
    }
    renderUserSheetInTheNextFrame();
  });

  // apply mixins to per-instance nesting rules (applyMixins replaces the set,
  // so both attaching and detaching a source re-renders correctly; mixin order
  // = selection values order = the source cascade)
  let prevSelectionsSet = new Set<{ instanceId: string; values: string[] }>();
  const unsubscribeStyleSourceSelections = $styleSourceSelections.subscribe(
    (styleSourceSelections) => {
      const selectionsSet = new Set(styleSourceSelections.values()) as Set<{
        instanceId: string;
        values: string[];
      }>;
      const addedSelections = setDifference(selectionsSet, prevSelectionsSet);
      prevSelectionsSet = selectionsSet;
      for (const { instanceId, values } of addedSelections) {
        const rule = userSheet.addNestingRule(getInstanceSelector(instanceId));
        rule.applyMixins(values);
      }
      renderUserSheetInTheNextFrame();
    }
  );

  return () => {
    unsubscribeBreakpoints();
    unsubscribeTransformValue();
    unsubscribeStyles();
    unsubscribeStyleSourceSelections();
    cancelScheduledRender();
  };
};

// ─── Selected-state preview ───────────────────────────────────────────────────

const isPseudoElement = (state: string) => state.startsWith("::");

const $instanceStateStyles = computed(
  [
    $selectedInstanceSelector,
    $selectedState,
    $isPreviewMode,
    $breakpoints,
    $styleSourceSelections,
    $styles,
  ],
  (selector, state, isPreview, breakpoints, selections, styles) => {
    const instanceId = selector?.[0];
    if (instanceId === undefined || state === "" || isPreview) return;
    const sources = new Set(selections.get(instanceId)?.values ?? []);
    const stateStyles: StyleDecl[] = [];
    for (const styleDecl of styles.values()) {
      if (styleDecl.state === state && sources.has(styleDecl.styleSourceId)) {
        stateStyles.push(styleDecl);
      }
    }
    return {
      instanceId,
      state,
      breakpoints: [...breakpoints.values()],
      styles: stateStyles,
    };
  }
);

/**
 * Render the styles of the currently selected pseudo-state without the state
 * selector (e.g. :hover styles applied statelessly) so the user can preview
 * them while editing. Pseudo-elements keep their selector — they target the
 * generated element, not the instance itself.
 */
export const subscribeStateStyles = () => {
  return $instanceStateStyles.subscribe((instanceStyles) => {
    stateSheet.clear();
    if (instanceStyles === undefined) {
      stateSheet.render();
      return;
    }
    const { instanceId, state, breakpoints, styles } = instanceStyles;
    for (const breakpoint of breakpoints) {
      stateSheet.addMediaRule(breakpoint.id, breakpoint);
    }
    const rule = stateSheet.addNestingRule(getInstanceSelector(instanceId));
    const stateSelector = isPseudoElement(state) ? state : "";
    for (const styleDecl of styles) {
      rule.setDeclaration({
        breakpoint: styleDecl.breakpointId,
        selector: stateSelector,
        property: styleDecl.property,
        value: styleDecl.value,
      });
    }
    stateSheet.setTransformer($transformValue.get());
    stateSheet.render();
  });
};

// ─── Design-mode helper styles ────────────────────────────────────────────────

const helperStyles = [
  // Double-click enters text editing — don't let it select the word instead.
  `[${idAttribute}] {
    user-select: none;
    -webkit-user-select: none;
    cursor: default;
  }`,
  `[${idAttribute}][contenteditable] {
    user-select: text;
    -webkit-user-select: text;
    cursor: initial;
  }`,
  // Every canvas element is focusable (tabIndex 0); the selection outline is
  // drawn via [data-ws-selected], so suppress the native focus ring.
  `[${idAttribute}][contenteditable], [${idAttribute}]:focus {
    outline: 0;
  }`,
];

export const subscribeHelperStyles = () => {
  return $isPreviewMode.subscribe((isPreview) => {
    helpersSheet.clear();
    if (isPreview === false) {
      for (const style of helperStyles) {
        helpersSheet.addPlaintextRule(style);
      }
    }
    helpersSheet.render();
  });
};

// ─── Fonts + component preset styles ─────────────────────────────────────────

export const GlobalStyles = () => {
  const assets = useStore($assets);
  const metas = useStore($registeredComponentMetas);

  useLayoutEffect(() => {
    fontsSheet.clear();
    addFontRules({ sheet: fontsSheet, assets, assetBaseUrl });
    fontsSheet.render();
  }, [assets]);

  useLayoutEffect(() => {
    presetSheet.clear();
    presetSheet.addMediaRule("presets");
    for (const [component, meta] of metas) {
      for (const [tag, styles] of Object.entries(meta.presetStyle ?? {})) {
        const rule = presetSheet.addNestingRule(
          getPresetStyleSelector(component, tag)
        );
        for (const declaration of styles) {
          rule.setDeclaration({
            breakpoint: "presets",
            selector: declaration.state ?? "",
            property: declaration.property,
            value: declaration.value,
          });
        }
      }
    }
    presetSheet.render();
  }, [metas]);

  return null;
};

export const __testing__ = {
  fontsSheet,
  presetSheet,
  userSheet,
  stateSheet,
  helpersSheet,
  getInstanceSelector,
  getPresetStyleSelector,
  toDeclarationParams,
  setDifference,
};
