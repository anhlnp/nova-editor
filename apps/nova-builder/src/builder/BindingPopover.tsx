"use client";
// M4 — Binding popover.
//
// Anchored next to a prop control. Lets the user bind the prop to a variable
// (quick pick), edit a full expression (advanced), or remove the binding. It
// talks only to lib/dataBinding transactions + lib/expression helpers (DIP) —
// never to atoms or the API directly.

import { useState } from "react";
import { useStore } from "@nanostores/react";
import { $dataSources } from "@/lib/data-stores";
import { bindPropToVariable, bindPropExpression, unbindProp } from "@/lib/dataBinding";
import { decodeExpression, encodeExpression } from "@/lib/expression";
import { ExpressionEditor } from "./ExpressionEditor";
import { UI_VARS as C, FONT } from "@/lib/uiTheme";
import { useI18n } from "@/lib/i18n";

export function BindingPopover({
  instanceId,
  propName,
  boundExpression,
  onClose,
}: {
  instanceId: string;
  propName: string;
  boundExpression: string | undefined;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const dataSources = useStore($dataSources);
  const variables = [...dataSources.values()].filter((d) => d.type === "variable");
  const [advanced, setAdvanced] = useState(Boolean(boundExpression));

  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        right: 0,
        marginTop: 4,
        zIndex: 40,
        width: 240,
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: FONT.sm, fontWeight: 700, color: C.text, fontFamily: C.font }}>
          {t.builder.bindProp}
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: C.textMuted, fontSize: 16, cursor: "pointer", lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      {variables.length === 0 ? (
        <div style={{ fontSize: FONT.sm, color: C.textMuted, fontFamily: C.font }}>
          {t.builder.bindNoVariables}
        </div>
      ) : advanced ? (
        <ExpressionEditor
          value={boundExpression ? decodeExpression(boundExpression, dataSources) : ""}
          variables={variables}
          placeholder={t.builder.bindExpressionPlaceholder}
          onCommit={(human) => {
            const encoded = encodeExpression(human, dataSources);
            if (encoded.trim().length === 0) unbindProp(instanceId, propName);
            else bindPropExpression(instanceId, propName, encoded);
          }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 180, overflowY: "auto" }}>
          {variables.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                bindPropToVariable(instanceId, propName, v.id);
                onClose();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 8px",
                borderRadius: 5,
                border: `1px solid ${C.border}`,
                background: "transparent",
                color: C.text,
                fontFamily: C.fontMono,
                fontSize: FONT.sm,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span>{v.name}</span>
              <span style={{ fontSize: FONT.xs, color: C.textMuted }}>
                {v.type === "variable" ? v.value.type : ""}
              </span>
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "space-between", borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
        <button
          onClick={() => setAdvanced((v) => !v)}
          style={{ background: "none", border: "none", color: C.accentLight, fontSize: FONT.xs, fontFamily: C.font, cursor: "pointer", padding: 0 }}
        >
          {advanced ? t.builder.bindPickVariable : t.builder.bindAdvanced}
        </button>
        {boundExpression && (
          <button
            onClick={() => {
              unbindProp(instanceId, propName);
              onClose();
            }}
            style={{ background: "none", border: "none", color: C.danger, fontSize: FONT.xs, fontFamily: C.font, cursor: "pointer", padding: 0 }}
          >
            {t.builder.bindRemove}
          </button>
        )}
      </div>
    </div>
  );
}
