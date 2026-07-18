// Simplified canvas component renderer.
//
// This is a stripped-down version of:
//   reference/webstudio/apps/builder/app/canvas/features/webstudio-component/webstudio-component.tsx
//
// Phase 2 scope: render instances with correct components and props, apply
// selection/hover attributes, no text editing (Lexical), no DnD.
// Full feature parity added in Phase 3.

"use client";

import { forwardRef, useContext, useMemo } from "react";
import { computed } from "nanostores";
import { useStore } from "@nanostores/react";
import type { Instance, Prop } from "@webstudio-is/sdk";
import {
  idAttribute,
  componentAttribute,
  selectorIdAttribute,
  showAttribute,
  type AnyComponent,
} from "@webstudio-is/react-sdk";
import type { DataSources } from "@webstudio-is/sdk";
import { $instances, $props, $dataSources } from "@/lib/data-stores";
import {
  $registeredComponentMetas,
  $selectedInstanceSelector,
  $hoveredInstanceSelector,
  $resourceValues,
} from "@/lib/nano-states";
import { evaluateExpression } from "@/lib/expression";
import { ItemScopeContext } from "./itemScope";
import {
  createInstanceChildrenElements,
  type WebstudioComponentProps,
} from "./elements";

// ─── MissingComponentStub ────────────────────────────────────────────────────

const MissingComponentStub = forwardRef<HTMLDivElement, { children?: React.ReactNode }>(
  (props, ref) => (
    <div
      ref={ref}
      {...props}
      style={{
        padding: 8,
        border: "1px solid #f87171",
        color: "#ef4444",
        fontSize: 12,
      }}
    >
      {(props as Record<string, unknown>)[componentAttribute as string] as string}: missing component
    </div>
  )
);
MissingComponentStub.displayName = "MissingComponentStub";

// ─── Prop value computation ───────────────────────────────────────────────────

// Resolve a flat map of { propName: value } for a given instanceId from the $props map.
// Bound props (type "expression" / "parameter") are evaluated against the current
// data sources so the canvas paints live values (M4 data binding).
const getInstancePropsObject = (
  instanceId: string,
  props: Map<string, Prop>,
  dataSources: DataSources,
  injectedValues: Map<string, unknown> | undefined
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const prop of props.values()) {
    if (prop.instanceId !== instanceId) continue;
    // Skip internal migration artifact
    if (prop.name === "_legacyClasses") continue;
    if (prop.type === "expression") {
      result[prop.name] = evaluateExpression(prop.value, dataSources, injectedValues);
    } else if (prop.type === "parameter") {
      if (injectedValues?.has(prop.value)) {
        result[prop.name] = injectedValues.get(prop.value);
      } else {
        const ds = dataSources.get(prop.value);
        result[prop.name] = ds?.type === "variable" ? ds.value.value : undefined;
      }
    } else {
      result[prop.name] = prop.value;
    }
  }
  return result;
};

// Merge item scope (collection) + loaded resource values into one injected map.
const mergeInjected = (
  itemScope: Map<string, unknown> | undefined,
  resourceValues: Map<string, unknown>
): Map<string, unknown> | undefined => {
  if (!itemScope && resourceValues.size === 0) return undefined;
  const merged = new Map<string, unknown>(resourceValues);
  if (itemScope) for (const [k, v] of itemScope) merged.set(k, v);
  return merged;
};

// ─── Canvas component (design mode) ──────────────────────────────────────────

export const WebstudioComponentCanvas = forwardRef<
  HTMLElement,
  WebstudioComponentProps
