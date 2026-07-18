"use client";
import { useStore } from "@nanostores/react";
import { $instances, $props } from "@/lib/data-stores";
import { $selectedInstanceId } from "@/lib/nano-states";
import { updateData } from "@/lib/transactions";
import { UI_VARS as C } from "@/lib/uiTheme";


type AnyProp = {
  id: string;
  instanceId: string;
  name: string;
  type: string;
  value: unknown;
};

export function SettingsPanel() {
  const instanceId = useStore($selectedInstanceId);
  const instances = useStore($instances);
  const props = useStore($props);

  if (!instanceId) {
    return (
      <div style={{ padding: 16, fontSize: 13, color: C.textMuted, fontFamily: C.font }}>
        Select an instance to edit its settings.
      </div>
    );
  }

  const instance = instances.get(instanceId);
  if (!instance) return null;

  const instanceProps: AnyProp[] = [];
  for (const prop of (props as Map<string, AnyProp>).values()) {
    if (prop.instanceId !== instanceId) continue;
    if (prop.name === "_legacyClasses") continue;
    instanceProps.push(prop);
  }
  instanceProps.sort((a, b) => a.name.localeCompare(b.name));

  function handleChange(propId: string, rawValue: string, type: string) {
    let value: unknown = rawValue;
    if (type === "number") value = Number(rawValue);
    if (type === "boolean") value = rawValue === "true";
    updateData(({ props: draft }) => {
      const existing = (draft as Map<string, AnyProp>).get(propId);
      if (!existing) return;
      (draft as Map<string, AnyProp>).set(propId, { ...existing, value });
    });
  }

  return (
    <div
      style={{
        height: "100%",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Instance header */}
      <div style={{ padding: "8px 12px 6px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: C.text, fontFamily: C.font, fontWeight: 600 }}>
          {(instance as { label?: string }).label || instance.component}
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, fontFamily: C.fontMono, marginTop: 2 }}>
          {instance.component}
        </div>
      </div>

      {/* Props list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {instanceProps.length === 0 ? (
          <div style={{ padding: "8px 12px", fontSize: 13, color: C.textMuted, fontFamily: C.font }}>
            No editable props.
          </div>
        ) : (
          instanceProps.map((p) => (
            <div key={p.id} style={{ padding: "4px 12px", display: "flex", flexDirection: "column", gap: 3 }}>
              <label
                style={{ fontSize: 12, color: C.textMuted, fontFamily: C.font, fontWeight: 600, letterSpacing: "0.04em" }}
              >
                {p.name}
              </label>
              {p.type === "boolean" ? (
                <select
                  value={String(p.value)}
                  onChange={(e) => handleChange(p.id, e.target.value, p.type)}
                  style={{
                    background: C.input,
                    border: `1px solid ${C.inputBorder}`,
                    borderRadius: 4,
                    color: C.text,
                    fontSize: 13,
                    fontFamily: C.font,
                    padding: "3px 6px",
                    width: "100%",
                  }}
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : (
                <input
                  type={p.type === "number" ? "number" : "text"}
                  value={
                    typeof p.value === "string" || typeof p.value === "number"
                      ? String(p.value)
                      : JSON.stringify(p.value)
                  }
                  onChange={(e) => handleChange(p.id, e.target.value, p.type)}
                  style={{
                    background: C.input,
                    border: `1px solid ${C.inputBorder}`,
                    borderRadius: 4,
                    color: C.text,
                    fontSize: 13,
                    fontFamily: C.fontMono,
                    padding: "3px 6px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
