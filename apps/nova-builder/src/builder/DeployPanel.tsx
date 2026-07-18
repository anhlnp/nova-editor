"use client";
import { useState, useRef, useEffect } from "react";
import { UI_VARS as C } from "@/lib/uiTheme";


type DeployProvider = "vercel" | "netlify" | "cloudflare";

export function DeployPanel({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const [provider, setProvider] = useState<DeployProvider>("vercel");
  const [form, setForm] = useState({ token: "", repoFullName: "", branch: "main", siteId: "", accountId: "", projectName: "" });
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    const keyHandler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", keyHandler); };
  }, [onClose]);

  const deploy = async () => {
    setStatus("running");
    setMessage("");
    try {
      let body: Record<string, string> = { provider };
      if (provider === "vercel") body = { ...body, token: form.token, repoFullName: form.repoFullName, branch: form.branch };
      else if (provider === "netlify") body = { ...body, token: form.token, siteId: form.siteId };
      else body = { ...body, token: form.token, accountId: form.accountId, projectName: form.projectName };

      const res = await fetch(`/api/projects/${projectId}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json() as { ok: boolean; deployUrl?: string; error?: string };
      if (data.ok) { setStatus("done"); setMessage(data.deployUrl ? `Deployed: ${data.deployUrl}` : "Deployment triggered!"); }
      else { setStatus("error"); setMessage(data.error ?? "Deploy failed"); }
    } catch (err) { setStatus("error"); setMessage(String(err)); }
  };

  const field = (label: string, key: keyof typeof form, placeholder = "") => (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: C.font, fontWeight: 600, letterSpacing: "0.05em" }}>{label}</label>
      <input
        type={key === "token" ? "password" : "text"}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, color: "#e5e7eb", fontSize: 13, fontFamily: "monospace", padding: "4px 8px", outline: "none" }}
      />
    </div>
  );

  return (
    <div ref={panelRef} style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, width: 300, background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 14, zIndex: 200, display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#e5e7eb", fontFamily: C.font }}>Deploy Project</div>

      <div style={{ display: "flex", gap: 4 }}>
        {(["vercel", "netlify", "cloudflare"] as DeployProvider[]).map((p) => (
          <button key={p} onClick={() => setProvider(p)} style={{ flex: 1, padding: "3px 0", fontSize: 12, fontFamily: C.font, fontWeight: 600, borderRadius: 4, border: `1px solid ${provider === p ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.1)"}`, background: provider === p ? "rgba(124,58,237,0.15)" : "transparent", color: provider === p ? "#c4b5fd" : "rgba(255,255,255,0.4)", cursor: "pointer", textTransform: "capitalize" }}>
            {p === "cloudflare" ? "CF Pages" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {field("API Token", "token", provider === "vercel" ? "v_…" : provider === "netlify" ? "nfp_…" : "CF API token")}
      {provider === "vercel" && field("GitHub Repo", "repoFullName", "owner/repo")}
      {provider === "vercel" && field("Branch", "branch", "main")}
      {provider === "netlify" && field("Site ID", "siteId", "xxxxxxxx-xxxx-…")}
      {provider === "cloudflare" && field("Account ID", "accountId", "abcd1234…")}
      {provider === "cloudflare" && field("Project Name", "projectName", "my-site")}

      {status !== "idle" && (
        <div style={{ fontSize: 13, fontFamily: C.font, color: status === "error" ? "#f87171" : status === "done" ? "#6ee7b7" : "#a78bfa", wordBreak: "break-all" }}>
          {status === "running" ? "Deploying…" : message}
        </div>
      )}

      <button
        onClick={deploy}
        disabled={status === "running"}
        style={{ padding: "6px 0", borderRadius: 5, border: "none", background: status === "running" ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.8)", color: "#fff", fontSize: 12, fontFamily: C.font, fontWeight: 600, cursor: status === "running" ? "default" : "pointer" }}
      >
        {status === "running" ? "Deploying…" : "Deploy →"}
      </button>
    </div>
  );
}
