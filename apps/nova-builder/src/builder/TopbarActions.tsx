"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@nanostores/react";
import { $projectMeta } from "@/lib/data-stores";
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
} from "@/lib/nano-states";
import { DeployPanel } from "./DeployPanel";
import { CollaboratorAvatars } from "./PresenceLayer";
import { LangToggle } from "./LangToggle";
import { TopbarMenu } from "./TopbarMenu";
import { UI_VARS as C } from "@/lib/uiTheme";
import { useI18n } from "@/lib/i18n";
import { $saveStatus } from "@/lib/saveQueue";
import type { I18nBuilderDictionary } from "@/lib/i18n/types";

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
  onSave: () => void;
  isSaving: boolean;
  isDemo?: boolean;
};

export function TopbarActions({ onSave, isSaving, isDemo }: Props) {
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

  const [published, setPublished] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);

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

        {/* 1 — Mode pills: Design / Content / Preview */}
        <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, overflow: "hidden", flexShrink: 0 }}>
          {(["design", "content", "preview"] as const).map((m) => (
            <button
              key={m}
              onClick={() => $builderMode.set(m)}
              title={m === "design" ? "Design mode" : m === "content" ? "Content-edit mode" : "Preview mode"}
              style={{
                background: mode === m ? "rgba(124,58,237,0.18)" : "none",
                border: "none",
                borderRight: m !== "preview" ? "1px solid rgba(255,255,255,0.08)" : "none",
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

            {/* 5 — Save */}
            <button
              onClick={onSave}
              disabled={isSaving}
              style={{ padding: "4px 12px", borderRadius: 5, border: "none", background: isSaving ? "rgba(255,255,255,0.06)" : "rgba(5,150,105,0.85)", color: "#fff", fontSize: 12, fontFamily: C.font, cursor: isSaving ? "default" : "pointer", fontWeight: 600 }}
            >
              {isSaving ? t.builder.saving : t.builder.save}
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
    </>
  );
}
