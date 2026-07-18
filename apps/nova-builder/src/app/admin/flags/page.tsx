"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UI_VARS as C } from "@/lib/uiTheme";


type Flag = {
  id: string;
  key: string;
  description: string;
  enabled: boolean;
  user_ids: string[];
  updated_at: string;
};

export default function FlagsPage() {
  const router = useRouter();
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/flags");
      if (res.status === 403) { setError("Access denied — admin only"); return; }
      const json = await res.json() as { flags: Flag[] };
      setFlags(json.flags);
    } catch (err) { setError(String(err)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (flag: Flag) => {
    await fetch("/api/admin/flags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: flag.id, enabled: !flag.enabled }),
    });
    setFlags((fs) => fs.map((f) => f.id === flag.id ? { ...f, enabled: !f.enabled } : f));
  };

  const create = async () => {
    if (!newKey.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKey.trim(), description: newDesc.trim() }),
      });
      const json = await res.json() as { flag: Flag };
      setFlags((fs) => [...fs, json.flag]);
      setNewKey("");
      setNewDesc("");
    } finally { setCreating(false); }
  };

  const remove = async (id: string) => {
    await fetch("/api/admin/flags", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setFlags((fs) => fs.filter((f) => f.id !== id));
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "28px 32px", fontFamily: C.font, color: C.text }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => router.push("/admin")}
            style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18 }}>
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Feature Flags</h1>
        </div>

        {error && <div style={{ color: C.danger, fontSize: 12, marginBottom: 16 }}>{error}</div>}

        {/* Create new flag */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 20, display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, display: "block", marginBottom: 4 }}>FLAG KEY</label>
            <input value={newKey} onChange={(e) => setNewKey(e.target.value.replace(/\s/g, "_"))}
              placeholder="feature_name"
              style={{ width: "100%", padding: "6px 8px", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 13, fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, display: "block", marginBottom: 4 }}>DESCRIPTION</label>
            <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
              placeholder="What does this flag control?"
              style={{ width: "100%", padding: "6px 8px", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 13, fontFamily: C.font, outline: "none", boxSizing: "border-box" }} />
          </div>
          <button onClick={create} disabled={creating || !newKey.trim()}
            style={{ padding: "6px 16px", borderRadius: 5, border: "none", background: "rgba(124,58,237,0.8)", color: "#fff", fontSize: 12, fontFamily: C.font, cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>
            {creating ? "Creating…" : "+ Add Flag"}
          </button>
        </div>

        {loading && <div style={{ color: C.textMuted, fontSize: 13 }}>Loading…</div>}

        {!loading && flags.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted, fontSize: 13 }}>No feature flags yet. Create one above.</div>
        )}

        {!loading && flags.length > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
            {flags.map((f, i) => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: 12, borderBottom: i < flags.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div
                  onClick={() => toggle(f)}
                  style={{
                    width: 36, height: 20, borderRadius: 10, flexShrink: 0, cursor: "pointer",
                    background: f.enabled ? "rgba(5,150,105,0.8)" : "rgba(255,255,255,0.1)",
                    position: "relative", transition: "background 0.2s",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 2, left: f.enabled ? 18 : 2,
                    width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.15s",
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "monospace" }}>{f.key}</div>
                  {f.description && <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{f.description}</div>}
                </div>
                <span style={{ fontSize: 12, color: f.enabled ? "#6ee7b7" : C.textMuted, fontWeight: 600 }}>
                  {f.enabled ? "ON" : "OFF"}
                </span>
                <button onClick={() => remove(f.id)}
                  style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 16, padding: "2px 6px" }}
                  title="Delete flag">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
