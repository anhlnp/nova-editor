// Built-in template definitions (pure data — no runtime imports).
import { BASE_BP, Template, ref, txt, inst, src, sel, sd, unit, kw, rgb } from "./types";

// ─── Template 1: Landing Hero ──────────────────────────────────────────────────

const heroSection   = "t1_sec";
const heroContent   = "t1_con";
const heroHeading   = "t1_hdg";
const heroParagraph = "t1_par";
const heroButtons   = "t1_btns";
const heroBtnPrimary = "t1_bp";
const heroBtnSecondary = "t1_bs";

const s1 = { sec: "s1_sec", con: "s1_con", hdg: "s1_hdg", par: "s1_par",
             btns: "s1_btns", bp: "s1_bp", bs: "s1_bs" };

export const TEMPLATE_HERO: Template = {
  id: "hero",
  name: "Landing Hero",
  description: "Centered hero section with headline, subtext and two CTA buttons",
  previewIcon: "🦸",
  rootIds: [heroSection],
  instances: [
    inst(heroSection,    "Box",       "Hero Section",    [ref(heroContent)]),
    inst(heroContent,    "Box",       "Hero Content",    [ref(heroHeading), ref(heroParagraph), ref(heroButtons)]),
    inst(heroHeading,    "Heading",   "Headline",        [txt("Build Something Amazing")]),
    inst(heroParagraph,  "Paragraph", "Subtext",         [txt("Launch your next idea with the most intuitive visual builder. No code needed.")]),
    inst(heroButtons,    "Box",       "CTA Row",         [ref(heroBtnPrimary), ref(heroBtnSecondary)]),
    inst(heroBtnPrimary,    "Button", "Primary CTA",     [txt("Get Started Free")]),
    inst(heroBtnSecondary,  "Button", "Secondary CTA",   [txt("See a Demo")]),
  ],
  props: [],
  styleSources: Object.values(s1).map(src),
  styleSourceSelections: [
    sel(heroSection,      s1.sec),
    sel(heroContent,      s1.con),
    sel(heroHeading,      s1.hdg),
    sel(heroParagraph,    s1.par),
    sel(heroButtons,      s1.btns),
    sel(heroBtnPrimary,   s1.bp),
    sel(heroBtnSecondary, s1.bs),
  ],
  styles: [
    sd(s1.sec, "backgroundColor", rgb(10, 10, 20)),
    sd(s1.sec, "paddingTop",    unit(80, "px")),
    sd(s1.sec, "paddingBottom", unit(80, "px")),
    sd(s1.sec, "paddingLeft",   unit(24, "px")),
    sd(s1.sec, "paddingRight",  unit(24, "px")),
    sd(s1.con, "display",         kw("flex")),
    sd(s1.con, "flexDirection",   kw("column")),
    sd(s1.con, "alignItems",      kw("center")),
    sd(s1.con, "textAlign",       kw("center")),
    sd(s1.con, "maxWidth",        unit(640, "px")),
    sd(s1.con, "marginLeft",      kw("auto")),
    sd(s1.con, "marginRight",     kw("auto")),
    sd(s1.con, "gap",             unit(20, "px")),
    sd(s1.hdg, "fontSize",    unit(48, "px")),
    sd(s1.hdg, "fontWeight",  kw("700")),
    sd(s1.hdg, "color",       rgb(226, 232, 240)),
    sd(s1.hdg, "lineHeight",  unit(1.1, "number")),
    sd(s1.par, "fontSize",    unit(18, "px")),
    sd(s1.par, "color",       rgb(148, 163, 184)),
    sd(s1.par, "lineHeight",  unit(1.6, "number")),
    sd(s1.btns, "display",      kw("flex")),
    sd(s1.btns, "gap",          unit(12, "px")),
    sd(s1.btns, "marginTop",    unit(8, "px")),
    sd(s1.bp, "backgroundColor", rgb(124, 58, 237)),
    sd(s1.bp, "color",           rgb(255, 255, 255)),
    sd(s1.bp, "paddingTop",      unit(12, "px")),
    sd(s1.bp, "paddingBottom",   unit(12, "px")),
    sd(s1.bp, "paddingLeft",     unit(24, "px")),
    sd(s1.bp, "paddingRight",    unit(24, "px")),
    sd(s1.bp, "borderRadius",    unit(8, "px")),
    sd(s1.bp, "fontWeight",      kw("600")),
    sd(s1.bp, "fontSize",        unit(14, "px")),
    sd(s1.bs, "backgroundColor", kw("transparent")),
    sd(s1.bs, "color",           rgb(148, 163, 184)),
    sd(s1.bs, "paddingTop",      unit(12, "px")),
    sd(s1.bs, "paddingBottom",   unit(12, "px")),
    sd(s1.bs, "paddingLeft",     unit(24, "px")),
    sd(s1.bs, "paddingRight",    unit(24, "px")),
    sd(s1.bs, "borderRadius",    unit(8, "px")),
    sd(s1.bs, "fontWeight",      kw("600")),
    sd(s1.bs, "fontSize",        unit(14, "px")),
    sd(s1.bs, "border",          { type: "keyword", value: "1px solid rgba(255,255,255,0.15)" }),
  ],
};

