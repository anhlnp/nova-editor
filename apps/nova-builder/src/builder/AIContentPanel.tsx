"use client";
import { useState, useEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { updateData } from "@/lib/transactions";
import { $instances, $pages } from "@/lib/data-stores";
import { $aiContentPanelOpen, $selectedPageId } from "@/lib/nano-states";
import { $projectMeta } from "@/lib/data-stores";
import type { Instance } from "@webstudio-is/sdk";
import { UI_VARS as C } from "@/lib/uiTheme";


type FillState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; fills: { instanceId: string; text: string }[] }
  | { type: "error"; message: string };

function collectTextInstances(instances: Map<string, Instance>, rootId: string): { instanceId: string; currentText: string }[] {
  const result: { instanceId: string; currentText: string }[] = [];
  const visited = new Set<string>();

  const walk = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    const inst = instances.get(id);
    if (!inst) return;
    const textChild = inst.children.find((c) => c.type === "text");
    if (textChild && !inst.children.some((c) => c.type === "id")) {
      result.push({ instanceId: id, currentText: textChild.value as string });
    }
    for (const child of inst.children) {
      if (child.type === "id") walk(child.value);
    }
  };
  walk(rootId);
  return result.slice(0, 20); // cap at 20 to control credits
}

export function AIContentPanel() {
  const isOpen = useStore($aiContentPanelOpen);
  const instances = useStore($instances);
  const pages = useStore($pages);
  const selectedPageId = useStore($selectedPageId);
  const meta = useStore($projectMeta);
  const [topic, setTopic] = useState("");
  const [state, setState] = useState<FillState>({ type: "idle" });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    textareaRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") $aiContentPanelOpen.set(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  if (!isOpen) return null;

  const page = pages?.pages.get(selectedPageId ?? pages.homePageId) ?? pages?.pages.get(pages?.homePageId ?? "");
  const textInstances = page ? collectTextInstances(instances, page.rootInstanceId) : [];

  const handleFill = async () => {
    if (!topic.trim() || !textInstances.length) return;
    setState({ type: "loading" });
    try {
      const res = await fetch("/api/ai/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), instances: textInstances, projectId: meta?.id }),
      });
      const json = await res.json() as { fills?: { instanceId: string; text: string }[]; error?: string };
      if (!res.ok) { setState({ type: "error", message: json.error ?? "Failed" }); return; }
      setState({ type: "success", fills: json.fills ?? [] });
    } catch (err) {
      setState({ type: "error", message: String(err) });
    }
  };

  const handleApply = () => {
    if (state.type !== "success") return;
    updateData(({ instances: draft }) => {
      for (const { instanceId, text } of state.fills) {
        const inst = draft.get(instanceId);
        if (!inst) continue;
        draft.set(instanceId, { ...inst, children: [{ type: "text" as const, value: text }] } as Parameters<typeof draft.set>[1]);
      }
    });
    $aiContentPanelOpen.set(false);
    setTopic("");
    setState({ type: "idle" });
  };

  const isLoading = state.type === "loading";

  return (
    <div
      role="dialog"
      aria-label="AI Content Fill"
      style={{
        position: "fixed", top: 52, left: "50%", transform: "translateX(-50%)",
        width: 500, maxWidth: "calc(100vw - 32px)", zIndex: 100,
        background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14,
        boxShadow: "0 12px 48px rgba(0,0,0,0.6)", fontFamily: C.font, overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>✦ Fill with AI</span>
        <button onClick={() => $aiContentPanelOpen.set(false)}
          style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18, padding: "2px 4px" }}>×</button>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 13, color: C.textMuted }}>
          Found <strong style={{ color: C.text }}>{textInstances.length}</strong> text elements on this page.
          Describe the topic/purpose and AI will write copy for each one.
        </div>
        <textarea
          ref={textareaRef}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleFill(); }}
          placeholder='e.g. "SaaS product for project management, professional tone"'
          rows={2}
          disabled={isLoading}
          style={{ width: "100%", background: C.input, border: `1px solid ${C.inputBorder}`, borderRadius: 8, color: C.text, fontSize: 12, fontFamily: C.font, padding: "9px 12px", resize: "none", outline: "none", boxSizing: "border-box", opacity: isLoading ? 0.5 : 1 }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleFill}
            disabled={isLoading || !topic.trim() || !textInstances.length}
            style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: isLoading || !topic.trim() ? "rgba(124,58,237,0.25)" : "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", fontSize: 12, fontFamily: C.font, fontWeight: 700, cursor: isLoading ? "default" : "pointer" }}
          >
            {isLoading ? "Generating…" : "Fill →"}
          </button>
        </div>
        {state.type === "error" && (
          <div style={{ padding: "9px 12px", borderRadius: 7, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontSize: 13 }}>
            {state.message}
          </div>
        )}
        {state.type === "success" && (
          <div style={{ padding: 12, borderRadius: 8, background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.18)", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ color: "#6ee7b7", fontSize: 12, fontWeight: 600 }}>✓ {state.fills.length} elements filled</div>
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <button onClick={() => setState({ type: "idle" })} style={{ padding: "4px 10px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: C.textMuted, fontSize: 13, fontFamily: C.font, cursor: "pointer" }}>Discard</button>
              <button onClick={handleApply} style={{ padding: "4px 14px", borderRadius: 5, border: "none", background: C.success, color: "#fff", fontSize: 13, fontFamily: C.font, fontWeight: 700, cursor: "pointer" }}>Apply</button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
