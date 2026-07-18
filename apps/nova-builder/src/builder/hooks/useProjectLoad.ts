"use client";
// Load-and-seed lifecycle for the builder page:
//   fetch project → deserialize → seed atoms → register component libraries →
//   create SyncClient(leader). Also loads user branding (non-demo).
// Returns { loadState, errorMessage, syncEmitterRef } — the emitter ref is
// injected into the canvas iframe by the page's onIframeLoad.

import { useEffect, useRef, useState } from "react";
import { deserializeWebstudioData } from "@/lib/schema";
import { seedDataStores, resetDataStores, $projectMeta } from "@/lib/data-stores";
import {
  $selectedPageId, $selectedInstanceSelector, registerComponentLibrary,
  $cssVars, $interactions, $customCss, $brandingLogo, $brandingName,
} from "@/lib/nano-states";
import { $symbols } from "@/lib/symbols";
import { registerContainers, createObjectPool } from "@/lib/sync-stores";
import { SyncClient, NanoEventsSyncEmitter } from "@/lib/sync-client";
import type { SyncEmitter } from "@/lib/sync-client";
import { $docVersion, startSaveQueue } from "@/lib/saveQueue";
import { coreMetas } from "@webstudio-is/sdk";
import { coreTemplates } from "@webstudio-is/sdk/core-templates";
import * as baseComponentMetas from "@webstudio-is/sdk-components-react/metas";
import * as baseComponentTemplates from "@webstudio-is/sdk-components-react/templates";
import * as radixComponentMetas from "@webstudio-is/sdk-components-react-radix/metas";
import * as radixTemplates from "@webstudio-is/sdk-components-react-radix/templates";
import { repeatListMeta } from "@/canvas/repeat-list";

type ProjectApiResponse = {
  id: string;
  name: string;
  schemaVersion: string;
  data: Parameters<typeof deserializeWebstudioData>[0];
  updatedAt: string;
  version?: number | null;
};

export type LoadState = "loading" | "ready" | "error";

export function useProjectLoad(projectId: string, isDemo: boolean) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const syncClientRef = useRef<SyncClient | null>(null);
  const syncEmitterRef = useRef<SyncEmitter | null>(null);

  // ── 1. Load project and seed atoms ──────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ProjectApiResponse = await res.json();

        const data = deserializeWebstudioData(json.data);
        seedDataStores(data);
        $cssVars.set((json as any).cssVars ?? {});
        $interactions.set((json as any).interactions ?? {});
        $customCss.set((json as any).customCss ?? "");
        $symbols.set((json as any).symbols ?? []);
        $projectMeta.set({ id: json.id, name: json.name, updatedAt: json.updatedAt });

        if (data.pages.homePageId) {
          $selectedPageId.set(data.pages.homePageId);
          // Auto-select root instance so the right panel shows content on load.
          const homePage = data.pages.pages.get(data.pages.homePageId);
          if (homePage?.rootInstanceId) {
            $selectedInstanceSelector.set([homePage.rootInstanceId]);
          }
        }

        registerContainers();

        // Register component libraries (metas + templates only — canvas renders, builder inspects)
        registerComponentLibrary({
          components: {},
          metas: coreMetas as Record<string, import("@webstudio-is/sdk").WsComponentMeta>,
          templates: coreTemplates as any,
        });
        registerComponentLibrary({
          components: {},
          metas: baseComponentMetas as Record<string, import("@webstudio-is/sdk").WsComponentMeta>,
          templates: baseComponentTemplates as any,
        });
        registerComponentLibrary({
          namespace: "@webstudio-is/sdk-components-react-radix",
          components: {},
          metas: radixComponentMetas as Record<string, import("@webstudio-is/sdk").WsComponentMeta>,
          templates: radixTemplates as any,
        });
        registerComponentLibrary({
          namespace: "nova",
          components: {},
          metas: { RepeatList: repeatListMeta },
        });

        const emitter = new NanoEventsSyncEmitter();
        syncEmitterRef.current = emitter;
        const client = new SyncClient({
          role: "leader",
          object: createObjectPool(),
          emitter,
          storages: [],
        });
        syncClientRef.current = client;
        client.connect({ signal: controller.signal });

        // Patch-based autosave (M2): transactions from M1 become the save
        // payload. Demo projects have no DB row — no queue.
        $docVersion.set(json.version ?? 0);
        if (!isDemo) {
          startSaveQueue(projectId, controller.signal);
        }

        setLoadState("ready");
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("[builder] load failed:", err);
        setErrorMessage(String(err));
        setLoadState("error");
      }
    })();

    return () => {
      controller.abort();
      resetDataStores();
      syncClientRef.current = null;
      syncEmitterRef.current = null;
    };
  }, [projectId, isDemo]);

  // ── 1b. Load branding settings (non-demo only) ──────────────────────────────
  useEffect(() => {
    if (isDemo) return;
    fetch("/api/settings/branding")
      .then((r) => r.json())
      .then((json: { logo: string | null; name: string | null }) => {
        $brandingLogo.set(json.logo ?? "");
        $brandingName.set(json.name ?? "");
      })
      .catch(() => { /* non-fatal */ });
  }, [isDemo]);

  return { loadState, errorMessage, syncEmitterRef };
}
