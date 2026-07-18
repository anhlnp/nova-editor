"use client";
import { useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { $selectedPage } from "@/lib/nano-states";
import { $projectMeta } from "@/lib/data-stores";
import { UI_VARS as C } from "@/lib/uiTheme";
import { usePageCrud, type PageRedirect } from "./left-sidebar/pages/usePageCrud";

type PageSEO = {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  robotsTxt?: string;
  canonicalUrl?: string;
  robots?: string;
};

type SeoData = Record<string, PageSEO>;

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "6px 8px",
  background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
  borderRadius: 5, color: C.text, fontSize: 13, fontFamily: "monospace",
  outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, color: C.textMuted, fontWeight: 600,
  letterSpacing: "0.05em", marginBottom: 4, display: "block",
};

function Field({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{ ...inputStyle, resize: "vertical", fontFamily: C.font }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
    </div>
  );
}

function OGPreviewCard({ title, description, image, url }: {
  title: string; description: string; image?: string; url?: string;
}) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" style={{ width: "100%", height: 80, objectFit: "cover", display: "block" }} />
      ) : (
        <div style={{ width: "100%", height: 80, background: "rgba(124,58,237,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>No OG image set</span>
        </div>
      )}
      <div style={{ padding: "8px 10px", background: "rgba(255,255,255,0.02)" }}>
        {url && <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 3, textTransform: "uppercase" }}>{url}</div>}
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>{title || "Page title"}</div>
        <div style={{ fontSize: 12, color: C.textDim, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {description || "Page description"}
        </div>
      </div>
    </div>
  );
}

function RedirectsEditor({ pageId, initialRedirects }: { pageId: string; initialRedirects: PageRedirect[] }) {
  const { updatePageRedirects } = usePageCrud();
  const [rows, setRows] = useState<PageRedirect[]>(initialRedirects);

  function addRow() {
    const next = [...rows, { from: "", to: "", permanent: false }];
    setRows(next);
    updatePageRedirects(pageId, next);
  }

  function update(i: number, patch: Partial<PageRedirect>) {
    const next = rows.map((r, idx) => idx === i ? { ...r, ...patch } : r);
    setRows(next);
    updatePageRedirects(pageId, next);
  }

  function remove(i: number) {
    const next = rows.filter((_, idx) => idx !== i);
    setRows(next);
    updatePageRedirects(pageId, next);
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>REDIRECTS</div>
      {rows.length === 0 && (
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>No redirects for this page.</div>
      )}
      {rows.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 6 }}>
          <input
            value={row.from}
            onChange={(e) => update(i, { from: e.target.value })}
            placeholder="/old-path"
            style={{ ...inputStyle, flex: 1 }}
          />
          <span style={{ color: C.textMuted, fontSize: 12 }}>→</span>
          <input
            value={row.to}
            onChange={(e) => update(i, { to: e.target.value })}
            placeholder="/new-path or URL"
            style={{ ...inputStyle, flex: 1 }}
          />
          <select
            value={row.permanent ? "301" : "302"}
            onChange={(e) => update(i, { permanent: e.target.value === "301" })}
            style={{ background: C.inputBg, border: `1px solid ${C.border}`, color: C.text, borderRadius: 4, fontSize: 11, padding: "4px 4px" }}
          >
            <option value="302">302</option>
            <option value="301">301</option>
          </select>
          <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: C.error, cursor: "pointer", fontSize: 14, padding: "0 2px" }}>×</button>
        </div>
      ))}
      <button
        onClick={addRow}
        style={{ fontSize: 11, color: C.accentText, background: "none", border: "none", cursor: "pointer", fontFamily: C.font, padding: 0 }}
      >
        + Add redirect
      </button>
    </div>
  );
}

function parseRedirects(meta: Record<string, unknown>): PageRedirect[] {
  try {
    const raw = meta.redirects;
    if (typeof raw === "string") return JSON.parse(raw) as PageRedirect[];
  } catch { /* */ }
  return [];
}

