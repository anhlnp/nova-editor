"use client";
import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $instances, $props, $pages } from "@/lib/data-stores";
import { $a11yPanelOpen, $selectedPageId, $selectedInstanceSelector } from "@/lib/nano-states";
import type { A11yIssue } from "@/app/api/ai/a11y/route";
import type { Instance } from "@webstudio-is/sdk";
import { UI_VARS as C } from "@/lib/uiTheme";


const SEVERITY_COLOR: Record<string, string> = {
  error: C.error, warning: C.warning, info: C.info,
};

function buildInstanceNodes(instances: Map<string, Instance>, props: Map<string, unknown>, rootId: string) {
  const result: { id: string; component: string; props: Record<string, unknown>; textContent?: string }[] = [];
  const visited = new Set<string>();

  const walk = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    const inst = instances.get(id);
    if (!inst) return;
    const instanceProps: Record<string, unknown> = {};
    for (const [, p] of props) {
      const prop = p as { instanceId?: string; name?: string; value?: unknown };
      if (prop.instanceId === id && prop.name) instanceProps[prop.name] = prop.value;
    }
    const textContent = inst.children.filter((c) => c.type === "text").map((c) => (c as { type: "text"; value: string }).value).join(" ");
    result.push({ id, component: inst.component, props: instanceProps, textContent: textContent || undefined });
    for (const child of inst.children) {
      if (child.type === "id") walk(child.value);
    }
  };
  walk(rootId);
  return result;
}

export function A11yPanel() {
  const isOpen = useStore($a11yPanelOpen);
  const instances = useStore($instances);
  const props = useStore($props);
  const pages = useStore($pages);
  const selectedPageId = useStore($selectedPageId);
  const [issues, setIssues] = useState<A11yIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") $a11yPanelOpen.set(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  if (!isOpen) return null;

  const page = pages?.pages.get(selectedPageId ?? pages?.homePageId ?? "") ?? pages?.pages.get(pages?.homePageId ?? "");

  const runCheck = async () => {
    if (!page) return;
    setLoading(true);
    setRan(false);
    const nodes = buildInstanceNodes(instances, props, page.rootInstanceId);
    try {
      const res = await fetch("/api/ai/a11y", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instances: nodes }),
      });
      const json = await res.json() as { issues?: A11yIssue[] };
      setIssues(json.issues ?? []);
      setRan(true);
    } catch {
      setIssues([]);
      setRan(true);
    } finally {
      setLoading(false);
    }
  };

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;

  return (
    <div role="dialog" aria-label="Accessibility Checker"
      style={{ position: "fixed", top: 52, right: 296, width: 380, maxHeight: "70vh", zIndex: 100, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", fontFamily: C.font, overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa" }}>♿ Accessibility Check</span>
        <button onClick={() => $a11yPanelOpen.set(false)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18, padding: "2px 4px" }}>×</button>
      </div>
      <div style={{ padding: "10px 14px", flexShrink: 0 }}>
        <button onClick={runCheck} disabled={loading}
          style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(96,165,250,0.4)", background: loading ? "rgba(96,165,250,0.1)" : "rgba(96,165,250,0.15)", color: "#93c5fd", fontSize: 13, fontFamily: C.font, fontWeight: 700, cursor: loading ? "default" : "pointer" }}>
          {loading ? "Checking…" : "Run Check"}
        </button>
        {ran && (
          <span style={{ marginLeft: 10, fontSize: 13, color: C.textMuted }}>
            {errors > 0 && <span style={{ color: C.error }}>{errors} error{errors > 1 ? "s" : ""} </span>}
            {warnings > 0 && <span style={{ color: C.warning }}>{warnings} warning{warnings > 1 ? "s" : ""} </span>}
            {issues.length === 0 && <span style={{ color: "#6ee7b7" }}>✓ All clear</span>}
          </span>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 14px 14px" }}>
        {issues.map((issue) => (
          <div key={`${issue.instanceId}-${issue.rule}`}
            style={{ marginBottom: 8, padding: "9px 11px", borderRadius: 7, border: `1px solid ${SEVERITY_COLOR[issue.severity]}30`, background: `${SEVERITY_COLOR[issue.severity]}08` }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: SEVERITY_COLOR[issue.severity], textTransform: "uppercase" }}>{issue.severity}</span>
              <span style={{ fontSize: 12, color: C.textMuted }}>{issue.component} · {issue.rule}</span>
              <button
                onClick={() => $selectedInstanceSelector.set([issue.instanceId])}
                style={{ marginLeft: "auto", fontSize: 9, color: "#a78bfa", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Select ›
              </button>
            </div>
            <div style={{ fontSize: 13, color: C.text, marginBottom: 4 }}>{issue.message}</div>
            <div style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>{issue.fix}</div>
          </div>
        ))}
        {ran && issues.length === 0 && (
          <div style={{ textAlign: "center", color: "#6ee7b7", fontSize: 12, paddingTop: 16 }}>
            ✓ No accessibility issues detected
          </div>
        )}
      </div>
    </div>
  );
}
