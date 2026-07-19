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
};

// Color maps matching shadcn defaults
const SHADCN_COLORS: Record<string, string> = {
  default: "#18181b", primary: "#7c3aed", secondary: "#27272a",
  destructive: "#ef4444", outline: "transparent", ghost: "transparent",
};

type ShadcnRenderer = (
  iId: string,
  ip: Record<string, unknown>,
  children: string,
  pad: string
) => string;

const SHADCN_RENDERERS: Record<string, ShadcnRenderer> = {
  "shadcn:Button": (iId, ip, children) => {
    const variant = String(ip.variant ?? "default");
    const size = String(ip.size ?? "default");
    const sizeMap: Record<string, string> = { sm: "32px", default: "38px", lg: "44px", icon: "38px" };
    const fontMap: Record<string, string> = { sm: "12px", default: "14px", lg: "16px", icon: "14px" };
    const padMap: Record<string, string> = { sm: "0 12px", default: "0 16px", lg: "0 24px", icon: "0" };
    const widthMap: Record<string, string> = { icon: "38px" };
    const bg = SHADCN_COLORS[variant] ?? "#7c3aed";
    const text = variant === "outline" || variant === "ghost" ? "var(--ui-text)" : "#fff";
    const border = variant === "outline" ? "1px solid var(--ui-border)" : "none";
    const content = children.trim() || "Button";
    const style = `display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:500;font-size:${fontMap[size] ?? "14px"};padding:${padMap[size] ?? "0 16px"};height:${sizeMap[size] ?? "38px"};${widthMap[size] ? `width:${widthMap[size]};` : ""}border-radius:6px;border:${border};background:${bg};color:${text};cursor:pointer;font-family:system-ui,sans-serif;text-decoration:none;white-space:nowrap;`;
    return `<button ${idAttribute}="${iId}" ${componentAttribute}="shadcn:Button" style="${esc(style)}">${content}</button>\n`;
  },

  "shadcn:Input": (iId, ip, _children, pad) => {
    const placeholder = String(ip.placeholder ?? "Search...");
    const type = String(ip.type ?? "text");
    const style = `width:100%;padding:8px 12px;border-radius:6px;border:1px solid var(--ui-border);background:var(--ui-bg);color:var(--ui-text);font-size:14px;font-family:system-ui,sans-serif;outline:none;box-sizing:border-box;`;
    return `${pad}<input ${idAttribute}="${iId}" ${componentAttribute}="shadcn:Input" type="${esc(type)}" placeholder="${esc(placeholder)}" style="${esc(style)}">\n`;
  },

  "shadcn:Textarea": (iId, ip, _children, pad) => {
    const placeholder = String(ip.placeholder ?? "Type message...");
    const style = `width:100%;min-height:80px;padding:8px 12px;border-radius:6px;border:1px solid var(--ui-border);background:var(--ui-bg);color:var(--ui-text);font-size:14px;font-family:system-ui,sans-serif;outline:none;box-sizing:border-box;resize:vertical;`;
    return `${pad}<textarea ${idAttribute}="${iId}" ${componentAttribute}="shadcn:Textarea" placeholder="${esc(placeholder)}" style="${esc(style)}"></textarea>\n`;
  },

  "shadcn:Checkbox": (iId, ip, children, pad) => {
    const isChecked = ip.isChecked === true || ip.isChecked === "true";
    const bg = isChecked ? "var(--ui-accent)" : "transparent";
    const border = isChecked ? "var(--ui-accent)" : "var(--ui-border)";
    const checkColor = isChecked ? "#fff" : "transparent";
    const label = children.trim() || "Accept terms";
    const boxStyle = `width:16px;height:16px;border-radius:4px;border:1px solid ${border};background:${bg};display:inline-flex;align-items:center;justify-content:center;color:${checkColor};font-size:10px;font-weight:bold;flex-shrink:0;`;
    const wrapStyle = `display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-family:system-ui,sans-serif;color:var(--ui-text);`;
    return `${pad}<div ${idAttribute}="${iId}" ${componentAttribute}="shadcn:Checkbox" style="${esc(wrapStyle)}">\n${pad}  <span style="${esc(boxStyle)}">✓</span>\n${pad}  <span style="font-size:14px;font-weight:500;">${esc(label)}</span>\n${pad}</div>\n`;
  },

  "shadcn:Switch": (iId, ip, children, pad) => {
    const isChecked = ip.isChecked === true || ip.isChecked === "true";
    const trackColor = isChecked ? "var(--ui-accent)" : "var(--ui-border)";
    const thumbLeft = isChecked ? "calc(100% - 18px)" : "2px";
    const trackStyle = `display:inline-flex;position:relative;width:36px;height:20px;border-radius:10px;background:${trackColor};transition:background .2s;flex-shrink:0;cursor:pointer;`;
    const thumbStyle = `position:absolute;top:2px;left:${thumbLeft};width:16px;height:16px;border-radius:50%;background:#fff;transition:left .2s;`;
    const wrapStyle = `display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-family:system-ui,sans-serif;color:var(--ui-text);`;
    const label = children.trim() || "";
    const labelHtml = label ? `<span style="font-size:14px;font-weight:500;">${label}</span>` : "";
    return `${pad}<label ${idAttribute}="${iId}" ${componentAttribute}="shadcn:Switch" style="${esc(wrapStyle)}">\n${pad}  <span style="${esc(trackStyle)}"><span style="${esc(thumbStyle)}"></span></span>\n${pad}  ${labelHtml}\n${pad}</label>\n`;
  },

  "shadcn:Select": (iId, ip, _children, pad) => {
    const placeholder = String(ip.placeholder ?? "Select option");
    const val = String(ip.defaultValue ?? "Active");
    const style = `display:inline-flex;align-items:center;justify-content:between;width:100%;max-width:200px;padding:8px 12px;border-radius:6px;border:1px solid var(--ui-border);background:var(--ui-bg);color:var(--ui-text);font-size:14px;font-family:system-ui,sans-serif;box-sizing:border-box;`;
    return `${pad}<div ${idAttribute}="${iId}" ${componentAttribute}="shadcn:Select" style="${esc(style)}">\n${pad}  <span style="flex-grow:1;text-align:left;">${esc(val || placeholder)}</span>\n${pad}  <span style="font-size:10px;color:var(--ui-text-muted);">▼</span>\n${pad}</div>\n`;
  },

  "shadcn:Badge": (iId, ip, children, pad) => {
    const variant = String(ip.variant ?? "default");
    const bg = variant === "destructive" ? "var(--ui-danger)" : variant === "secondary" ? "var(--ui-surface)" : "var(--ui-accent)";
    const textColor = variant === "secondary" ? "var(--ui-text)" : "#fff";
    const border = variant === "outline" ? "1px solid var(--ui-border)" : "none";
    const bgStyle = variant === "outline" ? "transparent" : bg;
    const style = `display:inline-flex;align-items:center;font-size:11px;padding:2px 10px;border-radius:9999px;background:${bgStyle};color:${textColor};border:${border};font-family:system-ui,sans-serif;white-space:nowrap;font-weight:600;`;
    const content = children.trim() || "Badge";
    return `${pad}<span ${idAttribute}="${iId}" ${componentAttribute}="shadcn:Badge" style="${esc(style)}">${content}</span>\n`;
  },

  "shadcn:Avatar": (iId, ip, _children, pad) => {
    const name = String(ip.name ?? "John Doe");
    const src = ip.src ? String(ip.src) : "";
    const initials = name.split(" ").map((n: string) => n[0] ?? "").join("").slice(0, 2).toUpperCase();
    const style = `width:36px;height:36px;border-radius:50%;background:var(--ui-surface);color:var(--ui-text);display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;flex-shrink:0;overflow:hidden;border:1px solid var(--ui-border);font-family:system-ui,sans-serif;`;
    const innerHtml = src
      ? `<img src="${esc(src)}" alt="${esc(name)}" style="width:100%;height:100%;object-fit:cover;">`
      : initials;
    return `${pad}<div ${idAttribute}="${iId}" ${componentAttribute}="shadcn:Avatar" style="${esc(style)}">${innerHtml}</div>\n`;
  },

  "shadcn:Progress": (iId, ip, _children, pad) => {
    const value = Math.max(0, Math.min(100, Number(ip.value) || 60));
    const trackStyle = `width:100%;height:8px;background:var(--ui-surface);border-radius:9999px;overflow:hidden;`;
    const barStyle = `height:100%;width:${value}%;background:var(--ui-accent);border-radius:9999px;`;
    return `${pad}<div ${idAttribute}="${iId}" ${componentAttribute}="shadcn:Progress" style="display:flex;flex-direction:column;width:100%;">\n${pad}  <div style="${esc(trackStyle)}"><div style="${esc(barStyle)}"></div></div>\n${pad}</div>\n`;
  },

  "shadcn:Separator": (iId, ip, _children, pad) => {
    const orientation = String(ip.orientation ?? "horizontal");
    const style = orientation === "horizontal"
      ? "width:100%;height:1px;background:var(--ui-border);margin:8px 0;display:block;border:none;"
      : "height:100%;width:1px;background:var(--ui-border);margin:0 8px;display:inline-block;border:none;";
    return `${pad}<hr ${idAttribute}="${iId}" ${componentAttribute}="shadcn:Separator" style="${esc(style)}">\n`;
  },

  "shadcn:Code": (iId, _ip, children, pad) => {
    const style = `font-family:ui-monospace,'Fira Code',monospace;font-size:13px;padding:2px 6px;border-radius:4px;background:var(--ui-surface);color:var(--ui-text);border:1px solid var(--ui-border);`;
    const content = children.trim() || "code";
    return `${pad}<code ${idAttribute}="${iId}" ${componentAttribute}="shadcn:Code" style="${esc(style)}">${content}</code>\n`;
  },

  "shadcn:Kbd": (iId, _ip, children, pad) => {
    const style = `font-family:system-ui,sans-serif;font-size:11px;padding:2px 6px;border-radius:4px;background:var(--ui-surface);color:var(--ui-text);border:1px solid var(--ui-border);box-shadow:0 1px 1px rgba(0,0,0,0.1);font-weight:600;`;
    const content = children.trim() || "Ctrl + P";
    return `${pad}<kbd ${idAttribute}="${iId}" ${componentAttribute}="shadcn:Kbd" style="${esc(style)}">${content}</kbd>\n`;
  },
};

