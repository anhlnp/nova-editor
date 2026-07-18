// M9 — Full-fidelity HTML export.
//
// Converts WebstudioData → a self-contained HTML document. Unlike the pre-M9
// stub (base-breakpoint styles only, expressions dropped — WS-PARITY-AUDIT #6),
// this emits the SAME CSS the canvas paints via the headless css-engine codegen
// (`lib/publish/cssGen`): @media rules per breakpoint, pseudo-state selectors and
// source cascade. Bound props are resolved to literal values (`lib/publish/expressionGen`).
// Markup carries data-ws-id / data-ws-component so the generated selectors match.
// Multi-page: every page in the project can be rendered (see exportPageToHtml).

import {
  type Page,
  type WebstudioData,
  type WsComponentMeta,
} from "@webstudio-is/sdk";
import { generateCss } from "./publish/cssGen";
import { resolveProps } from "./publish/expressionGen";

// Stable public attribute names — matching the generated CSS selectors (cssGen).
const idAttribute = "data-ws-id";
const componentAttribute = "data-ws-component";

const TAG: Record<string, string> = {
  Box: "div", Body: "div", Section: "section", Article: "article",
  Aside: "aside", Header: "header", Footer: "footer", Main: "main",
  Nav: "nav", Paragraph: "p", Heading: "h2", Text: "span",
  Bold: "strong", Italic: "em", Superscript: "sup", Subscript: "sub",
  Link: "a", RichTextLink: "a", Button: "button", Image: "img",
  Form: "form", WebhookForm: "form", Input: "input", Textarea: "textarea",
  Select: "select", Label: "label", Checkbox: "input",
  List: "ul", ListItem: "li", Separator: "hr",
  // HeroUI replicas → semantic HTML tags
  "heroui:HeroUIButton": "button", "heroui:HeroUIInput": "div",
  "heroui:HeroUICard": "div", "heroui:HeroUISwitch": "div",
  "heroui:HeroUIChip": "span", "heroui:HeroUIDivider": "hr",
  "heroui:HeroUISpinner": "div", "heroui:HeroUICode": "code",
  "heroui:HeroUIProgress": "div", "heroui:HeroUIUser": "div",
  "heroui:HeroUIRow": "div", "heroui:HeroUICol": "div",
  "heroui:HeroUIContainer": "div", "heroui:HeroUISection": "section",
  "heroui:HeroUIFlexRow": "div", "heroui:HeroUISpacer": "div",
  "heroui:HeroUIImage": "img", "heroui:HeroUIText": "p",
  "heroui:HeroUIHeading": "h2", "heroui:HeroUILink": "a",
};

