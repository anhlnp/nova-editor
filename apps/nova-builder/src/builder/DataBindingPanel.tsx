"use client";
import { useState } from "react";
import { useStore } from "@nanostores/react";
import { $dataSources, $resources, $props, $projectMeta } from "@/lib/data-stores";
import {
  createVariable, updateVariableValue, deleteVariable,
  createResource, deleteResource, countVariableUsage,
  type VariableType, type HttpMethod,
} from "@/lib/dataBinding";
import { loadProjectResources } from "@/lib/resourceLoader";
import { $resourceValues } from "@/lib/nano-states";
import { UI_VARS as C } from "@/lib/uiTheme";
import { useI18n } from "@/lib/i18n";


const inputStyle: React.CSSProperties = {
  padding: "5px 8px", background: "rgba(255,255,255,0.05)",
  border: `1px solid ${C.border}`, borderRadius: 5, color: C.text,
  fontSize: 13, fontFamily: C.font, outline: "none", boxSizing: "border-box",
};

function varValueToString(v: { type: string; value: unknown }): string {
  if (v.type === "json") return JSON.stringify(v.value);
  return String(v.value);
}

export function DataBindingPanel() {
  const { t } = useI18n();
  const dataSources = useStore($dataSources);
  const resources = useStore($resources);
  const props = useStore($props);
  const resourceValues = useStore($resourceValues);
  const projectMeta = useStore($projectMeta);
  const projectId = projectMeta?.id;
  const [loading] = useState(false);

  const [varName, setVarName] = useState("");
  const [varType, setVarType] = useState<VariableType>("string");
  const [resName, setResName] = useState("");
  const [resUrl, setResUrl] = useState("");
  const [resMethod, setResMethod] = useState<HttpMethod>("get");

  const variables = [...dataSources.values()].filter((d) => d.type === "variable");

  return (
    <div style={{ padding: 12, fontFamily: C.font, color: C.text, overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      {/* Variables */}
      <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, letterSpacing: "0.04em", marginBottom: 10 }}>{t.builder.dbVariables}</div>

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <input value={varName} onChange={(e) => setVarName(e.target.value)} placeholder={t.builder.dbNamePlaceholder} style={{ ...inputStyle, flex: 1 }} />
        <select value={varType} onChange={(e) => setVarType(e.target.value as VariableType)} style={{ ...inputStyle, width: 78 }}>
          <option value="string">string</option>
          <option value="number">number</option>
          <option value="boolean">boolean</option>
          <option value="json">json</option>
        </select>
        <button onClick={() => { if (varName.trim()) { createVariable(varName, varType); setVarName(""); } }}
          style={{ padding: "5px 10px", borderRadius: 5, border: "none", background: "rgba(124,58,237,0.8)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>+</button>
      </div>

      {variables.length === 0 ? (
        <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>{t.builder.dbNoVariables}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          {variables.map((v) => v.type === "variable" && (
            <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: 6 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: C.mono, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</div>
                <div style={{ fontSize: 9, color: C.textMuted }}>
                  {v.value.type}
                  {(() => { const n = countVariableUsage(v.id, props); return n > 0 ? ` · ${n} ${t.builder.bindUsageCount}` : ""; })()}
                </div>
              </div>
              <input
                defaultValue={varValueToString(v.value)}
                onBlur={(e) => updateVariableValue(v.id, e.target.value)}
                style={{ ...inputStyle, width: 90, fontFamily: C.mono, fontSize: 12 }}
              />
              <button onClick={() => deleteVariable(v.id)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13 }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Resources */}
      <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, letterSpacing: "0.04em", marginBottom: 10, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>{t.builder.dbResources}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
        <input value={resName} onChange={(e) => setResName(e.target.value)} placeholder={t.builder.dbResourceNamePlaceholder} style={inputStyle} />
        <div style={{ display: "flex", gap: 6 }}>
          <select value={resMethod} onChange={(e) => setResMethod(e.target.value as HttpMethod)} style={{ ...inputStyle, width: 72 }}>
            <option value="get">GET</option>
            <option value="post">POST</option>
            <option value="put">PUT</option>
            <option value="delete">DELETE</option>
          </select>
          <input value={resUrl} onChange={(e) => setResUrl(e.target.value)} placeholder="https://api.example.com/data" style={{ ...inputStyle, flex: 1, fontFamily: C.mono }} />
        </div>
        <button onClick={() => { if (resName.trim() && resUrl.trim()) { createResource(resName, resUrl, resMethod); setResName(""); setResUrl(""); } }}
          style={{ padding: "6px 0", borderRadius: 5, border: "none", background: "rgba(124,58,237,0.8)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{t.builder.dbAddResource}</button>
      </div>

      {resources.size === 0 ? (
        <div style={{ fontSize: 13, color: C.textMuted }}>{t.builder.dbNoResources}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[...resources.values()].map((r) => {
            const dsId = [...dataSources.values()].find(
              (d) => d.type === "resource" && d.resourceId === r.id
            )?.id;
            const loaded = dsId ? resourceValues.has(dsId) : false;
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: 6 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                    {r.name}
                    {loaded && <span style={{ color: C.success, marginLeft: 6, fontSize: 11 }}>●</span>}
                  </div>
                  <div style={{ fontSize: 9, color: C.textMuted, fontFamily: C.mono, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <span style={{ color: C.accent, textTransform: "uppercase" }}>{r.method}</span> {r.url}
                  </div>
                </div>
                <button
                  onClick={() => { if (projectId) loadProjectResources(projectId, dataSources, resources); }}
                  disabled={!projectId || loading}
                  title={t.builder.resourceLoad}
                  style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.textMuted, cursor: projectId ? "pointer" : "default", fontSize: 11, padding: "3px 7px" }}
                >
                  {loading ? "…" : t.builder.resourceLoad}
                </button>
                <button onClick={() => deleteResource(r.id)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13 }}>×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
