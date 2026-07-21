"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { $assets, $props, $instances, $projectMeta } from "@/lib/data-stores";
import { $selectedInstanceId } from "@/lib/nano-states";
import { updateData } from "@/lib/transactions";
import type { NovaAsset } from "@/lib/r2";
import type { AssetFolder } from "@/lib/db-folders";

const CHUNK_SIZE = 4 * 1024 * 1024;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function countAssetRefs(assetId: string): number {
  const props = $props.get();
  let count = 0;
  for (const prop of props.values()) {
    const p = prop as { value?: unknown };
    if (typeof p.value === "string" && p.value.includes(assetId)) count++;
  }
  return count;
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  bg: "#ffffff",
  surface: "#f8f8f8",
  border: "#e5e5e5",
  borderDash: "#d0d0d0",
  text: "#1a1a1a",
  textSub: "#666666",
  textMuted: "#999999",
  accent: "#7c3aed",
  accentHover: "#6d28d9",
  accentLight: "rgba(124,58,237,0.08)",
  accentBorder: "rgba(124,58,237,0.25)",
  inputBg: "#f5f5f5",
  cardBg: "#fafafa",
  cardHover: "#f0f0f0",
  error: "#ef4444",
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  radius: 12,
} as const;

// ── Inline SVG Icons ──────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);

const FolderPlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    <line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
  </svg>
);

const FolderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </svg>
);

const XIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ImagePlaceholderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);

const FontIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round">
    <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

const RecordIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

// ── Folder illustration (decorative) ─────────────────────────────────────────

function FolderIllustration() {
  return (
    <svg width="130" height="110" viewBox="0 0 130 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Folder body */}
      <rect x="15" y="38" width="90" height="58" rx="8" fill="#4dd9c0" />
      <rect x="15" y="30" width="45" height="16" rx="6" fill="#4dd9c0" />
      <rect x="15" y="38" width="90" height="58" rx="8" fill="url(#folderGrad)" />
      {/* Folder tab */}
      <path d="M15 34 Q15 30 20 30 L55 30 Q62 30 65 36 L15 36Z" fill="#38c8b0" />
      {/* Play button on folder */}
      <circle cx="60" cy="65" r="13" fill="white" fillOpacity="0.25" />
      <polygon points="56,59 74,65 56,71" fill="white" fillOpacity="0.8" />
      {/* Decorative flowers left */}
      <circle cx="8" cy="50" r="6" fill="#a78bfa" />
      <circle cx="2" cy="42" r="4" fill="#c4b5fd" />
      <circle cx="14" cy="40" r="3" fill="#7c3aed" />
      <line x1="8" y1="50" x2="8" y2="62" stroke="#34d399" strokeWidth="2" />
      {/* Decorative flowers right */}
      <circle cx="112" cy="44" r="7" fill="#60a5fa" />
      <circle cx="120" cy="36" r="4" fill="#93c5fd" />
      <circle cx="105" cy="35" r="5" fill="#3b82f6" />
      <line x1="112" y1="50" x2="110" y2="62" stroke="#34d399" strokeWidth="2" />
      {/* Leaves */}
      <ellipse cx="20" cy="70" rx="8" ry="4" fill="#34d399" transform="rotate(-30 20 70)" />
      <ellipse cx="100" cy="68" rx="8" ry="4" fill="#34d399" transform="rotate(20 100 68)" />
      {/* Small accent dots */}
      <circle cx="30" cy="28" r="3" fill="#f59e0b" />
      <circle cx="90" cy="25" r="2" fill="#ec4899" />
      <defs>
        <linearGradient id="folderGrad" x1="15" y1="38" x2="105" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4dd9c0" stopOpacity="0" />
          <stop offset="1" stopColor="#2bb5a0" stopOpacity="0.4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── FolderCard (in folder tab list) ──────────────────────────────────────────

function FolderCard({
  folder,
  assetCount,
  isActive,
  onClick,
  onDelete,
  onDrop,
}: {
  folder: AssetFolder;
  assetCount: number;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onDrop: (assetId: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragOver(false);
        const raw = e.dataTransfer.getData("nova/asset-image");
        if (!raw) return;
        try { const { assetId } = JSON.parse(raw); if (assetId) onDrop(assetId); } catch { /* */ }
      }}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderRadius: 10,
        background: dragOver ? T.accentLight : isActive ? T.accentLight : hovered ? T.cardHover : T.cardBg,
        border: `1.5px solid ${dragOver ? T.accent : isActive ? T.accentBorder : T.border}`,
        cursor: "pointer", transition: "all 0.15s",
        position: "relative",
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 8,
        background: isActive ? "rgba(124,58,237,0.12)" : "rgba(0,0,0,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color: isActive ? T.accent : "#888",
      }}>
        <FolderIcon />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: T.text,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {folder.name}
        </div>
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
          {assetCount} {assetCount === 1 ? "file" : "files"}
        </div>
      </div>
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            position: "absolute", right: 8, top: 8,
            background: "rgba(0,0,0,0.06)", border: "none", borderRadius: 4,
            width: 20, height: 20, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", color: T.textMuted,
          }}
          title="Delete folder"
        >
          <XIcon size={9} />
        </button>
      )}
    </div>
  );
}

