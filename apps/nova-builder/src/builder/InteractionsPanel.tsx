"use client";
import { useState } from "react";
import { useStore } from "@nanostores/react";
import { nanoid } from "nanoid";
import { $selectedInstanceId } from "@/lib/nano-states";
import {
  $interactions,
  type InteractionDef,
  type InteractionTrigger,
  type InteractionAction,
} from "@/lib/nano-states";
import { UI_VARS as C } from "@/lib/uiTheme";


const TRIGGERS: { value: InteractionTrigger; label: string }[] = [
  { value: "click", label: "On Click" },
  { value: "mouseover", label: "On Hover" },
  { value: "focus", label: "On Focus" },
];

const ACTION_TYPES = [
  { value: "navigate", label: "Navigate to URL" },
  { value: "toggleClass", label: "Toggle CSS class" },
  { value: "showHide", label: "Show / Hide element" },
];

function defaultAction(type: string): InteractionAction {
  if (type === "navigate") return { type: "navigate", url: "", newTab: false };
  if (type === "toggleClass") return { type: "toggleClass", className: "" };
  return { type: "showHide" };
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: C.input,
  border: `1px solid ${C.inputBorder}`,
  borderRadius: 5,
  color: C.text,
  fontSize: 13,
  fontFamily: C.font,
  padding: "5px 8px",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none" as const,
};

function ActionEditor({
  action,
  onChange,
}: {
  action: InteractionAction;
  onChange: (a: InteractionAction) => void;
}) {
  if (action.type === "navigate") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <input
          style={inputStyle}
          placeholder="https://example.com"
          value={action.url}
          onChange={(e) => onChange({ ...action, url: e.target.value })}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textMuted, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={!!action.newTab}
            onChange={(e) => onChange({ ...action, newTab: e.target.checked })}
          />
          Open in new tab
        </label>
      </div>
    );
  }
  if (action.type === "toggleClass") {
    return (
      <input
        style={inputStyle}
        placeholder="CSS class name"
        value={action.className}
        onChange={(e) => onChange({ ...action, className: e.target.value })}
      />
    );
  }
  if (action.type === "showHide") {
    return (
      <input
        style={inputStyle}
        placeholder="Target instance ID (leave blank = self)"
        value={action.targetInstanceId ?? ""}
        onChange={(e) => onChange({ ...action, targetInstanceId: e.target.value || undefined })}
      />
    );
  }
  return null;
}

export function InteractionsPanel() {
  const instanceId = useStore($selectedInstanceId);
  const all = useStore($interactions);
  const defs: InteractionDef[] = instanceId ? (all[instanceId] ?? []) : [];

  const [newTrigger, setNewTrigger] = useState<InteractionTrigger>("click");
  const [newActionType, setNewActionType] = useState("navigate");

  if (!instanceId) {
    return (
      <div style={{ padding: 16, color: C.textMuted, fontSize: 13, fontFamily: C.font }}>
        Select an element to add interactions.
      </div>
    );
  }

  const update = (next: InteractionDef[]) => {
    const map = { ...$interactions.get(), [instanceId]: next };
    if (!next.length) delete map[instanceId];
    $interactions.set(map);
  };

  const addInteraction = () => {
    const def: InteractionDef = {
      id: nanoid(8),
      trigger: newTrigger,
      action: defaultAction(newActionType),
    };
    update([...defs, def]);
  };

  const removeInteraction = (id: string) => update(defs.filter((d) => d.id !== id));

  const updateDef = (id: string, patch: Partial<InteractionDef>) => {
    update(defs.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, fontFamily: C.font }}>
      <div style={{ fontSize: 12, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Interactions active in Preview mode
      </div>

      {defs.map((def) => (
        <div
          key={def.id}
          style={{
            padding: 10,
            borderRadius: 7,
            border: `1px solid ${C.border}`,
            background: "rgba(255,255,255,0.02)",
            display: "flex",
            flexDirection: "column",
            gap: 7,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <select
              style={{ ...selectStyle, width: "auto", flex: 1, marginRight: 6 }}
              value={def.trigger}
              onChange={(e) => updateDef(def.id, { trigger: e.target.value as InteractionTrigger })}
            >
              {TRIGGERS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <button
              onClick={() => removeInteraction(def.id)}
              style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "1px 4px" }}
            >
              ×
            </button>
          </div>
          <select
            style={selectStyle}
            value={def.action.type}
            onChange={(e) => updateDef(def.id, { action: defaultAction(e.target.value) })}
          >
            {ACTION_TYPES.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
          <ActionEditor
            action={def.action}
            onChange={(action) => updateDef(def.id, { action })}
          />
        </div>
      ))}

      <div style={{ display: "flex", gap: 6 }}>
        <select
          style={{ ...selectStyle, flex: 1 }}
          value={newTrigger}
          onChange={(e) => setNewTrigger(e.target.value as InteractionTrigger)}
        >
          {TRIGGERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select
          style={{ ...selectStyle, flex: 1 }}
          value={newActionType}
          onChange={(e) => setNewActionType(e.target.value)}
        >
          {ACTION_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
        <button
          onClick={addInteraction}
          style={{
            padding: "5px 10px",
            borderRadius: 5,
            border: `1px solid rgba(124,58,237,0.4)`,
            background: "rgba(124,58,237,0.15)",
            color: "#c4b5fd",
            fontSize: 13,
            fontFamily: C.font,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          + Add
        </button>
      </div>
    </div>
  );
}
