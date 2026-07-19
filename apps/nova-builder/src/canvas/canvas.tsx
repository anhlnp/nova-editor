// Canvas root component — runs inside the /canvas iframe.
//
// Phase 2 scope:
//  • Connects as SyncClient(follower) via useCanvasStore()
//  • Registers all Webstudio component libraries
//  • Renders the selected page's instance tree using WebstudioComponentCanvas
//
// Phase 3 adds: DnD, text editing, inflator, state styles, selection overlay.
// Phase 6 adds: registerComponentLibrary for Nova-extended metadata.

"use client";

import { useMemo, useLayoutEffect, useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { ReactSdkContext, selectorIdAttribute } from "@webstudio-is/react-sdk";
import { wsImageLoader } from "@webstudio-is/image";
import { compareMedia } from "@webstudio-is/css-engine";
import { coreMetas, type Breakpoint } from "@webstudio-is/sdk";
import { coreTemplates } from "@webstudio-is/sdk/core-templates";
import * as baseComponents from "@webstudio-is/sdk-components-react/components";
import * as baseComponentMetas from "@webstudio-is/sdk-components-react/metas";
import { hooks as baseComponentHooks } from "@webstudio-is/sdk-components-react/hooks";
import * as baseComponentTemplates from "@webstudio-is/sdk-components-react/templates";
import * as radixComponents from "@webstudio-is/sdk-components-react-radix";
import * as radixComponentMetas from "@webstudio-is/sdk-components-react-radix/metas";
import * as radixTemplates from "@webstudio-is/sdk-components-react-radix/templates";
import { hooks as radixComponentHooks } from "@webstudio-is/sdk-components-react-radix/hooks";
import { $instances, $breakpoints } from "@/lib/data-stores";
import {
  $selectedPage,
  $isPreviewMode,
  $registeredComponents,
  $selectedInstanceSelector,
  $hoveredInstanceSelector,
  $multiSelectedInstanceIds,
  $textEditingInstance,
  registerComponentLibrary,
  assetBaseUrl,
  $cssVars,
  $interactions,
  $customCss,
} from "@/lib/nano-states";
import { useCanvasStore } from "@/lib/sync-stores";
import { createInstanceElement } from "./elements";
import { RepeatList, repeatListMeta } from "./repeat-list";
import { Slot, slotMeta } from "./slot";
import { shadcnComponents, shadcnMetas } from "./shadcn-components";
import { SelectionOverlay } from "./SelectionOverlay";
import { TextEditOverlay } from "./TextEditOverlay";
import { initDragReparent } from "./dragReparent";
import {
  mountStyles,
  subscribeStyles,
  subscribeStateStyles,
  subscribeHelperStyles,
  GlobalStyles,
} from "./styles";
import {
  WebstudioComponentCanvas,
  WebstudioComponentPreview,
} from "./webstudio-component";

// Canvas API — sets window.__webstudio__$__canvasApi for builder to call.
const initCanvasApi = () => {
  if (typeof window !== "undefined") {
    (window as any)["__webstudio__$__canvasApi"] = { isInitialized: () => true };
  }
};

// DIP fix: single injection point for named <style> elements.
const injectStyleEl = (id: string, css: string) => {
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = css;
};

// ─── Instance tree renderer ───────────────────────────────────────────────────

const useElementsTree = () => {
  const components = useStore($registeredComponents);
  const instances = useStore($instances);
  const isPreviewMode = useStore($isPreviewMode);
  const breakpointsMap = useStore($breakpoints);
  const page = useStore($selectedPage);
  const rootInstanceId = page?.rootInstanceId ?? "";

  const breakpoints = useMemo(
    () =>
      [...breakpointsMap.values()].sort(
        compareMedia as (a: Breakpoint, b: Breakpoint) => number
      ),
    [breakpointsMap]
  );

  return useMemo(() => {
    if (!rootInstanceId) return null;
    return (
      <ReactSdkContext.Provider
        value={{
          renderer: isPreviewMode ? "preview" : "canvas",
          isSafeMode: false,
          assetBaseUrl,
          imageLoader: wsImageLoader,
          videoLoader: undefined,
          resources: {},
          breakpoints,
          onError: (err: unknown) => console.error("[canvas]", err),
        }}
      >
        {createInstanceElement({
          instances,
          instanceId: rootInstanceId,
          instanceSelector: [rootInstanceId],
          Component: isPreviewMode
            ? WebstudioComponentPreview
            : WebstudioComponentCanvas,
          components,
        })}
      </ReactSdkContext.Provider>
    );
  }, [instances, rootInstanceId, components, isPreviewMode, breakpoints]);
};

// ─── Canvas component ─────────────────────────────────────────────────────────

export const Canvas = () => {
  // Connect this iframe as a SyncClient follower.
  useCanvasStore();

  // Style rendering (M-S1): mount stylesheets in cascade order, then subscribe
  // the user/state/helper sheets to the style atoms.
  useLayoutEffect(() => {
    mountStyles();
    const unsubscribeStyles = subscribeStyles();
    const unsubscribeStateStyles = subscribeStateStyles();
    const unsubscribeHelperStyles = subscribeHelperStyles();
    return () => {
      unsubscribeStyles();
      unsubscribeStateStyles();
      unsubscribeHelperStyles();
    };
  }, []);

  // Register component libraries once on mount.
  const [librariesRegistered, setLibrariesRegistered] = useState(false);
  useEffect(() => {
    if (librariesRegistered) return;
    // Core metas (non-renderable abstract components)
    registerComponentLibrary({
      components: {},
      metas: coreMetas as Record<string, import("@webstudio-is/sdk").WsComponentMeta>,
      templates: coreTemplates as any,
    });
    // Base components
    registerComponentLibrary({
      components: baseComponents as Record<string, unknown>,
      metas: baseComponentMetas as Record<string, import("@webstudio-is/sdk").WsComponentMeta>,
      templates: baseComponentTemplates as any,
      hooks: baseComponentHooks,
    });
    // Radix UI components
    registerComponentLibrary({
      namespace: "@webstudio-is/sdk-components-react-radix",
      components: radixComponents as Record<string, unknown>,
      metas: radixComponentMetas as Record<string, import("@webstudio-is/sdk").WsComponentMeta>,
      templates: radixTemplates as any,
      hooks: radixComponentHooks,
    });
    // Nova extended components (P45: RepeatList; M5: Slot)
    registerComponentLibrary({
      namespace: "nova",
      components: { RepeatList, Slot } as Record<string, unknown>,
      metas: { RepeatList: repeatListMeta, Slot: slotMeta },
    });
    // shadcn visual components
    const cleanComponents: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(shadcnComponents)) {
      const cleanKey = key.startsWith("Shadcn") ? key.substring(6) : key;
      cleanComponents[cleanKey] = value;
    }
    const cleanMetas: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(shadcnMetas)) {
      const cleanKey = key.startsWith("Shadcn") ? key.substring(6) : key;
      cleanMetas[cleanKey] = value;
    }
    registerComponentLibrary({
      namespace: "shadcn",
      components: cleanComponents,
      metas: cleanMetas as Record<string, import("@webstudio-is/sdk").WsComponentMeta>,
    });
    setLibrariesRegistered(true);
  }, [librariesRegistered]);

  // Expose canvas API.
  useEffect(() => {
    initCanvasApi();
  }, []);

  // Drag-reparent (FA-007): press-drag the selected element to move it.
  useEffect(() => initDragReparent(), []);

  // Scroll newly-selected instance into view with retry (M7b).
  useEffect(() => {
    return $selectedInstanceSelector.subscribe((selector) => {
      const instanceId = selector?.[0];
      if (!instanceId) return;
      let attempts = 0;
      const tryScroll = () => {
        const el = document.querySelector(`[${selectorIdAttribute}="${instanceId}"]`);
        if (el) {
          el.scrollIntoView({ block: "nearest", inline: "nearest" });
        } else if (attempts++ < 5) {
          setTimeout(tryScroll, 30);
        }
      };
      requestAnimationFrame(tryScroll);
    });
  }, []);

  // Inject/update :root { --var: value; } whenever $cssVars changes.
  useEffect(() => {
    return $cssVars.subscribe((vars) => {
      const entries = Object.entries(vars);
      const decls = entries.map(([k, v]) => `  --${k}: ${v};`).join("\n");
      injectStyleEl("nova-css-vars", entries.length ? `:root {\n${decls}\n}` : "");
    });
  }, []);

  // Inject/update custom raw CSS whenever $customCss changes.
  useEffect(() => {
    return $customCss.subscribe((css) => {
      injectStyleEl("nova-custom-css", css);
    });
  }, []);

  // Apply JS interactions (P46) — only in preview mode to avoid interfering with editing.
  useEffect(() => {
    let abortControllers: AbortController[] = [];

    const cleanup = () => {
      abortControllers.forEach((c) => c.abort());
      abortControllers = [];
    };

    const applyInteractions = () => {
      cleanup();
      if (!$isPreviewMode.get()) return;
      const interactions = $interactions.get();
      for (const [instanceId, defs] of Object.entries(interactions)) {
        if (!defs.length) continue;
        let target: HTMLElement | null = null;
        for (const el of document.querySelectorAll(`[${selectorIdAttribute}]`)) {
          const raw = el.getAttribute(selectorIdAttribute) ?? "";
          if (raw === instanceId || raw.startsWith(`${instanceId},`)) {
            target = el as HTMLElement;
            break;
          }
        }
        if (!target) continue;
        for (const def of defs) {
          const ctrl = new AbortController();
          abortControllers.push(ctrl);
          const el = target;
          target.addEventListener(def.trigger, () => {
            const a = def.action;
            if (a.type === "navigate") {
              if (a.newTab) window.open(a.url, "_blank");
              else window.location.href = a.url;
            } else if (a.type === "toggleClass") {
              el.classList.toggle(a.className);
            } else if (a.type === "showHide") {
              const tgt = a.targetInstanceId
                ? (() => {
                    for (const e2 of document.querySelectorAll(`[${selectorIdAttribute}]`)) {
                      const r = e2.getAttribute(selectorIdAttribute) ?? "";
                      if (r === a.targetInstanceId || r.startsWith(`${a.targetInstanceId},`)) return e2 as HTMLElement;
                    }
                    return null;
                  })()
                : el;
              if (tgt) tgt.style.display = tgt.style.display === "none" ? "" : "none";
            } else if (a.type === "animate") {
              el.animate(
                [{ transform: "translateY(0)" }, { transform: `translateY(0)` }],
                { duration: a.duration, easing: a.easing, fill: a.fill }
              );
              // Named keyframe: look up @keyframes by name in document stylesheets
              const kf = a.keyframe;
              el.style.animation = `${kf} ${a.duration}ms ${a.easing} ${a.fill}`;
              setTimeout(() => { el.style.animation = ""; }, a.duration + 100);
            }
          }, { signal: ctrl.signal });
        }
      }
    };

    const unsubMode = $isPreviewMode.subscribe(() => requestAnimationFrame(applyInteractions));
    const unsubInteract = $interactions.subscribe(() => requestAnimationFrame(applyInteractions));
    requestAnimationFrame(applyInteractions);
    return () => { unsubMode(); unsubInteract(); cleanup(); };
  }, []);

  // ── Direct instance-children update from builder PropsEditorPanel ───────────
  // Bypasses the SyncClient emitter chain (which has a startup race on demo).
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if ($isPreviewMode.get()) return;
      if (e.data?.type !== "nova:instanceChildren") return;
      const { instanceId, children } = e.data as {
        instanceId: string;
        children: { type: string; value: string }[];
      };
      const inst = $instances.get().get(instanceId);
      if (!inst) return;
      // Merge: keep non-text children, replace text children
      const nonText = inst.children.filter((c) => c.type !== "text");
      const next = new Map($instances.get());
      next.set(instanceId, { ...inst, children: [...children, ...nonText] } as Parameters<typeof next.set>[1]);
      $instances.set(next);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // ── Grid guides (M10) — toggle visual 12-column grid overlay via postMessage ─
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if ($isPreviewMode.get()) return;
      if (e.data?.type !== "nova:gridGuides") return;
      const STYLE_ID = "nova-grid-guides";
      let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
      if (e.data.visible) {
        if (!el) {
          el = document.createElement("style");
          el.id = STYLE_ID;
          document.head.appendChild(el);
        }
        el.textContent = `
          body {
            position: relative;
          }
          body::before {
            content: "";
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 9998;
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 16px;
            padding: 0 16px;
            box-sizing: border-box;
          }
          body::after {
            content: "";
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 9998;
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 16px;
            padding: 0 16px;
            box-sizing: border-box;
            background-image:
              repeating-linear-gradient(
                90deg,
                rgba(124, 58, 237, 0.06) 0px,
                rgba(124, 58, 237, 0.06) calc(100% / 12 - 16px * 11 / 12),
                transparent calc(100% / 12 - 16px * 11 / 12),
                transparent calc(100% / 12)
              );
          }
          /* Column fills using CSS counters trick */
          #nova-grid-col-overlay {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 9998;
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 16px;
            padding: 0 16px;
            box-sizing: border-box;
          }
          #nova-grid-col-overlay > div {
            background: rgba(124, 58, 237, 0.06);
            border-left: 1px solid rgba(124, 58, 237, 0.12);
            border-right: 1px solid rgba(124, 58, 237, 0.12);
            min-height: 100%;
          }
        `;
        // Create column fill overlay if missing
        if (!document.getElementById("nova-grid-col-overlay")) {
          const overlay = document.createElement("div");
          overlay.id = "nova-grid-col-overlay";
          for (let i = 0; i < 12; i++) overlay.appendChild(document.createElement("div"));
          document.body.appendChild(overlay);
        }
      } else {
        if (el) el.textContent = "";
        document.getElementById("nova-grid-col-overlay")?.remove();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // ── Drop indicator for sidebar drag-and-drop ─────────────────────────────────
  // Renders a visual line/box when a component is being dragged from the sidebar.
  useEffect(() => {
    let indicator: HTMLDivElement | null = null;
    const ACCENT = "#7c3aed";

    const ensureIndicator = (): HTMLDivElement => {
      if (indicator) return indicator;
      const el = document.createElement("div");
      el.id = "nova-drop-indicator";
      el.style.cssText = "position:fixed;pointer-events:none;z-index:2147483001;box-sizing:border-box;transition:top 0.08s ease, left 0.08s ease, width 0.08s ease, height 0.08s ease;";
      
      const tooltip = document.createElement("div");
      tooltip.id = "nova-drop-indicator-tooltip";
      tooltip.style.cssText = "position:absolute;background:#7c3aed;color:#fff;font-family:sans-serif;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:4px;white-space:nowrap;pointer-events:none;box-shadow:0 2px 4px rgba(0,0,0,0.25);transition:opacity 0.15s;";
      el.appendChild(tooltip);

      document.body.appendChild(el);
      indicator = el;
      return el;
    };

    const clearIndicator = () => {
      indicator?.remove();
      indicator = null;
    };

    const onMessage = (e: MessageEvent) => {
      if ($isPreviewMode.get()) return;
      if (e.data?.type === "nova:dragOverEnd") {
        clearIndicator();
        return;
      }
      if (e.data?.type !== "nova:dragOverUpdate") return;
      const { clientX, clientY, position } = e.data as { clientX: number; clientY: number; position: string };

      // Find the nearest instance element under the pointer
      const target = document.elementFromPoint(clientX, clientY);
      const instEl = target?.closest(`[${selectorIdAttribute}]`) as HTMLElement | null;
      if (!instEl) { clearIndicator(); return; }

      const el = ensureIndicator();
      const r = instEl.getBoundingClientRect();

      const tooltip = el.querySelector("#nova-drop-indicator-tooltip") as HTMLDivElement | null;
      if (tooltip) {
        const compName = instEl.getAttribute("data-ws-component") || "element";
        const cleanLabel = compName.split(":").pop() || compName;
        tooltip.textContent = position === "into" ? `➔ Drop inside ${cleanLabel}` : position === "above" ? `▲ Insert above ${cleanLabel}` : `▼ Insert below ${cleanLabel}`;
        
        if (position === "below") {
          tooltip.style.top = "4px";
          tooltip.style.transform = "none";
        } else {
          tooltip.style.top = "-4px";
          tooltip.style.transform = "translateY(-100%)";
        }
        tooltip.style.left = "4px";
      }

      if (position === "into") {
        el.style.left = `${r.left}px`;
        el.style.top = `${r.top}px`;
        el.style.width = `${r.width}px`;
        el.style.height = `${r.height}px`;
        el.style.border = `2px solid ${ACCENT}`;
        el.style.background = "rgba(124,58,237,0.08)";
        el.style.borderTop = `2px solid ${ACCENT}`;
      } else {
        const y = position === "above" ? r.top : r.bottom;
        el.style.left = `${r.left}px`;
        el.style.top = `${y - 1}px`;
        el.style.width = `${r.width}px`;
        el.style.height = "0px";
        el.style.border = "none";
        el.style.background = "none";
        el.style.borderTop = `2px solid ${ACCENT}`;
      }
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      clearIndicator();
    };
  }, []);

  // ── Link / form interceptor in design mode (M7b) ────────────────────────────
  // Prevent navigation when clicking <a> or form submit in design mode.
  useEffect(() => {
    const interceptLink = (e: MouseEvent) => {
      if ($isPreviewMode.get()) return;
      const anchor = (e.target as Element)?.closest("a");
      if (anchor) {
        e.preventDefault();
      }
    };
    const interceptSubmit = (e: SubmitEvent) => {
      if ($isPreviewMode.get()) return;
      e.preventDefault();
    };
    document.addEventListener("click", interceptLink, true);
    document.addEventListener("submit", interceptSubmit, true);
    return () => {
      document.removeEventListener("click", interceptLink, true);
      document.removeEventListener("submit", interceptSubmit, true);
    };
  }, []);

  // Click-to-select (with shift-click multi-select) + hover + dblclick text editing.
  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if ($isPreviewMode.get()) return;
      // Suppress click-to-select while Lexical editor is active.
      if ($textEditingInstance.get()) return;
      const el = (e.target as Element)?.closest(`[${selectorIdAttribute}]`);
      if (!el) {
        $selectedInstanceSelector.set(undefined);
        $multiSelectedInstanceIds.set([]);
        window.parent.postMessage({ type: "nova:select", selector: undefined }, window.location.origin);
        return;
      }
      const raw = el.getAttribute(selectorIdAttribute);
      if (!raw) return;
      const instanceId = raw.split(",")[0];
      if (!instanceId) return;

      // Shift-click: toggle this instance in multi-selection.
      if (e.shiftKey) {
        let current = $multiSelectedInstanceIds.get();
        if (current.length === 0) {
          const currentSingle = $selectedInstanceSelector.get()?.[0];
          if (currentSingle && currentSingle !== instanceId) {
            current = [currentSingle];
          }
        }
        let next: string[];
        if (current.includes(instanceId)) {
          next = current.filter((id) => id !== instanceId);
        } else {
          next = [...current, instanceId];
        }
        $multiSelectedInstanceIds.set(next);
        const nextSelector = next.length > 0 ? [next[0]] : undefined;
        $selectedInstanceSelector.set(nextSelector);
        window.parent.postMessage(
          { type: "nova:select", selector: nextSelector },
          window.location.origin
        );
        return;
      }

      // Normal click: single-select.
      $multiSelectedInstanceIds.set([]);
      const selector = raw.split(",").filter(Boolean);
      $selectedInstanceSelector.set(selector);
      // Bridge selection to builder via postMessage — more reliable than the
      // SyncClient emitter chain which has a startup race on the demo project.
      window.parent.postMessage(
        { type: "nova:select", selector },
        window.location.origin
      );
    };
    const hoverHandler = (e: MouseEvent) => {
      if ($isPreviewMode.get()) return;
      const el = (e.target as Element)?.closest(`[${selectorIdAttribute}]`);
      if (!el) {
        $hoveredInstanceSelector.set(undefined);
        return;
      }
      const raw = el.getAttribute(selectorIdAttribute);
      if (raw) $hoveredInstanceSelector.set(raw.split(",").filter(Boolean));
    };

    // ── Inline text editing (M6: Lexical) ──────────────────────────────────────
    // Double-click activates the Lexical TextEditOverlay (React component).
    // No more contentEditable or execCommand.
    const dblClickHandler = (e: MouseEvent) => {
      if ($isPreviewMode.get()) return;
      const target = (e.target as Element)?.closest(`[${selectorIdAttribute}]`);
      if (!target || !(target instanceof HTMLElement)) return;
      const raw = target.getAttribute(selectorIdAttribute);
      if (!raw) return;
      const instanceId = raw.split(",")[0];
      if (!instanceId) return;

      const inst = $instances.get().get(instanceId);
      if (!inst) return;
      // Allow text editing on components that carry inline text (even if empty)
      // or that already have text children.
      const TEXT_EDITABLE = new Set([
        "Heading", "Paragraph", "Text", "Button", "Link", "Label",
        "RichText", "Bold", "Italic", "Span",
      ]);
      const hasText = inst.children.some((c) => c.type === "text");
      const isTextComponent = TEXT_EDITABLE.has(inst.component.split(":").pop() ?? inst.component);
      if (!hasText && !isTextComponent) return;

      e.preventDefault();
      e.stopPropagation();

      // Close any active Lexical editor before opening a new one.
      if ($textEditingInstance.get()) {
        $textEditingInstance.set(null);
        window.parent.postMessage({ type: "nova:editingEnd" }, window.location.origin);
      }

      const rect = target.getBoundingClientRect();
      // Seed a placeholder text child so Lexical has something to render when
      // the instance was inserted with empty children.
      const initialChildren =
        inst.children.length > 0
          ? inst.children
          : [{ type: "text" as const, value: "" }];
      $textEditingInstance.set({
        instanceId,
        initialChildren,
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      });
      window.parent.postMessage({ type: "nova:editingStart", instanceId }, window.location.origin);
    };

    const contextMenuHandler = (e: MouseEvent) => {
      if ($isPreviewMode.get()) return;
      e.preventDefault();
      const el = (e.target as Element)?.closest(`[${selectorIdAttribute}]`);
      if (!el) return;
      const raw = el.getAttribute(selectorIdAttribute);
      if (!raw) return;
      const instanceId = raw.split(",")[0];
      if (!instanceId) return;
      // Select the right-clicked instance first
      $selectedInstanceSelector.set(raw.split(",").filter(Boolean));
      window.parent.postMessage(
        { type: "nova:contextMenu", instanceId, clientX: e.clientX, clientY: e.clientY },
        window.location.origin
      );
    };

    document.addEventListener("click", clickHandler);
    document.addEventListener("mouseover", hoverHandler);
    document.addEventListener("dblclick", dblClickHandler);
    document.addEventListener("contextmenu", contextMenuHandler);
    return () => {
      document.removeEventListener("click", clickHandler);
      document.removeEventListener("mouseover", hoverHandler);
      document.removeEventListener("dblclick", dblClickHandler);
      document.removeEventListener("contextmenu", contextMenuHandler);
    };
  }, []);

  const elements = useElementsTree();
  const components = useStore($registeredComponents);
  const instances = useStore($instances);

  console.log("[canvas] Render tick details:", {
    librariesRegistered,
    componentsSize: components.size,
    instancesSize: instances.size,
    instancesMap: Array.from(instances.entries()).map(([k, v]) => ({ id: k, children: v.children.length }))
  });

  // Don't render until libraries are registered and at least one instance exists.
  if (!librariesRegistered || components.size === 0 || instances.size === 0) {
    return null;
  }

  return (
    <>
      <GlobalStyles />
      {elements}
      <SelectionOverlay />
      <TextEditOverlay />
    </>
  );
};
