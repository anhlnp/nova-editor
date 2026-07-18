"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { UI_VARS as C } from "@/lib/uiTheme";

type Submission = {
  id: string;
  form_name: string;
  fields: Record<string, string>;
  ip: string | null;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

export default function SubmissionsPage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formFilter, setFormFilter] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = formFilter ? `?formName=${encodeURIComponent(formFilter)}` : "";
      const res = await fetch(`/api/projects/${projectId}/submissions${qs}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as { submissions: Submission[] };
      setSubmissions(json.submissions);
    } catch (err) { setError(String(err)); }
    finally { setLoading(false); }
  }, [projectId, formFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/projects/${projectId}/submissions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setSubmissions((s) => s.filter((x) => x.id !== id));
    } finally { setDeleting(null); }
  };

  const allKeys = [...new Set(submissions.flatMap((s) => Object.keys(s.fields)))];
  const formNames = [...new Set(submissions.map((s) => s.form_name))];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "28px 32px", fontFamily: C.font, color: C.text }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => router.push("/projects")}
            style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18 }}>
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Form Submissions</h1>
          <div style={{ flex: 1 }} />
          {submissions.length > 0 && (
            <a
              href={`/api/projects/${projectId}/submissions?format=csv${formFilter ? `&formName=${encodeURIComponent(formFilter)}` : ""}`}
              download
              style={{
                padding: "5px 14px", borderRadius: 5,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent", color: C.textDim,
                fontSize: 12, textDecoration: "none", fontWeight: 600,
              }}
            >
              ↓ Export CSV
            </a>
          )}
        </div>

        {/* Form filter pills */}
        {formNames.length > 1 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
            {["", ...formNames].map((f) => (
              <button key={f || "_all"} onClick={() => setFormFilter(f)}
                style={{
                  padding: "3px 12px", borderRadius: 20, fontSize: 13,
                  border: `1px solid ${formFilter === f ? "rgba(124,58,237,0.5)" : C.border}`,
                  background: formFilter === f ? "rgba(124,58,237,0.12)" : "transparent",
                  color: formFilter === f ? "#c4b5fd" : C.textMuted,
                  cursor: "pointer", fontWeight: formFilter === f ? 600 : 400,
                }}>
                {f || "All forms"}
              </button>
            ))}
          </div>
        )}

        {error && <div style={{ color: C.danger, fontSize: 12, marginBottom: 16 }}>{error}</div>}
        {loading && <div style={{ color: C.textMuted, fontSize: 13 }}>Loading…</div>}

        {!loading && submissions.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.25 }}>◧</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>No submissions yet</div>
            <div style={{ fontSize: 13, color: C.textMuted }}>
              Form submissions will appear here when visitors submit forms on your published site.
            </div>
          </div>
        )}

        {!loading && submissions.length > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(255,255,255,0.02)" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: C.textMuted, fontWeight: 600, whiteSpace: "nowrap" }}>Date</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: C.textMuted, fontWeight: 600 }}>Form</th>
                    {allKeys.map((k) => (
                      <th key={k} style={{ padding: "10px 14px", textAlign: "left", color: C.textMuted, fontWeight: 600, whiteSpace: "nowrap" }}>{k}</th>
                    ))}
                    <th style={{ padding: "10px 14px", width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "10px 14px", color: C.textDim, whiteSpace: "nowrap" }}>{formatDate(s.created_at)}</td>
                      <td style={{ padding: "10px 14px", color: C.textDim }}>{s.form_name}</td>
                      {allKeys.map((k) => (
                        <td key={k} style={{ padding: "10px 14px", color: C.text, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.fields[k] ?? "—"}
                        </td>
                      ))}
                      <td style={{ padding: "10px 8px", textAlign: "center" }}>
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={deleting === s.id}
                          style={{ background: "none", border: "none", color: deleting === s.id ? C.textMuted : C.danger, cursor: "pointer", fontSize: 14, padding: "2px 6px" }}
                          title="Delete submission"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "10px 14px", fontSize: 13, color: C.textMuted, borderTop: `1px solid ${C.border}` }}>
              {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
