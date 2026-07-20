"use client";
// Floating bold/italic/underline toolbar shown while a canvas text element is
// in double-click edit mode. Commands are posted into the canvas iframe.

import type { RefObject } from "react";
import { useI18n } from "@/lib/i18n";

export function TextFormatToolbar({ iframeRef }: { iframeRef: RefObject<HTMLIFrameElement | null> }) {
  const { t } = useI18n();

  return (
    <div
      data-text-format-toolbar="true"
      style={{
        position: "absolute",
        top: 8,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        gap: 2,
        background: "#0f172a",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 6,
        padding: "3px 4px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        fontFamily: "system-ui,sans-serif",
      }}
    >
      {[
        { label: "B", title: "Bold (Ctrl+B)", cmd: "bold", style: { fontWeight: 700 } },
        { label: "I", title: "Italic (Ctrl+I)", cmd: "italic", style: { fontStyle: "italic" } },
        { label: "U̲", title: "Underline (Ctrl+U)", cmd: "underline", style: {} },
        { label: "🔗", title: "Link (Ctrl+K)", cmd: "link", style: {} },
      ].map(({ label, title, cmd, style }) => (
        <button
          key={cmd}
          title={title}
          onMouseDown={(e) => {
            e.preventDefault(); // prevent blur in canvas
            if (cmd === "link") {
              const url = window.prompt("Enter link URL:", "https://");
              if (!url) return;
              iframeRef.current?.contentWindow?.postMessage(
                { type: "nova:formatText", command: "link", url },
                window.location.origin
              );
              return;
            }
            iframeRef.current?.contentWindow?.postMessage(
              { type: "nova:formatText", command: cmd },
              window.location.origin
            );
          }}
          style={{
            background: "none",
            border: "1px solid transparent",
            borderRadius: 4,
            color: "#c4b5fd",
            cursor: "pointer",
            fontSize: 12,
            padding: "2px 8px",
            lineHeight: "18px",
            ...style,
          }}
        >
          {label}
        </button>
      ))}
      <div style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "3px 2px" }} />
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", padding: "2px 4px", lineHeight: "18px" }}>
        {t.builder.formatCommitHint}
      </span>
    </div>
  );
}
