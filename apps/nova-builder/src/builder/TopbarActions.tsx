"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@nanostores/react";
import {
  $projectMeta,
  $pages,
  $assets,
  $instances,
  $props,
  $dataSources,
  $resources,
  $breakpoints,
  $styles,
  $styleSources,
  $styleSourceSelections,
} from "@/lib/data-stores";
import { serializeWebstudioData } from "@/lib/schema";
import {
  $builderMode,
  $aiPanelOpen,
  $aiContentPanelOpen,
  $a11yPanelOpen,
  $perfPanelOpen,
  $historyPanelOpen,
  $canvasZoom,
  $gridGuidesVisible,
  $cssPreviewOpen,
  $cssVars,
  $interactions,
  $customCss,
  $isDirty,
  $saveTriggerCount,
} from "@/lib/nano-states";
import { saveProject } from "@/lib/saveProject";
import { SaveProjectDialog } from "./SaveProjectDialog";
import { DeployPanel } from "./DeployPanel";
import { CollaboratorAvatars } from "./PresenceLayer";
import { LangToggle } from "./LangToggle";
import { TopbarMenu } from "./TopbarMenu";
import { UI_VARS as C } from "@/lib/uiTheme";
import { useI18n } from "@/lib/i18n";
import { $saveStatus } from "@/lib/saveQueue";
import type { I18nBuilderDictionary } from "@/lib/i18n/types";
import { $symbols } from "@/lib/symbols";

// Sync-status chip (M2): reflects the patch-autosave queue. Conflict offers a
// reload — the only safe recovery when another tab/session saved first.
function SyncStatusChip() {
  const { t } = useI18n();
  const status = useStore($saveStatus);
  if (status === "idle") return null;
  const labels: Record<string, { key: keyof I18nBuilderDictionary; color: string }> = {
    saving: { key: "syncSaving", color: C.textMuted },
    saved: { key: "syncSaved", color: C.success },
    recovering: { key: "syncRecovering", color: C.textMuted },
    error: { key: "syncError", color: C.danger },
    conflict: { key: "syncConflict", color: C.danger },
  };
  const entry = labels[status];
  if (!entry) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: entry.color, fontFamily: C.font, padding: "0 4px", whiteSpace: "nowrap" }}>
      {t.builder[entry.key]}
      {status === "conflict" && (
        <button
          onClick={() => window.location.reload()}
          style={{ padding: "2px 8px", borderRadius: 4, border: `1px solid ${C.danger}`, background: "none", color: C.danger, fontSize: 12, fontFamily: C.font, cursor: "pointer", fontWeight: 600 }}
        >
          {t.builder.syncConflictReload}
        </button>
      )}
    </span>
  );
}

type Props = {
  isDemo?: boolean;
};

