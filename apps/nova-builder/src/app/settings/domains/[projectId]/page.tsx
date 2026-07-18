"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { UI_VARS as C } from "@/lib/uiTheme";

type Domain = {
  id: string;
  domain: string;
  verify_token: string;
  status: string;
  ssl_status: string;
  verified_at: string | null;
};

const STATUS_COLOR: Record<string, string> = {
  pending: C.warning, verified: C.success, ssl_active: C.success, error: C.danger,
};

export default function DomainsPage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/domains`);
      if (res.status === 403) { setError("Access denied"); return; }
      const json = await res.json() as { domains: Domain[] };
      setDomains(json.domains);
    } finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    setAdding(true); setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/domains`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed"); return; }
      setNewDomain("");
      setDomains((d) => [json.domain, ...d]);
    } finally { setAdding(false); }
  };

  const verify = async (id: string) => {
    setVerifying(id);
    try {
      await fetch(`/api/projects/${projectId}/domains`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await load();
    } finally { setVerifying(null); }
  };

  const remove = async (id: string) => {
    await fetch(`/api/projects/${projectId}/domains`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDomains((d) => d.filter((x) => x.id !== id));
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "28px 32px", fontFamily: C.font, color: C.text }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => router.push("/projects")} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18 }}>←</button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Custom Domains</h1>
        </div>

        {/* Add domain */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, letterSpacing: "0.05em", marginBottom: 10 }}>ADD A DOMAIN</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") add(); }}
              placeholder="www.example.com"
              style={{ flex: 1, padding: "7px 10px", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 12, fontFamily: C.mono, outline: "none" }}
            />
            <button onClick={add} disabled={adding || !newDomain.trim()}
              style={{ padding: "7px 16px", borderRadius: 6, border: "none", background: "rgba(124,58,237,0.8)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
              {adding ? "Adding…" : "Add Domain"}
            </button>
          </div>
          {error && <div style={{ color: C.danger, fontSize: 13, marginTop: 8 }}>{error}</div>}
        </div>

        {loading && <div style={{ color: C.textMuted, fontSize: 13 }}>Loading…</div>}

        {!loading && domains.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted, fontSize: 13 }}>
            No custom domains yet. Add one above to connect your own URL.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {domains.map((d) => (
            <div key={d.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: C.mono, flex: 1 }}>{d.domain}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLOR[d.status] ?? C.textMuted, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 20, padding: "2px 10px", textTransform: "uppercase" }}>
                  {d.status}
                </span>
                {d.ssl_status !== "none" && (
                  <span style={{ fontSize: 12, color: d.ssl_status === "active" ? C.success : C.warning }}>🔒 {d.ssl_status}</span>
                )}
              </div>

              {d.status !== "verified" && d.status !== "ssl_active" && (
                <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, color: C.textDim, marginBottom: 8 }}>Add these DNS records at your registrar, then click Verify:</div>
                  <div style={{ fontSize: 12, fontFamily: C.mono, color: C.textMuted, lineHeight: 1.7 }}>
                    <div><span style={{ color: C.textDim }}>CNAME</span> {d.domain} → cname.nova.build</div>
                    <div><span style={{ color: C.textDim }}>TXT</span> _nova-verify.{d.domain} → {d.verify_token}</div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                {d.status !== "verified" && d.status !== "ssl_active" && (
                  <button onClick={() => verify(d.id)} disabled={verifying === d.id}
                    style={{ padding: "5px 14px", borderRadius: 5, border: "none", background: "rgba(5,150,105,0.7)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    {verifying === d.id ? "Verifying…" : "Verify DNS"}
                  </button>
                )}
                <button onClick={() => remove(d.id)}
                  style={{ padding: "5px 14px", borderRadius: 5, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 13, cursor: "pointer" }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