// Inline styles for HeroUI components in exported HTML.
const HEROUI_EXPORT_STYLES: Record<string, (props: Record<string, unknown>) => string> = {
  "heroui:HeroUIButton": (p) => {
    const colors: Record<string, string> = { default: "#3f3f46", primary: "#006FEE", secondary: "#9353d3", success: "#17c964", warning: "#f5a524", danger: "#f31260" };
    const bg = colors[String(p.color ?? "primary")] ?? "#006FEE";
    return `display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:600;font-size:14px;padding:0 16px;height:40px;border-radius:12px;border:none;background:${bg};color:#fff;cursor:pointer;font-family:system-ui,sans-serif;`;
  },
  "heroui:HeroUICard": () => "background:#18181b;border:1px solid #27272a;border-radius:14px;box-shadow:0 4px 14px rgba(0,0,0,0.3);padding:16px;color:#fafafa;font-family:system-ui,sans-serif;",
  "heroui:HeroUIRow": (p) => `display:grid;grid-template-columns:repeat(12,1fr);gap:${p.gap ?? "16px"};width:100%;box-sizing:border-box;`,
  "heroui:HeroUICol": (p) => { const s = Math.max(1, Math.min(12, Number(p.span) || 6)); return `grid-column:span ${s}/span ${s};min-width:0;`; },
  "heroui:HeroUIChip": () => "display:inline-flex;align-items:center;font-size:12px;padding:4px 10px;border-radius:9999px;background:#3f3f46;color:#fafafa;font-family:system-ui,sans-serif;",
  "heroui:HeroUIProgress": (p) => { const v = Math.max(0, Math.min(100, Number(p.value) || 50)); return `width:100%;height:6px;background:#27272a;border-radius:9999px;overflow:hidden;--progress-w:${v}%;`; },
  "heroui:HeroUIInput": () => "display:flex;flex-direction:column;gap:4px;font-family:system-ui,sans-serif;width:100%;",
  "heroui:HeroUISpinner": () => "display:inline-flex;flex-direction:column;align-items:center;gap:8px;",
  "heroui:HeroUICode": () => "font-family:ui-monospace,'Fira Code',monospace;font-size:14px;padding:2px 8px;border-radius:6px;background:rgba(63,63,70,0.25);color:#d4d4d8;",
  "heroui:HeroUIUser": () => "display:inline-flex;align-items:center;gap:12px;font-family:system-ui,sans-serif;color:#fafafa;",
  "heroui:HeroUIDivider": () => "border:none;background:#27272a;height:1px;width:100%;margin:8px 0;",
  "heroui:HeroUISwitch": () => "display:inline-flex;align-items:center;gap:8px;font-family:system-ui,sans-serif;color:#fafafa;",
  "heroui:HeroUIContainer": (p) => {
    const justifyMap: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end", between: "space-between", around: "space-around", evenly: "space-evenly" };
    const alignMap: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch", baseline: "baseline" };
    return `display:flex;flex-direction:${p.direction ?? "column"};justify-content:${justifyMap[String(p.justify ?? "start")] ?? "flex-start"};align-items:${alignMap[String(p.align ?? "stretch")] ?? "stretch"};gap:${p.gap ?? "0px"};padding:${p.padding ?? "16px"};flex-wrap:${p.wrap ?? "nowrap"};box-sizing:border-box;min-height:40px;width:100%;`;
  },
  "heroui:HeroUISection": (p) => `display:flex;flex-direction:column;width:100%;max-width:${p.maxWidth ?? "1200px"};margin:0 auto;padding:${p.padding ?? "48px 24px"};background:${p.background ?? "transparent"};box-sizing:border-box;min-height:80px;`,
  "heroui:HeroUIFlexRow": (p) => {
    const justifyMap: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end", between: "space-between", around: "space-around" };
    const alignMap: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch" };
    return `display:flex;flex-direction:row;gap:${p.gap ?? "12px"};justify-content:${justifyMap[String(p.justify ?? "start")] ?? "flex-start"};align-items:${alignMap[String(p.align ?? "center")] ?? "center"};flex-wrap:${p.wrap ?? "wrap"};width:100%;box-sizing:border-box;min-height:32px;`;
  },
  "heroui:HeroUISpacer": (p) => `height:${p.height ?? "24px"};width:100%;flex-shrink:0;`,
  "heroui:HeroUIImage": (p) => `width:${p.width ?? "100%"};height:${p.height ?? "auto"};object-fit:${p.objectFit ?? "cover"};border-radius:${p.borderRadius ?? "8px"};display:block;max-width:100%;`,
  "heroui:HeroUIText": (p) => `font-size:${p.fontSize ?? "16px"};font-weight:${p.fontWeight ?? "400"};color:${p.color ?? "inherit"};text-align:${p.textAlign ?? "left"};line-height:1.6;margin:0;`,
  "heroui:HeroUIHeading": (p) => {
    const sizes: Record<number, string> = { 1: "2.5rem", 2: "2rem", 3: "1.5rem", 4: "1.25rem", 5: "1rem", 6: "0.875rem" };
    return `font-size:${sizes[Number(p.level ?? 2)] ?? "2rem"};font-weight:bold;text-align:${p.textAlign ?? "left"};color:${p.color ?? "inherit"};margin:0;line-height:1.3;`;
  },
  "heroui:HeroUILink": (p) => `color:${p.color ?? "#006FEE"};text-decoration:underline;cursor:pointer;`,
};

