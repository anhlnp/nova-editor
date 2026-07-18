"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UI_VARS as C } from "@/lib/uiTheme";


type Prefs = Record<string, boolean>;

const NOTIFICATION_TYPES = [
  { key: "publish", label: "Project published", description: "When a project preview is published or shared" },
  { key: "ai_complete", label: "AI generation complete", description: "When AI finishes generating content for a page" },
  { key: "form_submission", label: "New form submission", description: "When a visitor submits a form on your site" },
  { key: "comment", label: "New comment", description: "When a collaborator adds a comment to a project" },
  { key: "team_invite", label: "Team invitations", description: "When you are invited to a team workspace" },
  { key: "billing", label: "Billing & invoices", description: "Receipts, plan changes, and credit alerts" },
  { key: "tips", label: "Product tips & updates", description: "Nova feature announcements and how-to guides" },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings/notifications")
      .then((r) => r.json())
      .then((json: Prefs) => setPrefs(json))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: string) => setPrefs((p) => ({ ...p, [key]: !(p[key] ?? true) }));

  const save = async () => {
    await fetch("/api/settings/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "28px 32px", fontFamily: C.font, color: C.text }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button onClick={() => router.push("/projects")}
            style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18 }}>
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Notification Preferences</h1>
        </div>

        {loading ? (
          <div style={{ color: C.textMuted, fontSize: 13 }}>Loading…</div>
        ) : (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
              {NOTIFICATION_TYPES.map((n, i) => (
                <div
                  key={n.key}
                  style={{
                    display: "flex", alignItems: "center", padding: "14px 16px", gap: 12,
                    borderBottom: i < NOTIFICATION_TYPES.length - 1 ? `1px solid ${C.border}` : "none",
                    cursor: "pointer",
                  }}
                  onClick={() => toggle(n.key)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>{n.label}</div>
                    <div style={{ fontSize: 13, color: C.textMuted }}>{n.description}</div>
                  </div>
                  <div
                    style={{
                      width: 36, height: 20, borderRadius: 10, flexShrink: 0,
                      background: (prefs[n.key] ?? true) ? "rgba(124,58,237,0.8)" : "rgba(255,255,255,0.1)",
                      transition: "background 0.2s", position: "relative",
                    }}
                  >
                    <div style={{
                      position: "absolute", top: 2, left: (prefs[n.key] ?? true) ? 18 : 2,
                      width: 16, height: 16, borderRadius: "50%", background: "#fff",
                      transition: "left 0.15s",
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={save}
              style={{
                padding: "8px 24px", borderRadius: 6, border: "none",
                background: saved ? "rgba(5,150,105,0.8)" : "rgba(124,58,237,0.8)",
                color: "#fff", fontSize: 12, fontFamily: C.font, cursor: "pointer", fontWeight: 600,
              }}
            >
              {saved ? "✓ Saved!" : "Save Preferences"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
