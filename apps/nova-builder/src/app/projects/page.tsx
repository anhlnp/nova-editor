"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WelcomeCard } from "@/components/WelcomeCard";
import { useI18n } from "@/lib/i18n";
import { UI_VARS as C } from "@/lib/uiTheme";
import { UserDropdown } from "@/components/UserDropdown";

type Site = {
  id: string;
  name: string;
  updatedAt: string | null;
};

// EXAMPLES removed — sourced from t.landing.examples via useI18n() (OCP fix: single source of truth).


function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function SiteCard({ site, onOpen, onDelete, onAnalytics, onLeads, onClone, isCloning }: { site: Site; onOpen: () => void; onDelete: () => void; onAnalytics: () => void; onLeads: () => void; onClone: () => void; isCloning: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${hovered ? C.borderHover : C.border}`,
        borderRadius: 12,
        padding: "0 0 14px",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: hovered ? "0 4px 20px rgba(0,0,0,0.3)" : "none",
        cursor: "pointer",
        overflow: "hidden",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: "100%",
          height: 120,
          background: `linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(79,70,229,0.06) 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
          flexShrink: 0,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.2 }}>
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="white" strokeWidth="1.5" />
          <path d="M8 21h8M12 17v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M5 7h14M5 11h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          title={site.name}>
          {site.name}
        </div>
        <div style={{ fontSize: 13, color: C.textMuted }}>
          {site.updatedAt ? `Edited ${timeAgo(site.updatedAt)}` : "Never saved"}
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onOpen}
            style={{
              flex: 1, padding: "5px 0", borderRadius: 6, border: "none",
              background: C.accent, color: "#fff", fontSize: 13, fontFamily: C.font,
              fontWeight: 600, cursor: "pointer",
            }}
          >
            Edit
          </button>
          <button
            onClick={onAnalytics}
            title="View analytics"
            style={{
              padding: "5px 8px", borderRadius: 6, border: `1px solid ${C.border}`,
              background: "transparent", color: C.textMuted, fontSize: 13,
              fontFamily: C.font, cursor: "pointer",
            }}
          >
            ◑
          </button>
          <button
            onClick={onLeads}
            title="View form submissions"
            style={{
              padding: "5px 8px", borderRadius: 6, border: `1px solid ${C.border}`,
              background: "transparent", color: C.textMuted, fontSize: 13,
              fontFamily: C.font, cursor: "pointer",
            }}
          >
            ◧
          </button>
          <button
            onClick={onClone}
            disabled={isCloning}
            title="Duplicate site"
            style={{
              padding: "5px 8px", borderRadius: 6, border: `1px solid ${C.border}`,
              background: "transparent", color: C.textMuted, fontSize: 13,
              fontFamily: C.font, cursor: isCloning ? "default" : "pointer", opacity: isCloning ? 0.5 : 1,
            }}
          >
            ⊕
          </button>
          <button onClick={onDelete}
            title="Delete site"
            style={{
              padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
              background: "transparent", color: C.textMuted, fontSize: 13,
              fontFamily: C.font, cursor: "pointer", transition: "all 0.15s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.danger;
              e.currentTarget.style.color = "#ff8a8a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color = C.textMuted;
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

function NewSiteModal({ onCreate, onClose }: { onCreate: (prompt: string) => Promise<void>; onClose: () => void }) {
  const { t } = useI18n();
  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleCreate() {
    const trimmed = prompt.trim();
    setCreating(true);
    try {
      await onCreate(trimmed || "New site");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
    >
      <div style={{ width: 480, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, fontFamily: C.font }}>What should your site be about?</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.textMuted, fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        <p style={{ margin: 0, fontSize: 13, color: C.textMuted, fontFamily: C.font, lineHeight: 1.5 }}>
          Nova will build it with AI. You can edit any part visually afterwards.
        </p>

        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleCreate(); }}
          placeholder="e.g. A modern portfolio for a brand designer based in Tokyo…"
          rows={3}
          style={{ padding: "11px 14px", borderRadius: 9, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.05)", color: C.text, fontSize: 13, fontFamily: C.font, outline: "none", width: "100%", boxSizing: "border-box", resize: "vertical", lineHeight: 1.5 }}
        />

        {/* Example chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {t.landing.examples.map((ex) => (
            <button
              key={ex.label}
              onClick={() => { setPrompt(ex.prompt); textareaRef.current?.focus(); }}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 13, fontFamily: C.font, cursor: "pointer", transition: "all 0.12s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.borderHover; (e.currentTarget as HTMLElement).style.color = C.text; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.textMuted; }}
            >
              {ex.icon} {ex.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose}
            style={{ padding: "8px 16px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 12, fontFamily: C.font, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleCreate} disabled={creating}
            style={{ padding: "8px 22px", borderRadius: 7, border: "none", background: creating ? "rgba(124,58,237,0.5)" : C.accent, color: "#fff", fontSize: 13, fontFamily: C.font, fontWeight: 700, cursor: creating ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            {creating ? (
              <><span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />Building…</>
            ) : "Build with AI →"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function DeleteConfirmModal({ siteName, onConfirm, onClose }: { siteName: string; onConfirm: () => Promise<void>; onClose: () => void }) {
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleConfirm() {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
      onClose();
    }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
    >
      <div style={{ width: 400, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, fontFamily: C.font }}>Delete Project</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.textMuted, fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        <p style={{ margin: 0, fontSize: 13, color: C.textMuted, fontFamily: C.font, lineHeight: 1.5 }}>
          Are you sure you want to delete <strong style={{ color: C.text }}>&ldquo;{siteName}&rdquo;</strong>? This action cannot be undone.
        </p>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={onClose}
            style={{ padding: "8px 16px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 12, fontFamily: C.font, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={deleting}
            style={{ padding: "8px 22px", borderRadius: 7, border: "none", background: deleting ? "rgba(220,38,38,0.5)" : C.danger, color: "#fff", fontSize: 13, fontFamily: C.font, fontWeight: 700, cursor: deleting ? "default" : "pointer" }}>
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SitesPage() {
  const router = useRouter();
  const { t } = useI18n();
  const EXAMPLES = t.landing.examples;
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteSite, setDeleteSite] = useState<Site | null>(null);
  const [isFreeTier, setIsFreeTier] = useState(false);
  // M13 — search, clone, notifications
  const [search, setSearch] = useState("");
  const [cloning, setCloning] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [tokensCopied, setTokensCopied] = useState(false);

  useEffect(() => {
    fetch("/api/settings/account")
      .then((r) => r.json())
      .then((json: { tier?: string }) => { if (json.tier === "free") setIsFreeTier(true); })
      .catch(() => { });
  }, []);

  const loadSites = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const res = await fetch("/api/projects");
      if (res.status === 401) { router.push("/login"); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSites((await res.json()) as Site[]);
    } catch (err) {
      setPageError(String(err));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { loadSites(); }, [loadSites]);

  // Recover a prompt saved from the landing page
  useEffect(() => {
    const pending = sessionStorage.getItem("nova-pending-prompt");
    if (pending) {
      sessionStorage.removeItem("nova-pending-prompt");
      // Auto-open create modal pre-filled after sites load
      const timer = setTimeout(() => setShowCreate(true), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  async function handleCreate(prompt: string) {
    const name = prompt.slice(0, 48) + (prompt.length > 48 ? "…" : "");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || "New site" }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { id } = (await res.json()) as { id: string };
    if (prompt.trim()) sessionStorage.setItem("nova-pending-prompt", prompt.trim());
    setShowCreate(false);
    router.push(`/builder/${id}`);
  }

  async function handleDelete(siteId: string) {
    const res = await fetch(`/api/projects/${siteId}`, { method: "DELETE" });
    if (!res.ok) { alert("Failed to delete. Please try again."); return; }
    setSites((prev) => prev.filter((s) => s.id !== siteId));
  }

  async function handleClone(siteId: string) {
    if (cloning) return;
    setCloning(siteId);
    try {
      const res = await fetch(`/api/projects/${siteId}/clone`, { method: "POST" });
      if (!res.ok) { alert("Clone failed. Please try again."); return; }
      await loadSites();
    } catch (err) {
      console.error("Clone failed:", err);
      alert("Clone failed. Please try again.");
    } finally {
      setCloning(null);
    }
  }

  function handleShareTokens() {
    const vars = Object.fromEntries(
      Array.from(document.querySelectorAll<HTMLElement>("[data-theme]"))
        .flatMap((el) => {
          const style = getComputedStyle(el);
          return ["--ui-bg", "--ui-surface", "--ui-card", "--ui-border", "--ui-border-hover",
            "--ui-text", "--ui-text-muted", "--ui-accent", "--ui-accent-light", "--ui-danger",
            "--ui-success", "--ui-warning", "--ui-overlay"].map((v) => [v, style.getPropertyValue(v).trim()]);
        })
    );
    navigator.clipboard.writeText(JSON.stringify(vars, null, 2)).then(() => {
      setTokensCopied(true);
      setTimeout(() => setTokensCopied(false), 2000);
    });
  }

  const filteredSites = sites.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.font, color: C.text }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "0 28px", height: 54, display: "flex", alignItems: "center", gap: 10, background: C.bg }}>
        <Link href="/" style={{ fontSize: 14, fontWeight: 800, color: C.accentLight, letterSpacing: "-0.02em" }}>Nova</Link>
        <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 14 }}>/</span>
        <span style={{ fontSize: 13, color: C.text }}>My Sites</span>

        {/* Search */}
        <div style={{ position: "relative", marginLeft: 8 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.builder.searchSites}
            style={{
              padding: "5px 10px 5px 30px", borderRadius: 7, border: `1px solid ${C.border}`,
              background: "rgba(255,255,255,0.04)", color: C.text, fontSize: 13,
              fontFamily: C.font, outline: "none", width: 180,
            }}
          />
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 12, pointerEvents: "none" }}>⌕</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Share style tokens */}
        <button
          onClick={handleShareTokens}
          title={t.builder.shareTokens}
          style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: tokensCopied ? C.success : C.textMuted, fontSize: 13, fontFamily: C.font, cursor: "pointer", flexShrink: 0 }}
        >
          {tokensCopied ? t.builder.shareTokensCopied : "{}"}
        </button>

        {/* Notification bell */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            title={t.builder.notifications}
            style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 14, fontFamily: C.font, cursor: "pointer" }}
          >
            🔔
          </button>
          {notifOpen && (
            <div
              style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0, width: 260,
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                boxShadow: "0 12px 32px rgba(0,0,0,0.4)", padding: "12px 16px", zIndex: 50,
              }}
              onBlur={() => setNotifOpen(false)}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>{t.builder.notifications}</div>
              <div style={{ fontSize: 13, color: C.textMuted, textAlign: "center", padding: "16px 0" }}>{t.builder.noNotifications}</div>
            </div>
          )}
        </div>

        {isFreeTier && (
          <Link
            href="/settings/subscription"
            style={{ padding: "5px 14px", borderRadius: 7, border: "1px solid rgba(124,58,237,0.4)", background: "transparent", color: C.accentLight, fontSize: 13, fontFamily: C.font, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            ⭐ Upgrade
          </Link>
        )}
        <button
          onClick={() => setShowCreate(true)}
          style={{ padding: "7px 18px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontFamily: C.font, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
        >
          <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> New Site
        </button>
        <UserDropdown mode="dark" />
      </div>

      {/* Body */}
      <div style={{ padding: "28px 28px 48px" }}>
        <WelcomeCard />
        {loading && (
          <div style={{ color: C.textMuted, fontSize: 13 }}>Loading your sites…</div>
        )}

        {pageError && (
          <div style={{ color: "#fca5a5", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
            {pageError}
            <button onClick={loadSites} style={{ fontSize: 12, color: C.accentLight, background: "none", border: "none", cursor: "pointer", fontFamily: C.font, textDecoration: "underline", padding: 0 }}>
              Retry
            </button>
          </div>
        )}

        {/* Empty state — prompt-first */}
        {!loading && !pageError && sites.length === 0 && (
          <div style={{ maxWidth: 520, margin: "80px auto 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div style={{ fontSize: 40, opacity: 0.15 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="3" width="20" height="14" rx="2" stroke="white" strokeWidth="1.5" />
                <path d="M8 21h8M12 17v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>Build your first site</div>
              <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
                Tell Nova what you need — it generates a fully editable site in seconds.
              </div>
            </div>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              {EXAMPLES.slice(0, 3).map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => { handleCreate(ex.prompt); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.02)", color: C.text, fontSize: 13, fontFamily: C.font, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.25)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; (e.currentTarget as HTMLElement).style.borderColor = C.border; }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{ex.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{ex.label}</div>
                    <div style={{ fontSize: 13, color: C.textMuted }}>{ex.prompt.slice(0, 60)}…</div>
                  </div>
                  <span style={{ marginLeft: "auto", color: C.accentLight, opacity: 0.6, fontSize: 14 }}>→</span>
                </button>
              ))}
              <button
                onClick={() => setShowCreate(true)}
                style={{ padding: "11px 0", borderRadius: 10, border: `1px dashed ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 12, fontFamily: C.font, cursor: "pointer" }}
              >
                + Write your own prompt
              </button>
            </div>
          </div>
        )}

        {/* Site grid */}
        {!loading && !pageError && sites.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            {/* New site card — hidden when searching */}
            {!search && (
              <div
                onClick={() => setShowCreate(true)}
                style={{ background: "rgba(124,58,237,0.04)", border: `1px dashed rgba(124,58,237,0.2)`, borderRadius: 12, height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 8, transition: "all 0.15s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.35)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.2)"; }}
              >
                <span style={{ fontSize: 22, color: C.accentLight, opacity: 0.5 }}>+</span>
                <span style={{ fontSize: 12, color: C.accentLight, fontWeight: 600, opacity: 0.6 }}>New Site</span>
              </div>
            )}

            {filteredSites.length === 0 && search && (
              <div style={{ gridColumn: "1/-1", color: C.textMuted, fontSize: 13, padding: "32px 0", textAlign: "center" }}>
                No sites match &ldquo;{search}&rdquo;
              </div>
            )}

            {filteredSites.map((s) => (
              <SiteCard
                key={s.id}
                site={s}
                onOpen={() => router.push(`/builder/${s.id}`)}
                onDelete={() => setDeleteSite(s)}
                onAnalytics={() => router.push(`/analytics/${s.id}`)}
                onLeads={() => router.push(`/submissions/${s.id}`)}
                onClone={() => handleClone(s.id)}
                isCloning={cloning === s.id}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && <NewSiteModal onCreate={handleCreate} onClose={() => setShowCreate(false)} />}
      
      {deleteSite && (
        <DeleteConfirmModal
          siteName={deleteSite.name}
          onConfirm={async () => {
            await handleDelete(deleteSite.id);
          }}
          onClose={() => setDeleteSite(null)}
        />
      )}
    </div>
  );
}
