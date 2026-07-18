"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { UI_VARS as C } from "@/lib/uiTheme";
const BAR = "rgba(124,58,237,0.6)";
const BAR_BG = "rgba(255,255,255,0.05)";

type DaySeries = { date: string; count: number };
type TopPage = { path: string; count: number };
type Devices = { mobile: number; tablet: number; desktop: number };
type TopReferrer = { referrer: string; count: number };

type Stats = {
  totalViews: number;
  days: number;
  daySeries: DaySeries[];
  topPages: TopPage[];
  devices: Devices;
  topReferrers: TopReferrer[];
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px" }}>
      <div style={{ fontSize: 13, color: C.textMuted, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.text, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: C.textMuted, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function BarChart({ series }: { series: DaySeries[] }) {
  const max = Math.max(...series.map((d) => d.count), 1);
  const formatDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00Z");
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };
  // Show at most 14 labels to avoid crowding
  const step = series.length > 14 ? Math.ceil(series.length / 14) : 1;

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 80, width: "100%" }}>
      {series.map((d, i) => {
        const height = Math.max(2, Math.round((d.count / max) * 80));
        const showLabel = i % step === 0 || i === series.length - 1;
        return (
          <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 0 }}>
            <div title={`${formatDate(d.date)}: ${d.count} views`}
              style={{ width: "100%", height, background: d.count > 0 ? BAR : BAR_BG, borderRadius: 2, transition: "height 0.2s" }} />
            {showLabel && (
              <div style={{ fontSize: 9, color: C.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%", textAlign: "center" }}>
                {formatDate(d.date)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DevicePie({ devices }: { devices: Devices }) {
  const total = (devices.mobile ?? 0) + (devices.tablet ?? 0) + (devices.desktop ?? 0);
  const pct = (n: number) => total === 0 ? 0 : Math.round((n / total) * 100);
  const bars: { label: string; value: number; color: string }[] = [
    { label: "Desktop", value: pct(devices.desktop), color: C.accent },
    { label: "Mobile",  value: pct(devices.mobile),  color: "#06b6d4" },
    { label: "Tablet",  value: pct(devices.tablet),  color: "#8b5cf6" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {bars.map((b) => (
        <div key={b.label}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: C.textDim }}>{b.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{b.value}%</span>
          </div>
          <div style={{ height: 6, background: BAR_BG, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${b.value}%`, background: b.color, borderRadius: 3, transition: "width 0.4s" }} />
          </div>
        </div>
      ))}
      {total === 0 && <div style={{ fontSize: 13, color: C.textMuted }}>No data yet</div>}
    </div>
  );
}

function TopTable({ rows, keyCol, valLabel }: {
  rows: Array<{ key: string; count: number }>;
  keyCol: string;
  valLabel: string;
}) {
  if (rows.length === 0) return <div style={{ fontSize: 13, color: C.textMuted }}>No data yet</div>;
  const max = rows[0].count;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((r) => (
        <div key={r.key}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 12, color: C.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "78%" }}
              title={r.key}>{r.key}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.text, flexShrink: 0, marginLeft: 8 }}>{r.count}</span>
          </div>
          <div style={{ height: 3, background: BAR_BG, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.round((r.count / max) * 100)}%`, background: BAR, borderRadius: 2 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/${projectId}?days=${days}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as Stats;
      setStats(json);
    } catch (err) { setError(String(err)); }
    finally { setLoading(false); }
  }, [projectId, days]);

  useEffect(() => { load(); }, [load]);

  const topPageRows = (stats?.topPages ?? []).map((p) => ({ key: p.path, count: p.count }));
  const topRefRows  = (stats?.topReferrers ?? []).map((r) => ({ key: r.referrer, count: r.count }));

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "28px 32px", fontFamily: C.font, color: C.text }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button onClick={() => router.push("/projects")}
            style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18 }}>
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Analytics</h1>
          <div style={{ flex: 1 }} />
          {/* Period selector */}
          <div style={{ display: "flex", gap: 4 }}>
            {([7, 30, 90] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                style={{
                  padding: "4px 12px", borderRadius: 5, border: `1px solid ${days === d ? "rgba(124,58,237,0.5)" : C.border}`,
                  background: days === d ? "rgba(124,58,237,0.12)" : "transparent",
                  color: days === d ? "#c4b5fd" : C.textMuted,
                  fontSize: 12, fontFamily: C.font, cursor: "pointer", fontWeight: days === d ? 600 : 400,
                }}
              >{d}d</button>
            ))}
            <button onClick={load} style={{ padding: "4px 10px", borderRadius: 5, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 12, fontFamily: C.font, cursor: "pointer" }}>↻</button>
          </div>
        </div>

        {error && (
          <div style={{ color: "#f87171", fontSize: 12, marginBottom: 20 }}>{error}</div>
        )}

        {loading && !stats && (
          <div style={{ color: C.textMuted, fontSize: 13 }}>Loading analytics…</div>
        )}

        {stats && (
          <>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              <StatCard label={`TOTAL VIEWS (${days}d)`} value={stats.totalViews.toLocaleString()} />
              <StatCard label="TOP PAGE" value={stats.topPages[0]?.path ?? "—"} sub={stats.topPages[0] ? `${stats.topPages[0].count} views` : undefined} />
              <StatCard label="MOST COMMON DEVICE"
                value={
                  Object.entries(stats.devices).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"
                }
                sub={`${Math.round(((Object.entries(stats.devices).sort((a, b) => b[1] - a[1])[0]?.[1] ?? 0) / (stats.totalViews || 1)) * 100)}% of views`}
              />
            </div>

            {/* Views over time */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textDim, marginBottom: 14 }}>VIEWS OVER TIME</div>
              <BarChart series={stats.daySeries} />
            </div>

            {/* Bottom grid: Top Pages + Devices + Referrers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textDim, marginBottom: 16 }}>TOP PAGES</div>
                <TopTable rows={topPageRows} keyCol="path" valLabel="Views" />
              </div>

              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textDim, marginBottom: 16 }}>DEVICES</div>
                <DevicePie devices={stats.devices} />
              </div>

              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textDim, marginBottom: 16 }}>TOP REFERRERS</div>
                <TopTable rows={topRefRows} keyCol="referrer" valLabel="Views" />
              </div>
            </div>

            {stats.totalViews === 0 && (
              <div style={{ marginTop: 24, padding: "20px", background: "rgba(124,58,237,0.06)", border: `1px solid rgba(124,58,237,0.15)`, borderRadius: 10, textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>No views yet</div>
                <div style={{ fontSize: 13, color: C.textMuted }}>
                  Share your preview link to start collecting analytics. Views are recorded when visitors open your published preview.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