// ── AssetCard (image grid) ────────────────────────────────────────────────────

function AssetCard({
  asset, canInsert, onInsert, onDelete, onPreview,
}: {
  asset: NovaAsset; canInsert: boolean;
  onInsert: (a: NovaAsset) => void; onDelete: (a: NovaAsset) => void; onPreview: (a: NovaAsset) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isImage = asset.type === "image";
  const shortName = asset.name.length > 16 ? asset.name.slice(0, 14) + "..." : asset.name;

  function handleDragStart(e: React.DragEvent) {
    const payload = JSON.stringify({ assetId: asset.id, url: asset.url, name: asset.name });
    e.dataTransfer.setData("nova/asset-image", payload);
    e.dataTransfer.setData("text/plain", asset.url);
    e.dataTransfer.effectAllowed = "copy";
    if (isImage) {
      try {
        const ghost = document.createElement("div");
        ghost.style.cssText = "position:fixed;top:-200px;left:-200px;width:64px;height:64px;border-radius:8px;overflow:hidden;border:2px solid #7c3aed;";
        const img = document.createElement("img");
        img.src = asset.url; img.style.cssText = "width:100%;height:100%;object-fit:cover;";
        ghost.appendChild(img); document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 32, 32);
        requestAnimationFrame(() => ghost.remove());
      } catch { /* */ }
    }
  }

  return (
    <div
      draggable onDragStart={handleDragStart}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: 10, overflow: "hidden",
        background: T.cardBg, border: `1.5px solid ${hovered ? T.accentBorder : T.border}`,
        cursor: "grab", transition: "border-color 0.15s",
      }}
      title={`${asset.name} · ${formatBytes(asset.size)}`}
    >
      <div style={{ width: "100%", aspectRatio: "1", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {isImage
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={asset.url} alt={asset.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ textAlign: "center", padding: 8 }}>
            <FontIcon />
            {asset.fontFamily && <div style={{ fontSize: 9, color: T.textMuted, marginTop: 2 }}>{asset.fontFamily}</div>}
          </div>
        }
      </div>
      <div style={{ padding: "5px 6px 6px", fontSize: 11, color: T.textSub, fontFamily: T.font, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {shortName}
      </div>
      {hovered && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
          {isImage && (
            <button onClick={(e) => { e.stopPropagation(); onPreview(asset); }} style={{ padding: "4px 12px", borderRadius: 6, background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", fontSize: 12, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(4px)" }}>Preview</button>
          )}
          {canInsert && isImage && (
            <button onClick={(e) => { e.stopPropagation(); onInsert(asset); }} style={{ padding: "4px 12px", borderRadius: 6, background: T.accent, color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Insert</button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(asset); }} style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)", fontSize: 11, cursor: "pointer" }}>Delete</button>
        </div>
      )}
    </div>
  );
}

// ── AssetsPanel (main) ────────────────────────────────────────────────────────

export function AssetsPanel() {
  const assets = useStore($assets);
  const instances = useStore($instances);
  const selectedInstanceId = useStore($selectedInstanceId);
  const projectMeta = useStore($projectMeta);

  const [activeTab, setActiveTab] = useState<"images" | "folders">("images");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ asset: NovaAsset; refCount: number } | null>(null);
  const [previewAsset, setPreviewAsset] = useState<NovaAsset | null>(null);

  // Folder state
  const [folders, setFolders] = useState<AssetFolder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderError, setFolderError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const projectId = projectMeta?.id;
  const selectedInstance = selectedInstanceId ? instances.get(selectedInstanceId) : undefined;
  const isImageSelected = selectedInstance?.component === "Image";

  // Load folders
  const loadFolders = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/assets/folders?projectId=${encodeURIComponent(projectId)}`);
      if (!res.ok) return;
      const json = (await res.json()) as { folders?: AssetFolder[] };
      setFolders(json.folders ?? []);
    } catch { /* non-fatal */ }
  }, [projectId]);

  useEffect(() => { void loadFolders(); }, [loadFolders]);

  // Filter assets
  const assetList = ([...assets.values()] as NovaAsset[]).filter((a) => {
    const matchesFolder = activeFolderId === null
      ? true
      : (a.folderId ?? null) === activeFolderId;
    const matchesSearch = search
      ? a.name.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesFolder && matchesSearch;
  });

  const imageAssets = assetList.filter((a) => a.type === "image");
  const allAssets = [...assets.values()] as NovaAsset[];
  function folderAssetCount(folderId: string) {
    return allAssets.filter((a) => (a.folderId ?? null) === folderId).length;
  }

  // Upload
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;
    setUploading(true); setError(null); setProgress(0);
    try {
      let asset: NovaAsset;
      if (file.size <= 8 * 1024 * 1024) {
        setProgress(30);
        const form = new FormData();
        form.append("file", file);
        form.append("projectId", projectId);
        if (activeFolderId) form.append("folderId", activeFolderId);
        const res = await fetch("/api/assets", { method: "POST", body: form });
        const json = (await res.json()) as { asset?: NovaAsset; error?: string };
        if (!res.ok) throw new Error(json.error ?? "Upload failed");
        asset = json.asset!; setProgress(100);
      } else {
        const totalParts = Math.ceil(file.size / CHUNK_SIZE);
        const initRes = await fetch("/api/assets/upload", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, fileName: file.name, fileType: file.type, totalParts, folderId: activeFolderId }),
        });
        const init = (await initRes.json()) as { uploadId?: string; assetId?: string; error?: string };
        if (!initRes.ok) throw new Error(init.error ?? "Upload init failed");
        const { uploadId, assetId } = init;
        for (let i = 0; i < totalParts; i++) {
          const form = new FormData();
          form.append("uploadId", uploadId!); form.append("chunk", file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
          form.append("partIndex", String(i)); form.append("totalParts", String(totalParts));
          await fetch("/api/assets/upload", { method: "PUT", body: form });
          setProgress(Math.round(((i + 1) / totalParts) * 80));
        }
        const completeRes = await fetch("/api/assets/upload", {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uploadId, assetId, fileName: file.name, fileType: file.type, fileSize: file.size }),
        });
        const complete = (await completeRes.json()) as { asset?: NovaAsset; error?: string };
        if (!completeRes.ok) throw new Error(complete.error ?? "Complete failed");
        asset = complete.asset!; setProgress(100);
      }
      updateData(({ assets: a }) => { a.set(asset.id, asset as Parameters<typeof a.set>[1]); });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false); setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleInsert(asset: NovaAsset) {
    if (!selectedInstanceId) return;
    updateData(({ props }) => {
      // Find all existing src props for this instance and consolidate to one ID
      const matching: string[] = [];
      for (const p of (props as Map<string, { instanceId: string; name: string }>).values()) {
        if (p.instanceId === selectedInstanceId && p.name === "src") matching.push((p as any).id);
      }
      const propId = matching[0] ?? `${selectedInstanceId}:src`;
      // Remove duplicates
      for (let i = 1; i < matching.length; i++) props.delete(matching[i]);
      props.set(propId, { id: propId, instanceId: selectedInstanceId, name: "src", type: "string" as const, value: asset.url } as Parameters<typeof props.set>[1]);
    });
  }

  function handleDeleteRequest(asset: NovaAsset) {
    const refCount = countAssetRefs(asset.id);
    if (refCount > 0) { setDeleteConfirm({ asset, refCount }); } else { void doDelete(asset); }
  }

  async function doDelete(asset: NovaAsset) {
    if (!projectId) return; setDeleteConfirm(null);
    try {
      await fetch(`/api/assets/${asset.id}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, key: asset.key, force: true, imagekitFileId: asset.imagekitFileId }),
      });
    } catch { /* */ }
    updateData(({ assets: a }) => { a.delete(asset.id); });
  }

  async function handleCreateFolder() {
    if (!projectId || !newFolderName.trim()) return;
    const name = newFolderName.trim();
    setCreatingFolder(false); setNewFolderName(""); setFolderError(null);
    try {
      const res = await fetch("/api/assets/folders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, projectId, parentId: null }),
      });
      const json = (await res.json()) as { folder?: AssetFolder; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Create failed");
      setFolders((prev) => [...prev, json.folder!]);
      setActiveFolderId(json.folder!.id);
    } catch (err) {
      setFolderError(err instanceof Error ? err.message : "Failed to create folder");
    }
  }

  async function handleDeleteFolder(folder: AssetFolder) {
    if (!confirm(`Delete folder "${folder.name}"?`)) return;
    try {
      await fetch(`/api/assets/folders/${folder.id}`, { method: "DELETE" });
      setFolders((prev) => prev.filter((f) => f.id !== folder.id));
      if (activeFolderId === folder.id) setActiveFolderId(null);
    } catch (err) {
      setFolderError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function handleMoveAsset(assetId: string, folderId: string) {
    updateData(({ assets: a }) => {
      const asset = a.get(assetId) as NovaAsset | undefined;
      if (!asset) return;
      a.set(assetId, { ...asset, folderId } as Parameters<typeof a.set>[1]);
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.bg, fontFamily: T.font }}>

      {/* Search bar */}
      <div style={{ padding: "12px 12px 8px" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tim kiem theo tu khoa, the, mau"
            style={{
              width: "100%", boxSizing: "border-box" as const,
              padding: "9px 10px 9px 34px",
              background: T.inputBg, border: `1.5px solid ${T.border}`,
              borderRadius: 10, fontSize: 13, color: T.text,
              fontFamily: T.font, outline: "none",
            }}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ padding: "0 12px 8px", display: "flex", gap: 8 }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !projectId}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "10px 12px", borderRadius: 10,
            background: uploading ? "rgba(124,58,237,0.5)" : T.accent,
            color: "#fff", border: "none", fontSize: 13, fontWeight: 700,
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          <UploadIcon />
          {uploading ? "Đang tải..." : "Tải lên tệp"}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*,font/woff,font/woff2,application/font-woff,application/font-woff2" style={{ display: "none" }} onChange={handleFileChange} />
      </div>

      {/* Upload progress */}
      {uploading && (
        <div style={{ padding: "0 12px 6px" }}>
          <div style={{ height: 3, background: "#e5e5e5", borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: T.accent, borderRadius: 2, transition: "width 0.2s" }} />
          </div>
        </div>
      )}



      {/* Error banner */}
      {(error || folderError) && (
        <div style={{ margin: "0 12px 8px", padding: "8px 12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 12, color: T.error, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{error || folderError}</span>
          <button onClick={() => { setError(null); setFolderError(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: T.error, padding: 0, display: "flex" }}>
            <XIcon size={10} />
          </button>
        </div>
      )}

      {/* Insert hint */}
      {isImageSelected && (
        <div style={{ margin: "0 12px 6px", padding: "6px 10px", background: "rgba(124,58,237,0.06)", border: `1px solid ${T.accentBorder}`, borderRadius: 8, fontSize: 11, color: T.accent }}>
          Click an image to set it as src
        </div>
      )}

      {/* Tabs: Hinh anh | Thu muc */}
      <div style={{ padding: "0 12px", borderBottom: `1.5px solid ${T.border}`, display: "flex", gap: 24 }}>
        {(["images", "folders"] as const).map((tab) => {
          const label = tab === "images" ? "Hình ảnh" : "Thư mục";
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none", border: "none", padding: "10px 0",
                fontSize: 13, fontWeight: active ? 700 : 500,
                color: active ? T.accent : T.textSub,
                cursor: "pointer", fontFamily: T.font,
                borderBottom: active ? `2.5px solid ${T.accent}` : "2.5px solid transparent",
                marginBottom: -1.5, transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* ── Images tab ── */}
        {activeTab === "images" && (
          <div style={{ padding: 12 }}>
            {/* Folder breadcrumb when filtering by folder */}
            {activeFolderId && (
              <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.textMuted }}>
                <span style={{ cursor: "pointer", color: T.accent }} onClick={() => setActiveFolderId(null)}>Tat ca</span>
                <span>&rsaquo;</span>
                <span style={{ color: T.text, fontWeight: 600 }}>
                  {folders.find((f) => f.id === activeFolderId)?.name ?? "Thu muc"}
                </span>
                <button onClick={() => setActiveFolderId(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: T.textMuted, display: "flex" }}>
                  <XIcon size={9} />
                </button>
              </div>
            )}

            {imageAssets.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", gap: 8, textAlign: "center" }}>
                <ImagePlaceholderIcon />
                <div style={{ fontSize: 13, color: T.textMuted }}>
                  {activeFolderId ? "Không có hình ảnh trong thư mục này." : "Chưa có hình ảnh."}
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                {imageAssets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} canInsert={isImageSelected} onInsert={handleInsert} onDelete={handleDeleteRequest} onPreview={setPreviewAsset} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Folders tab ── */}
        {activeTab === "folders" && (
          <div style={{ padding: 12 }}>
            {folders.length === 0 && !creatingFolder ? (
              /* Empty state — matches the design */
              <div style={{
                margin: "8px 0",
                border: `1.5px dashed ${T.borderDash}`,
                borderRadius: 16, padding: "28px 24px 24px",
                display: "flex", flexDirection: "column", alignItems: "center",
                textAlign: "center", gap: 6,
              }}>
                <FolderIllustration />
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginTop: 8 }}>
                  Sap xep noi dung tai len
                </div>
                <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.55, maxWidth: 220 }}>
                  Sap xep noi dung tai len that gon gang bang cach di chuyen vao cac thu muc.
                </div>
                <button
                  onClick={() => setCreatingFolder(true)}
                  style={{
                    marginTop: 14, display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 22px", borderRadius: 50,
                    background: T.bg, border: `1.5px solid ${T.border}`,
                    color: T.text, fontSize: 13, fontWeight: 600,
                    cursor: "pointer", fontFamily: T.font,
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text; }}
                >
                  <FolderPlusIcon />
                  Tao thu muc
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    assetCount={folderAssetCount(folder.id)}
                    isActive={activeFolderId === folder.id}
                    onClick={() => { setActiveFolderId(folder.id); setActiveTab("images"); }}
                    onDelete={() => handleDeleteFolder(folder)}
                    onDrop={(assetId) => handleMoveAsset(assetId, folder.id)}
                  />
                ))}
                {/* Add new folder button (when folders exist) */}
                <button
                  onClick={() => setCreatingFolder(true)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "10px", borderRadius: 10,
                    background: "transparent", border: `1.5px dashed ${T.borderDash}`,
                    color: T.textMuted, fontSize: 13, cursor: "pointer",
                    fontFamily: T.font, transition: "border-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.borderDash; e.currentTarget.style.color = T.textMuted; }}
                >
                  <FolderPlusIcon />
                  Tao thu muc moi
                </button>
              </div>
            )}

            {/* Create folder inline input */}
            {creatingFolder && (
              <div style={{ marginTop: folders.length > 0 ? 8 : 0, padding: "12px 14px", background: T.cardBg, border: `1.5px solid ${T.accentBorder}`, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 8 }}>Ten thu muc</div>
                <input
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleCreateFolder();
                    if (e.key === "Escape") { setCreatingFolder(false); setNewFolderName(""); }
                  }}
                  placeholder="VD: Anh baner, Logo..."
                  style={{
                    width: "100%", boxSizing: "border-box" as const,
                    padding: "8px 10px", background: T.bg,
                    border: `1.5px solid ${T.accentBorder}`, borderRadius: 8,
                    fontSize: 13, color: T.text, fontFamily: T.font, outline: "none",
                  }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => { setCreatingFolder(false); setNewFolderName(""); }}
                    style={{ padding: "6px 14px", borderRadius: 7, border: `1px solid ${T.border}`, background: "transparent", color: T.textSub, fontSize: 12, cursor: "pointer" }}
                  >
                    Huy
                  </button>
                  <button
                    onClick={() => void handleCreateFolder()}
                    disabled={!newFolderName.trim()}
                    style={{
                      padding: "6px 14px", borderRadius: 7, border: "none",
                      background: newFolderName.trim() ? T.accent : "#c4b5fd",
                      color: "#fff", fontSize: 12, fontWeight: 600,
                      cursor: newFolderName.trim() ? "pointer" : "not-allowed",
                    }}
                  >
                    Tao
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: T.bg, borderRadius: 16, padding: "20px 22px", width: 280, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 8 }}>Xoa asset?</div>
            <div style={{ fontSize: 12, color: T.textSub, lineHeight: 1.6, marginBottom: 16 }}>
              <strong style={{ color: T.error }}>{deleteConfirm.refCount}</strong> instance dang su dung asset nay.
              Xoa se khien cac tham chieu do bi hong.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.textSub, fontSize: 12, cursor: "pointer" }}>Huy</button>
              <button onClick={() => void doDelete(deleteConfirm.asset)} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: T.error, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Xoa</button>
            </div>
          </div>
        </div>
      )}

      {/* Image preview lightbox */}
      {previewAsset && <AssetLightbox asset={previewAsset} onClose={() => setPreviewAsset(null)} />}
    </div>
  );
}

