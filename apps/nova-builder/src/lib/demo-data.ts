// Hardcoded WebstudioData for the public demo builder session.
// Uses fixed IDs so the project is always identical. Read-only — never saved to Supabase.

export const DEMO_PROJECT_ID = "demo";

const PAGE_ID   = "page_demo01";
const FOLDER_ID = "fold_demo1";
const BP_ID     = "bp_base001";

// One style-source for all locally-defined styles
const SRC = "src_demo001";

// Stable instance IDs
const I = {
  body:    "inst_body01",
  hero:    "inst_hero01",
  inner:   "inst_inn001",
  badge:   "inst_badg01",
  heading: "inst_head01",
  sub:     "inst_sub001",
  ctas:    "inst_ctas01",
  btn1:    "inst_btn001",
  btn2:    "inst_btn002",
  feats:   "inst_feat01",
  fgrid:   "inst_fgrd01",
  c1:      "inst_c1_001",
  c1i:     "inst_c1i001",
  c1h:     "inst_c1h001",
  c1p:     "inst_c1p001",
  c2:      "inst_c2_001",
  c2i:     "inst_c2i001",
  c2h:     "inst_c2h001",
  c2p:     "inst_c2p001",
  c3:      "inst_c3_001",
  c3i:     "inst_c3i001",
  c3h:     "inst_c3h001",
  c3p:     "inst_c3p001",
};

// Helper: style key
function sk(property: string) {
  return `${SRC}:${BP_ID}::${property}`;
}
// Helper: style decl
function sd(property: string, value: Record<string, unknown>) {
  return { styleSourceId: SRC, breakpointId: BP_ID, state: "", property, value };
}
// Helper: unit value
function unit(v: number, u: string) { return { type: "unit", value: v, unit: u }; }
// Helper: keyword value
function kw(v: string) { return { type: "keyword", value: v }; }
// Helper: rgb value
function rgb(r: number, g: number, b: number, a = 1) { return { type: "rgb", r, g, b, alpha: a }; }

// Per-instance style source (each gets its own so styles don't bleed)
function instSrc(id: string) { return `src_${id}`; }
function instSk(instId: string, property: string) {
  return `${instSrc(instId)}:${BP_ID}::${property}`;
}
function instSd(instId: string, property: string, value: Record<string, unknown>) {
  return { styleSourceId: instSrc(instId), breakpointId: BP_ID, state: "", property, value };
}

