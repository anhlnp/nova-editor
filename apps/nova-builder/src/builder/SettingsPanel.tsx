"use client";
import { useStore } from "@nanostores/react";
import { $instances, $props, $styles, $styleSourceSelections, $breakpoints } from "@/lib/data-stores";
import { $selectedInstanceId, $selectedBreakpoint } from "@/lib/nano-states";
import { updateData } from "@/lib/transactions";
import { ensureLocalSource } from "@/lib/style-object-model";
import { UI_VARS as C } from "@/lib/uiTheme";

type AnyProp = {
  id: string;
  instanceId: string;
  name: string;
  type: string;
  value: unknown;
};

// Props to hide from the generic list
const HIDDEN_PROPS = new Set(["_legacyClasses"]);

// Display order for common props
const PROP_ORDER = ["src", "alt", "width", "height", "loading", "decoding"];

// Human-readable labels
const PROP_LABELS: Record<string, string> = {
  src: "Source URL",
  alt: "Alt text",
  width: "Width",
  height: "Height",
  loading: "Loading",
  decoding: "Decoding",
  href: "Link URL",
  target: "Open in",
  placeholder: "Placeholder",
};

// Enum options for specific prop names (non-objectFit)
const ENUM_OPTIONS: Record<string, { label: string; value: string }[]> = {
  target: [
    { label: "Same tab (_self)", value: "_self" },
    { label: "New tab (_blank)", value: "_blank" },
  ],
  loading: [
    { label: "Lazy (default)", value: "lazy" },
    { label: "Eager (preload)", value: "eager" },
  ],
  decoding: [
    { label: "Auto", value: "auto" },
    { label: "Async", value: "async" },
    { label: "Sync", value: "sync" },
  ],
};

const OBJECT_FIT_VALUES = ["cover", "contain", "fill", "none", "scale-down"] as const;

const selectStyle: React.CSSProperties = {
  background: C.input,
  border: `1px solid ${C.inputBorder}`,
  borderRadius: 6,
  color: C.text,
  fontSize: 13,
  fontFamily: C.font,
  padding: "5px 8px",
  width: "100%",
  cursor: "pointer",
  outline: "none",
};

const inputStyle: React.CSSProperties = {
  background: C.input,
  border: `1px solid ${C.inputBorder}`,
  borderRadius: 6,
  color: C.text,
  fontSize: 13,
  fontFamily: C.fontMono,
  padding: "5px 8px",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: C.textMuted,
  fontFamily: C.font,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
};

// ── ObjectFit control (reads/writes CSS styles, not props) ──────────────────
function ObjectFitControl({ instanceId }: { instanceId: string }) {
  const styles = useStore($styles) as Map<string, { property: string; value: { value: string }; styleSourceId: string; breakpointId: string }>;
  const styleSourceSelections = useStore($styleSourceSelections) as Map<string, { instanceId: string; values: string[] }>;
  const breakpoints = useStore($breakpoints) as Map<string, { id: string; minWidth?: number }>;
  const selectedBp = useStore($selectedBreakpoint);

  // Find current objectFit value in the CSS cascade
  const sel = styleSourceSelections.get(instanceId);
  const sourceIds = sel?.values ?? [];
  let currentFit = "cover"; // default
  for (const srcId of sourceIds) {
    for (const [, decl] of styles) {
      if (decl.styleSourceId === srcId && decl.property === "objectFit") {
        currentFit = decl.value.value;
      }
    }
  }

  function setObjectFit(val: string) {
    // Find base breakpoint
    const bps = [...breakpoints.values()];
    const baseBp = bps.sort((a, b) => (a.minWidth ?? 0) - (b.minWidth ?? 0))[0];
    const bpId = selectedBp?.id ?? baseBp?.id;
    if (!bpId) return;

    updateData(({ styles: draftStyles, styleSources, styleSourceSelections: draftSels }) => {
      const sources = styleSources as Map<string, { id: string; type: string }>;
      const selections = draftSels as Map<string, { instanceId: string; values: string[] }>;
      const sourceId = ensureLocalSource(instanceId, sources, selections);
      const declKey = `${sourceId}:${bpId}:objectFit:`;
      (draftStyles as Map<string, unknown>).set(declKey, {
        styleSourceId: sourceId,
        breakpointId: bpId,
        property: "objectFit",
        value: { type: "keyword", value: val },
      });
    });
  }

  return (
    <div style={{ padding: "6px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={labelStyle}>Object Fit</label>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {OBJECT_FIT_VALUES.map((val) => {
          const active = currentFit === val;
          return (
            <button
              key={val}
              onClick={() => setObjectFit(val)}
              title={val}
              style={{
                padding: "3px 9px",
                borderRadius: 5,
                border: `1.5px solid ${active ? C.accent : C.border}`,
                background: active ? "rgba(124,58,237,0.13)" : C.input,
                color: active ? C.accent : C.textMuted,
                fontSize: 11,
                fontWeight: active ? 700 : 400,
                cursor: "pointer",
                fontFamily: C.fontMono,
                transition: "all 0.12s",
              }}
            >
              {val}
            </button>
          );
        })}
      </div>
    </div>
  );
}

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

  const component = instance.component as string;
  const isImage = component === "Image";

  const instanceProps: AnyProp[] = [];
  for (const prop of (props as Map<string, AnyProp>).values()) {
    if (prop.instanceId !== instanceId) continue;
    if (HIDDEN_PROPS.has(prop.name)) continue;
    instanceProps.push(prop);
  }

  // Sort by defined order first, then alphabetically
  instanceProps.sort((a, b) => {
    const ai = PROP_ORDER.indexOf(a.name);
    const bi = PROP_ORDER.indexOf(b.name);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

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
    <div style={{ height: "100%", background: C.bg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "10px 14px 8px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 13, color: C.text, fontFamily: C.font, fontWeight: 700 }}>
          {(instance as { label?: string }).label || component}
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, fontFamily: C.fontMono, marginTop: 2 }}>
          &lt;{component}&gt;
        </div>
      </div>

      {/* Props list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 0 16px" }}>
        {/* Image-specific: objectFit CSS control */}
        {isImage && <ObjectFitControl instanceId={instanceId} />}

        {instanceProps.length === 0 && !isImage ? (
          <div style={{ padding: "8px 14px", fontSize: 13, color: C.textMuted, fontFamily: C.font }}>
            No editable props.
          </div>
        ) : (
          instanceProps.map((p) => {
            const label = PROP_LABELS[p.name] ?? p.name;
            const enumOpts = ENUM_OPTIONS[p.name];
            const isEnum = enumOpts !== undefined;
            const isBool = p.type === "boolean";
            const currentVal =
              typeof p.value === "string" || typeof p.value === "number"
                ? String(p.value)
                : JSON.stringify(p.value);

            return (
              <div
                key={p.id}
                style={{ padding: "6px 14px", display: "flex", flexDirection: "column", gap: 4 }}
              >
                <label style={labelStyle}>{label}</label>

                {isEnum || isBool ? (
                  <select
                    value={currentVal}
                    onChange={(e) => handleChange(p.id, e.target.value, p.type)}
                    style={selectStyle}
                  >
                    {isBool ? (
                      <>
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </>
                    ) : (
                      (enumOpts ?? []).map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))
                    )}
                  </select>
                ) : (
                  <input
                    type={p.type === "number" ? "number" : "text"}
                    value={currentVal}
                    onChange={(e) => handleChange(p.id, e.target.value, p.type)}
                    style={inputStyle}
                    spellCheck={false}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