// ─── Template 2: Feature Cards ─────────────────────────────────────────────────

const featsSection = "t2_sec";
const featsTitle   = "t2_ttl";
const featsGrid    = "t2_grid";
const c1 = "t2_c1"; const c1Icon = "t2_c1i"; const c1Title = "t2_c1t"; const c1Body = "t2_c1b";
const c2 = "t2_c2"; const c2Icon = "t2_c2i"; const c2Title = "t2_c2t"; const c2Body = "t2_c2b";
const c3 = "t2_c3"; const c3Icon = "t2_c3i"; const c3Title = "t2_c3t"; const c3Body = "t2_c3b";

const s2 = {
  sec: "s2_sec", ttl: "s2_ttl", grid: "s2_grid",
  card: "s2_card",
  icon: "s2_icon", cTitle: "s2_ctit", cBody: "s2_cbod",
};

export const TEMPLATE_FEATURES: Template = {
  id: "features",
  name: "Feature Cards",
  description: "Three-column feature grid with icon, title and description",
  previewIcon: "⊞",
  rootIds: [featsSection],
  instances: [
    inst(featsSection, "Box",       "Features Section", [ref(featsTitle), ref(featsGrid)]),
    inst(featsTitle,   "Heading",   "Section Title",    [txt("Why Choose Us")]),
    inst(featsGrid,    "Box",       "Cards Grid",       [ref(c1), ref(c2), ref(c3)]),
    inst(c1,           "Box",       "Card 1",           [ref(c1Icon), ref(c1Title), ref(c1Body)]),
    inst(c1Icon,       "Heading",   "Card 1 Icon",      [txt("⚡")]),
    inst(c1Title,      "Heading",   "Card 1 Title",     [txt("Lightning Fast")]),
    inst(c1Body,       "Paragraph", "Card 1 Body",      [txt("Generate complete pages in seconds with our AI-powered builder.")]),
    inst(c2,           "Box",       "Card 2",           [ref(c2Icon), ref(c2Title), ref(c2Body)]),
    inst(c2Icon,       "Heading",   "Card 2 Icon",      [txt("🎨")]),
    inst(c2Title,      "Heading",   "Card 2 Title",     [txt("Pixel Perfect")]),
    inst(c2Body,       "Paragraph", "Card 2 Body",      [txt("Visual editing with full control over every style property.")]),
    inst(c3,           "Box",       "Card 3",           [ref(c3Icon), ref(c3Title), ref(c3Body)]),
    inst(c3Icon,       "Heading",   "Card 3 Icon",      [txt("🚀")]),
    inst(c3Title,      "Heading",   "Card 3 Title",     [txt("One-Click Deploy")]),
    inst(c3Body,       "Paragraph", "Card 3 Body",      [txt("Ship to production without touching the command line.")]),
  ],
  props: [],
  styleSources: [
    src(s2.sec), src(s2.ttl), src(s2.grid),
    src(s2.card), src(s2.icon), src(s2.cTitle), src(s2.cBody),
  ],
  styleSourceSelections: [
    sel(featsSection, s2.sec), sel(featsTitle, s2.ttl), sel(featsGrid, s2.grid),
    sel(c1, s2.card), sel(c1Icon, s2.icon), sel(c1Title, s2.cTitle), sel(c1Body, s2.cBody),
    sel(c2, s2.card), sel(c2Icon, s2.icon), sel(c2Title, s2.cTitle), sel(c2Body, s2.cBody),
    sel(c3, s2.card), sel(c3Icon, s2.icon), sel(c3Title, s2.cTitle), sel(c3Body, s2.cBody),
  ],
  styles: [
    sd(s2.sec, "backgroundColor",  rgb(10, 10, 20)),
    sd(s2.sec, "paddingTop",       unit(64, "px")),
    sd(s2.sec, "paddingBottom",    unit(64, "px")),
    sd(s2.sec, "paddingLeft",      unit(24, "px")),
    sd(s2.sec, "paddingRight",     unit(24, "px")),
    sd(s2.ttl, "fontSize",         unit(32, "px")),
    sd(s2.ttl, "fontWeight",       kw("700")),
    sd(s2.ttl, "color",            rgb(226, 232, 240)),
    sd(s2.ttl, "textAlign",        kw("center")),
    sd(s2.ttl, "marginBottom",     unit(40, "px")),
    sd(s2.grid, "display",         kw("grid")),
    sd(s2.grid, "gridTemplateColumns", { type: "keyword", value: "repeat(3, 1fr)" }),
    sd(s2.grid, "gap",             unit(24, "px")),
    sd(s2.grid, "maxWidth",        unit(960, "px")),
    sd(s2.grid, "marginLeft",      kw("auto")),
    sd(s2.grid, "marginRight",     kw("auto")),
    sd(s2.card, "backgroundColor", rgb(15, 23, 42)),
    sd(s2.card, "borderRadius",    unit(12, "px")),
    sd(s2.card, "padding",         unit(28, "px")),
    sd(s2.card, "display",         kw("flex")),
    sd(s2.card, "flexDirection",   kw("column")),
    sd(s2.card, "gap",             unit(12, "px")),
    sd(s2.card, "border",          { type: "keyword", value: "1px solid rgba(255,255,255,0.06)" }),
    sd(s2.icon, "fontSize",        unit(32, "px")),
    sd(s2.cTitle, "fontSize",      unit(18, "px")),
    sd(s2.cTitle, "fontWeight",    kw("600")),
    sd(s2.cTitle, "color",         rgb(226, 232, 240)),
    sd(s2.cBody, "fontSize",       unit(14, "px")),
    sd(s2.cBody, "color",          rgb(148, 163, 184)),
    sd(s2.cBody, "lineHeight",     unit(1.6, "number")),
  ],
};

