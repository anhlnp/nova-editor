"use client";
// Read-only canvas preview — no builder chrome.
// Loads project from public /api/preview/:id, seeds atoms, injects emitter into canvas iframe.
// Accessible without auth so share links work in incognito.

import { useEffect, useRef, useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { deserializeWebstudioData } from "@/lib/schema";
import {
  seedDataStores,
  resetDataStores,
  $projectMeta,
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
} from "@/lib/data-stores";
import {
  $selectedPageId, registerComponentLibrary,
  $builderMode, $cssVars, $interactions, $customCss,
} from "@/lib/nano-states";
import { registerContainers, createObjectPool } from "@/lib/sync-stores";
import { SyncClient, NanoEventsSyncEmitter } from "@/lib/sync-client";
import type { SyncEmitter } from "@/lib/sync-client";
import { coreMetas } from "@webstudio-is/sdk";
import { coreTemplates } from "@webstudio-is/sdk/core-templates";
import * as baseComponentMetas from "@webstudio-is/sdk-components-react/metas";
import * as baseComponentTemplates from "@webstudio-is/sdk-components-react/templates";
import * as radixComponentMetas from "@webstudio-is/sdk-components-react-radix/metas";
import * as radixTemplates from "@webstudio-is/sdk-components-react-radix/templates";

type CookieConsent = {
  enabled: boolean;
  message: string;
  acceptLabel: string;
  declineLabel: string;
  position: "bottom" | "top" | "bottom-left" | "bottom-right";
  bgColor: string;
  textColor: string;
  buttonColor: string;
};

type ProjectApiResponse = {
  id: string;
  name: string;
  schemaVersion: string;
  data: Parameters<typeof deserializeWebstudioData>[0];
  cssVars?: Record<string, string>;
  interactions?: Record<string, never[]>;
  customCss?: string;
  cookieConsent?: CookieConsent | null;
  updatedAt: string;
};

// Cookie banner overlay — same behavior as the exported-HTML banner (P67).
function CookieBanner({ config }: { config: CookieConsent }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("nova-cookie-consent")) setVisible(true);
  }, []);
  if (!visible) return null;

  const decide = (value: string) => {
    localStorage.setItem("nova-cookie-consent", value);
    setVisible(false);
  };
  const positionStyle: React.CSSProperties =
    config.position === "top" ? { top: 0, left: 0, right: 0 } :
    config.position === "bottom-left" ? { bottom: 16, left: 16, maxWidth: 380, borderRadius: 10 } :
    config.position === "bottom-right" ? { bottom: 16, right: 16, maxWidth: 380, borderRadius: 10 } :
    { bottom: 0, left: 0, right: 0 };

  return (
    <div style={{
      position: "fixed", zIndex: 9999, ...positionStyle,
      background: config.bgColor, padding: "14px 18px",
      fontFamily: "system-ui, sans-serif", display: "flex",
      alignItems: "center", gap: 12, flexWrap: "wrap",
      boxShadow: "0 -2px 16px rgba(0,0,0,0.2)",
    }}>
      <span style={{ fontSize: 13, color: config.textColor, flex: 1, minWidth: 200, lineHeight: 1.5 }}>
        {config.message}
      </span>
      <span style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={() => decide("accepted")}
          style={{ padding: "7px 16px", borderRadius: 6, border: "none", background: config.buttonColor, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          {config.acceptLabel}
        </button>
        <button onClick={() => decide("declined")}
          style={{ padding: "7px 16px", borderRadius: 6, border: `1px solid ${config.buttonColor}`, background: "transparent", color: config.textColor, fontSize: 12, cursor: "pointer" }}>
          {config.declineLabel}
        </button>
      </span>
    </div>
  );
}

export default function PreviewPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const syncClientRef = useRef<SyncClient | null>(null);
  const syncEmitterRef = useRef<SyncEmitter | null>(null);

  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [cookieConsent, setCookieConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    if (!projectId) return;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/preview/${projectId}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status} — project not found`);
        const json: ProjectApiResponse = await res.json();

        const data = deserializeWebstudioData(json.data);
        seedDataStores(data);
        $projectMeta.set({ id: json.id, name: json.name, updatedAt: json.updatedAt });

        // Published-site extras (R5): custom CSS, CSS vars, and interactions
        // sync into the canvas; preview mode activates the interaction runtime.
        $cssVars.set(json.cssVars ?? {});
        $interactions.set((json.interactions ?? {}) as Parameters<typeof $interactions.set>[0]);
        $customCss.set(json.customCss ?? "");
        $builderMode.set("preview");
        if (json.cookieConsent?.enabled) setCookieConsent(json.cookieConsent);

        if (data.pages.homePageId) {
          $selectedPageId.set(data.pages.homePageId);
        }

        registerContainers();

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

        setState("ready");

        // Fire-and-forget page view tracking
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            path: window.location.pathname,
            referrer: document.referrer || null,
          }),
        }).catch(() => { /* non-fatal */ });
      } catch (err) {
        if (controller.signal.aborted) return;
        setErrorMsg(String(err));
        setState("error");
      }
    })();

    return () => {
      controller.abort();
      resetDataStores();
      syncClientRef.current = null;
      syncEmitterRef.current = null;
    };
  }, [projectId]);

  const onIframeLoad = useCallback(() => {
    const emitter = syncEmitterRef.current;
    const iframe = iframeRef.current;
    if (!emitter || !iframe?.contentWindow) return;
    (
      iframe.contentWindow as Window & { __webstudioSharedSyncEmitter__?: SyncEmitter }
    ).__webstudioSharedSyncEmitter__ = emitter;

    // Live form capture (R5): same-origin iframe — a capture-phase submit
    // listener on the canvas document turns every form into lead capture.
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.addEventListener(
      "submit",
      (e) => {
        const form = e.target as HTMLFormElement | null;
        if (!form || form.tagName !== "FORM") return;
        e.preventDefault();
        const fields: Record<string, string> = {};
        new FormData(form).forEach((v, k) => { fields[k] = String(v); });
        fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            formName: form.getAttribute("name") ?? "default",
            fields,
          }),
        })
          .then(() => {
            form.reset();
            const msg = doc.createElement("div");
            msg.textContent = "Thanks! Your submission was received.";
            msg.style.cssText = "padding:10px 0;font-size:14px;color:#059669;font-family:system-ui";
            form.appendChild(msg);
          })
          .catch(() => { /* non-fatal */ });
      },
      true
    );
  }, [projectId]);

  if (state === "error") {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#ef4444",
          fontFamily: "system-ui, sans-serif",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 14 }}>Could not load preview</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{errorMsg}</div>
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#fff" }}>
      {state === "loading" && (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            fontFamily: "system-ui, sans-serif",
            fontSize: 14,
          }}
        >
          Loading preview…
        </div>
      )}
      {state === "ready" && (
        <iframe
          ref={iframeRef}
          src="/canvas"
          onLoad={onIframeLoad}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Preview"
        />
      )}
      {/* Cookie consent banner (P67) — rendered over the preview */}
      {state === "ready" && cookieConsent && <CookieBanner config={cookieConsent} />}
    </div>
  );
}