>(({ instance, instanceSelector, components, ...restProps }, ref) => {
  const instances = useStore($instances);
  const allProps = useStore($props);
  const dataSources = useStore($dataSources);
  const resourceValues = useStore($resourceValues);
  const itemScope = useContext(ItemScopeContext);
  const metas = useStore($registeredComponentMetas);
  const selectedInstanceSelector = useStore($selectedInstanceSelector);
  const hoveredInstanceSelector = useStore($hoveredInstanceSelector);

  // Derived per-instance props as a memo keyed on instanceId so it only
  // recomputes when props / data sources / item scope / resource values change.
  const injected = mergeInjected(itemScope, resourceValues);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const instanceProps = useMemo(
    () => getInstancePropsObject(instance.id, allProps, dataSources, injected),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [instance.id, allProps, dataSources, itemScope, resourceValues]
  );

  const show = instanceProps[showAttribute] ?? true;
  if (show === false) return <></>;

  // Resolve component — fall back to MissingComponentStub on unknown names.
  let Component: string | AnyComponent =
    (components.get(instance.component) as AnyComponent) ??
    (MissingComponentStub as AnyComponent);

  // The Webstudio "Body" component forwards to a real <body> element, which is
  // illegal when nested inside the Next.js RootLayout's own <body>. Swap it for
  // a <div> so the canvas surface renders correctly without invalid HTML nesting.
  if (Component === "body" || instance.component === "Body") {
    Component = "div" as unknown as AnyComponent;
  }

  const isSelected = selectedInstanceSelector?.[0] === instance.id;
  const isHovered = hoveredInstanceSelector?.[0] === instance.id;

  const props: Record<string, unknown> = {
    ...restProps,
    ...instanceProps,
    tabIndex: 0,
    [idAttribute]: instance.id,
    [componentAttribute]: instance.component,
    [selectorIdAttribute]: instanceSelector.join(","),
    ...(isSelected ? { "data-ws-selected": "" } : {}),
    ...(isHovered ? { "data-ws-hovered": "" } : {}),
  };

  // Drop showAttribute from rendered props — it's a builder-only hint.
  delete props[showAttribute];

  const children =
    createInstanceChildrenElements({
      instances,
      instanceSelector,
      children: instance.children,
      Component: WebstudioComponentCanvas,
      components,
    }) ?? null;

  return <Component key={instance.id} {...(props as any)} ref={ref}>{children}</Component>;
});
WebstudioComponentCanvas.displayName = "WebstudioComponentCanvas";

// ─── Preview component (no builder chrome) ────────────────────────────────────

export const WebstudioComponentPreview = forwardRef<
  HTMLElement,
  WebstudioComponentProps
>(({ instance, instanceSelector, components, ...restProps }, ref) => {
  const instances = useStore($instances);
  const allProps = useStore($props);
  const dataSources = useStore($dataSources);
  const resourceValues = useStore($resourceValues);
  const itemScope = useContext(ItemScopeContext);

  const injected = mergeInjected(itemScope, resourceValues);
  const instanceProps = useMemo(
    () => getInstancePropsObject(instance.id, allProps, dataSources, injected),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [instance.id, allProps, dataSources, itemScope, resourceValues]
  );

  const show = instanceProps[showAttribute] ?? true;
  if (show === false) return <></>;

  let Component: string | AnyComponent =
    (components.get(instance.component) as AnyComponent) ??
    (MissingComponentStub as AnyComponent);

  // Swap <body> → <div> for the same reason as WebstudioComponentCanvas.
  if (Component === "body" || instance.component === "Body") {
    Component = "div" as unknown as AnyComponent;
  }

  const props: Record<string, unknown> = {
    ...restProps,
    ...instanceProps,
    [idAttribute]: instance.id,
    [componentAttribute]: instance.component,
    [selectorIdAttribute]: instanceSelector.join(","),
  };
  delete props[showAttribute];

  const children =
    createInstanceChildrenElements({
      instances,
      instanceSelector,
      children: instance.children,
      Component: WebstudioComponentPreview,
      components,
    }) ?? null;

  return <Component {...(props as any)} ref={ref}>{children}</Component>;
});
WebstudioComponentPreview.displayName = "WebstudioComponentPreview";
