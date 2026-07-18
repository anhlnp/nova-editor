"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UI_VARS as C } from "@/lib/uiTheme";


type User = {
  id: string;
  email: string;
  tier: string;
  role: string;
  credits: number;
  created_at: string;
};

const TIERS = ["free", "pro", "team", "enterprise"];
const ROLES = ["user", "admin"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "short" });
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ tier: string; role: string; credits: number }>({ tier: "free", role: "user", credits: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = search ? `?q=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/users${qs}`);
      if (res.status === 403) { setError("Access denied — admin only"); return; }
      const json = await res.json() as { users: User[]; total: number };
      setUsers(json.users);
      setTotal(json.total);
    } catch (err) { setError(String(err)); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const startEdit = (u: User) => {
    setEditing(u.id);
    setEditData({ tier: u.tier, role: u.role, credits: u.credits });
  };

  const saveEdit = async (userId: string) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...editData }),
    });
    setEditing(null);
    load();
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "28px 32px", fontFamily: C.font, color: C.text }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => router.push("/projects")}
            style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18 }}>
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Admin Console</h1>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => router.push("/admin/flags")}
            style={{ padding: "5px 14px", borderRadius: 5, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 13, cursor: "pointer", fontFamily: C.font, fontWeight: 600 }}
          >
            Feature Flags →
          </button>
        </div>

        {error && <div style={{ color: C.danger, fontSize: 12, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, padding: "7px 12px", background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 6, color: C.text, fontSize: 12, fontFamily: C.font, outline: "none",
            }}
          />
          <button onClick={load} style={{ padding: "7px 16px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 12, fontFamily: C.font, cursor: "pointer" }}>
            Search
          </button>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontSize: 13, color: C.textMuted }}>
            {total} user{total !== 1 ? "s" : ""}
          </div>
          {loading && <div style={{ padding: 16, color: C.textMuted, fontSize: 13 }}>Loading…</div>}
          {!loading && users.map((u) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", padding: "12px 14px", borderBottom: `1px solid ${C.border}`, gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{u.email}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Joined {formatDate(u.created_at)}</div>
              </div>

              {editing === u.id ? (
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <select value={editData.tier} onChange={(e) => setEditData((d) => ({ ...d, tier: e.target.value }))}
                    style={{ padding: "3px 6px", background: "#1e1e30", border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 13 }}>
                    {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={editData.role} onChange={(e) => setEditData((d) => ({ ...d, role: e.target.value }))}
                    style={{ padding: "3px 6px", background: "#1e1e30", border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 13 }}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <input type="number" value={editData.credits} onChange={(e) => setEditData((d) => ({ ...d, credits: parseInt(e.target.value, 10) || 0 }))}
                    style={{ width: 70, padding: "3px 6px", background: "#1e1e30", border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 13 }} />
                  <button onClick={() => saveEdit(u.id)} style={{ padding: "3px 10px", borderRadius: 4, border: "none", background: "rgba(5,150,105,0.7)", color: "#fff", fontSize: 13, cursor: "pointer" }}>Save</button>
                  <button onClick={() => setEditing(null)} style={{ padding: "3px 10px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#c4b5fd", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 20, padding: "2px 8px" }}>{u.tier}</span>
                  {u.role === "admin" && <span style={{ fontSize: 12, fontWeight: 600, color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 20, padding: "2px 8px" }}>admin</span>}
                  <span style={{ fontSize: 13, color: C.textMuted }}>{u.credits} cr</span>
                  <button onClick={() => startEdit(u)} style={{ padding: "3px 10px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 13, cursor: "pointer", fontFamily: C.font }}>Edit</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
