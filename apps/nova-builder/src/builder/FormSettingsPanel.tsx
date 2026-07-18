"use client";
import { useStore } from "@nanostores/react";
import { nanoid } from "nanoid";
import { $instances, $props } from "@/lib/data-stores";
import { $selectedInstanceId } from "@/lib/nano-states";
import { updateData } from "@/lib/transactions";
import { UI_VARS as C } from "@/lib/uiTheme";

export const FORM_COMPONENTS = new Set([
  "Form", "WebhookForm",
  "Input", "Textarea", "Select",
  "Label", "Checkbox", "Button",
]);


type AnyProp = { id: string; instanceId: string; name: string; type: string; value: unknown };

const inputSt: React.CSSProperties = {
  background: C.input,
  border: `1px solid ${C.inputBorder}`,
  borderRadius: 4,
  color: C.text,
  fontSize: 13,
  fontFamily: C.mono,
  padding: "4px 8px",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
};

const selectSt: React.CSSProperties = {
  ...inputSt,
  fontFamily: C.font,
  cursor: "pointer",
};

// ── Field configs per component ───────────────────────────────────────────────

type FieldDef = {
  name: string;
  label: string;
  control: "text" | "select" | "boolean" | "number";
  options?: string[];
  placeholder?: string;
};

const FIELDS: Record<string, FieldDef[]> = {
  Form: [
    { name: "action", label: "Action URL", control: "text", placeholder: "https://..." },
    { name: "method", label: "Method", control: "select", options: ["get", "post"] },
    { name: "id", label: "ID", control: "text", placeholder: "form-id" },
  ],
  WebhookForm: [
    { name: "action", label: "Webhook URL", control: "text", placeholder: "https://..." },
    { name: "state", label: "State", control: "select", options: ["", "success", "error"] },
    { name: "id", label: "ID", control: "text", placeholder: "form-id" },
  ],
  Input: [
    { name: "type", label: "Type", control: "select", options: ["text","email","password","number","tel","url","search","date","time","checkbox","radio","file","hidden"] },
    { name: "name", label: "Name", control: "text", placeholder: "field-name" },
    { name: "placeholder", label: "Placeholder", control: "text", placeholder: "Enter value…" },
    { name: "value", label: "Default value", control: "text" },
    { name: "required", label: "Required", control: "boolean" },
    { name: "autofocus", label: "Autofocus", control: "boolean" },
    { name: "min", label: "Min", control: "text", placeholder: "0" },
    { name: "max", label: "Max", control: "text", placeholder: "100" },
    { name: "pattern", label: "Pattern (regex)", control: "text", placeholder: "[A-Za-z]+" },
    { name: "id", label: "ID", control: "text" },
  ],
  Textarea: [
    { name: "name", label: "Name", control: "text", placeholder: "field-name" },
    { name: "placeholder", label: "Placeholder", control: "text" },
    { name: "rows", label: "Rows", control: "number" },
    { name: "required", label: "Required", control: "boolean" },
    { name: "id", label: "ID", control: "text" },
  ],
  Select: [
    { name: "name", label: "Name", control: "text", placeholder: "field-name" },
    { name: "required", label: "Required", control: "boolean" },
    { name: "multiple", label: "Multiple", control: "boolean" },
    { name: "id", label: "ID", control: "text" },
  ],
  Label: [
    { name: "htmlFor", label: "For (field ID)", control: "text", placeholder: "input-id" },
  ],
  Checkbox: [
    { name: "name", label: "Name", control: "text", placeholder: "field-name" },
    { name: "value", label: "Value", control: "text", placeholder: "on" },
    { name: "checked", label: "Checked", control: "boolean" },
    { name: "required", label: "Required", control: "boolean" },
    { name: "id", label: "ID", control: "text" },
  ],
  Button: [
    { name: "type", label: "Type", control: "select", options: ["submit","button","reset"] },
    { name: "disabled", label: "Disabled", control: "boolean" },
    { name: "id", label: "ID", control: "text" },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPropMap(props: Map<string, AnyProp>, instanceId: string): Map<string, AnyProp> {
  const m = new Map<string, AnyProp>();
  for (const p of props.values()) {
    if (p.instanceId === instanceId) m.set(p.name, p);
  }
  return m;
}

function writeProp(instanceId: string, name: string, rawValue: string, type: string) {
  let value: unknown = rawValue;
  if (type === "number") value = rawValue === "" ? undefined : Number(rawValue);
  if (type === "boolean") value = rawValue === "true";
  updateData(({ props: draft }) => {
    const current = draft as Map<string, AnyProp>;
    const existing = [...current.values()].find((p) => p.instanceId === instanceId && p.name === name);
    if (existing) {
      current.set(existing.id, { ...existing, value });
    } else {
      const id = `prop_${nanoid(8)}`;
      current.set(id, { id, instanceId, name, type, value });
    }
  });
}

// ── Section ───────────────────────────────────────────────────────────────────

function FieldRow({ field, instanceId, propMap }: { field: FieldDef; instanceId: string; propMap: Map<string, AnyProp> }) {
  const existing = propMap.get(field.name);
  const rawVal = existing ? String(existing.value ?? "") : "";

  return (
    <div style={{ padding: "4px 12px", display: "flex", flexDirection: "column", gap: 3 }}>
      <label style={{ fontSize: 12, color: C.textMuted, fontFamily: C.font, fontWeight: 600, letterSpacing: "0.04em" }}>
        {field.label}
      </label>
      {field.control === "boolean" ? (
        <select
          value={rawVal || "false"}
          onChange={(e) => writeProp(instanceId, field.name, e.target.value, "boolean")}
          style={selectSt}
        >
          <option value="false">false</option>
          <option value="true">true</option>
        </select>
      ) : field.control === "select" ? (
        <select
          value={rawVal}
          onChange={(e) => writeProp(instanceId, field.name, e.target.value, "string")}
          style={selectSt}
        >
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>{opt || "(default)"}</option>
          ))}
        </select>
      ) : (
        <input
          type={field.control === "number" ? "number" : "text"}
          placeholder={field.placeholder}
          value={rawVal}
          onChange={(e) => writeProp(instanceId, field.name, e.target.value, field.control === "number" ? "number" : "string")}
          style={inputSt}
        />
      )}
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export function FormSettingsPanel() {
  const instanceId = useStore($selectedInstanceId);
  const instances = useStore($instances);
  const props = useStore($props) as Map<string, AnyProp>;

  if (!instanceId) {
    return (
      <div style={{ padding: 16, fontSize: 13, color: C.textMuted, fontFamily: C.font }}>
        Select a form element to edit its settings.
      </div>
    );
  }

  const instance = instances.get(instanceId);
  if (!instance) return null;

  const fields = FIELDS[instance.component] ?? [];
  const propMap = getPropMap(props, instanceId);

  return (
    <div style={{ height: "100%", background: C.bg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "8px 12px 6px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: C.text, fontFamily: C.font, fontWeight: 600 }}>
          {(instance as { label?: string }).label || instance.component}
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, fontFamily: C.mono, marginTop: 2 }}>
          {instance.component}
        </div>
      </div>

      {/* Fields */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
        {fields.length === 0 ? (
          <div style={{ padding: "8px 12px", fontSize: 13, color: C.textMuted, fontFamily: C.font }}>
            No form settings for this component.
          </div>
        ) : (
          fields.map((f) => (
            <FieldRow key={f.name} field={f} instanceId={instanceId} propMap={propMap} />
          ))
        )}
      </div>
    </div>
  );
}
