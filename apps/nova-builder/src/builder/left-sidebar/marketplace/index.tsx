"use client";
import { useEffect, useRef, useState } from "react";
import { BUILT_IN_TEMPLATES, applyTemplate, type Template } from "@/lib/templates";
import { buildBundle, insertBundle, type NovaBundle } from "@/lib/protocol/bundle";
import { downloadBundle, readBundleFile } from "@/lib/protocol/bundleFile";
import {
  browseMarketplace, fetchMarketplaceBundle, publishBundle, type MarketplaceItem,
} from "@/lib/protocol/marketplaceClient";
import { $nestingWarning } from "@/lib/nano-states";
import { UI_VARS as C } from "@/lib/uiTheme";
import { useI18n } from "@/lib/i18n";

const cardStyle = (hovered: boolean): React.CSSProperties => ({
  background: hovered ? C.cardHover : C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: 14,
  marginBottom: 10,
  transition: "background 0.12s",
});

function TemplateCard({ template, onUse }: { template: Template; onUse: (t: Template) => void }) {
  const [hovered, setHovered] = useState(false);
  const [applied, setApplied] = useState(false);
  function handleUse() {
    onUse(template);
    setApplied(true);
    setTimeout(() => setApplied(false), 1800);
  }
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={cardStyle(hovered)}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 24, lineHeight: 1 }}>{template.previewIcon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{template.name}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2, lineHeight: 1.4 }}>{template.description}</div>
        </div>
      </div>
      <button onClick={handleUse} style={{ width: "100%", padding: "6px 0", borderRadius: 6, border: "none", background: applied ? C.success : C.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: C.font, transition: "background 0.2s" }}>
        {applied ? "✓ Applied!" : "Use Template"}
      </button>
    </div>
  );
}

function CommunityCard({ item, onInstall }: { item: MarketplaceItem; onInstall: (i: MarketplaceItem) => void }) {
  const { t } = useI18n();
  const [hovered, setHovered] = useState(false);
  const [installed, setInstalled] = useState(false);
  async function handleInstall() {
    await onInstall(item);
    setInstalled(true);
    setTimeout(() => setInstalled(false), 1800);
  }
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={cardStyle(hovered)}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 24, lineHeight: 1 }}>{item.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2, lineHeight: 1.4 }}>{item.description}</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{item.install_count} {t.builder.mktInstalls}</div>
        </div>
      </div>
      <button onClick={handleInstall} style={{ width: "100%", padding: "6px 0", borderRadius: 6, border: "none", background: installed ? C.success : C.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: C.font, transition: "background 0.2s" }}>
        {installed ? t.builder.mktInstalled : t.builder.mktInstall}
      </button>
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.06em",
  textTransform: "uppercase", margin: "14px 0 8px",
};
const btnStyle: React.CSSProperties = {
  flex: 1, padding: "7px 0", borderRadius: 6, border: `1px solid ${C.border}`,
  background: "transparent", color: C.text, fontSize: 12, fontWeight: 600,
  cursor: "pointer", fontFamily: C.font,
};

