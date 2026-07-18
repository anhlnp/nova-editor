"use client";

import { useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { $assets, $props, $instances, $projectMeta } from "@/lib/data-stores";
import { $selectedInstanceId } from "@/lib/nano-states";
import { updateData } from "@/lib/transactions";
import { UI_VARS as C } from "@/lib/uiTheme";
import type { NovaAsset } from "@/lib/r2";

const CHUNK_SIZE = 4 * 1024 * 1024; // 4 MB per chunk

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

function AssetCard({
  asset,
  canInsert,
  onInsert,
  onDelete,
}: {
  asset: NovaAsset;
  canInsert: boolean;
  onInsert: (asset: NovaAsset) => void;
  onDelete: (asset: NovaAsset) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isImage = asset.type === "image";
  const shortName = asset.name.length > 18 ? asset.name.slice(0, 16) + "…" : asset.name;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: hovered ? C.cardHover : C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        overflow: "hidden",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      title={`${asset.name} · ${formatBytes(asset.size)}${asset.fontFamily ? ` · ${asset.fontFamily} ${asset.fontWeight ?? 400}` : ""}`}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.url} alt={asset.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>🔤</div>
            {asset.fontFamily && (
              <div style={{ fontSize: 9, color: C.textMuted, fontFamily: C.font, marginTop: 2, padding: "0 4px" }}>
                {asset.fontFamily}
              </div>
            )}
            {asset.fontWeight && asset.fontWeight !== 400 && (
              <div style={{ fontSize: 9, color: C.muted, fontFamily: C.font }}>
                {asset.fontWeight}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          padding: "4px 6px",
          fontSize: 12,
          color: C.muted,
          fontFamily: C.font,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {shortName}
      </div>

      {hovered && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            background: "rgba(0,0,0,0.65)",
          }}
        >
          {canInsert && isImage && (
            <button
              onClick={(e) => { e.stopPropagation(); onInsert(asset); }}
              style={{
                padding: "4px 10px", borderRadius: 4, background: C.accent,
                color: "#fff", border: "none", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: C.font,
              }}
            >
              Insert
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(asset); }}
            style={{
              padding: "3px 8px", borderRadius: 4,
              background: "rgba(248,113,113,0.18)",
              color: C.error, border: `1px solid rgba(248,113,113,0.3)`,
              fontSize: 12, cursor: "pointer", fontFamily: C.font,
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function AssetsPanel() {
  const assets = useStore($assets);
  const instances = useStore($instances);
  const selectedInstanceId = useStore($selectedInstanceId);
  const projectMeta = useStore($projectMeta);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ asset: NovaAsset; refCount: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectId = projectMeta?.id;
  const selectedInstance = selectedInstanceId ? instances.get(selectedInstanceId) : undefined;
  const isImageSelected = selectedInstance?.component === "Image";

  const assetList = [...assets.values()] as NovaAsset[];

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      let asset: NovaAsset;

      if (file.size <= 8 * 1024 * 1024) {
        // Small file: use the simple single-request upload
        setProgress(30);
        const form = new FormData();
        form.append("file", file);
        form.append("projectId", projectId);
        const res = await fetch("/api/assets", { method: "POST", body: form });
        const json = (await res.json()) as { asset?: NovaAsset; error?: string };
        if (!res.ok) throw new Error(json.error ?? "Upload failed");
        asset = json.asset!;
        setProgress(100);
      } else {
        // Large file: chunked upload
        const totalParts = Math.ceil(file.size / CHUNK_SIZE);

        // 1. Initiate
        const initRes = await fetch("/api/assets/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            fileName: file.name,
            fileType: file.type,
            totalParts,
          }),
        });
        const init = (await initRes.json()) as { uploadId?: string; assetId?: string; key?: string; error?: string };
        if (!initRes.ok) throw new Error(init.error ?? "Upload init failed");
        const { uploadId, assetId } = init;

        // 2. Upload chunks
        for (let i = 0; i < totalParts; i++) {
          const start = i * CHUNK_SIZE;
          const chunk = file.slice(start, start + CHUNK_SIZE);
          const form = new FormData();
          form.append("uploadId", uploadId!);
          form.append("chunk", chunk);
          form.append("partIndex", String(i));
          form.append("totalParts", String(totalParts));
          const putRes = await fetch("/api/assets/upload", { method: "PUT", body: form });
          if (!putRes.ok) throw new Error(`Chunk ${i} upload failed`);
          setProgress(Math.round(((i + 1) / totalParts) * 80));
        }

        // 3. Complete
        const completeRes = await fetch("/api/assets/upload", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadId, assetId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        });
        const complete = (await completeRes.json()) as { asset?: NovaAsset; error?: string };
        if (!completeRes.ok) throw new Error(complete.error ?? "Upload complete failed");
        asset = complete.asset!;
        setProgress(100);
      }

      updateData(({ assets: a }) => {
        a.set(asset.id, asset as Parameters<typeof a.set>[1]);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleInsert(asset: NovaAsset) {
    if (!selectedInstanceId) return;
    updateData(({ props }) => {
      const propId = `${selectedInstanceId}:src`;
      props.set(propId, {
        id: propId,
        instanceId: selectedInstanceId,
        name: "src",
        type: "string" as const,
        value: asset.url,
      } as Parameters<typeof props.set>[1]);
    });
  }

  function handleDeleteRequest(asset: NovaAsset) {
    const refCount = countAssetRefs(asset.id);
    if (refCount > 0) {
      setDeleteConfirm({ asset, refCount });
    } else {
      void doDelete(asset);
    }
  }

  async function doDelete(asset: NovaAsset) {
    if (!projectId) return;
    setDeleteConfirm(null);
    try {
      await fetch(`/api/assets/${asset.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, key: asset.key, force: true }),
      });
    } catch { /* non-fatal */ }
    updateData(({ assets: a }) => { a.delete(asset.id); });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: C.font, background: C.bg }}>
      {/* Header */}
      <div style={{
        padding: "10px 12px 8px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Assets</span>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !projectId}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "3px 8px", borderRadius: 4,
            background: uploading ? "rgba(124,58,237,0.3)" : C.accent,
            color: "#fff", border: "none", fontSize: 12, fontWeight: 600,
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: !projectId ? 0.4 : 1,
          }}
        >
          {uploading ? "Uploading…" : "+ Upload"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,font/woff,font/woff2,application/font-woff,application/font-woff2"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {/* Upload progress bar */}
      {uploading && (
        <div style={{ padding: "4px 12px", flexShrink: 0 }}>
          <div style={{ height: 3, background: C.inputBg, borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${progress}%`,
              background: C.accent,
              borderRadius: 2,
              transition: "width 0.2s ease",
            }} />
          </div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{progress}%</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: "6px 12px", fontSize: 12, color: C.error, borderBottom: `1px solid rgba(248,113,113,0.2)`, flexShrink: 0 }}>
          {error}
        </div>
      )}

      {/* Context hint */}
      {isImageSelected && (
        <div style={{ padding: "5px 12px", fontSize: 12, color: "#a78bfa", background: "rgba(124,58,237,0.08)", borderBottom: `1px solid rgba(124,58,237,0.15)`, flexShrink: 0 }}>
          Click an image to set it as src
        </div>
      )}

      {/* Asset grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {assetList.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80%", gap: 8, color: C.muted, fontSize: 13, textAlign: "center", padding: "0 16px" }}>
            <span style={{ fontSize: 28 }}>🖼</span>
            <span>No assets yet.</span>
            <span>Upload images or fonts to use them in your design.</span>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {assetList.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                canInsert={isImageSelected}
                onInsert={handleInsert}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal for in-use assets */}
      {deleteConfirm && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }}>
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: "20px 24px", maxWidth: 300, width: "90%",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Delete Asset?</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 16, lineHeight: 1.5 }}>
              <strong style={{ color: C.danger }}>{deleteConfirm.refCount} instance{deleteConfirm.refCount !== 1 ? "s" : ""}</strong> reference this asset.
              Deleting it will break those references.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ padding: "5px 14px", borderRadius: 5, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: C.font }}
              >
                Cancel
              </button>
              <button
                onClick={() => void doDelete(deleteConfirm.asset)}
                style={{ padding: "5px 14px", borderRadius: 5, border: "none", background: C.danger, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: C.font }}
              >
                Delete Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
