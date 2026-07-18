"use client";
import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $instances, $assets, $pages } from "@/lib/data-stores";
import { $perfPanelOpen, $selectedPageId } from "@/lib/nano-states";
import type { PerfHint } from "@/app/api/ai/performance/route";
import type { Instance } from "@webstudio-is/sdk";
import { UI_VARS as C } from "@/lib/uiTheme";


const IMPACT_COLOR: Record<string, string> = {
  high: "#ef4444", medium: "#f59e0b", low: "#60a5fa",
};

const SEVERITY_ICON: Record<string, string> = {
  error: "⚠", warning: "▲", info: "ℹ",
};

function scoreColor(s: number): string {
  if (s >= 80) return "#34d399";
  if (s >= 60) return "#f59e0b";
  return "#ef4444";
}

function collectInstanceNodes(instances: Map<string, Instance>, rootId: string) {
  const result: { id: string; component: string; props: Record<string, unknown>; childCount: number; depth: number }[] = [];
  const visited = new Set<string>();

  const walk = (id: string, depth: number) => {
    if (visited.has(id)) return;
    visited.add(id);
    const inst = instances.get(id);
    if (!inst) return;
    const childCount = inst.children.filter((c) => c.type === "id").length;
    result.push({ id, component: inst.component, props: {}, childCount, depth });
    for (const child of inst.children) {
      if (child.type === "id") walk(child.value, depth + 1);
    }
  };
  walk(rootId, 0);
  return result;
}

export function PerformancePanel() {
  const isOpen = useStore($perfPanelOpen);
  const instances = useStore($instances);
  const assets = useStore($assets);
  const pages = useStore($pages);
  const selectedPageId = useStore($selectedPageId);
  const [hints, setHints] = useState<PerfHint[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") $perfPanelOpen.set(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  if (!isOpen) return null;

  const page = pages?.pages.get(selectedPageId ?? pages?.homePageId ?? "") ?? pages?.pages.get(pages?.homePageId ?? "");

  const runAnalysis = async () => {
    setLoading(true);
    const nodes = page ? collectInstanceNodes(instances, page.rootInstanceId) : [];
    const assetList = [...assets.values()].map((a) => ({
      id: (a as { id: string }).id,
      name: (a as { name: string }).name ?? "",
      type: (a as { type: string }).type ?? "",
      size: (a as { size?: number }).size,
      width: (a as { width?: number }).width,
      height: (a as { height?: number }).height,
    }));
    try {
      const res = await fetch("/api/ai/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instances: nodes, assets: assetList }),
      });
      const json = await res.json() as { hints?: PerfHint[]; score?: number };
      setHints(json.hints ?? []);
      setScore(json.score ?? null);
    } catch {
      setHints([]);
      setScore(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div role="dialog" aria-label="Performance Advisor"
      style={{ position: "fixed", top: 52, right: 296, width: 380, maxHeight: "70vh", zIndex: 100, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", fontFamily: C.font, overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#34d399" }}>⚡ Performance Advisor</span>
        <button onClick={() => $perfPanelOpen.set(false)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18, padding: "2px 4px" }}>×</button>
      </div>
      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={runAnalysis} disabled={loading}
          style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(52,211,153,0.4)", background: loading ? "rgba(52,211,153,0.1)" : "rgba(52,211,153,0.15)", color: "#6ee7b7", fontSize: 13, fontFamily: C.font, fontWeight: 700, cursor: loading ? "default" : "pointer" }}>
          {loading ? "Analyzing…" : "Analyze Page"}
        </button>
        {score !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: scoreColor(score), lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 12, color: C.textMuted }}>/ 100</span>
          </div>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
        {hints.map((hint) => (
          <div key={hint.id}
            style={{ marginBottom: 8, padding: "9px 11px", borderRadius: 7, border: `1px solid ${IMPACT_COLOR[hint.impact]}22`, background: `${IMPACT_COLOR[hint.impact]}08` }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <span style={{ color: IMPACT_COLOR[hint.impact], fontSize: 12 }}>{SEVERITY_ICON[hint.severity]}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: IMPACT_COLOR[hint.impact], textTransform: "uppercase" }}>{hint.impact} impact</span>
              <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 4 }}>{hint.category}</span>
            </div>
            <div style={{ fontSize: 13, color: C.text, marginBottom: 4 }}>{hint.message}</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>{hint.recommendation}</div>
          </div>
        ))}
        {!loading && hints.length === 0 && score === null && (
          <div style={{ textAlign: "center", color: C.textMuted, fontSize: 13, paddingTop: 20 }}>
            Click Analyze Page to run performance checks.
          </div>
        )}
      </div>
    </div>
  );
}