export function MarketplacePanel() {
  const { t } = useI18n();
  const [community, setCommunity] = useState<MarketplaceItem[]>([]);
  const [search, setSearch] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishName, setPublishName] = useState("");
  const [publishDesc, setPublishDesc] = useState("");
  const [publishOpen, setPublishOpen] = useState(false);
  const [published, setPublished] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    browseMarketplace(search || undefined).then((items) => { if (alive) setCommunity(items); });
    return () => { alive = false; };
  }, [search]);

  function applyBundle(bundle: NovaBundle) {
    const result = insertBundle(bundle);
    if (result && !result.ok) $nestingWarning.set(result.violation.message);
  }

  async function handleInstall(item: MarketplaceItem) {
    const bundle = await fetchMarketplaceBundle(item.id);
    if (bundle) applyBundle(bundle);
  }

  function handleExport() {
    const bundle = buildBundle({ name: publishName || "Page bundle", description: publishDesc });
    if (bundle) downloadBundle(bundle);
  }

  async function handleImportFile(file: File) {
    const bundle = await readBundleFile(file);
    if (!bundle) { $nestingWarning.set(t.builder.mktImportFailed); return; }
    applyBundle(bundle);
  }

  async function handlePublish() {
    const bundle = buildBundle({ name: publishName.trim() || "Untitled", description: publishDesc.trim() });
    if (!bundle || !publishName.trim()) return;
    setPublishing(true);
    const ok = await publishBundle({ name: publishName.trim(), description: publishDesc.trim(), bundle, category: "section" });
    setPublishing(false);
    if (ok) {
      setPublished(true);
      setPublishName("");
      setPublishDesc("");
      setTimeout(() => { setPublished(false); setPublishOpen(false); }, 1600);
      browseMarketplace(search || undefined).then(setCommunity);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg, fontFamily: C.font }}>
      <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: "0.05em" }}>{t.builder.templates.toUpperCase()}</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
        {/* Import / Export bundle */}
        <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
          <button onClick={handleExport} style={btnStyle}>⬇ {t.builder.mktExport}</button>
          <button onClick={() => fileInputRef.current?.click()} style={btnStyle}>⬆ {t.builder.mktImport}</button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = ""; }}
          />
        </div>

        {/* Publish current page */}
        {!publishOpen ? (
          <button onClick={() => setPublishOpen(true)} style={{ ...btnStyle, width: "100%", marginBottom: 4 }}>
            ◈ {t.builder.mktPublishPage}
          </button>
        ) : (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, marginBottom: 4 }}>
            <input value={publishName} onChange={(e) => setPublishName(e.target.value)} placeholder={t.builder.mktPublishName}
              style={{ width: "100%", boxSizing: "border-box", marginBottom: 6, padding: "6px 8px", borderRadius: 5, border: `1px solid ${C.border}`, background: C.input, color: C.text, fontSize: 12, fontFamily: C.font, outline: "none" }} />
            <input value={publishDesc} onChange={(e) => setPublishDesc(e.target.value)} placeholder={t.builder.mktPublishDesc}
              style={{ width: "100%", boxSizing: "border-box", marginBottom: 8, padding: "6px 8px", borderRadius: 5, border: `1px solid ${C.border}`, background: C.input, color: C.text, fontSize: 12, fontFamily: C.font, outline: "none" }} />
            <button onClick={handlePublish} disabled={publishing || !publishName.trim()}
              style={{ width: "100%", padding: "6px 0", borderRadius: 6, border: "none", background: published ? C.success : C.accent, color: "#fff", fontSize: 12, fontWeight: 700, cursor: publishing ? "default" : "pointer", opacity: publishing ? 0.6 : 1, fontFamily: C.font }}>
              {published ? t.builder.mktPublished : publishing ? "…" : t.builder.mktPublishCta}
            </button>
          </div>
        )}

        {/* Built-in templates */}
        <div style={sectionLabel}>{t.builder.mktBuiltInTemplates}</div>
        {BUILT_IN_TEMPLATES.map((tpl) => (
          <TemplateCard key={tpl.id} template={tpl} onUse={applyTemplate} />
        ))}

        {/* Community */}
        <div style={sectionLabel}>{t.builder.mktCommunity}</div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.builder.mktSearch}
          style={{ width: "100%", boxSizing: "border-box", marginBottom: 10, padding: "6px 8px", borderRadius: 5, border: `1px solid ${C.border}`, background: C.input, color: C.text, fontSize: 12, fontFamily: C.font, outline: "none" }} />
        {community.length === 0 ? (
          <div style={{ fontSize: 12, color: C.textMuted, padding: "8px 2px", lineHeight: 1.5 }}>{t.builder.mktEmpty}</div>
        ) : (
          community.map((item) => <CommunityCard key={item.id} item={item} onInstall={handleInstall} />)
        )}
      </div>
    </div>
  );
}