export function SEOPanel() {
  const page = useStore($selectedPage);
  const meta = useStore($projectMeta);
  const pageKey = (page as { path?: string } | undefined)?.path ?? "/";
  const pageId = (page as { id?: string } | undefined)?.id ?? "";
  const pageMeta = (page as { meta?: Record<string, unknown> } | undefined)?.meta ?? {};

  const [seoData, setSeoData] = useState<SeoData>({});
  const [robotsTxt, setRobotsTxt] = useState("");
  const [saved, setSaved] = useState(false);
  const [showOG, setShowOG] = useState(false);
  const [showRedirects, setShowRedirects] = useState(false);

  useEffect(() => {
    if (!meta?.id) return;
    fetch(`/api/projects/${meta.id}`)
      .then((r) => r.json())
      .then((json: { seoData?: SeoData }) => {
        setSeoData(json.seoData ?? {});
      })
      .catch(() => {});
  }, [meta?.id]);

  const pageSeo: PageSEO = seoData[pageKey] ?? {};
  const update = useCallback((field: keyof PageSEO, value: string | boolean) => {
    setSeoData((prev) => ({
      ...prev,
      [pageKey]: { ...(prev[pageKey] ?? {}), [field]: value },
    }));
  }, [pageKey]);

  const save = async () => {
    if (!meta?.id) return;
    await fetch(`/api/projects/${meta.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seoData, robotsTxt }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const redirects = parseRedirects(pageMeta);

  return (
    <div style={{ padding: 12, fontFamily: C.font, color: C.text, overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 14, letterSpacing: "0.04em" }}>
        SEO — {pageKey === "/" ? "Home" : pageKey}
      </div>

      <Field label="PAGE TITLE" value={pageSeo.title ?? ""} onChange={(v) => update("title", v)} placeholder="My awesome page" />
      <Field label="META DESCRIPTION" value={pageSeo.description ?? ""} onChange={(v) => update("description", v)} placeholder="Describe this page in 160 chars…" multiline />
      <Field label="CANONICAL URL" value={pageSeo.canonicalUrl ?? ""} onChange={(v) => update("canonicalUrl", v)} placeholder="https://example.com/page" />

      {/* Per-page robots directive */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 12 }}>
        <label style={labelStyle}>ROBOTS DIRECTIVE</label>
        <select
          value={pageSeo.robots ?? "index,follow"}
          onChange={(e) => update("robots", e.target.value)}
          style={{ ...inputStyle, fontFamily: C.font, cursor: "pointer" }}
        >
          <option value="index,follow">index, follow (default)</option>
          <option value="noindex,follow">noindex, follow</option>
          <option value="index,nofollow">index, nofollow</option>
          <option value="noindex,nofollow">noindex, nofollow</option>
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <input
          type="checkbox"
          id="noindex"
          checked={pageSeo.noIndex ?? false}
          onChange={(e) => update("noIndex", e.target.checked)}
          style={{ accentColor: C.accent }}
        />
        <label htmlFor="noindex" style={{ fontSize: 13, color: C.textDim, cursor: "pointer" }}>Exclude from search engines (noindex)</label>
      </div>

      {/* OG section toggle */}
      <button
        onClick={() => setShowOG((v) => !v)}
        style={{ background: "none", border: "none", color: C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: C.font, fontWeight: 600, letterSpacing: "0.05em", padding: 0, marginBottom: 12 }}
      >
        {showOG ? "▼" : "▶"} OPEN GRAPH / SOCIAL PREVIEW
      </button>

      {showOG && (
        <>
          <OGPreviewCard
            title={pageSeo.ogTitle || pageSeo.title || ""}
            description={pageSeo.ogDescription || pageSeo.description || ""}
            image={pageSeo.ogImage}
            url={pageSeo.canonicalUrl}
          />
          <Field label="OG TITLE" value={pageSeo.ogTitle ?? ""} onChange={(v) => update("ogTitle", v)} placeholder="Overrides page title for social" />
          <Field label="OG DESCRIPTION" value={pageSeo.ogDescription ?? ""} onChange={(v) => update("ogDescription", v)} placeholder="Overrides meta description for social" multiline />
          <Field label="OG IMAGE URL" value={pageSeo.ogImage ?? ""} onChange={(v) => update("ogImage", v)} placeholder="https://…/og.png (1200×630)" />
        </>
      )}

      {/* Redirects section */}
      <button
        onClick={() => setShowRedirects((v) => !v)}
        style={{ background: "none", border: "none", color: C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: C.font, fontWeight: 600, letterSpacing: "0.05em", padding: 0, marginBottom: 12, display: "block" }}
      >
        {showRedirects ? "▼" : "▶"} REDIRECTS {redirects.length > 0 && <span style={{ color: C.accentText }}>({redirects.length})</span>}
      </button>

      {showRedirects && pageId && (
        <RedirectsEditor pageId={pageId} initialRedirects={redirects} />
      )}

      <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 8, paddingTop: 12 }}>
        <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 6 }}>ROBOTS.TXT</div>
        <textarea
          value={robotsTxt}
          onChange={(e) => setRobotsTxt(e.target.value)}
          placeholder={"User-agent: *\nAllow: /"}
          rows={4}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", marginBottom: 10 }}
        />
        {meta?.id && (
          <a
            href={`/api/projects/${meta.id}/sitemap`}
            target="_blank"
            rel="noopener"
            style={{ fontSize: 12, color: C.accent, textDecoration: "none", display: "block", marginBottom: 10 }}
          >
            ↗ View auto-generated sitemap.xml
          </a>
        )}
      </div>

      <button
        onClick={save}
        style={{
          width: "100%", padding: "7px 0", borderRadius: 5, border: "none",
          background: saved ? "rgba(5,150,105,0.8)" : "rgba(124,58,237,0.8)",
          color: "#fff", fontSize: 12, fontFamily: C.font, cursor: "pointer", fontWeight: 600,
        }}
      >
        {saved ? "✓ Saved!" : "Save SEO"}
      </button>
    </div>
  );
}