// ── AssetLightbox (full-screen preview) ───────────────────────────────────────

function AssetLightbox({ asset, onClose }: { asset: NovaAsset; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(s + 0.25, 5));
      if (e.key === "-") setScale((s) => Math.max(s - 0.25, 0.25));
      if (e.key === "0") { setScale(1); setTranslate({ x: 0, y: 0 }); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setScale((s) => Math.max(0.25, Math.min(5, s + delta)));
  }, []);

  // Pan
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale <= 1) return;
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      translateStart.current = { ...translate };
    },
    [scale, translate]
  );

  useEffect(() => {
    if (!isPanning) return;
    const move = (e: MouseEvent) => {
      setTranslate({
        x: translateStart.current.x + (e.clientX - panStart.current.x),
        y: translateStart.current.y + (e.clientY - panStart.current.y),
      });
    };
    const up = () => setIsPanning(false);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    return () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
  }, [isPanning]);

  const zoomIn = () => setScale((s) => Math.min(s + 0.5, 5));
  const zoomOut = () => setScale((s) => Math.max(s - 0.5, 0.25));
  const resetZoom = () => { setScale(1); setTranslate({ x: 0, y: 0 }); };

  return (
    <div
      ref={containerRef}
      onClick={(e) => { if (e.target === containerRef.current) close(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isVisible ? "rgba(0, 0, 0, 0.88)" : "rgba(0, 0, 0, 0)",
        backdropFilter: isVisible ? "blur(12px)" : "blur(0px)",
        WebkitBackdropFilter: isVisible ? "blur(12px)" : "blur(0px)",
        transition: "background 0.3s ease, backdrop-filter 0.3s ease",
        cursor: isPanning ? "grabbing" : scale > 1 ? "grab" : "default",
        userSelect: "none",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px",
          background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)",
          opacity: isVisible ? 1 : 0, transition: "opacity 0.3s ease",
          pointerEvents: isVisible ? "auto" : "none", zIndex: 2,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: "70%" }}>
          <span style={{
            color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: 600,
            fontFamily: T.font, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {asset.name}
          </span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: T.font }}>
            {formatBytes(asset.size)}
          </span>
        </div>
        <button
          onClick={close}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)",
            color: "#fff", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget).style.background = "rgba(255,255,255,0.18)"; }}
          onMouseLeave={(e) => { (e.currentTarget).style.background = "rgba(255,255,255,0.08)"; }}
          title="Close (Esc)"
        >
          ✕
        </button>
      </div>

      {/* Image */}
      <div
        style={{
          maxWidth: "90vw", maxHeight: "85vh",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.92)",
          transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.url}
          alt={asset.name}
          draggable={false}
          style={{
            display: "block", maxWidth: "90vw", maxHeight: "85vh",
            objectFit: "contain", borderRadius: 8,
            boxShadow: "0 8px 60px rgba(0,0,0,0.6), 0 2px 16px rgba(0,0,0,0.3)",
            transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
            transition: isPanning ? "none" : "transform 0.2s ease",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Bottom toolbar */}
      <div
        style={{
          position: "absolute", bottom: 24, left: "50%",
          transform: `translateX(-50%) translateY(${isVisible ? "0" : "20px"})`,
          display: "flex", alignItems: "center", gap: 2,
          padding: "6px 8px",
          background: "rgba(30, 30, 40, 0.85)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s ease, transform 0.3s ease",
          pointerEvents: isVisible ? "auto" : "none", zIndex: 2,
        }}
      >
        <LightboxBtn onClick={zoomOut} title="Zoom Out (-)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
            <line x1="4.5" y1="7" x2="9.5" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </LightboxBtn>

        <button
          onClick={resetZoom} title="Reset Zoom (0)"
          style={{
            height: 30, minWidth: 52, border: "none", borderRadius: 8,
            background: "transparent", color: "rgba(255,255,255,0.85)",
            fontSize: 11, fontFamily: T.font, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s", letterSpacing: "0.02em",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          {Math.round(scale * 100)}%
        </button>

        <LightboxBtn onClick={zoomIn} title="Zoom In (+)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
            <line x1="4.5" y1="7" x2="9.5" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="7" y1="4.5" x2="7" y2="9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </LightboxBtn>

        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)", margin: "0 4px" }} />

        <LightboxBtn onClick={resetZoom} title="Fit to Screen">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <rect x="4.5" y="4.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1.5" />
          </svg>
        </LightboxBtn>
      </div>
    </div>
  );
}

function LightboxBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      onClick={onClick} title={title}
      style={{
        width: 32, height: 30, border: "none", borderRadius: 8,
        background: "transparent", color: "rgba(255,255,255,0.75)",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.95)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
    >
      {children}
    </button>
  );
}
