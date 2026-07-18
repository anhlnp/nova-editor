"use client";
import { useState } from "react";
import { useStore } from "@nanostores/react";
import { $pages } from "@/lib/data-stores";
import { $selectedPageId } from "@/lib/nano-states";
import { PageItem } from "./PageItem";
import { FolderItem } from "./FolderItem";
import { usePageCrud } from "./usePageCrud";
import type { PageSeo } from "./usePageCrud";
import { UI_VARS as C } from "@/lib/uiTheme";


const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(139,92,246,0.4)",
  borderRadius: 4,
  color: C.text,
  fontSize: 12,
  fontFamily: C.font,
  padding: "4px 7px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export function PagesPanel() {
  const pages = useStore($pages);
  const selectedPageId = useStore($selectedPageId);
  const { createPage, renamePage, updatePageSeo, deletePage, createFolder, renameFolder, deleteFolder } = usePageCrud();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showNewPage, setShowNewPage] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPath, setNewPath] = useState("/");
  const [newFolderName, setNewFolderName] = useState("");

  if (!pages) {
    return <div style={{ padding: 12, fontSize: 13, color: C.textMuted, fontFamily: C.font }}>No pages loaded.</div>;
  }

  // Narrow for use inside closures — TypeScript doesn't track non-null through nested functions.
  const pagesData = pages;
  const activePageId = selectedPageId ?? pagesData.homePageId;
  const canDelete = pagesData.pages.size > 1;

  function toggleFolder(fid: string) {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(fid)) next.delete(fid); else next.add(fid);
      return next;
    });
  }

  function handleCreatePage() {
    if (!newName.trim()) return;
    createPage(newName.trim(), newPath.trim() || "/");
    setNewName(""); setNewPath("/"); setShowNewPage(false);
  }

  function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    const name = newFolderName.trim();
    createFolder(name);
    setNewFolderName(""); setShowNewFolder(false);
  }

  // Recursively render a folder's children.
  function renderChildren(childIds: string[], depth = 0): React.ReactNode {
    return childIds.map(childId => {
      const folder = pagesData.folders.get(childId);
      if (folder) {
        const isExpanded = expandedFolders.has(childId);
        return (
          <FolderItem
            key={childId}
            name={folder.name}
            isExpanded={isExpanded}
            handlers={{
              onToggle: () => toggleFolder(childId),
              onRename: (name) => renameFolder(childId, name),
              onDelete: () => {
                if (confirm(`Delete folder "${folder.name}"? Its pages will be moved to the parent.`)) {
                  deleteFolder(childId);
                }
              },
            }}
          >
            {isExpanded && renderChildren(folder.children ?? [], depth + 1)}
          </FolderItem>
        );
      }

      const page = pagesData.pages.get(childId);
      if (!page) return null;
      return (
        <PageItem
          key={page.id}
          page={{
            id: page.id,
            name: page.name,
            path: page.path,
            title: (page as any).title,
            description: (page as any).meta?.description,
            noindex: (page as any).meta?.excludePageFromSearch === "true",
          }}
          status={{ isActive: page.id === activePageId, canDelete }}
          handlers={{
            onClick: () => $selectedPageId.set(page.id),
            onRename: (name, path) => renamePage(page.id, name, path),
            onSeoChange: (seo: PageSeo) => updatePageSeo(page.id, seo),
            onDelete: () => {
              if (confirm(`Delete page "${page.name}"?`)) deletePage(page.id);
            },
          }}
        />
      );
    });
  }

  // Root folder children drive the top-level list.
  const rootFolder = pagesData.rootFolderId ? pagesData.folders.get(pagesData.rootFolderId) : null;
  const rootChildren: string[] = rootFolder?.children ?? [...pagesData.pages.keys()];

  return (
    <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "7px 10px 6px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontFamily: C.font, color: C.textMuted, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Pages
        </span>
      </div>

      {/* Tree */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {renderChildren(rootChildren)}
      </div>

      {/* New page form */}
      {showNewPage && (
        <div style={{ padding: "8px 10px", borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
          <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Page name"
            onKeyDown={(e) => { if (e.key === "Enter") handleCreatePage(); if (e.key === "Escape") { setShowNewPage(false); setNewName(""); setNewPath("/"); } }}
            style={inputStyle} />
          <input value={newPath} onChange={(e) => setNewPath(e.target.value)} placeholder="/path or /blog/[slug]"
            onKeyDown={(e) => { if (e.key === "Enter") handleCreatePage(); if (e.key === "Escape") { setShowNewPage(false); } }}
            style={{ ...inputStyle, border: "1px solid rgba(255,255,255,0.1)", color: C.textMuted, fontFamily: C.fontMono, fontSize: 13 }} />
          {newPath.includes("[") && (
            <div style={{ fontSize: 10, color: C.accentText, fontFamily: C.font, marginTop: -2 }}>
              Path param: use <code style={{ fontFamily: C.fontMono }}>/[slug]</code> syntax
            </div>
          )}
          <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
            <button onClick={handleCreatePage} style={{ flex: 1, padding: "4px 0", background: "rgba(139,92,246,0.25)", border: "1px solid rgba(139,92,246,0.5)", borderRadius: 4, color: "#c4b5fd", fontSize: 13, fontFamily: C.font, cursor: "pointer" }}>Create</button>
            <button onClick={() => { setShowNewPage(false); setNewName(""); setNewPath("/"); }} style={{ padding: "4px 10px", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, color: C.textMuted, fontSize: 13, fontFamily: C.font, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* New folder form */}
      {showNewFolder && (
        <div style={{ padding: "8px 10px", borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
          <input autoFocus value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder name"
            onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") { setShowNewFolder(false); setNewFolderName(""); } }}
            style={inputStyle} />
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={handleCreateFolder} style={{ flex: 1, padding: "4px 0", background: "rgba(139,92,246,0.25)", border: "1px solid rgba(139,92,246,0.5)", borderRadius: 4, color: "#c4b5fd", fontSize: 13, fontFamily: C.font, cursor: "pointer" }}>Create Folder</button>
            <button onClick={() => { setShowNewFolder(false); setNewFolderName(""); }} style={{ padding: "4px 10px", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, color: C.textMuted, fontSize: 13, fontFamily: C.font, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Footer buttons */}
      {!showNewPage && !showNewFolder && (
        <div style={{ padding: "6px 10px", borderTop: `1px solid ${C.border}`, flexShrink: 0, display: "flex", gap: 10 }}>
          <button onClick={() => setShowNewPage(true)} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 13, fontFamily: C.font, cursor: "pointer", padding: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.text)} onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}>
            + Page
          </button>
          <button onClick={() => setShowNewFolder(true)} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 13, fontFamily: C.font, cursor: "pointer", padding: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.text)} onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}>
            + Folder
          </button>
        </div>
      )}
    </div>
  );
}
