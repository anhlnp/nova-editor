// Sync store wiring: registers data-store atoms with immerhin and exposes
// useCanvasStore() for the canvas iframe to connect as a SyncClient follower.
//
// Ported/simplified from:
//   reference/webstudio/apps/builder/app/shared/sync/sync-stores.ts
// Removed: clientSyncStore, many UI state objects, SelectedPageAndInstance object
// Kept: serverSyncStore (data atoms), useCanvasStore(), createObjectPool(),
//        registerContainers()

import { Store } from "immerhin";
import { enableMapSet, setAutoFreeze } from "immer";
import { useEffect } from "react";
import { nanoid } from "nanoid";
import type { SyncEmitter } from "@webstudio-is/sync-client";
import {
  SyncClient,
  SyncObjectPool,
  ImmerhinSyncObject,
  NanostoresSyncObject,
} from "./sync-client";
import {
  $pages,
  $assets,
  $instances,
  $props,
  $dataSources,
  $resources,
  $breakpoints,
  $styles,
  $styleSources,
  $styleSourceSelections,
} from "./data-stores";
import {
  $registeredComponentMetas,
  $registeredTemplates,
  $selectedPageId,
  $selectedInstanceSelector,
  $hoveredInstanceSelector,
  $selectedState,
  $builderMode,
  $cssVars,
  $interactions,
  $customCss,
} from "./nano-states";

// Immer setup — must run once at module load time.
enableMapSet();
setAutoFreeze(false);

// Immerhin store for all synced server-side data atoms.
// Mutations via serverSyncStore.createTransaction(...) flow through the sync protocol.
export const serverSyncStore = new Store();

const serverSyncStores = {
  pages: $pages,
  breakpoints: $breakpoints,
  instances: $instances,
  styles: $styles,
  styleSources: $styleSources,
  styleSourceSelections: $styleSourceSelections,
  props: $props,
  dataSources: $dataSources,
  resources: $resources,
  assets: $assets,
} as const;

type ServerSyncStoreName = keyof typeof serverSyncStores;
type ServerSyncStoreValue = (typeof serverSyncStores)[ServerSyncStoreName] extends {
  get(): infer V;
}
  ? V
  : never;
export type ServerSyncState = Map<ServerSyncStoreName, ServerSyncStoreValue>;

export const serverSyncStoreNames = Object.keys(
  serverSyncStores
) as ReadonlyArray<ServerSyncStoreName>;

/**
 * Register all data-store atoms with the immerhin server sync store.
 * Must be called in BOTH builder (leader) and canvas (follower) contexts
 * before creating a SyncClient — so mutations flow through the correct containers.
 */
export const registerContainers = () => {
  for (const name of serverSyncStoreNames) {
    serverSyncStore.register<ServerSyncStoreValue>(
      name,
      serverSyncStores[name]
    );
  }
};

// Track selection as a plain object for cross-context sync.
type SelectionState = {
  selectedPageId: string | undefined;
  selectedInstanceSelector: string[] | undefined;
};

class SelectionSyncObject {
  name = "selectedPageAndInstance";
  operation: "local" | "state" | "add" = "local";

  getState(): SelectionState {
    return {
      selectedPageId: $selectedPageId.get(),
      selectedInstanceSelector: $selectedInstanceSelector.get(),
    };
  }

  setState(state: unknown) {
    const s = state as Partial<SelectionState> | null;
    if (!s) return;
    this.operation = "state";
    if (s.selectedPageId !== undefined) $selectedPageId.set(s.selectedPageId);
    if ("selectedInstanceSelector" in s)
      $selectedInstanceSelector.set(s.selectedInstanceSelector);
    this.operation = "local";
  }

  applyTransaction(transaction: { payload: unknown }) {
    this.setState(structuredClone(transaction.payload));
  }

  revertTransaction(_: unknown) {}

  subscribe(sendTransaction: (t: { id: string; object: string; payload: unknown }) => void, signal: AbortSignal) {
    const send = (payload: SelectionState) => {
      if (this.operation !== "local") return;
      sendTransaction({ id: nanoid(), object: this.name, payload });
    };
    const unsub1 = $selectedPageId.listen(() => send(this.getState()));
    const unsub2 = $selectedInstanceSelector.listen(() => send(this.getState()));
    signal.addEventListener("abort", () => {
      unsub1();
      unsub2();
    });
  }
}

/**
 * Build the SyncObjectPool used by both leader (builder) and follower (canvas).
 * Both sides must call this with the same set of objects so state transfers correctly.
 */
export const createObjectPool = () =>
  new SyncObjectPool([
    new ImmerhinSyncObject("server", serverSyncStore),
    new SelectionSyncObject(),
    new NanostoresSyncObject("builderMode", $builderMode),
    new NanostoresSyncObject("hoveredInstanceSelector", $hoveredInstanceSelector),
    // State-preview (M-S1): the canvas state sheet renders the selected
    // pseudo-state statelessly, so it must know which state is being edited.
    new NanostoresSyncObject("selectedState", $selectedState),
    new NanostoresSyncObject("registeredComponentMetas", $registeredComponentMetas),
    new NanostoresSyncObject("registeredTemplates", $registeredTemplates),
    new NanostoresSyncObject("cssVars", $cssVars),
    new NanostoresSyncObject("interactions", $interactions),
    new NanostoresSyncObject("customCss", $customCss),
  ]);

// ─── Canvas side: follower SyncClient ────────────────────────────────────────

declare global {
  interface Window {
    __webstudioSharedSyncEmitter__: SyncEmitter | undefined;
  }
}

// Acquire the emitter the builder injects into this iframe's window.
//
// Previously this was read ONCE at module-eval time — but the builder sets
// window.__webstudioSharedSyncEmitter__ from its iframe `onLoad` handler, which
// races against this module's evaluation. When the module won the race it read
// `undefined`, connected as a follower with no emitter, and the canvas stayed
// blank ("canvas render random"). Now we WAIT for the property to appear.
const waitForEmitter = (
  onReady: (emitter: SyncEmitter) => void,
  signal: AbortSignal
) => {
  if (typeof window === "undefined") return;
  const tryGrab = (): boolean => {
    const emitter = window.__webstudioSharedSyncEmitter__;
    if (!emitter) return false;
    // Do not delete __webstudioSharedSyncEmitter__ from window so it survives
    // canvas page re-renders/fast refresh mounts.
    onReady(emitter);
    return true;
  };
  if (tryGrab()) return;
  // Poll on a short interval until the builder injects it (bounded by unmount).
  const id = setInterval(() => {
    if (signal.aborted) { clearInterval(id); return; }
    if (tryGrab()) clearInterval(id);
  }, 30);
  signal.addEventListener("abort", () => clearInterval(id));
};

/**
 * Canvas hook: creates a SyncClient(follower) and connects to the builder's emitter.
 * Must be called once, at the root of the canvas component tree.
 */
export const useCanvasStore = () => {
  useEffect(() => {
    registerContainers();
    const controller = new AbortController();
    waitForEmitter((emitter) => {
      if (controller.signal.aborted) return;
      const canvasClient = new SyncClient({
        role: "follower",
        object: createObjectPool(),
        emitter,
      });
      canvasClient.connect({ signal: controller.signal });
    }, controller.signal);
    return () => controller.abort();
  }, []);
};
