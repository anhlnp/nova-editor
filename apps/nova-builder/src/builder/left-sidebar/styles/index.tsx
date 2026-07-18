"use client";
import { useState } from "react";
import { useStore } from "@nanostores/react";
import { $cssVars } from "@/lib/nano-states";
import { UI_VARS as C } from "@/lib/uiTheme";


const inputSt: React.CSSProperties = {
  background: C.inputBg,
  border: `1px solid ${C.border}`,
  borderRadius: 3,
  color: C.text,
  fontFamily: C.mono,
  fontSize: 13,
  padding: "3px 6px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export function StylesPanel() {
  const vars = useStore($cssVars);
  const [draftName, setDraftName] = useState("");
  const [draftValue, setDraftValue] = useState("");
  const [error, setError] = useState("");

  const entries = Object.entries(vars).sort(([a], [b]) => a.localeCompare(b));

  function updateVar(name: string, value: string) {
    $cssVars.set({ ...$cssVars.get(), [name]: value });
  }

  function deleteVar(name: string) {
    const next = { ...$cssVars.get() };
    delete next[name];
    $cssVars.set(next);
  }

  function addVar() {
    const name = draftName.trim().replace(/^--/, "");
    if (!name) { setError("Name is required"); return; }
    if (!/^[a-zA-Z][\w-]*$/.test(name)) { setError("Use letters, numbers, hyphens only (start with a letter)"); return; }
    $cssVars.set({ ...$cssVars.get(), [name]: draftValue.trim() || "inherit" });
    setDraftName("");
    setDraftValue("");
    setError("");
  }

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "12px 10px",
        fontFamily: C.font,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>
        CSS Variables
      </div>

      {entries.length === 0 && (
        <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 12, padding: "8px 0" }}>
          No variables yet. Add one below.
        </div>
      )}

      {entries.map(([name, value]) => (
        <div key={name} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 22px", gap: 4, marginBottom: 5, alignItems: "center" }}>
          <div
            style={{ fontFamily: C.mono, fontSize: 12, color: "#a78bfa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            title={`--${name}`}
          >
            --{name}
          </div>
          <input
            value={value}
            onChange={(e) => updateVar(name, e.target.value)}
            style={inputSt}
          />
          <button
            onClick={() => deleteVar(name)}
            style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontSize: 15, lineHeight: 1, padding: "0 2px", fontFamily: C.font }}
          >×</button>
        </div>
      ))}

      {/* Add new */}
      <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 8, paddingTop: 10 }}>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 5, fontWeight: 600 }}>Add variable</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 4 }}>
          <input
            placeholder="name (e.g. brand-color)"
            value={draftName}
            onChange={(e) => { setDraftName(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") addVar(); }}
            style={{ ...inputSt, fontFamily: C.mono }}
          />
          <input
            placeholder="value (e.g. #7c3aed)"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addVar(); }}
            style={{ ...inputSt, fontFamily: C.mono }}
          />
        </div>
        {error && <div style={{ fontSize: 12, color: C.danger, marginBottom: 4 }}>{error}</div>}
        <button
          onClick={addVar}
          style={{
            width: "100%",
            padding: "4px 0",
            background: "rgba(124,58,237,0.12)",
            border: `1px dashed rgba(124,58,237,0.4)`,
            borderRadius: 4,
            color: C.accentText,
            fontSize: 13,
            fontFamily: C.font,
            cursor: "pointer",
          }}
        >
          + Add variable
        </button>
      </div>

      <div style={{ marginTop: 12, padding: "8px 10px", background: "rgba(124,58,237,0.06)", border: `1px solid rgba(124,58,237,0.15)`, borderRadius: 4 }}>
        <div style={{ fontSize: 9, color: "#7c3aed", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Usage</div>
        <div style={{ fontFamily: C.mono, fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
          {"color: var(--brand-color)"}
        </div>
      </div>
    </div>
  );
}
