"use client";
import { useState, useEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { $aiPanelOpen, $aiInitialPrompt } from "@/lib/nano-states";
import { $projectMeta } from "@/lib/data-stores";
import { applyWSComposition } from "@/lib/applyWSComposition";
import type { WSCompositionResult } from "@studio/ai";
import { UI_VARS as C } from "@/lib/uiTheme";


type AIState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; composition: WSCompositionResult }
  | { type: "error"; message: string };

export function AIPanel() {
  const isOpen = useStore($aiPanelOpen);
  const meta = useStore($projectMeta);
  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<AIState>({ type: "idle" });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const didAutoSubmit = useRef(false);

  // Read initial prompt (set by landing-page → builder flow)
  useEffect(() => {
    if (!isOpen) return;
    const initial = $aiInitialPrompt.get();
    if (initial && !didAutoSubmit.current) {
      $aiInitialPrompt.set("");
      didAutoSubmit.current = true;
      setPrompt(initial);
      // Auto-generate after a brief tick so the panel renders first
      setTimeout(() => handleGenerate(initial), 80);
    } else {
      textareaRef.current?.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Reset auto-submit flag when panel closes
  useEffect(() => {
    if (!isOpen) didAutoSubmit.current = false;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") $aiPanelOpen.set(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  if (!isOpen) return null;

  const isLoading = state.type === "loading";

  async function handleGenerate(overridePrompt?: string) {
    const text = (overridePrompt ?? prompt).trim();
    if (!text || isLoading) return;
    setState({ type: "loading" });
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: text, projectId: meta?.id ?? null }),
      });
      const json = (await res.json()) as {
        composition?: WSCompositionResult;
        error?: string;
      };
      if (!res.ok) {
        setState({ type: "error", message: json.error ?? `Something went wrong (HTTP ${res.status})` });
        return;
      }
      setState({ type: "success", composition: json.composition! });
    } catch (err) {
      setState({ type: "error", message: String(err) });
    }
  }

  function handleApply() {
    if (state.type !== "success") return;
    applyWSComposition(state.composition);
    $aiPanelOpen.set(false);
    setPrompt("");
    setState({ type: "idle" });
  }

  return (
    <div
      role="dialog"
      aria-label="Generate with AI"
      style={{
        position: "fixed",
        top: 52,
        left: "50%",
        transform: "translateX(-50%)",
        width: 580,
        maxWidth: "calc(100vw - 32px)",
        zIndex: 100,
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        boxShadow: "0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.08)",
        fontFamily: C.font,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#a78bfa" }}>✦ Generate with AI</span>
          {isLoading && (
            <span style={{ fontSize: 13, color: C.textMuted }}>Building your site…</span>
          )}
        </div>
        <button
          onClick={() => $aiPanelOpen.set(false)}
          style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "2px 4px", borderRadius: 4 }}
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
          }}
          placeholder='Describe your page — e.g. "Landing page with hero, three feature cards, and a contact form"'
          rows={3}
          disabled={isLoading}
          style={{
            width: "100%",
            background: C.input,
            border: `1px solid ${C.inputBorder}`,
            borderRadius: 9,
            color: C.text,
            fontSize: 13,
            fontFamily: C.font,
            padding: "11px 14px",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            opacity: isLoading ? 0.5 : 1,
            lineHeight: 1.5,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: C.textMuted }}>⌘↵ to generate</span>
          <button
            onClick={() => handleGenerate()}
            disabled={isLoading || !prompt.trim()}
            style={{
              padding: "7px 18px",
              borderRadius: 7,
              border: "none",
              background: isLoading || !prompt.trim()
                ? "rgba(124,58,237,0.25)"
                : "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              color: "#fff",
              fontSize: 13,
              fontFamily: C.font,
              fontWeight: 700,
              cursor: isLoading || !prompt.trim() ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {isLoading ? (
              <>
                <span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.25)", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
                Generating…
              </>
            ) : "Generate →"}
          </button>
        </div>

        {/* Error */}
        {state.type === "error" && (
          <div style={{ padding: "11px 14px", borderRadius: 9, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontSize: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ flex: 1 }}>{state.message}</span>
            <button
              onClick={() => setState({ type: "idle" })}
              style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 5, color: "#fca5a5", fontSize: 13, fontFamily: C.font, cursor: "pointer", padding: "3px 8px", whiteSpace: "nowrap" }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Success */}
        {state.type === "success" && (
          <div style={{ padding: 14, borderRadius: 9, background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.18)", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 18, lineHeight: 1, marginTop: 1 }}>✓</span>
              <div>
                <div style={{ color: "#6ee7b7", fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
                  Your page is ready to preview
                </div>
                <div style={{ color: C.textMuted, fontSize: 13 }}>
                  {state.composition.instances.length} elements generated. Click Apply to add it to your canvas.
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => setState({ type: "idle" })}
                style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: C.textMuted, fontSize: 13, fontFamily: C.font, cursor: "pointer" }}
              >
                Discard
              </button>
              <button
                onClick={handleApply}
                style={{ padding: "5px 18px", borderRadius: 5, border: "none", background: C.success, color: "#fff", fontSize: 12, fontFamily: C.font, fontWeight: 700, cursor: "pointer" }}
              >
                Apply to page
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