// ─── Template 3: Two-Column Split ─────────────────────────────────────────────

const splitSection  = "t3_sec";
const splitLeft     = "t3_left";
const splitHeading  = "t3_hdg";
const splitText     = "t3_txt";
const splitBtn      = "t3_btn";
const splitRight    = "t3_right";
const splitImg      = "t3_img";

const s3 = { sec: "s3_sec", left: "s3_left", hdg: "s3_hdg", txt: "s3_txt",
             btn: "s3_btn", right: "s3_right", img: "s3_img" };

export const TEMPLATE_SPLIT: Template = {
  id: "split",
  name: "Two-Column Split",
  description: "Left copy + right image placeholder, great for product or about sections",
  previewIcon: "⊟",
  rootIds: [splitSection],
  instances: [
    inst(splitSection, "Box",       "Split Section",   [ref(splitLeft), ref(splitRight)]),
    inst(splitLeft,    "Box",       "Content Column",  [ref(splitHeading), ref(splitText), ref(splitBtn)]),
    inst(splitHeading, "Heading",   "Section Heading", [txt("Designed for Creators")]),
    inst(splitText,    "Paragraph", "Body Copy",       [txt("Whether you're building a portfolio, a startup landing page, or a full product site — Nova gives you the tools to make it perfect.")]),
    inst(splitBtn,     "Button",    "CTA",             [txt("Start Building")]),
    inst(splitRight,   "Box",       "Image Column",    [ref(splitImg)]),
    inst(splitImg,     "Box",       "Image Placeholder", []),
  ],
  props: [],
  styleSources: Object.values(s3).map(src),
  styleSourceSelections: [
    sel(splitSection, s3.sec),
    sel(splitLeft,    s3.left),
    sel(splitHeading, s3.hdg),
    sel(splitText,    s3.txt),
    sel(splitBtn,     s3.btn),
    sel(splitRight,   s3.right),
    sel(splitImg,     s3.img),
  ],
  styles: [
    sd(s3.sec, "backgroundColor",  rgb(10, 10, 20)),
    sd(s3.sec, "display",          kw("flex")),
    sd(s3.sec, "alignItems",       kw("center")),
    sd(s3.sec, "gap",              unit(48, "px")),
    sd(s3.sec, "paddingTop",       unit(64, "px")),
    sd(s3.sec, "paddingBottom",    unit(64, "px")),
    sd(s3.sec, "paddingLeft",      unit(48, "px")),
    sd(s3.sec, "paddingRight",     unit(48, "px")),
    sd(s3.sec, "maxWidth",         unit(1200, "px")),
    sd(s3.sec, "marginLeft",       kw("auto")),
    sd(s3.sec, "marginRight",      kw("auto")),
    sd(s3.left, "flex",            { type: "keyword", value: "1" }),
    sd(s3.left, "display",         kw("flex")),
    sd(s3.left, "flexDirection",   kw("column")),
    sd(s3.left, "gap",             unit(20, "px")),
    sd(s3.hdg, "fontSize",         unit(36, "px")),
    sd(s3.hdg, "fontWeight",       kw("700")),
    sd(s3.hdg, "color",            rgb(226, 232, 240)),
    sd(s3.hdg, "lineHeight",       unit(1.2, "number")),
    sd(s3.txt, "fontSize",         unit(16, "px")),
    sd(s3.txt, "color",            rgb(148, 163, 184)),
    sd(s3.txt, "lineHeight",       unit(1.7, "number")),
    sd(s3.btn, "backgroundColor",  rgb(124, 58, 237)),
    sd(s3.btn, "color",            rgb(255, 255, 255)),
    sd(s3.btn, "paddingTop",       unit(12, "px")),
    sd(s3.btn, "paddingBottom",    unit(12, "px")),
    sd(s3.btn, "paddingLeft",      unit(24, "px")),
    sd(s3.btn, "paddingRight",     unit(24, "px")),
    sd(s3.btn, "borderRadius",     unit(8, "px")),
    sd(s3.btn, "fontWeight",       kw("600")),
    sd(s3.btn, "alignSelf",        kw("flex-start")),
    sd(s3.right, "flex",           { type: "keyword", value: "1" }),
    sd(s3.img, "backgroundColor",  rgb(15, 23, 42)),
    sd(s3.img, "borderRadius",     unit(16, "px")),
    sd(s3.img, "height",           unit(320, "px")),
    sd(s3.img, "border",           { type: "keyword", value: "1px solid rgba(255,255,255,0.08)" }),
  ],
};

export const BUILT_IN_TEMPLATES: Template[] = [
  TEMPLATE_HERO,
  TEMPLATE_FEATURES,
  TEMPLATE_SPLIT,
];