function makeStyles() {
  const entries: [string, Record<string, unknown>][] = [];

  // Body: dark background
  entries.push([instSk(I.body, "backgroundColor"), instSd(I.body, "backgroundColor", rgb(10, 10, 20))]);
  entries.push([instSk(I.body, "margin"), instSd(I.body, "margin", unit(0, "px"))]);
  entries.push([instSk(I.body, "padding"), instSd(I.body, "padding", unit(0, "px"))]);
  entries.push([instSk(I.body, "fontFamily"), instSd(I.body, "fontFamily", kw("system-ui, -apple-system, sans-serif"))]);

  // Hero section: full-page dark hero
  entries.push([instSk(I.hero, "minHeight"), instSd(I.hero, "minHeight", unit(100, "vh"))]);
  entries.push([instSk(I.hero, "display"), instSd(I.hero, "display", kw("flex"))]);
  entries.push([instSk(I.hero, "flexDirection"), instSd(I.hero, "flexDirection", kw("column"))]);
  entries.push([instSk(I.hero, "alignItems"), instSd(I.hero, "alignItems", kw("center"))]);
  entries.push([instSk(I.hero, "justifyContent"), instSd(I.hero, "justifyContent", kw("center"))]);
  entries.push([instSk(I.hero, "padding"), instSd(I.hero, "padding", unit(80, "px"))]);
  entries.push([instSk(I.hero, "backgroundColor"), instSd(I.hero, "backgroundColor", rgb(10, 10, 20))]);
  entries.push([instSk(I.hero, "textAlign"), instSd(I.hero, "textAlign", kw("center"))]);

  // Inner content box
  entries.push([instSk(I.inner, "maxWidth"), instSd(I.inner, "maxWidth", unit(720, "px"))]);
  entries.push([instSk(I.inner, "width"), instSd(I.inner, "width", unit(100, "%"))]);
  entries.push([instSk(I.inner, "display"), instSd(I.inner, "display", kw("flex"))]);
  entries.push([instSk(I.inner, "flexDirection"), instSd(I.inner, "flexDirection", kw("column"))]);
  entries.push([instSk(I.inner, "alignItems"), instSd(I.inner, "alignItems", kw("center"))]);
  entries.push([instSk(I.inner, "gap"), instSd(I.inner, "gap", unit(24, "px"))]);

  // Badge
  entries.push([instSk(I.badge, "display"), instSd(I.badge, "display", kw("inline-flex"))]);
  entries.push([instSk(I.badge, "alignItems"), instSd(I.badge, "alignItems", kw("center"))]);
  entries.push([instSk(I.badge, "paddingLeft"), instSd(I.badge, "paddingLeft", unit(12, "px"))]);
  entries.push([instSk(I.badge, "paddingRight"), instSd(I.badge, "paddingRight", unit(12, "px"))]);
  entries.push([instSk(I.badge, "paddingTop"), instSd(I.badge, "paddingTop", unit(4, "px"))]);
  entries.push([instSk(I.badge, "paddingBottom"), instSd(I.badge, "paddingBottom", unit(4, "px"))]);
  entries.push([instSk(I.badge, "borderRadius"), instSd(I.badge, "borderRadius", unit(999, "px"))]);
  entries.push([instSk(I.badge, "backgroundColor"), instSd(I.badge, "backgroundColor", rgb(124, 58, 237, 0.12))]);
  entries.push([instSk(I.badge, "borderWidth"), instSd(I.badge, "borderWidth", unit(1, "px"))]);
  entries.push([instSk(I.badge, "borderStyle"), instSd(I.badge, "borderStyle", kw("solid"))]);
  entries.push([instSk(I.badge, "borderColor"), instSd(I.badge, "borderColor", rgb(124, 58, 237, 0.3))]);
  entries.push([instSk(I.badge, "color"), instSd(I.badge, "color", rgb(167, 139, 250))]);
  entries.push([instSk(I.badge, "fontSize"), instSd(I.badge, "fontSize", unit(12, "px"))]);
  entries.push([instSk(I.badge, "fontWeight"), instSd(I.badge, "fontWeight", unit(600, "number"))]);

  // Main heading
  entries.push([instSk(I.heading, "fontSize"), instSd(I.heading, "fontSize", unit(56, "px"))]);
  entries.push([instSk(I.heading, "fontWeight"), instSd(I.heading, "fontWeight", unit(900, "number"))]);
  entries.push([instSk(I.heading, "color"), instSd(I.heading, "color", rgb(255, 255, 255))]);
  entries.push([instSk(I.heading, "lineHeight"), instSd(I.heading, "lineHeight", unit(1.05, "number"))]);
  entries.push([instSk(I.heading, "letterSpacing"), instSd(I.heading, "letterSpacing", unit(-0.02, "em"))]);
  entries.push([instSk(I.heading, "margin"), instSd(I.heading, "margin", unit(0, "px"))]);
  entries.push([instSk(I.heading, "textAlign"), instSd(I.heading, "textAlign", kw("center"))]);

  // Subtitle paragraph
  entries.push([instSk(I.sub, "fontSize"), instSd(I.sub, "fontSize", unit(18, "px"))]);
  entries.push([instSk(I.sub, "color"), instSd(I.sub, "color", rgb(255, 255, 255, 0.5))]);
  entries.push([instSk(I.sub, "lineHeight"), instSd(I.sub, "lineHeight", unit(1.6, "number"))]);
  entries.push([instSk(I.sub, "margin"), instSd(I.sub, "margin", unit(0, "px"))]);
  entries.push([instSk(I.sub, "maxWidth"), instSd(I.sub, "maxWidth", unit(500, "px"))]);
  entries.push([instSk(I.sub, "textAlign"), instSd(I.sub, "textAlign", kw("center"))]);

  // CTA button row
  entries.push([instSk(I.ctas, "display"), instSd(I.ctas, "display", kw("flex"))]);
  entries.push([instSk(I.ctas, "gap"), instSd(I.ctas, "gap", unit(12, "px"))]);
  entries.push([instSk(I.ctas, "flexWrap"), instSd(I.ctas, "flexWrap", kw("wrap"))]);
  entries.push([instSk(I.ctas, "justifyContent"), instSd(I.ctas, "justifyContent", kw("center"))]);

  // Primary button
  entries.push([instSk(I.btn1, "paddingLeft"), instSd(I.btn1, "paddingLeft", unit(28, "px"))]);
  entries.push([instSk(I.btn1, "paddingRight"), instSd(I.btn1, "paddingRight", unit(28, "px"))]);
  entries.push([instSk(I.btn1, "paddingTop"), instSd(I.btn1, "paddingTop", unit(14, "px"))]);
  entries.push([instSk(I.btn1, "paddingBottom"), instSd(I.btn1, "paddingBottom", unit(14, "px"))]);
  entries.push([instSk(I.btn1, "borderRadius"), instSd(I.btn1, "borderRadius", unit(10, "px"))]);
  entries.push([instSk(I.btn1, "backgroundColor"), instSd(I.btn1, "backgroundColor", rgb(124, 58, 237))]);
  entries.push([instSk(I.btn1, "color"), instSd(I.btn1, "color", rgb(255, 255, 255))]);
  entries.push([instSk(I.btn1, "fontSize"), instSd(I.btn1, "fontSize", unit(15, "px"))]);
  entries.push([instSk(I.btn1, "fontWeight"), instSd(I.btn1, "fontWeight", unit(700, "number"))]);
  entries.push([instSk(I.btn1, "border"), instSd(I.btn1, "border", kw("none"))]);
  entries.push([instSk(I.btn1, "cursor"), instSd(I.btn1, "cursor", kw("pointer"))]);

  // Secondary button
  entries.push([instSk(I.btn2, "paddingLeft"), instSd(I.btn2, "paddingLeft", unit(28, "px"))]);
  entries.push([instSk(I.btn2, "paddingRight"), instSd(I.btn2, "paddingRight", unit(28, "px"))]);
  entries.push([instSk(I.btn2, "paddingTop"), instSd(I.btn2, "paddingTop", unit(14, "px"))]);
  entries.push([instSk(I.btn2, "paddingBottom"), instSd(I.btn2, "paddingBottom", unit(14, "px"))]);
  entries.push([instSk(I.btn2, "borderRadius"), instSd(I.btn2, "borderRadius", unit(10, "px"))]);
  entries.push([instSk(I.btn2, "backgroundColor"), instSd(I.btn2, "backgroundColor", rgb(255, 255, 255, 0.05))]);
  entries.push([instSk(I.btn2, "color"), instSd(I.btn2, "color", rgb(255, 255, 255, 0.7))]);
  entries.push([instSk(I.btn2, "fontSize"), instSd(I.btn2, "fontSize", unit(15, "px"))]);
  entries.push([instSk(I.btn2, "fontWeight"), instSd(I.btn2, "fontWeight", unit(600, "number"))]);
  entries.push([instSk(I.btn2, "borderWidth"), instSd(I.btn2, "borderWidth", unit(1, "px"))]);
  entries.push([instSk(I.btn2, "borderStyle"), instSd(I.btn2, "borderStyle", kw("solid"))]);
  entries.push([instSk(I.btn2, "borderColor"), instSd(I.btn2, "borderColor", rgb(255, 255, 255, 0.12))]);
  entries.push([instSk(I.btn2, "cursor"), instSd(I.btn2, "cursor", kw("pointer"))]);

  // Features section
  entries.push([instSk(I.feats, "padding"), instSd(I.feats, "padding", unit(80, "px"))]);
  entries.push([instSk(I.feats, "paddingLeft"), instSd(I.feats, "paddingLeft", unit(40, "px"))]);
  entries.push([instSk(I.feats, "paddingRight"), instSd(I.feats, "paddingRight", unit(40, "px"))]);
  entries.push([instSk(I.feats, "backgroundColor"), instSd(I.feats, "backgroundColor", rgb(14, 14, 28))]);

  // Features grid
  entries.push([instSk(I.fgrid, "display"), instSd(I.fgrid, "display", kw("grid"))]);
  entries.push([instSk(I.fgrid, "gridTemplateColumns"), instSd(I.fgrid, "gridTemplateColumns", kw("repeat(3,1fr)"))]);
  entries.push([instSk(I.fgrid, "gap"), instSd(I.fgrid, "gap", unit(24, "px"))]);
  entries.push([instSk(I.fgrid, "maxWidth"), instSd(I.fgrid, "maxWidth", unit(960, "px"))]);
  entries.push([instSk(I.fgrid, "marginLeft"), instSd(I.fgrid, "marginLeft", kw("auto"))]);
  entries.push([instSk(I.fgrid, "marginRight"), instSd(I.fgrid, "marginRight", kw("auto"))]);

  for (const id of [I.c1, I.c2, I.c3]) {
    entries.push([instSk(id, "backgroundColor"), instSd(id, "backgroundColor", rgb(255, 255, 255, 0.03))]);
    entries.push([instSk(id, "borderWidth"), instSd(id, "borderWidth", unit(1, "px"))]);
    entries.push([instSk(id, "borderStyle"), instSd(id, "borderStyle", kw("solid"))]);
    entries.push([instSk(id, "borderColor"), instSd(id, "borderColor", rgb(255, 255, 255, 0.07))]);
    entries.push([instSk(id, "borderRadius"), instSd(id, "borderRadius", unit(16, "px"))]);
    entries.push([instSk(id, "padding"), instSd(id, "padding", unit(28, "px"))]);
    entries.push([instSk(id, "display"), instSd(id, "display", kw("flex"))]);
    entries.push([instSk(id, "flexDirection"), instSd(id, "flexDirection", kw("column"))]);
    entries.push([instSk(id, "gap"), instSd(id, "gap", unit(12, "px"))]);
  }

  for (const id of [I.c1i, I.c2i, I.c3i]) {
    entries.push([instSk(id, "fontSize"), instSd(id, "fontSize", unit(32, "px"))]);
    entries.push([instSk(id, "margin"), instSd(id, "margin", unit(0, "px"))]);
  }

  for (const id of [I.c1h, I.c2h, I.c3h]) {
    entries.push([instSk(id, "fontSize"), instSd(id, "fontSize", unit(16, "px"))]);
    entries.push([instSk(id, "fontWeight"), instSd(id, "fontWeight", unit(700, "number"))]);
    entries.push([instSk(id, "color"), instSd(id, "color", rgb(255, 255, 255))]);
    entries.push([instSk(id, "margin"), instSd(id, "margin", unit(0, "px"))]);
  }

  for (const id of [I.c1p, I.c2p, I.c3p]) {
    entries.push([instSk(id, "fontSize"), instSd(id, "fontSize", unit(14, "px"))]);
    entries.push([instSk(id, "color"), instSd(id, "color", rgb(255, 255, 255, 0.45))]);
    entries.push([instSk(id, "lineHeight"), instSd(id, "lineHeight", unit(1.55, "number"))]);
    entries.push([instSk(id, "margin"), instSd(id, "margin", unit(0, "px"))]);
  }

  return entries;
}