const VOID_TAGS = new Set(["img", "input", "hr", "br"]);

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Mirror of InteractionDef (lib/nano-states) — kept local so the exporter
// stays self-contained.
export interface ExportInteraction {
  id: string;
  trigger: "click" | "mouseover" | "focus" | "scroll" | "load";
  action:
  | { type: "navigate"; url: string; newTab?: boolean }
  | { type: "toggleClass"; className: string }
  | { type: "showHide"; targetInstanceId?: string }
  | { type: "animate"; keyframe: string; duration: number; easing: string; fill: string };
}

export interface ExportCookieConsent {
  enabled: boolean;
  message: string;
  acceptLabel: string;
  declineLabel: string;
  position: "bottom" | "top" | "bottom-left" | "bottom-right";
  bgColor: string;
  textColor: string;
  buttonColor: string;
}

export interface ExportOptions {
  title?: string;
  brandingName?: string;
  hidePoweredBy?: boolean;
  customCss?: string;
  interactions?: Record<string, ExportInteraction[]>;
  cookieConsent?: ExportCookieConsent | null;
  // When set, forms in the export post {projectId, formName, fields} here.
  projectId?: string;
  apiBaseUrl?: string;
  // Component preset styles (same map the canvas registers). Optional — presets
  // are omitted when not supplied, so callers without meta access still get user styles.
  metas?: Map<string, WsComponentMeta>;
  assetBaseUrl?: string;
  // Render a specific page instead of the home page (multi-page export).
  page?: Page;
}

// Serialize one instance subtree to HTML, emitting data-ws-* so generated CSS matches.
function renderInstance(
  data: WebstudioData,
  propMap: Map<string, Record<string, unknown>>,
  iId: string,
  indent: number
): string {
  const inst = data.instances.get(iId);
  if (!inst) return "";
  const ip = propMap.get(iId) ?? {};
  let tag = TAG[inst.component] ?? "div";
  if (inst.component === "heroui:HeroUIHeading") {
    const level = ip["level"] ?? 2;
    tag = `h${level}`;
  }
  const pad = "  ".repeat(indent);
  const attrs: string[] = [
    `${idAttribute}="${iId}"`,
    `${componentAttribute}="${esc(inst.component)}"`,
  ];

  if (tag === "a") {
    if (ip["href"]) attrs.push(`href="${esc(String(ip["href"]))}"`);
    if (ip["target"]) attrs.push(`target="${esc(String(ip["target"]))}"`);
  }
  if (tag === "img") {
    if (ip["src"]) attrs.push(`src="${esc(String(ip["src"]))}"`);
    attrs.push(`alt="${esc(String(ip["alt"] ?? ""))}"`);
    if (ip["width"]) attrs.push(`width="${ip["width"]}"`);
    if (ip["height"]) attrs.push(`height="${ip["height"]}"`);
    return `${pad}<img ${attrs.join(" ")}>\n`;
  }
  if (tag === "input") {
    attrs.push(`type="${esc(String(ip["type"] ?? "text"))}"`);
    if (ip["placeholder"]) attrs.push(`placeholder="${esc(String(ip["placeholder"]))}"`);
    if (ip["name"]) attrs.push(`name="${esc(String(ip["name"]))}"`);
    if (ip["required"]) attrs.push("required");
    return `${pad}<input ${attrs.join(" ")}>\n`;
  }
  if (VOID_TAGS.has(tag)) return `${pad}<${tag} ${attrs.join(" ")}>\n`;

  if (tag === "form") {
    // caller decides wiring via projectId; handled in the document assembler
    if (ip["action"]) attrs.push(`action="${esc(String(ip["action"]))}"`);
    attrs.push(`method="${esc(String(ip["method"] ?? "get"))}"`);
  }
  // Inline style prop (e.g. from Tailwind paste M7) travels through.
  if (typeof ip["style"] === "string" && ip["style"]) {
    attrs.push(`style="${esc(ip["style"] as string)}"`);
  }
  // HeroUI component inline styles for export
  const heroStyleFn = HEROUI_EXPORT_STYLES[inst.component];
  if (heroStyleFn && !ip["style"]) {
    attrs.push(`style="${esc(heroStyleFn(ip))}"`);
  }

  const children = inst.children
    .map((c) => {
      if (c.type === "text") return `${pad}  ${esc(c.value)}\n`;
      if (c.type === "id") return renderInstance(data, propMap, c.value, indent + 1);
      return "";
    })
    .join("");

  return `${pad}<${tag} ${attrs.join(" ")}>\n${children}${pad}</${tag}>\n`;
}

