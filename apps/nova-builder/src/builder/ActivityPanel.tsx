"use client";
import { useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { $projectMeta } from "@/lib/data-stores";
import { UI_VARS as C } from "@/lib/uiTheme";


type ActivityEvent = {
  id: string;
  action: string;
  meta: Record<string, unknown> | null;
  created_at: string;
  user_id: string;
};

const ACTION_ICON: Record<string, string> = {
  save: "💾",
  ai_compose: "✦",
  snapshot: "⏱",
  deploy: "🚀",
  github_push: "⇡",
  restore: "↩",
  comment: "💬",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function actionLabel(action: string, meta: Record<string, unknown> | null): string {
  const labels: Record<string, string> = {
    save: "Project saved",
    ai_compose: "AI composition applied",
    snapshot: meta?.label ? `Snapshot: ${meta.label}` : "Snapshot saved",
    deploy: `Deployed to ${meta?.provider ?? "platform"}`,
    github_push: `Pushed to GitHub (${meta?.branch ?? "main"})`,
    restore: "Restored from snapshot",
    comment: "Comment added",
  };
  return labels[action] ?? action;
}

export function ActivityPanel({ projectId }: { projectId: string }) {
  const meta = useStore($projectMeta);
  const pid = projectId || meta?.id;
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!pid) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${pid}/activity`);
      const json = await res.json() as { events?: ActivityEvent[] };
      setEvents(json.events ?? []);
    } finally {
      setLoading(false);
    }
  }, [pid]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: C.font }}>
      <div style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Recent activity</span>
        <button onClick={load} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, padding: 0 }}>↻</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading && <div style={{ padding: "10px 12px", color: C.textMuted, fontSize: 13 }}>Loading…</div>}
        {!loading && events.length === 0 && (
          <div style={{ padding: "16px 12px", color: C.textMuted, fontSize: 13, textAlign: "center" }}>
            No activity recorded yet. Actions like saves, deploys, and AI ops appear here.
          </div>
        )}
        {events.map((ev) => (
          <div key={ev.id} style={{ padding: "7px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ fontSize: 14, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>{ACTION_ICON[ev.action] ?? "•"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>{actionLabel(ev.action, ev.meta)}</div>
              <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>{timeAgo(ev.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