function makeStyleSources() {
  const entries: [string, Record<string, unknown>][] = [];
  for (const id of Object.values(I)) {
    entries.push([instSrc(id), { id: instSrc(id), type: "local" }]);
  }
  return entries;
}

function makeStyleSourceSelections() {
  const entries: [string, Record<string, unknown>][] = [];
  for (const id of Object.values(I)) {
    entries.push([id, { instanceId: id, values: [instSrc(id)] }]);
  }
  return entries;
}

function t(value: string) { return { type: "text", value }; }
function ref(id: string)  { return { type: "id", value: id }; }

export function getDemoProjectJson() {
  return {
    id: DEMO_PROJECT_ID,
    name: "Demo — Nova Builder",
    schemaVersion: "5.0",
    updatedAt: new Date().toISOString(),
    data: {
      pages: {
        homePageId: PAGE_ID,
        rootFolderId: FOLDER_ID,
        pages: [
          [PAGE_ID, { id: PAGE_ID, name: "Home", path: "/", title: "Nova Demo", rootInstanceId: I.body }],
        ],
        folders: [
          [FOLDER_ID, { id: FOLDER_ID, name: "Root", slug: "", children: [PAGE_ID] }],
        ],
      },
      instances: [
        [I.body, { type: "instance", id: I.body, component: "Body", label: "Body", children: [ref(I.hero), ref(I.feats)] }],

        // Hero section
        [I.hero, { type: "instance", id: I.hero, component: "Box", label: "Hero", children: [ref(I.inner)] }],
        [I.inner, { type: "instance", id: I.inner, component: "Box", label: "Hero Inner", children: [ref(I.badge), ref(I.heading), ref(I.sub), ref(I.ctas)] }],
        [I.badge, { type: "instance", id: I.badge, component: "Box", label: "Badge", children: [t("✦  AI-powered website builder")] }],
        [I.heading, { type: "instance", id: I.heading, component: "Heading", label: "Heading", children: [t("Build any website with AI.")] }],
        [I.sub, { type: "instance", id: I.sub, component: "Paragraph", label: "Subtitle", children: [t("Describe what you need. Nova generates a fully editable site in seconds — no code, no setup.")] }],
        [I.ctas, { type: "instance", id: I.ctas, component: "Box", label: "CTA Buttons", children: [ref(I.btn1), ref(I.btn2)] }],
        [I.btn1, { type: "instance", id: I.btn1, component: "Button", label: "Primary CTA", children: [t("Start building free →")] }],
        [I.btn2, { type: "instance", id: I.btn2, component: "Button", label: "See examples", children: [t("See examples")] }],

        // Features section
        [I.feats, { type: "instance", id: I.feats, component: "Box", label: "Features", children: [ref(I.fgrid)] }],
        [I.fgrid, { type: "instance", id: I.fgrid, component: "Box", label: "Feature Grid", children: [ref(I.c1), ref(I.c2), ref(I.c3)] }],

        [I.c1, { type: "instance", id: I.c1, component: "Box", label: "Card 1", children: [ref(I.c1i), ref(I.c1h), ref(I.c1p)] }],
        [I.c1i, { type: "instance", id: I.c1i, component: "Heading", label: "Card 1 Icon", children: [t("⚡")] }],
        [I.c1h, { type: "instance", id: I.c1h, component: "Heading", label: "Card 1 Title", children: [t("Instant generation")] }],
        [I.c1p, { type: "instance", id: I.c1p, component: "Paragraph", label: "Card 1 Body", children: [t("Describe your page in plain English. Nova builds the entire layout in under 10 seconds.")] }],

        [I.c2, { type: "instance", id: I.c2, component: "Box", label: "Card 2", children: [ref(I.c2i), ref(I.c2h), ref(I.c2p)] }],
        [I.c2i, { type: "instance", id: I.c2i, component: "Heading", label: "Card 2 Icon", children: [t("🎨")] }],
        [I.c2h, { type: "instance", id: I.c2h, component: "Heading", label: "Card 2 Title", children: [t("Visual editor")] }],
        [I.c2p, { type: "instance", id: I.c2p, component: "Paragraph", label: "Card 2 Body", children: [t("Click anything to edit it. Change colors, fonts, and layout with the style panel.")] }],

        [I.c3, { type: "instance", id: I.c3, component: "Box", label: "Card 3", children: [ref(I.c3i), ref(I.c3h), ref(I.c3p)] }],
        [I.c3i, { type: "instance", id: I.c3i, component: "Heading", label: "Card 3 Icon", children: [t("🚀")] }],
        [I.c3h, { type: "instance", id: I.c3h, component: "Heading", label: "Card 3 Title", children: [t("One-click publish")] }],
        [I.c3p, { type: "instance", id: I.c3p, component: "Paragraph", label: "Card 3 Body", children: [t("Share a preview link or deploy to your own domain — without touching a terminal.")] }],
      ],
      props: [],
      styles: makeStyles(),
      styleSources: makeStyleSources(),
      styleSourceSelections: makeStyleSourceSelections(),
      breakpoints: [
        [BP_ID, { id: BP_ID, label: "Base" }],
      ],
      assets: [],
      dataSources: [],
      resources: [],
    },
  };
}
