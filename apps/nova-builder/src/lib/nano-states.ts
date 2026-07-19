// Minimal builder/canvas UI state atoms.
// Subset of reference/webstudio/apps/builder/app/shared/nano-states.ts
// Only the atoms required to initialize the canvas and render instances.

import { atom, computed } from "nanostores";
import type { Components } from "@webstudio-is/react-sdk";
import type { WsComponentMeta } from "@webstudio-is/sdk";
// TemplateMeta is from @webstudio-is/template (not in our tsconfig paths).
// Use a structural alias so component libraries can be registered without the dep.
type WsComponentTemplate = Record<string, any>;
import { $pages, $breakpoints } from "./data-stores";
import { compareMedia } from "@webstudio-is/css-engine";

// ─── Canvas render mode ───────────────────────────────────────────────────────

export type BuilderMode = "design" | "content" | "preview";
const getInitialBuilderMode = (): BuilderMode => {
  if (typeof window !== "undefined") {
    const mode = new URLSearchParams(window.location.search).get("mode");
    if (mode === "preview" || mode === "design" || mode === "content") {
      return mode;
    }
  }
  return "design";
};
export const $builderMode = atom<BuilderMode>(getInitialBuilderMode());
export const $isPreviewMode = computed($builderMode, (m) => m === "preview");
export const $isDesignMode = computed($builderMode, (m) => m === "design");
export const $isContentMode = computed($builderMode, (m) => m === "content");

export const $isDirty = atom<boolean>(false);
export const $saveTriggerCount = atom<number>(0);

// ─── M10 UI state atoms ───────────────────────────────────────────────────────

// Grid guides overlay on canvas (toggled by Shift+G / toolbar button)
export const $gridGuidesVisible = atom<boolean>(false);
// CSS preview navigator panel open state
export const $cssPreviewOpen = atom<boolean>(false);

// ─── Selection ───────────────────────────────────────────────────────────────

export const $selectedPageId = atom<string | undefined>(undefined);
export const $selectedPage = computed(
  [$pages, $selectedPageId],
  (pages, selectedPageId) => {
    if (pages === undefined) return undefined;
    const id = selectedPageId ?? pages.homePageId;
    return pages.pages.get(id);
  }
);

export const $selectedBreakpointId = atom<string | undefined>(undefined);
export const $selectedBreakpoint = computed(
  [$breakpoints, $selectedBreakpointId],
  (breakpoints, selectedBreakpointId) => {
    if (selectedBreakpointId !== undefined) {
      const bp = breakpoints.get(selectedBreakpointId);
      if (bp !== undefined) return bp;
    }
    // Default to base breakpoint (no maxWidth — mobile-first base).
    const sorted = [...breakpoints.values()].sort(
      // Cast: compareMedia expects MediaRuleOptions but Breakpoint is compatible at runtime.
      compareMedia as (a: (typeof sorted)[0], b: (typeof sorted)[0]) => number
    );
    return sorted[0];
  }
);

// InstanceSelector: array of [instanceId, parentId, ...] tracing the selection path.
// We simplify to just a string[] for now.
export const $selectedInstanceSelector = atom<string[] | undefined>(undefined);
export const $hoveredInstanceSelector = atom<string[] | undefined>(undefined);

// Derived convenience: just the leaf (selected) instance ID.
export const $selectedInstanceId = computed(
  $selectedInstanceSelector,
  (sel) => sel?.[0]
);

// ─── Component library ───────────────────────────────────────────────────────

export const $registeredComponents = atom<Components>(new Map());
export const $registeredComponentMetas = atom<Map<string, WsComponentMeta>>(
  new Map()
);
export const $registeredTemplates = atom<Map<string, WsComponentTemplate>>(
  new Map()
);

// Asset base URL — R2 public bucket URL (or empty string for local dev).
export const assetBaseUrl =
  process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(/\/$/, "") ?? "";

export const registerComponentLibrary = ({
  namespace,
  components: newComponents,
  metas: newMetas,
  templates: newTemplates,
}: {
  namespace?: string;
  components: Record<string, unknown>;
  metas: Record<string, WsComponentMeta>;
  templates?: Record<string, WsComponentTemplate>;
  hooks?: unknown;
}) => {
  const prefix = namespace ? `${namespace}:` : "";

  const allComponents = new Map($registeredComponents.get());
  for (const [name, component] of Object.entries(newComponents)) {
    allComponents.set(`${prefix}${name}`, component as Components extends Map<infer K, infer V> ? V : never);
  }
  $registeredComponents.set(allComponents);

  const allMetas = new Map($registeredComponentMetas.get());
  for (const [name, meta] of Object.entries(newMetas)) {
    allMetas.set(`${prefix}${name}`, meta);
  }
  $registeredComponentMetas.set(allMetas);

  if (newTemplates !== undefined) {
    const allTemplates = new Map($registeredTemplates.get());
    for (const [name, template] of Object.entries(newTemplates)) {
      allTemplates.set(`${prefix}${name}`, template);
    }
    $registeredTemplates.set(allTemplates);
  }
};

// ─── Pubsub ──────────────────────────────────────────────────────────────────
// Minimal pub/sub atom for builder ↔ canvas UI events.
// Full implementation is in reference/webstudio/apps/builder/app/shared/pubsub/.
// For Phase 2 we just expose the atom; subscriptions are wired in Phase 3.
export const $publisher = atom<{
  publish: (event: { type: string; payload?: unknown }) => void;
} | null>(null);

