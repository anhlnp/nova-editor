"use client";
// M4 — Expression editor.
//
// A lightweight code editor for binding expressions. It edits a *human* form of
// the expression (variable names as the user typed them) and encodes to the SDK
// `$ws$dataSource$<id>` form on commit. A CodeMirror stack is deliberately avoided
// to keep the OpenNext/Workers bundle small (CLAUDE.md build:cf trap); the SDK's
// lintExpression provides the same diagnostics a CodeMirror linter would.
//
// I (Interface Segregation): props are exactly what an editor needs — the current
// human expression, the variables in scope, and an onCommit callback.

import { useMemo, useRef, useState } from "react";
import { lintExpression, type DataSource } from "@webstudio-is/sdk";
import { UI_VARS as C, FONT } from "@/lib/uiTheme";

type ScopeVariable = Pick<DataSource, "id" | "name">;

export function ExpressionEditor({
  value,
  variables,
  onCommit,
  placeholder,
}: {
  value: string;
  variables: ScopeVariable[];
  onCommit: (humanExpression: string) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [caret, setCaret] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const availableNames = useMemo(
    () => new Set(variables.map((v) => v.name)),
    [variables]
  );

  const diagnostics = useMemo(
    () =>
      draft.trim().length === 0
        ? []
        : lintExpression({ expression: draft, availableVariables: availableNames }),
    [draft, availableNames]
  );
  const firstError = diagnostics.find((d) => d.severity === "error");
  const firstWarning = diagnostics.find((d) => d.severity === "warning");

  // Token the caret currently sits in — drives autocomplete filtering.
  const currentToken = useMemo(() => {
    const before = draft.slice(0, caret);
    const match = before.match(/[A-Za-z_$][\w$]*$/);
    return match ? match[0] : "";
  }, [draft, caret]);

  const suggestions = useMemo(() => {
    if (!menuOpen) return [];
    const q = currentToken.toLowerCase();
    return variables.filter((v) => v.name.toLowerCase().includes(q)).slice(0, 6);
  }, [menuOpen, currentToken, variables]);

  const insertVariable = (name: string) => {
    const before = draft.slice(0, caret).replace(/[A-Za-z_$][\w$]*$/, "");
    const after = draft.slice(caret);
    const next = `${before}${name}${after}`;
    setDraft(next);
    setMenuOpen(false);
    const nextCaret = before.length + name.length;
    requestAnimationFrame(() => {
      taRef.current?.focus();
      taRef.current?.setSelectionRange(nextCaret, nextCaret);
      setCaret(nextCaret);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative" }}>
      <textarea
        ref={taRef}
        value={draft}
        rows={2}
        spellCheck={false}
        placeholder={placeholder ?? "e.g. myVar"}
        onChange={(e) => {
          setDraft(e.target.value);
          setCaret(e.target.selectionStart);
          setMenuOpen(true);
        }}
        onKeyUp={(e) => setCaret((e.target as HTMLTextAreaElement).selectionStart)}
        onClick={(e) => setCaret((e.target as HTMLTextAreaElement).selectionStart)}
        onBlur={() => {
          // delay so a suggestion click can register first
          setTimeout(() => setMenuOpen(false), 120);
          onCommit(draft);
        }}
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: C.input,
          border: `1px solid ${firstError ? C.danger : C.inputBorder}`,
          borderRadius: 5,
          color: C.text,
          fontFamily: C.fontMono,
          fontSize: FONT.sm,
          padding: "6px 8px",
          outline: "none",
          resize: "vertical",
          lineHeight: 1.5,
        }}
      />

      {menuOpen && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 52,
            left: 0,
            right: 0,
            zIndex: 30,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            overflow: "hidden",
          }}
        >
          {suggestions.map((v) => (
            <button
              key={v.id}
              // onMouseDown fires before textarea blur, so the insert lands
              onMouseDown={(e) => {
                e.preventDefault();
                insertVariable(v.name);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "6px 10px",
                background: "none",
                border: "none",
                color: C.text,
                fontFamily: C.fontMono,
                fontSize: FONT.sm,
                cursor: "pointer",
              }}
            >
              {v.name}
            </button>
          ))}
        </div>
      )}

      {firstError ? (
        <div style={{ fontSize: FONT.xs, color: C.danger, fontFamily: C.font }}>{firstError.message}</div>
      ) : firstWarning ? (
        <div style={{ fontSize: FONT.xs, color: C.warning, fontFamily: C.font }}>{firstWarning.message}</div>
      ) : null}
    </div>
  );
}
