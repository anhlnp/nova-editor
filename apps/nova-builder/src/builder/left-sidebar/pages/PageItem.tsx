"use client";
import { useState, useRef } from "react";
import type { PageSeo } from "./usePageCrud";
import { UI_VARS as C } from "@/lib/uiTheme";


const inputStyle: React.CSSProperties = {
  width: "100%",
  background: C.input,
  border: `1px solid ${C.inputBorder}`,
  borderRadius: 4,
  color: C.text,
  fontSize: 13,
  fontFamily: C.font,
  padding: "3px 6px",
  outline: "none",
  boxSizing: "border-box",
};

type PageData = {
  id: string;
  name: string;
  path: string;
  title?: string;
  description?: string;
  noindex?: boolean;
};

type PageStatus = {
  isActive: boolean;
  canDelete: boolean;
};

type PageHandlers = {
  onClick: () => void;
  onRename: (name: string, path: string) => void;
  onSeoChange: (seo: PageSeo) => void;
  onDelete: () => void;
};

type PageItemProps = {
  page: PageData;
  status: PageStatus;
  handlers: PageHandlers;
};

export function PageItem({ page, status, handlers }: PageItemProps) {
  const { name, path, title, description, noindex } = page;
  const { isActive, canDelete } = status;
  const { onClick, onRename, onSeoChange, onDelete } = handlers;

  const [isEditing, setIsEditing] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const pathRef = useRef<HTMLInputElement>(null);

  function commitEdit() {
    const newName = nameRef.current?.value.trim() || name;
    const newPath = pathRef.current?.value.trim() || path;
    setIsEditing(false);
    if (newName !== name || newPath !== path) onRename(newName, newPath);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div style={{ padding: "6px 10px", display: "flex", flexDirection: "column", gap: 4, background: "rgba(255,255,255,0.04)", borderLeft: `2px solid ${C.activeBorder}` }}>
        <input ref={nameRef} autoFocus defaultValue={name} placeholder="Page name" onKeyDown={handleKeyDown} onBlur={commitEdit}
          style={{ ...inputStyle, border: `1px solid rgba(139,92,246,0.4)` }} />
        <input ref={pathRef} defaultValue={path} placeholder="/path" onKeyDown={handleKeyDown} onBlur={commitEdit}
          style={{ ...inputStyle, fontFamily: C.fontMono, color: C.textMuted }} />
      </div>
    );
  }

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ position: "relative", display: "flex", alignItems: "stretch" }}>
        <button
          onClick={onClick}
          onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "7px 10px",
            background: isActive ? C.active : "none",
            borderLeft: isActive ? `2px solid ${C.activeBorder}` : "2px solid transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            gap: 2,
          }}
        >
          <span style={{ fontSize: 12, fontFamily: C.font, color: isActive ? C.accent : C.text, fontWeight: isActive ? 600 : 400 }}>
            {name}
          </span>
          <span style={{ fontSize: 12, fontFamily: C.fontMono, color: C.textMuted }}>{path}</span>
        </button>

        {isActive && (
          <button
            onClick={(e) => { e.stopPropagation(); setSeoOpen(o => !o); }}
            title="SEO settings"
            style={{ background: "none", border: "none", color: seoOpen ? C.accent : C.textMuted, cursor: "pointer", fontSize: 12, padding: "0 6px", flexShrink: 0 }}
          >
            {seoOpen ? "▲" : "▼"} SEO
          </button>
        )}

        {hovered && canDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Delete page"
            style={{ position: "absolute", right: isActive ? 52 : 6, top: "50%", transform: "translateY(-50%)", background: "rgba(30,41,59,0.95)", border: "none", color: C.danger, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: "2px 4px", borderRadius: 3 }}
          >
            ×
          </button>
        )}
      </div>

      {isActive && seoOpen && (
        <div style={{ padding: "8px 10px 10px", background: "rgba(15,23,42,0.6)", borderLeft: `2px solid ${C.activeBorder}`, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 12, color: C.textMuted, fontFamily: C.font, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
            SEO / Meta
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: C.font }}>Browser title</span>
            <input
              defaultValue={title ?? name}
              placeholder={name}
              onBlur={(e) => onSeoChange({ title: e.target.value.trim() || name })}
              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
              style={inputStyle}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: C.font }}>Meta description</span>
            <textarea
              defaultValue={description ?? ""}
              placeholder="Describe this page for search engines…"
              rows={2}
              onBlur={(e) => onSeoChange({ description: e.target.value.trim() })}
              style={{ ...inputStyle, resize: "vertical", fontFamily: C.font, lineHeight: "1.4" }}
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={!!noindex}
              onChange={(e) => onSeoChange({ noindex: e.target.checked })}
              style={{ accentColor: C.accent, width: 12, height: 12 }}
            />
            <span style={{ fontSize: 13, color: C.text, fontFamily: C.font }}>Exclude from search engines (noindex)</span>
          </label>
        </div>
      )}
    </div>
  );
}