const SHADCN_CONTAINER_STYLES: Record<string, (p: Record<string, unknown>) => string> = {
  "shadcn:Card": () => "background:var(--ui-card);border:1px solid var(--ui-border);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:16px;color:var(--ui-text);font-family:system-ui,sans-serif;",
  "shadcn:Row": (p) => `display:grid;grid-template-columns:repeat(12,1fr);gap:${p.gap ?? "16px"};width:100%;box-sizing:border-box;`,
  "shadcn:Col": (p) => { const s = Math.max(1, Math.min(12, Number(p.span) || 6)); return `grid-column:span ${s}/span ${s};min-width:0;`; },
  "shadcn:Container": (p) => {
    const jMap: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end", between: "space-between", around: "space-around", evenly: "space-evenly" };
    const aMap: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch", baseline: "baseline" };
    return `display:flex;flex-direction:${p.direction ?? "column"};justify-content:${jMap[String(p.justify ?? "start")] ?? "flex-start"};align-items:${aMap[String(p.align ?? "stretch")] ?? "stretch"};gap:${p.gap ?? "0px"};padding:${p.padding ?? "16px"};flex-wrap:${p.wrap ?? "nowrap"};box-sizing:border-box;min-height:40px;width:100%;`;
  },
  "shadcn:Section": (p) => `display:flex;flex-direction:column;width:100%;max-width:${p.maxWidth ?? "1200px"};margin:0 auto;padding:${p.padding ?? "48px 24px"};background:${p.background ?? "transparent"};box-sizing:border-box;min-height:80px;`,
  "shadcn:FlexRow": (p) => {
    const jMap: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end", between: "space-between", around: "space-around" };
    const aMap: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch" };
    return `display:flex;flex-direction:row;gap:${p.gap ?? "12px"};justify-content:${jMap[String(p.justify ?? "start")] ?? "flex-start"};align-items:${aMap[String(p.align ?? "center")] ?? "center"};flex-wrap:${p.wrap ?? "wrap"};width:100%;box-sizing:border-box;min-height:32px;`;
  },
  "shadcn:Spacer": (p) => `height:${p.height ?? "24px"};width:100%;flex-shrink:0;`,
  "shadcn:Text": (p) => `font-size:${p.fontSize ?? "16px"};font-weight:${p.fontWeight ?? "400"};color:${p.color ?? "inherit"};text-align:${p.textAlign ?? "left"};line-height:1.6;margin:0;font-family:system-ui,sans-serif;`,
  "shadcn:Heading": (p) => {
    const sizes: Record<number, string> = { 1: "2.25rem", 2: "1.75rem", 3: "1.5rem", 4: "1.25rem", 5: "1rem", 6: "0.875rem" };
    return `font-size:${sizes[Number(p.level ?? 2)] ?? "1.75rem"};font-weight:700;text-align:${p.textAlign ?? "left"};color:${p.color ?? "inherit"};margin:0;line-height:1.25;font-family:system-ui,sans-serif;letter-spacing:-0.025em;`;
  },
  "shadcn:Link": (p) => `color:${p.color ?? "var(--ui-accent)"};text-decoration:underline;cursor:pointer;font-family:system-ui,sans-serif;`,
};