function buildScripts(opts: ExportOptions): string {
  // Interactions (P46 + M10 animate) — instanceIds map to [data-ws-id] selectors.
  const interactionList: Array<{ sel: string; trigger: string; action: unknown }> = [];
  for (const [instanceId, defs] of Object.entries(opts.interactions ?? {})) {
    for (const def of defs) {
      const action = def.action.type === "showHide" && def.action.targetInstanceId
        ? { ...def.action, targetSel: `[${idAttribute}="${def.action.targetInstanceId}"]` }
        : def.action;
      interactionList.push({ sel: `[${idAttribute}="${instanceId}"]`, trigger: def.trigger, action });
    }
  }
  const interactionsScript = interactionList.length
    ? `<script>
(function(){
  var defs=${JSON.stringify(interactionList)};
  defs.forEach(function(d){
    var el=document.querySelector(d.sel); if(!el) return;
    function run(){
      var a=d.action;
      if(a.type==="navigate"){ if(a.newTab) window.open(a.url,"_blank"); else window.location.href=a.url; }
      else if(a.type==="toggleClass"){ el.classList.toggle(a.className); }
      else if(a.type==="showHide"){ var t=a.targetSel?document.querySelector(a.targetSel):el; if(t) t.style.display=t.style.display==="none"?"":"none"; }
      else if(a.type==="animate"){ el.style.animation=a.keyframe+" "+a.duration+"ms "+a.easing+" "+a.fill; }
    }
    if(d.trigger==="load"){ run(); }
    else if(d.trigger==="scroll"){ window.addEventListener("scroll",run,{passive:true}); }
    else { el.addEventListener(d.trigger,run); }
  });
})();
</script>`
    : "";

  const formsScript = opts.projectId
    ? `<script>
(function(){
  var endpoint=${JSON.stringify(`${(opts.apiBaseUrl ?? "").replace(/\/$/, "")}/api/submissions`)};
  document.querySelectorAll("form").forEach(function(form){
    form.addEventListener("submit",function(e){
      e.preventDefault();
      var fields={};
      new FormData(form).forEach(function(v,k){ fields[k]=String(v); });
      fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({projectId:${JSON.stringify(opts.projectId)},formName:form.getAttribute("name")||"default",fields:fields})})
        .then(function(){ form.reset();
          var m=document.createElement("div"); m.textContent="Thanks! Your submission was received.";
          m.style.cssText="padding:10px 0;font-size:14px;color:#059669"; form.appendChild(m); })
        .catch(function(){});
    });
  });
})();
</script>`
    : "";

  const cc = opts.cookieConsent;
  const cookieBanner = cc?.enabled
    ? `<div id="nova-cookie-banner" style="display:none;position:fixed;z-index:9999;${cc.position === "top" ? "top:0;left:0;right:0;" :
      cc.position === "bottom-left" ? "bottom:16px;left:16px;max-width:380px;border-radius:10px;" :
        cc.position === "bottom-right" ? "bottom:16px;right:16px;max-width:380px;border-radius:10px;" :
          "bottom:0;left:0;right:0;"
    }background:${cc.bgColor};padding:14px 18px;font-family:system-ui,sans-serif;align-items:center;gap:12px;flex-wrap:wrap;box-shadow:0 -2px 16px rgba(0,0,0,0.2)">
  <span style="font-size:13px;color:${cc.textColor};flex:1;min-width:200px;line-height:1.5">${esc(cc.message)}</span>
  <span style="display:flex;gap:8px;flex-shrink:0">
    <button id="nova-cookie-accept" style="padding:7px 16px;border-radius:6px;border:none;background:${cc.buttonColor};color:#fff;font-size:12px;font-weight:600;cursor:pointer">${esc(cc.acceptLabel)}</button>
    <button id="nova-cookie-decline" style="padding:7px 16px;border-radius:6px;border:1px solid ${cc.buttonColor};background:transparent;color:${cc.textColor};font-size:12px;cursor:pointer">${esc(cc.declineLabel)}</button>
  </span>
</div>
<script>
(function(){
  var KEY="nova-cookie-consent";
  if(localStorage.getItem(KEY)) return;
  var b=document.getElementById("nova-cookie-banner"); if(!b) return;
  b.style.display="flex";
  document.getElementById("nova-cookie-accept").addEventListener("click",function(){ localStorage.setItem(KEY,"accepted"); b.remove(); });
  document.getElementById("nova-cookie-decline").addEventListener("click",function(){ localStorage.setItem(KEY,"declined"); b.remove(); });
})();
</script>`
    : "";

  return [cookieBanner, interactionsScript, formsScript].filter(Boolean).join("\n");
}

