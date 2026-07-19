"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@nanostores/react";
import { $breakpoints, $instances } from "@/lib/data-stores";
import {
  $selectedBreakpointId, $selectedBreakpoint,
  $selectedInstanceId, $selectedInstanceSelector, $clipboard,
  $brandingLogo, $brandingName, $nestingWarning,
} from "@/lib/nano-states";
import { updateData, replaceMap } from "@/lib/transactions";
import { deleteInstance, duplicateInstance, pasteInstance } from "@/lib/edit-operations";
import { BreakpointManager } from "./BreakpointManager";
import { BreakpointPill } from "./BreakpointPills";
import { TopbarActions } from "./TopbarActions";
import { LogoIcon } from "@/components/LogoIcon";
import { useI18n } from "@/lib/i18n";
import { UI_VARS as C } from "@/lib/uiTheme";


export function Topbar({ isDemo }: { isDemo?: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const breakpoints = useStore($breakpoints);
  const activeBreakpoint = useStore($selectedBreakpoint);
  const selectedId = useStore($selectedInstanceId);
  const clipboard = useStore($clipboard);
  const brandingLogo = useStore($brandingLogo);
  const brandingName = useStore($brandingName);

  const [bpManagerOpen, setBpManagerOpen] = useState(false);

  const handleCopy = useCallback(() => {
    if (!selectedId) return;
    $clipboard.set({ instances: new Map($instances.get()), rootId: selectedId });
  }, [selectedId]);

  const handlePaste = useCallback(() => {
    const cb = $clipboard.get();
    if (!cb) return;
    const result = pasteInstance(cb, $selectedInstanceId.get(), $instances.get());
    if (result?.violation) {
      $nestingWarning.set(result.violation.message);
    } else if (result?.updated) {
      updateData(({ instances, props }) => {
        replaceMap(instances, result.updated);
        if (result.clonedProps) for (const [id, p] of result.clonedProps) props.set(id, p);
      });
      $selectedInstanceSelector.set([result.newRootId]);
    }
  }, []);

  const handleDuplicate = useCallback(() => {
    if (!selectedId) return;
    const result = duplicateInstance(selectedId, $instances.get());
    if (result) {
      updateData(({ instances }) => replaceMap(instances, result.updated));
      $selectedInstanceSelector.set([result.newRootId]);
    }
  }, [selectedId]);

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    const { updated, deleted } = deleteInstance(selectedId, $instances.get());
    if (deleted) {
      updateData(({ instances }) => replaceMap(instances, updated));
      $selectedInstanceSelector.set(undefined);
    }
  }, [selectedId]);

  const sortedBreakpoints = [...breakpoints.values()].sort((a, b) => {
    const aMax = a.maxWidth ?? Infinity;
    const bMax = b.maxWidth ?? Infinity;
    return bMax - aMax;
  });

  return (
    <div style={{ gridArea: "topbar", height: 44, background: C.bg, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 10px", gap: 6, fontFamily: C.font, flexShrink: 0, zIndex: 10 }}>
      {/* Left: back + site name */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, flexShrink: 0 }}>
        <button onClick={() => router.push("/projects")} title={t.builder.backToMySites} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontSize: 16, padding: "2px 5px", lineHeight: 1, borderRadius: 4 }}>←</button>
        {brandingLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brandingLogo} alt={brandingName || "Logo"} style={{ height: 24, objectFit: "contain", flexShrink: 0 }} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <LogoIcon width={20} height={20} />
            <span style={{ fontSize: 13, fontWeight: 800, color: "#a78bfa", letterSpacing: "-0.02em", flexShrink: 0 }}>{brandingName || "Nova"}</span>
          </div>
        )}
      </div>

      {/* Edit toolbar: copy / paste / duplicate / delete */}
      <div style={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, marginLeft: 4 }}>
        {(
          [
            { label: "⎘", title: t.builder.copyTooltip, onClick: handleCopy, disabled: !selectedId },
            { label: "⧉", title: t.builder.pasteTooltip, onClick: handlePaste, disabled: !clipboard },
            { label: "⊕", title: t.builder.duplicateTooltip, onClick: handleDuplicate, disabled: !selectedId },
            { label: "⌫", title: t.builder.deleteTooltip, onClick: handleDelete, disabled: !selectedId, danger: true },
          ] as Array<{ label: string; title: string; onClick: () => void; disabled: boolean; danger?: boolean }>
        ).map(({ label, title, onClick, disabled, danger }) => (
          <button key={title} onClick={onClick} disabled={disabled} title={title} style={{ background: "none", border: "none", cursor: disabled ? "default" : "pointer", color: disabled ? "rgba(255,255,255,0.18)" : danger ? "rgba(248,113,113,0.75)" : "rgba(255,255,255,0.45)", fontSize: 13, padding: "3px 7px", borderRadius: 4, lineHeight: 1, fontFamily: C.font, transition: "color 0.1s" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Center: responsive breakpoints + manage ⚙ */}
      <div style={{ display: "flex", alignItems: "center", gap: 3, position: "relative" }}>
        {sortedBreakpoints.map((bp) => (
          <BreakpointPill key={bp.id} bp={bp} active={bp.id === activeBreakpoint?.id} onClick={() => $selectedBreakpointId.set(bp.id)} />
        ))}
        <button onClick={() => setBpManagerOpen((v) => !v)} title={t.builder.manageBreakpoints} style={{ background: bpManagerOpen ? "rgba(124,58,237,0.15)" : "none", border: `1px solid ${bpManagerOpen ? "rgba(124,58,237,0.4)" : "transparent"}`, cursor: "pointer", color: bpManagerOpen ? "#c4b5fd" : "rgba(255,255,255,0.3)", fontSize: 13, lineHeight: 1, padding: "3px 6px", borderRadius: 4, fontFamily: C.font, transition: "all 0.1s" }}>⚙</button>
        {bpManagerOpen && <BreakpointManager onClose={() => setBpManagerOpen(false)} />}
      </div>

      <div style={{ flex: 1 }} />

      {/* Right: zoom + actions (extracted) */}
      <TopbarActions isDemo={isDemo} />
    </div>
  );
}