const SHADCN_CONTAINER_TAG: Record<string, string> = {
  "shadcn:Card": "div",
  "shadcn:Row": "div", "shadcn:Col": "div",
  "shadcn:Container": "div", "shadcn:Section": "section",
  "shadcn:FlexRow": "div", "shadcn:Spacer": "div",
  "shadcn:Text": "p", "shadcn:Heading": "h2",
  "shadcn:Link": "a",
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
  const pad = "  ".repeat(indent);

  // ── shadcn: self-contained renderers (Button, Switch, Input, etc.) ────────
  const shadcnRenderer = SHADCN_RENDERERS[inst.component];
  if (shadcnRenderer) {
    // Collect children HTML first (for components that may embed children, e.g. button label)
    const childrenHtml = inst.children
      .map((c) => {
        if (c.type === "text") return esc(c.value);
        if (c.type === "id") return renderInstance(data, propMap, c.value, indent + 1);
        return "";
      })
      .join("");
    return shadcnRenderer(iId, ip, childrenHtml, pad);
  }

  // ── shadcn: layout/passthrough containers ─────────────────────────────────
  const shadcnContainerStyle = SHADCN_CONTAINER_STYLES[inst.component];
  if (shadcnContainerStyle) {
    let tag = SHADCN_CONTAINER_TAG[inst.component] ?? "div";
    // Dynamic heading tag
    if (inst.component === "shadcn:Heading") {
      tag = `h${ip.level ?? 2}`;
    }
    const styleStr = shadcnContainerStyle(ip);
    const attrs: string[] = [
      `${idAttribute}="${iId}"`,
      `${componentAttribute}="${esc(inst.component)}"`,
      `style="${esc(styleStr)}"`,
    ];
    // Image: self-closing
    if (tag === "img") {
      const src = ip.src ? String(ip.src) : "https://via.placeholder.com/400x250?text=Image";
      attrs.push(`src="${esc(src)}" alt="${esc(String(ip.alt ?? "Image"))}"`);
      return `${pad}<img ${attrs.join(" ")}>\n`;
    }
    // Link: add href
    if (tag === "a") {
      if (ip.href) attrs.push(`href="${esc(String(ip.href))}"`);
      if (ip.target) attrs.push(`target="${esc(String(ip.target))}"`);
    }
    const children = inst.children
      .map((c) => {
        if (c.type === "text") return `${pad}  ${esc(c.value)}\n`;
        if (c.type === "id") return renderInstance(data, propMap, c.value, indent + 1);
        return "";
      })
      .join("");
    // Fallback content for empty containers (e.g. Text, Heading)
    const fallbacks: Record<string, string> = {
      "shadcn:Text": "Text block",
      "shadcn:Heading": `Heading ${ip.level ?? 2}`,
      "shadcn:Link": "Link text",
    };
    const inner = children || (fallbacks[inst.component] ? `${pad}  ${fallbacks[inst.component]}\n` : "");
    return `${pad}<${tag} ${attrs.join(" ")}>\n${inner}${pad}</${tag}>\n`;
  }

  // ── Standard component rendering ──────────────────────────────────────────
  let tag = TAG[inst.component] ?? "div";
  if (inst.component === "Heading") {
    const level = ip["level"] ?? 2;
    tag = `h${level}`;
  }

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
    if (ip["action"]) attrs.push(`action="${esc(String(ip["action"]))}"`);
    attrs.push(`method="${esc(String(ip["method"] ?? "get"))}"`);
  }
  // Inline style prop (e.g. from Tailwind paste M7) travels through.
  if (typeof ip["style"] === "string" && ip["style"]) {
    attrs.push(`style="${esc(ip["style"] as string)}"`);
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
    "    @keyframes nova-spin { to { transform: rotate(360deg); } }",
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