export function TopbarActions({ isDemo }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const meta = useStore($projectMeta);
  const mode = useStore($builderMode);
  const isAIPanelOpen = useStore($aiPanelOpen);
  const isAIContentOpen = useStore($aiContentPanelOpen);
  const isA11yOpen = useStore($a11yPanelOpen);
  const isPerfOpen = useStore($perfPanelOpen);
  const isHistoryOpen = useStore($historyPanelOpen);
  const canvasZoom = useStore($canvasZoom);
  const gridGuides = useStore($gridGuidesVisible);
  const cssPreview = useStore($cssPreviewOpen);
  
  const isDirty = useStore($isDirty);
  const saveTriggerCount = useStore($saveTriggerCount);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);
  const [timeLabel, setTimeLabel] = useState<string>("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const [published, setPublished] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);

  const handleSaveClick = useCallback(() => {
    if (isSaving) return;
    setSaveDialogOpen(true);
  }, [isSaving]);

  // Sync keyboard Ctrl+S / trigger count to show dialog
  useEffect(() => {
    if (saveTriggerCount > 0) {
      handleSaveClick();
    }
  }, [saveTriggerCount, handleSaveClick]);

  // Update time elapsed label since last save
  useEffect(() => {
    if (lastSavedTime === null || isSaving || isDirty) return;
    
    const updateLabel = () => {
      const diff = Date.now() - lastSavedTime;
      const seconds = Math.floor(diff / 1000);
      if (seconds < 10) {
        setTimeLabel("Saved");
      } else if (seconds < 60) {
        setTimeLabel(`Saved (${seconds}s ago)`);
      } else {
        const minutes = Math.floor(seconds / 60);
        setTimeLabel(`Saved (${minutes}m ago)`);
      }
    };
    
    updateLabel();
    const interval = setInterval(updateLabel, 5000);
    return () => clearInterval(interval);
  }, [lastSavedTime, isSaving, isDirty]);

  const handleUpdate = async () => {
    if (!meta) return;
    setIsSaving(true);
    setSaveError(false);
    try {
      await saveProject(meta.id);
      $isDirty.set(false);
      setLastSavedTime(Date.now());
    } catch (err) {
      console.error(err);
      setSaveError(true);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const getProjectPayload = (name: string, description: string = "", thumbnail: string = "") => {
    const data = {
      pages: $pages.get()!,
      assets: $assets.get(),
      instances: $instances.get(),
      props: $props.get(),
      dataSources: $dataSources.get(),
      resources: $resources.get(),
      breakpoints: $breakpoints.get(),
      styles: $styles.get(),
      styleSources: $styleSources.get(),
      styleSourceSelections: $styleSourceSelections.get(),
    };
    const serialized = serializeWebstudioData(data);
    return {
      name,
      schema_json: {
        schemaVersion: "5.0",
        data: serialized,
        cssVars: $cssVars.get(),
        interactions: $interactions.get(),
        customCss: $customCss.get(),
        symbols: $symbols.get(),
        metadata: {
          description,
          thumbnail,
        }
      }
    };
  };

  const handleCreate = async (name: string, description: string, thumbnail: string) => {
    setIsSaving(true);
    setSaveError(false);
    try {
      const payload = getProjectPayload(name, description, thumbnail);
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const { id } = (await res.json()) as { id: string };

      $projectMeta.set({ id, name, updatedAt: new Date().toISOString() });
      $isDirty.set(false);
      setLastSavedTime(Date.now());

      router.push(`/builder/${id}`);
    } catch (err) {
      console.error(err);
      setSaveError(true);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAs = async (newName: string) => {
    setIsSaving(true);
    setSaveError(false);
    try {
      const payload = getProjectPayload(newName);
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const { id } = (await res.json()) as { id: string };

      $projectMeta.set({ id, name: newName, updatedAt: new Date().toISOString() });
      $isDirty.set(false);
      setLastSavedTime(Date.now());

      router.push(`/builder/${id}`);
    } catch (err) {
      console.error(err);
      setSaveError(true);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = useCallback(() => {
    if (!meta) return;
    navigator.clipboard.writeText(`${window.location.origin}/preview/${meta.id}`).then(() => {
      setPublished(true);
      setTimeout(() => setPublished(false), 2500);
    });
  }, [meta]);

  const handleZoomIn = useCallback(() => {
    $canvasZoom.set(Math.min(3, Math.round(($canvasZoom.get() + 0.1) * 100) / 100));
  }, []);

  const handleZoomOut = useCallback(() => {
    $canvasZoom.set(Math.max(0.1, Math.round(($canvasZoom.get() - 0.1) * 100) / 100));
  }, []);

  const btnBase = {
    padding: "3px 10px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent", color: C.textMuted, fontSize: 13, fontFamily: C.font,
    cursor: "pointer", fontWeight: 600,
  };

  return (
    <>
      {/* Zoom controls */}
      <div style={{ display: "flex", alignItems: "center", flexShrink: 0, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, overflow: "hidden" }}>
        <button onClick={handleZoomOut} title="Zoom out" style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontSize: 14, lineHeight: 1, padding: "2px 7px", fontFamily: C.font }}>−</button>
        <button onClick={() => $canvasZoom.set(1)} title="Reset zoom (Ctrl+0)" style={{ background: "none", border: "none", borderLeft: "1px solid rgba(255,255,255,0.08)", borderRight: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", color: canvasZoom !== 1 ? C.accentText : C.textMuted, fontSize: 13, fontFamily: C.font, fontWeight: canvasZoom !== 1 ? 700 : 400, padding: "2px 8px", minWidth: 40, textAlign: "center" }}>
          {Math.round(canvasZoom * 100)}%
        </button>
        <button onClick={handleZoomIn} title="Zoom in" style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontSize: 14, lineHeight: 1, padding: "2px 7px", fontFamily: C.font }}>+</button>
      </div>

      {/* Right action area — 7 logical controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
        <CollaboratorAvatars />

        {/* Language toggle — always visible; persists across F5 */}
        <LangToggle />

        {/* 1 — Mode pills: Design / Content */}
        <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, overflow: "hidden", flexShrink: 0 }}>
          {(["design", "content"] as const).map((m) => (
            <button
              key={m}
              onClick={() => $builderMode.set(m)}
              title={m === "design" ? "Design mode" : "Content-edit mode"}
              style={{
                background: mode === m ? "rgba(124,58,237,0.18)" : "none",
                border: "none",
                borderRight: m !== "content" ? "1px solid rgba(255,255,255,0.08)" : "none",
                cursor: "pointer",
                color: mode === m ? C.accentText : C.textMuted,
                fontSize: 12,
                fontFamily: C.font,
                fontWeight: mode === m ? 700 : 400,
                padding: "3px 9px",
                lineHeight: 1,
                textTransform: "capitalize",
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {isDemo ? (
          <>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: C.font, padding: "0 4px" }}>{t.builder.demoNotice}</span>
            <button onClick={() => router.push("/signup")} style={{ padding: "4px 14px", borderRadius: 6, border: "none", background: "linear-gradient(135deg, rgba(124,58,237,0.9) 0%, rgba(79,70,229,0.85) 100%)", color: "#fff", fontSize: 12, fontFamily: C.font, cursor: "pointer", fontWeight: 700 }}>{t.builder.signUpFree}</button>
            <button
              onClick={() => {
                const data = {
                  pages: $pages.get()!,
                  assets: $assets.get(),
                  instances: $instances.get(),
                  props: $props.get(),
                  dataSources: $dataSources.get(),
                  resources: $resources.get(),
                  breakpoints: $breakpoints.get(),
                  styles: $styles.get(),
                  styleSources: $styleSources.get(),
                  styleSourceSelections: $styleSourceSelections.get(),
                };
                const serialized = serializeWebstudioData(data);
                const demoPayload = {
                  id: "demo",
                  name: "Demo — Nova Builder",
                  schemaVersion: "5.0",
                  data: serialized,
                  cssVars: $cssVars.get(),
                  interactions: $interactions.get(),
                  customCss: $customCss.get(),
                  updatedAt: new Date().toISOString(),
                };
                localStorage.setItem("nova-demo-project-data", JSON.stringify(demoPayload));
                window.open("/preview/demo", "_blank");
              }}
              style={{ ...btnBase, transition: "all 0.15s" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = C.textMuted;
              }}
            >
              Preview
            </button>
            <button
              onClick={handleSaveClick}
              disabled={isSaving || (!isDirty && !saveError)}
              style={{
                padding: "4px 12px",
                borderRadius: 5,
                border: "none",
                background: isSaving
                  ? "rgba(255,255,255,0.06)"
                  : saveError
                  ? "rgba(220,38,38,0.85)"
                  : isDirty
                  ? "rgba(5,150,105,0.85)"
                  : "rgba(255,255,255,0.08)",
                color: isSaving || (!isDirty && !saveError) ? C.textMuted : "#fff",
                fontSize: 12,
                fontFamily: C.font,
                cursor: isSaving || (!isDirty && !saveError) ? "default" : "pointer",
                fontWeight: 600,
                transition: "all 0.15s",
              }}
            >
              {isSaving
                ? "Saving..."
                : saveError
                ? "Failed. Retry?"
                : isDirty
                ? "Save"
                : lastSavedTime !== null
                ? timeLabel
                : "Save"}
            </button>
          </>
        ) : (
          <>
            <SyncStatusChip />
            {/* 2 — Export ▾ (HTML + React + Deploy) */}
            <TopbarMenu
              trigger={t.builder.export}
              open={exportOpen}
              onToggle={() => { setExportOpen((v) => !v); setToolsOpen(false); }}
              onClose={() => setExportOpen(false)}
              items={[
                { label: t.builder.exportHtml, title: "Download as standalone HTML", href: meta ? `/api/export/${meta.id}` : "#", download: true },
                { label: t.builder.exportReact, title: "Download as React component", href: meta ? `/api/export/${meta.id}/react` : "#", download: true },
                { label: t.builder.deploy, title: "Deploy to hosting", onClick: () => setDeployOpen((v) => !v) },
              ]}
            />

            {/* Deploy panel (opens from Export menu) */}
            {deployOpen && meta && (
              <div style={{ position: "relative" }}>
                <DeployPanel projectId={meta.id} onClose={() => setDeployOpen(false)} />
              </div>
            )}

            {/* 3 — Tools ▾ (Fill, A11y, Perf, History) */}
            <TopbarMenu
              trigger={t.builder.tools}
              open={toolsOpen}
              onToggle={() => { setToolsOpen((v) => !v); setExportOpen(false); }}
              onClose={() => setToolsOpen(false)}
              items={[
                { label: t.builder.aiContentFill, active: isAIContentOpen, onClick: () => $aiContentPanelOpen.set(!isAIContentOpen) },
                { label: t.builder.accessibility, active: isA11yOpen, onClick: () => $a11yPanelOpen.set(!isA11yOpen) },
                { label: t.builder.performance, active: isPerfOpen, onClick: () => $perfPanelOpen.set(!isPerfOpen) },
                { label: t.builder.history, active: isHistoryOpen, onClick: () => $historyPanelOpen.set(!isHistoryOpen) },
                { label: t.builder.gridGuides, active: gridGuides, onClick: () => $gridGuidesVisible.set(!gridGuides) },
                { label: t.builder.cssPreview, active: cssPreview, onClick: () => $cssPreviewOpen.set(!cssPreview) },
              ]}
            />

            {/* 4 — Publish */}
            {meta && (
              <button
                onClick={handlePublish}
                style={{ ...btnBase, border: `1px solid ${published ? "rgba(5,150,105,0.45)" : "rgba(255,255,255,0.1)"}`, background: published ? "rgba(5,150,105,0.12)" : "transparent", color: published ? "#6ee7b7" : C.textMuted, transition: "all 0.15s" }}
              >
                {published ? t.builder.copied : t.builder.publish}
              </button>
            )}

            {/* Preview Button */}
            {meta && (
              <button
                onClick={() => window.open(`/preview/${meta.id}`, "_blank")}
                style={{ ...btnBase, transition: "all 0.15s" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = C.textMuted;
                }}
              >
                Preview
              </button>
            )}

            {/* 5 — Save */}
            <button
              onClick={handleSaveClick}
              disabled={isSaving || (!isDirty && !saveError)}
              style={{
                padding: "4px 12px",
                borderRadius: 5,
                border: "none",
                background: isSaving
                  ? "rgba(255,255,255,0.06)"
                  : saveError
                  ? "rgba(220,38,38,0.85)"
                  : isDirty
                  ? "rgba(5,150,105,0.85)"
                  : "rgba(255,255,255,0.08)",
                color: isSaving || (!isDirty && !saveError) ? C.textMuted : "#fff",
                fontSize: 12,
                fontFamily: C.font,
                cursor: isSaving || (!isDirty && !saveError) ? "default" : "pointer",
                fontWeight: 600,
                transition: "all 0.15s",
              }}
            >
              {isSaving
                ? "Saving..."
                : saveError
                ? "Failed. Retry?"
                : isDirty
                ? "Save"
                : lastSavedTime !== null
                ? timeLabel
                : "Saved"}
            </button>

            {/* 6 — ✦ Generate */}
            <button
              onClick={() => $aiPanelOpen.set(!isAIPanelOpen)}
              title="Generate with AI"
              style={{ padding: "4px 14px", borderRadius: 6, border: `1px solid ${isAIPanelOpen ? "rgba(167,139,250,0.6)" : "rgba(124,58,237,0.4)"}`, background: isAIPanelOpen ? "rgba(124,58,237,0.3)" : "linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(79,70,229,0.16) 100%)", color: C.accentText, fontSize: 12, fontFamily: C.font, cursor: "pointer", fontWeight: 700 }}
            >
              {t.builder.generate}
            </button>
          </>
        )}
      </div>

      <SaveProjectDialog
        isOpen={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        isDemo={!!isDemo}
        projectName={meta?.name || ""}
        onUpdate={handleUpdate}
        onCreate={handleCreate}
        onSaveAs={handleSaveAs}
      />
    </>
  );
}