// Render a single page to a full HTML document.
export function exportPageToHtml(data: WebstudioData, page: Page, opts: ExportOptions): string {
  const title = opts.title ?? page.title ?? page.name ?? "Site";

  // Resolve bound props to literal values (M4 expressions in output).
  const propMap = resolveProps(data.props, data.dataSources);

  // Full-fidelity CSS via the headless css-engine codegen (media/state/cascade).
  const css = generateCss(data, opts.metas ?? new Map(), opts.assetBaseUrl ?? "");

  const rootInst = data.instances.get(page.rootInstanceId);
  const bodyHtml = rootInst
    ? rootInst.children
      .map((c) =>
        c.type === "id"
          ? renderInstance(data, propMap, c.value, 2)
          : c.type === "text"
            ? `    ${esc(c.value)}\n`
            : ""
      )
      .join("")
    : "";

  const poweredBy = opts.hidePoweredBy ? "" : `<!-- Built with ${opts.brandingName || "Nova"} -->`;
  const customCssBlock = opts.customCss?.trim()
    ? `  <style id="nova-custom-css">\n${opts.customCss}\n  </style>`
    : "";

  return [
    "<!DOCTYPE html>",
    poweredBy,
    '<html lang="en">',
    "<head>",
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `  <title>${esc(title)}</title>`,
    '  <script src="https://cdn.tailwindcss.com"></script>',
    "  <style>",
    "    *, *::before, *::after { box-sizing: border-box; }",
    "    body { margin: 0; }",
    css.fonts,
    css.presets,
    css.user,
    "  </style>",
    customCssBlock,
    "</head>",
    `<body ${idAttribute}="${page.rootInstanceId}" ${componentAttribute}="Body">`,
    bodyHtml.trimEnd(),
    buildScripts(opts),
    "</body>",
    "</html>",
  ].filter(Boolean).join("\n");
}

// Backwards-compatible entry point — exports the home page.
export function exportToHtml(
  data: WebstudioData,
  titleOrOptions: string | ExportOptions = "Exported Site"
): string {
  const opts: ExportOptions = typeof titleOrOptions === "string"
    ? { title: titleOrOptions }
    : titleOrOptions;

  const page = opts.page ?? data.pages.pages.get(data.pages.homePageId);
  if (!page) return `<!DOCTYPE html><html><body><p>No content.</p></body></html>`;
  return exportPageToHtml(data, page, opts);
}

// Multi-page export: returns one { path, filename, html } per page.
export function exportAllPages(
  data: WebstudioData,
  opts: ExportOptions = {}
): Array<{ path: string; filename: string; html: string }> {
  const out: Array<{ path: string; filename: string; html: string }> = [];
  for (const page of data.pages.pages.values()) {
    const isHome = page.id === data.pages.homePageId;
    const filename = isHome ? "index.html" : `${(page.path || page.name || page.id).replace(/^\//, "").replace(/[^a-zA-Z0-9/_-]/g, "-") || page.id}.html`;
    out.push({
      path: page.path || "/",
      filename,
      html: exportPageToHtml(data, page, { ...opts, page, title: page.title ?? page.name }),
    });
  }
  return out;
}
