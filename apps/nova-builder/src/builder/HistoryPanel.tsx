"use client";
import { useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { $projectMeta } from "@/lib/data-stores";
import { $historyPanelOpen } from "@/lib/nano-states";
import { UI_VARS as C } from "@/lib/uiTheme";


type Snapshot = { id: string; label: string | null; created_at: string };

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function HistoryPanel() {
  const isOpen = useStore($historyPanelOpen);
  const meta = useStore($projectMeta);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [restoring, setRestoring] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    if (!meta?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${meta.id}/snapshots`);
      const json = await res.json() as { snapshots?: Snapshot[] };
      setSnapshots(json.snapshots ?? []);
    } finally {
      setLoading(false);
    }
  }, [meta?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") $historyPanelOpen.set(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  if (!isOpen) return null;

  const saveSnapshot = async () => {
    if (!meta?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${meta.id}/snapshots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel.trim() || null }),
      });
      if (res.ok) { setNewLabel(""); setMessage({ type: "ok", text: "Snapshot saved" }); load(); }
      else setMessage({ type: "err", text: "Failed to save" });
    } finally {
      setSaving(false);
    }
    setTimeout(() => setMessage(null), 2500);
  };

  const restore = async (snapId: string) => {
    if (!meta?.id) return;
    if (!window.confirm("Restore this snapshot? Current version will be saved as a checkpoint.")) return;
    setRestoring(snapId);
    try {
      const res = await fetch(`/api/projects/${meta.id}/snapshots/${snapId}/restore`, { method: "POST" });
      if (res.ok) {
        setMessage({ type: "ok", text: "Restored. Reload to see changes." });
        load();
      } else setMessage({ type: "err", text: "Restore failed" });
    } finally {
      setRestoring(null);
    }
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div role="dialog" aria-label="Version History"
      style={{ position: "fixed", top: 52, right: 296, width: 340, maxHeight: "70vh", zIndex: 100, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", fontFamily: C.font, overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#c4b5fd" }}>⏱ Version History</span>
        <button onClick={() => $historyPanelOpen.set(false)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18, padding: "2px 4px" }}>×</button>
      </div>
      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Snapshot label (optional)"
            onKeyDown={(e) => { if (e.key === "Enter") saveSnapshot(); }}
            style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 5, color: C.text, fontSize: 13, fontFamily: C.font, padding: "5px 9px", outline: "none" }}
          />
          <button onClick={saveSnapshot} disabled={saving}
            style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid rgba(124,58,237,0.4)", background: "rgba(124,58,237,0.15)", color: "#c4b5fd", fontSize: 13, fontFamily: C.font, fontWeight: 700, cursor: saving ? "default" : "pointer" }}>
            {saving ? "…" : "Save"}
          </button>
        </div>
        {message && (
          <div style={{ marginTop: 6, fontSize: 12, color: message.type === "ok" ? "#6ee7b7" : "#fca5a5" }}>{message.text}</div>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {loading && <div style={{ padding: "12px 14px", color: C.textMuted, fontSize: 13 }}>Loading…</div>}
        {!loading && snapshots.length === 0 && (
          <div style={{ padding: "16px 14px", color: C.textMuted, fontSize: 13, textAlign: "center" }}>
            No snapshots yet. Save one to start tracking history.
          </div>
        )}
        {snapshots.map((snap) => (
          <div key={snap.id} style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: C.text, fontWeight: snap.label ? 600 : 400 }}>
                {snap.label || <span style={{ color: C.textMuted, fontStyle: "italic" }}>Unnamed snapshot</span>}
              </div>
              <div style={{ fontSize: 9, color: C.textMuted, marginTop: 1 }}>{formatDate(snap.created_at)}</div>
            </div>
            <button
              onClick={() => restore(snap.id)}
              disabled={restoring === snap.id}
              style={{ padding: "3px 9px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: C.textMuted, fontSize: 12, fontFamily: C.font, cursor: restoring === snap.id ? "default" : "pointer" }}
            >
              {restoring === snap.id ? "…" : "Restore"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