// AI panel open/close toggle
export const $aiPanelOpen = atom<boolean>(false);

// Pre-filled prompt for AI panel (set before opening; cleared after use)
export const $aiInitialPrompt = atom<string>("");

// Internal clipboard — holds a deep-cloned subtree from the last Ctrl+C.
// IDs are re-minted on every paste so multiple pastes never share instances.
import type { ClipboardData } from "./edit-operations";
export const $clipboard = atom<ClipboardData | null>(null);

// M5 — transient content-model warning shown as a toast when an insertion
// (DnD / paste / AI-apply) is blocked by the nesting guard. Cleared after a timeout.
export const $nestingWarning = atom<string | null>(null);

// M5 — loaded Resource data, keyed by the resource's data-source id. The canvas
// merges this into the expression scope so props bound to a resource variable
// resolve to the fetched response. Populated by the resources runtime loader.
export const $resourceValues = atom<Map<string, unknown>>(new Map());

// Active CSS pseudo-state for the style inspector.
// "" = default (no state); values match CSS pseudo-class syntax.
export type CSSState = "" | ":hover" | ":focus" | ":focus-within" | ":active" | ":disabled" | ":placeholder";
export const $selectedState = atom<CSSState>("");

// Multi-selection — IDs of all currently selected instances.
// Empty array = single-select mode (use $selectedInstanceId instead).
// Plain string[] keeps it JSON-serializable across contexts.
export const $multiSelectedInstanceIds = atom<string[]>([]);

// Canvas zoom level — 1.0 = 100%, range 0.1–3.0.
// Builder-side only; never synced to the canvas iframe.
// Applied as transform: scale() on the wrapper div around the iframe.
export const $canvasZoom = atom<number>(1);

// Command palette open/close (⌘K trigger)
export const $commandPaletteOpen = atom<boolean>(false);

// Global CSS custom properties (design tokens).
// Record keys are the var name WITHOUT leading "--" (e.g. "brand-color").
// Canvas injects these as :root { --brand-color: value; } on every change.
export const $cssVars = atom<Record<string, string>>({});

// ─── JavaScript Interactions (P46) ───────────────────────────────────────────
// Keyed by instanceId → list of event→action bindings.
// Synced across the iframe boundary so the canvas can apply listeners at runtime.

export type InteractionTrigger = "click" | "mouseover" | "focus" | "scroll" | "load";

export type InteractionAction =
  | { type: "navigate"; url: string; newTab?: boolean }
  | { type: "toggleClass"; className: string }
  | { type: "showHide"; targetInstanceId?: string }
  | { type: "animate"; keyframe: string; duration: number; easing: string; fill: "none" | "forwards" | "backwards" | "both" };

export type InteractionDef = {
  id: string;
  trigger: InteractionTrigger;
  action: InteractionAction;
};

export const $interactions = atom<Record<string, InteractionDef[]>>({});

// ─── Tool panel toggles (P47–P49) ────────────────────────────────────────────
export const $aiContentPanelOpen = atom<boolean>(false);
export const $a11yPanelOpen = atom<boolean>(false);
export const $perfPanelOpen = atom<boolean>(false);
export const $historyPanelOpen = atom<boolean>(false);

// ─── Custom CSS (P58) ────────────────────────────────────────────────────────
// Raw CSS string injected into the canvas <head> as <style id="nova-custom-css">.
export const $customCss = atom<string>("");

// ─── White-label branding (P62) ──────────────────────────────────────────────
// Loaded once from /api/settings/branding at builder mount; used in Topbar + HTML export.
export const $brandingLogo = atom<string>("");
export const $brandingName = atom<string>("");

// ─── Lexical text editing (M6) ───────────────────────────────────────────────
// Set by canvas dblclick to activate the Lexical editor overlay.
// Cleared on commit/cancel.
import type { Instance } from "@webstudio-is/sdk";
export type TextEditingState = {
  instanceId: string;
  initialChildren: Instance["children"];
  rect: { top: number; left: number; width: number; height: number };
};
export const $textEditingInstance = atom<TextEditingState | null>(null);

// ─── M10 — Safe-mode banner ───────────────────────────────────────────────────
// True when the current page's root instance has no children → canvas is empty.
// The builder shows a blocking alert with a "Start building" call-to-action.
import { $instances } from "./data-stores";
export const $safeModeActive = computed(
  [$selectedPage, $instances],
  (page, instances) => {
    if (!page) return false;
    const root = instances.get(page.rootInstanceId);
    return !root || root.children.length === 0;
  }
);

// ─── Builder→Canvas postMessage bridge ───────────────────────────────────────
// When the SyncClient emitter chain is unavailable (startup race), the builder
// posts direct messages to the canvas iframe for specific mutations.
// The builder page forwards each entry to iframeRef on change.
export type CanvasMsg =
  | { type: "nova:instanceChildren"; instanceId: string; children: { type: string; value: string }[] };
export const $pendingCanvasMsg = atom<CanvasMsg | null>(null);

// Global Toast Notifications
export type ToastMessage = {
  type: "success" | "error" | "warning";
  text: string;
};
export const $toast = atom<ToastMessage | null>(null);

export function showToast(text: string, type: "success" | "error" | "warning" = "success") {
  $toast.set({ type, text });
}

// ─── Import trigger ──────────────────────────────────────────────────────────
// Incrementing this value causes the builder page to reload the canvas iframe
// with fresh data after a project import.
export const $importKey = atom<number>(0);
