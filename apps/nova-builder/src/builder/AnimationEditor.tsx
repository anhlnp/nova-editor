"use client";
import { useMemo } from "react";
import { writeStyleProperty } from "@/lib/styleWriteHelper";
import { UI_VARS as C } from "@/lib/uiTheme";
import {
  AnimationLayer,
  parseAnimationCss,
  serializeAnimationLayers,
  MsInput,
  FieldLabel,
  SelectField,
  DeleteBtn,
  PanelHeader,
  baseInput,
  EASING_OPTIONS,
  ANIMATION_NAMES,
  DIRECTION_KW,
  FILL_KW,
} from "./TransitionEditor";

// ── AnimationLayerRow ─────────────────────────────────────────────────────────

function AnimationLayerRow({ layer, onChange, onDelete }: {
  layer: AnimationLayer;
  onChange: (l: AnimationLayer) => void;
  onDelete: () => void;
}) {
  const upd = (patch: Partial<AnimationLayer>) => onChange({ ...layer, ...patch });
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 5, padding: "5px 7px", display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel text="Name" />
          <input
            list="nova-animation-names"
            defaultValue={layer.name}
            onBlur={(e) => upd({ name: e.target.value.trim() || "none" })}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
            style={{ ...baseInput, width: "100%" }}
          />
          <datalist id="nova-animation-names">
            {ANIMATION_NAMES.map((n) => <option key={n} value={n} />)}
          </datalist>
        </div>
        <div style={{ paddingTop: 14 }}>
          <DeleteBtn onClick={onDelete} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <FieldLabel text="Duration" />
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <MsInput value={layer.duration} onChange={(n) => upd({ duration: n })} />
            <span style={{ fontSize: 9, color: C.textMuted, fontFamily: C.fontMono }}>ms</span>
          </div>
        </div>
        <div>
          <FieldLabel text="Delay" />
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <MsInput value={layer.delay} onChange={(n) => upd({ delay: n })} />
            <span style={{ fontSize: 9, color: C.textMuted, fontFamily: C.fontMono }}>ms</span>
          </div>
        </div>
        <div>
          <FieldLabel text="Repeat" />
          <input
            list="nova-iterations"
            defaultValue={layer.iterations}
            onBlur={(e) => upd({ iterations: e.target.value.trim() || "1" })}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
            style={{ ...baseInput, width: 52 }}
          />
          <datalist id="nova-iterations">
            <option value="1" /><option value="2" /><option value="3" /><option value="infinite" />
          </datalist>
        </div>
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <FieldLabel text="Easing" />
          <SelectField value={layer.easing} options={EASING_OPTIONS} onChange={(v) => upd({ easing: v })} width={92} />
        </div>
        <div>
          <FieldLabel text="Direction" />
          <SelectField
            value={layer.direction}
            options={[...DIRECTION_KW]}
            onChange={(v) => upd({ direction: v })}
            width={82}
          />
        </div>
        <div>
          <FieldLabel text="Fill" />
          <SelectField
            value={layer.fillMode}
            options={[...FILL_KW]}
            onChange={(v) => upd({ fillMode: v })}
            width={72}
          />
        </div>
      </div>
    </div>
  );
}

// ── AnimationPanel ────────────────────────────────────────────────────────────

type PanelProps = { instanceId: string; currentCss: string };

export function AnimationPanel({ instanceId, currentCss }: PanelProps) {
  const layers = useMemo(() => parseAnimationCss(currentCss), [currentCss]);

  const commit = (next: AnimationLayer[]) =>
    writeStyleProperty(instanceId, "animation", serializeAnimationLayers(next));

  const addLayer = () =>
    commit([...layers, { name: "fadeIn", duration: 500, easing: "ease", delay: 0, iterations: "1", direction: "normal", fillMode: "forwards" }]);
  const updateLayer = (i: number, l: AnimationLayer) => { const n = [...layers]; n[i] = l; commit(n); };
  const deleteLayer = (i: number) => commit(layers.filter((_, idx) => idx !== i));

  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <PanelHeader label="Animation" count={layers.length} onAdd={addLayer} />
      {layers.length > 0 && (
        <div style={{ padding: "4px 8px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {layers.map((l, i) => (
            <AnimationLayerRow key={i} layer={l} onChange={(nl) => updateLayer(i, nl)} onDelete={() => deleteLayer(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
