"use client";
import { useStore } from "@nanostores/react";
import { $selectedInstanceId } from "@/lib/nano-states";
import { $styles, $styleSourceSelections, $breakpoints } from "@/lib/data-stores";
import { $selectedBreakpoint } from "@/lib/nano-states";
import { getDeclsForInstance } from "@/lib/styleInspectorWrite";
import { styleValueToString } from "@/lib/styleValueConversion";
import type { AnyStyleDecl } from "@/lib/styleValueConversion";
import { UI_VARS as C, FONT } from "@/lib/uiTheme";

// CSS Preview Navigator — shows the final computed CSS for the selected instance
// as a read-only code block. Useful for understanding cascade resolution without
// opening DevTools. Values reflect the active breakpoint + state.
export function CssPreviewPanel() {
  const instanceId = useStore($selectedInstanceId);
  const styles = useStore($styles);
  const selections = useStore($styleSourceSelections);
  const breakpoint = useStore($selectedBreakpoint);
  const allBreakpoints = useStore($breakpoints);

  if (!instanceId) {
    return (
      <div style={{ padding: 16, fontSize: 13, color: C.textMuted, fontFamily: C.font }}>
        Select an element to preview its CSS.
      </div>
    );
  }

  const bpId = breakpoint?.id;
  const baseBpId = [...allBreakpoints.values()].find((bp) => !bp.minWidth && !bp.maxWidth)?.id;

  const typedStyles = styles as Map<string, AnyStyleDecl>;
  const typedSelections = selections as Map<string, { instanceId: string; values: string[] }>;
  const decls = getDeclsForInstance(instanceId, typedStyles, typedSelections, bpId, baseBpId, "");

  const cssLines = [...decls.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([prop, decl]) => {
      // Convert camelCase prop to kebab-case for display
      const kebab = prop.replace(/([A-Z])/g, (c) => `-${c.toLowerCase()}`);
      return `  ${kebab}: ${styleValueToString(decl.value)};`;
    });

  const selectorLabel = `.instance-${instanceId.slice(0, 8)}`;
  const code = cssLines.length > 0
    ? `${selectorLabel} {\n${cssLines.join("\n")}\n}`
    : `/* No styles at this breakpoint */`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: FONT.xs, color: C.textMuted, fontFamily: C.font, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>
          CSS Preview
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          title="Copy CSS"
          style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 4, color: C.textMuted, fontSize: 11, fontFamily: C.font, cursor: "pointer", padding: "2px 7px" }}
        >
          Copy
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "10px 12px",
          flex: 1,
          overflow: "auto",
          fontSize: 12,
          fontFamily: C.fontMono,
          color: C.text,
          background: C.surface,
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        <span style={{ color: C.accentText }}>{selectorLabel}</span>
        {cssLines.length > 0 ? (
          <>
            {" {\n"}
            {cssLines.map((line, i) => {
              const colon = line.indexOf(":");
              const prop = line.slice(0, colon);
              const val = line.slice(colon + 1);
              return (
                <span key={i}>
                  <span style={{ color: C.codeKey }}>{prop}</span>
                  <span style={{ color: C.textMuted }}>:</span>
                  <span style={{ color: C.codeVal }}>{val}</span>
                  {"\n"}
                </span>
              );
            })}
            {"}"}
          </>
        ) : (
          <span style={{ color: C.textMuted }}>{" {\n  /* No styles at this breakpoint */\n}"}</span>
        )}
      </pre>
    </div>
  );
}
