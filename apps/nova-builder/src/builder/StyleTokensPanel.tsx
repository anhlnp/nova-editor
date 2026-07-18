"use client";
import { useState } from "react";
import { useStore } from "@nanostores/react";
import { nanoid } from "nanoid";
import { $styleSources, $styleSourceSelections } from "@/lib/data-stores";
import { $selectedInstanceId } from "@/lib/nano-states";
import { updateData } from "@/lib/transactions";
import { UI_VARS as C } from "@/lib/uiTheme";


type Src = { id: string; type: string; name?: string };
type Sel = { instanceId: string; values: string[] };

const inputSt: React.CSSProperties = {
  background: C.input,
  border: `1px solid ${C.border}`,
  borderRadius: 4,
  color: C.text,
  fontSize: 13,
  fontFamily: C.font,
  padding: "4px 8px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

function btnSt(variant: "accent" | "danger" | "ghost" = "ghost"): React.CSSProperties {
  return {
    background: variant === "accent" ? "rgba(124,58,237,0.15)" : variant === "danger" ? "rgba(248,113,113,0.08)" : "none",
    border: `1px solid ${variant === "accent" ? "rgba(124,58,237,0.4)" : variant === "danger" ? "rgba(248,113,113,0.3)" : C.border}`,
    borderRadius: 4,
    color: variant === "accent" ? C.accentText : variant === "danger" ? C.danger : C.textMuted,
    cursor: "pointer",
    fontSize: 12,
    fontFamily: C.font,
    padding: "2px 8px",
    lineHeight: "18px",
    whiteSpace: "nowrap",
  };
}

export function StyleTokensPanel() {
  const instanceId = useStore($selectedInstanceId);
  const styleSources = useStore($styleSources) as Map<string, Src>;
  const styleSourceSelections = useStore($styleSourceSelections) as Map<string, Sel>;
  const [draftName, setDraftName] = useState("");
  const [error, setError] = useState("");

  const tokens = [...styleSources.values()].filter((s) => s.type === "token");
  const appliedIds = new Set(
    instanceId ? (styleSourceSelections.get(instanceId)?.values ?? []) : []
  );

  function createToken() {
    const name = draftName.trim();
    if (!name) { setError("Token name is required"); return; }
    if (tokens.some((t) => t.name === name)) { setError("A token with that name already exists"); return; }
    const id = `tok_${nanoid(8)}`;
    updateData(({ styleSources: sources }) => {
      (sources as Map<string, Src>).set(id, { type: "token", id, name } as Src);
    });
    setDraftName("");
    setError("");
  }

  function applyToken(tokenId: string) {
    if (!instanceId) return;
    updateData(({ styleSourceSelections: sels, styleSources: srcs }) => {
      const sel = (sels as Map<string, Sel>).get(instanceId);
      const existing = sel?.values.filter((v) => v !== tokenId) ?? [];
      const sourcesMap = srcs as Map<string, Src>;
      const tokenIds = existing.filter((id) => sourcesMap.get(id)?.type === "token");
      const localIds = existing.filter((id) => sourcesMap.get(id)?.type === "local");
      // Tokens come first (lowest specificity), local sources come last (highest specificity)
      const values = [...tokenIds, tokenId, ...localIds];
      (sels as Map<string, Sel>).set(instanceId, { instanceId, values });
    });
  }

  function removeToken(tokenId: string) {
    if (!instanceId) return;
    updateData(({ styleSourceSelections: sels }) => {
      const sel = (sels as Map<string, Sel>).get(instanceId);
      if (!sel) return;
      (sels as Map<string, Sel>).set(instanceId, { ...sel, values: sel.values.filter((v) => v !== tokenId) });
    });
  }

  function deleteToken(tokenId: string) {
    updateData(({ styleSources: srcs, styleSourceSelections: sels }) => {
      for (const [iid, sel] of sels as Map<string, Sel>) {
        if (sel.values.includes(tokenId)) {
          (sels as Map<string, Sel>).set(iid, { ...sel, values: sel.values.filter((v) => v !== tokenId) });
        }
      }
      (srcs as Map<string, Src>).delete(tokenId);
    });
  }

  return (
    <div style={{ height: "100%", background: C.bg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "8px 12px 6px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>
          Style Tokens
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>
          Reusable named style sets. Apply to any instance.
        </div>
      </div>

      {/* Token list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
        {tokens.length === 0 && (
          <div style={{ padding: "8px 12px", fontSize: 13, color: C.textMuted, fontFamily: C.font }}>
            No tokens yet. Create one below.
          </div>
        )}
        {tokens.map((tok) => {
          const applied = appliedIds.has(tok.id);
          return (
            <div
              key={tok.id}
              style={{
                padding: "5px 12px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: applied ? "rgba(124,58,237,0.05)" : "none",
                borderLeft: applied ? "2px solid rgba(124,58,237,0.5)" : "2px solid transparent",
              }}
            >
              {/* Colored dot */}
              <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: applied ? "rgba(124,58,237,0.9)" : "rgba(255,255,255,0.2)",
              }} />
              {/* Name */}
              <span style={{ flex: 1, fontSize: 13, color: C.text, fontFamily: C.font, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {tok.name}
              </span>
              {/* Apply / Remove */}
              {instanceId && (
                <button
                  onClick={() => applied ? removeToken(tok.id) : applyToken(tok.id)}
                  style={btnSt(applied ? "danger" : "accent")}
                >
                  {applied ? "Remove" : "Apply"}
                </button>
              )}
              {/* Delete */}
              <button
                onClick={() => deleteToken(tok.id)}
                title="Delete token"
                style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: "0 2px" }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* Create form */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "8px 12px", flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 5, fontWeight: 600 }}>Create token</div>
        <input
          placeholder="Token name (e.g. primary-button)"
          value={draftName}
          onChange={(e) => { setDraftName(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") createToken(); }}
          style={inputSt}
        />
        {error && <div style={{ fontSize: 12, color: C.danger, marginTop: 3 }}>{error}</div>}
        <button
          onClick={createToken}
          style={{
            marginTop: 5, width: "100%", padding: "4px 0",
            background: "rgba(124,58,237,0.12)",
            border: "1px dashed rgba(124,58,237,0.4)",
            borderRadius: 4, color: C.accentText, fontSize: 13,
            fontFamily: C.font, cursor: "pointer",
          }}
        >
          + Create token
        </button>
      </div>

      {!instanceId && (
        <div style={{ padding: "6px 12px 10px", fontSize: 12, color: C.textMuted }}>
          Select an instance to apply tokens.
        </div>
      )}
    </div>
  );
}
