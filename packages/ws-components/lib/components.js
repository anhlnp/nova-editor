import { jsx as i, jsxs as ne, Fragment as re } from "react/jsx-runtime";
import { forwardRef as l, useContext as g, useState as L, useSyncExternalStore as Te, useRef as P, useMemo as oe, useEffect as A, createElement as I, createContext as ve, useCallback as Ne, useId as we } from "react";
import { mergeRefs as Se } from "@react-aria/utils";
import { ReactSdkContext as S } from "@webstudio-is/react-sdk/runtime";
import { micromark as Ae } from "micromark";
import { gfmTableHtml as Ee, gfmTable as Le } from "micromark-extension-gfm-table";
import { getTagFromProps as V } from "@webstudio-is/sdk/runtime";
import { B as In, B as Rn } from "./link-BlqzOhBL.js";
import { Image as Ie } from "@webstudio-is/image";
import { colord as Re } from "colord";
import De from "await-interaction-response";
import { X as F } from "./head-slot-BEYGWhGu.js";
import { H as kn, S as Cn } from "./head-slot-BEYGWhGu.js";
const ke = l((e, t) => /* @__PURE__ */ i(
  "div",
  {
    ...e,
    ref: t,
    style: { display: e.children ? "contents" : "block" }
  }
));
ke.displayName = "Slot";
const Ce = l((e, t) => /* @__PURE__ */ i("div", { ...e, ref: t, style: { display: "contents" } }));
Ce.displayName = "Fragment";
const Me = () => document.readyState === "complete" || document.readyState === "interactive", D = [];
let W = !1;
const Oe = () => {
  if (Me() === !1) {
    console.error("DOMContentLoaded event has not been fired yet");
    return;
  }
  if (W)
    return;
  W = !0;
  const e = document.addEventListener, t = window.addEventListener, n = new Event("DOMContentLoaded"), r = new Event("load");
  window.addEventListener = (s, a, o) => {
    s === "DOMContentLoaded" ? D.push(
      () => a.call(window, n)
    ) : (s === "load" && D.push(() => a.call(window, r)), t.call(window, s, a, o));
  }, document.addEventListener = (s, a, o) => {
    s === "DOMContentLoaded" ? D.push(
      () => a.call(document, n)
    ) : e.call(document, s, a, o);
  };
}, Pe = () => {
  for (const e of D)
    e();
  D.length = 0;
}, _e = "client-", Ue = (e) => new Promise((t, n) => {
  const r = document.createElement("script"), s = e.hasAttribute("src"), a = e.type === "module";
  for (const { name: o, value: c } of e.attributes)
    r.setAttribute(o, c);
  if (r.dataset.testid !== void 0 && (r.dataset.testid = `${_e}${r.dataset.testid}`), s)
    r.addEventListener("load", () => {
      t();
    }), r.addEventListener("error", n);
  else {
    if (a) {
      const o = new Blob([e.innerText], {
        type: "text/javascript"
      }), c = URL.createObjectURL(o);
      import(
        /* webpackIgnore: true */
        /* @vite-ignore */
        c
      ).then(t).catch(n).finally(() => {
        URL.revokeObjectURL(c);
      });
      return;
    }
    r.textContent = e.innerText;
  }
  e.replaceWith(r), s === !1 && t();
}), U = [];
let x = !1;
const xe = async (e) => {
  if (U.push(...e), await Promise.resolve(), !x) {
    for (Oe(), x = !0; U.length > 0; )
      await U.shift()();
    Pe(), x = !1;
  }
}, Be = (e) => {
  const t = e.querySelectorAll("script"), n = [], r = [];
  t.forEach((s) => {
    (s.hasAttribute("async") ? r : n).push(() => Ue(s));
  });
  for (const s of r)
    s();
  xe(n);
}, Ve = (e) => {
  const { code: t, innerRef: n, ...r } = e;
  return /* @__PURE__ */ i("div", { ref: n, ...r, style: { display: "block", padding: 20 }, children: 'Open the "Settings" panel to insert HTML code.' });
}, ae = () => Te(
  () => () => {
  },
  () => !1,
  () => !0
), O = (e) => {
  if (!ae())
    return e.children;
}, q = (e) => {
  const { code: t, innerRef: n, ...r } = e, s = P(null), a = P(!0), o = oe(
    () => ({
      __html: t ?? ""
    }),
    [t]
  );
  return A(() => {
    const c = s.current;
    c && a.current && (a.current = !1, Be(c));
  }, []), /* @__PURE__ */ i(
    "div",
    {
      ...r,
      ref: Se(n, s),
      dangerouslySetInnerHTML: o
    }
  );
}, se = (e) => {
  const { code: t, innerRef: n, ...r } = e;
  return /* @__PURE__ */ i(
    "div",
    {
      ...r,
      ref: n,
      dangerouslySetInnerHTML: { __html: t ?? "" }
    }
  );
}, Q = se, Fe = l(
  (e, t) => {
    const { code: n, executeScriptOnCanvas: r, clientOnly: s, children: a, ...o } = e, { renderer: c, isSafeMode: u } = g(S), m = ae(), [f] = L(m);
    return n === void 0 || String(n).trim().length === 0 ? /* @__PURE__ */ i(Ve, { innerRef: t, ...o }) : f ? s !== !0 ? /* @__PURE__ */ i(se, { innerRef: t, code: n, ...o }) : /* @__PURE__ */ i(O, { children: /* @__PURE__ */ i(q, { innerRef: t, code: n, ...o }) }) : u ? /* @__PURE__ */ i(O, { children: /* @__PURE__ */ i(
      Q,
      {
        innerRef: t,
        code: n,
        ...o
      }
    ) }) : c === "canvas" && r !== !0 ? /* @__PURE__ */ i(O, { children: /* @__PURE__ */ i(
      Q,
      {
        innerRef: t,
        code: n,
        ...o
      }
    ) }) : /* @__PURE__ */ i(O, { children: /* @__PURE__ */ i(
      q,
      {
        innerRef: t,
        code: n,
        ...o
      },
      n
    ) });
  }
);
Fe.displayName = "HtmlEmbed";
const wn = /* @__PURE__ */ l((e, t) => {
  const { code: n, children: r, ...s } = e, a = oe(
    // support data uri protocol in images
    () => Ae(n ?? "", {
      allowDangerousProtocol: !0,
      extensions: [Le()],
      htmlExtensions: [Ee()]
    }),
    [n]
  );
  return /* @__PURE__ */ i("div", { ...s, ref: t, dangerouslySetInnerHTML: { __html: a } });
}), He = l((e, t) => /* @__PURE__ */ i("body", { ...e, ref: t }));
He.displayName = "Body";
const $e = "div", Ge = l(
  ({ tag: e, ...t }, n) => {
    const r = V(t) ?? e ?? $e;
    return I(r, { ...t, ref: n });
  }
);
Ge.displayName = "Box";
const je = "div", Ye = l(
  ({ tag: e, ...t }, n) => {
    const r = V(t) ?? e ?? je;
    return I(r, { ...t, ref: n });
  }
);
Ye.displayName = "Text";
const Ke = "h1", Ze = l(
  ({ tag: e, ...t }, n) => {
    const r = V(t) ?? e ?? Ke;
    return I(r, { ...t, ref: n });
  }
);
Ze.displayName = "Heading";
const We = l(({ children: e, ...t }, n) => /* @__PURE__ */ i("p", { ...t, ref: n, children: e }));
We.displayName = "Paragraph";
const qe = l((e, t) => /* @__PURE__ */ i("span", { ...e, ref: t }));
qe.displayName = "Span";
const Qe = l((e, t) => /* @__PURE__ */ i("b", { ...e, ref: t }));
Qe.displayName = "Bold";
const ze = l((e, t) => /* @__PURE__ */ i("i", { ...e, ref: t }));
ze.displayName = "Italic";
const Je = l((e, t) => /* @__PURE__ */ i("sup", { ...e, ref: t }));
Je.displayName = "Bold";
const Xe = l((e, t) => /* @__PURE__ */ i("sub", { ...e, ref: t }));
Xe.displayName = "Subscript";
const ie = l(
  ({ type: e = "submit", children: t, ...n }, r) => /* @__PURE__ */ i("button", { type: e, ...n, ref: r, children: t })
);
ie.displayName = "Button";
const et = l(
  ({ value: e, defaultValue: t, checked: n, defaultChecked: r, ...s }, a) => {
    const { renderer: o } = g(S), c = o === "canvas" ? String(e ?? t) + String(n ?? r) : void 0;
    return /* @__PURE__ */ I(
      "input",
      {
        ...s,
        key: c,
        defaultValue: e ?? t,
        defaultChecked: n ?? r,
        ref: a
      }
    );
  }
);
et.displayName = "Input";
const tt = l(
  ({ children: e, state: t = "initial", ...n }, r) => /* @__PURE__ */ i("form", { ...n, ref: r, children: e })
);
tt.displayName = "WebhookForm";
const nt = l(({ children: e, ...t }, n) => /* @__PURE__ */ i("form", { ...t, ref: n, children: e }));
nt.displayName = "Form";
const ce = l(
  ({
    loading: e = "lazy",
    width: t,
    height: n,
    optimize: r = !0,
    decoding: s,
    // @todo: it's a hack made for the builder and should't be in the runtime at all.
    $webstudio$canvasOnly$assetId: a,
    ...o
  }, c) => {
    const u = String(o.src ?? ""), { imageLoader: m, renderer: f } = g(S);
    let h = s, d = u;
    return f === "canvas" && (e = "eager", h = "sync", d = a ?? u, t !== void 0 && n !== void 0 && Number.isNaN(t) && Number.isNaN(n) && (r = !1, t = void 0, n = void 0)), /* @__PURE__ */ i(
      Ie,
      {
        loading: e,
        decoding: h,
        optimize: r,
        width: t,
        height: n,
        ...o,
        loader: m,
        src: u,
        ref: c
      },
      d
    );
  }
);
ce.displayName = "Image";
const rt = l(
  ({ children: e, ...t }, n) => /* @__PURE__ */ i("blockquote", { ...t, ref: n, children: e })
);
rt.displayName = "Blockquote";
const ot = "ul", at = "ol", st = l(({ ordered: e = !1, ...t }, n) => I(e ? at : ot, { ...t, ref: n }));
st.displayName = "List";
const it = l(
  ({ children: e, ...t }, n) => /* @__PURE__ */ i("li", { ...t, ref: n, children: e })
);
it.displayName = "ListItem";
const ct = "hr", lt = l(
  (e, t) => I(ct, { ...e, ref: t })
);
lt.displayName = "Separator";
const dt = ({
  innerRef: e,
  ...t
}) => /* @__PURE__ */ i("code", { ...t, style: { padding: 20 }, ref: e, children: 'Open the "Settings" panel to edit the code.' }), ut = l(({ code: e, children: t, ...n }, r) => t === void 0 && e === void 0 || String(e).trim().length === 0 ? /* @__PURE__ */ i(dt, { innerRef: r, ...n }) : /* @__PURE__ */ i("code", { ...n, ref: r, children: e ?? t }));
ut.displayName = "CodeText";
const mt = l((e, t) => /* @__PURE__ */ i("label", { ...e, ref: t }));
mt.displayName = "Label";
const ft = l(({ value: e, defaultValue: t, ...n }, r) => {
  const { renderer: s } = g(S), a = s === "canvas" ? String(e ?? t) : void 0;
  return /* @__PURE__ */ I(
    "textarea",
    {
      ...n,
      key: a,
      defaultValue: e ?? t,
      ref: r
    }
  );
});
ft.displayName = "Textarea";
const pt = l(({ children: e, checked: t, defaultChecked: n, ...r }, s) => /* @__PURE__ */ i(
  "input",
  {
    ...r,
    defaultChecked: t ?? n,
    type: "radio",
    ref: s
  }
));
pt.displayName = "RadioButton";
const ht = l(({ children: e, checked: t, defaultChecked: n, ...r }, s) => /* @__PURE__ */ i(
  "input",
  {
    ...r,
    defaultChecked: t ?? n,
    type: "checkbox",
    ref: s
  }
));
ht.displayName = "Checkbox";
const le = (e) => {
  const t = "ontouchstart" in window;
  (window.matchMedia("(max-width: 1024px)").matches || t) && e.requestFullscreen();
}, C = ve({
  onInitPlayer: () => {
  },
  status: "initial"
}), yt = (e) => {
  if (e.url === void 0)
    return;
  let t;
  try {
    const s = new URL(e.url);
    t = new URL(de), t.pathname = `/video${s.pathname}`;
  } catch {
  }
  if (t === void 0)
    return;
  const n = {
    showPortrait: "portrait",
    showByline: "byline",
    showTitle: "title",
    controlsColor: "color",
    showControls: "controls",
    interactiveParams: "interactive_params",
    backgroundMode: "background",
    doNotTrack: "dnt"
  };
  let r;
  for (r in e) {
    const s = e[r];
    if (r === "url" || s === void 0)
      continue;
    const a = n[r] ?? r;
    t.searchParams.append(a, s.toString());
  }
  if (t.searchParams.set("autoplay", "true"), typeof e.controlsColor == "string") {
    const s = Re(e.controlsColor).toHex().replace("#", "");
    t.searchParams.set("color", s);
  }
  return e.showPortrait && t.searchParams.set("title", "true"), e.showByline && (t.searchParams.set("portrait", "true"), t.searchParams.set("title", "true")), t.toString();
}, B = (e) => {
  const t = document.createElement("link");
  t.rel = "preconnect", t.href = e, t.crossOrigin = "true", document.head.appendChild(t);
};
let z = !1;
const bt = "https://f.vimeocdn.com", de = "https://player.vimeo.com", ue = "https://i.vimeocdn.com", gt = () => {
  z || window.matchMedia("(hover: none)").matches || (B(bt), B(de), B(ue), z = !0);
}, Tt = (e) => {
  try {
    const n = new URL(e).pathname.split("/")[2];
    return n === "" || n == null ? void 0 : n;
  } catch {
  }
}, vt = async (e) => {
  const n = `https://vimeo.com/api/v2/video/${Tt(e)}.json`, s = (await (await fetch(n)).json())[0].thumbnail_large, a = s.substr(s.lastIndexOf("/") + 1).split("_")[0], o = new URL(ue);
  return o.pathname = `/video/${a}.webp`, o.searchParams.append("mw", "1100"), o.searchParams.append("mh", "619"), o.searchParams.append("q", "70"), o;
}, Nt = () => /* @__PURE__ */ i(
  "div",
  {
    style: {
      display: "flex",
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.2em"
    },
    children: 'Open the "Settings" panel and paste a video URL, e.g. https://vimeo.com/831343124.'
  }
), wt = ({
  title: e,
  status: t,
  loading: n,
  videoUrl: r,
  previewImageUrl: s,
  autoplay: a,
  renderer: o,
  showPreview: c,
  playsinline: u,
  onStatusChange: m,
  onPreviewImageUrlChange: f
}) => {
  const [h, d] = L(0), p = P(null);
  if (A(() => {
    a && o !== "canvas" && t === "initial" && m("loading");
  }, [a, t, o, m]), A(() => {
    o !== "canvas" && gt();
  }, [o]), A(() => {
    if (r !== void 0) {
      if (c === !1) {
        f(void 0);
        return;
      }
      s === void 0 && vt(r).then(f).catch(() => {
        console.error(`Could not load preview image for ${r}`);
      });
    }
  }, [f, c, r, s]), !(o === "canvas" || t === "initial"))
    return /* @__PURE__ */ i(
      "iframe",
      {
        ref: p,
        title: e,
        src: r,
        loading: n,
        allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture;",
        allowFullScreen: !0,
        style: {
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: h,
          transition: "opacity 1s",
          border: "none"
        },
        onLoad: () => {
          m("ready"), d(1), p.current && !u && !a && le(p.current);
        }
      }
    );
}, St = l(
  ({
    url: e,
    loading: t = "lazy",
    autoplay: n = !1,
    autopause: r = !0,
    showByline: s = !1,
    showControls: a = !0,
    doNotTrack: o = !1,
    keyboard: c = !0,
    loop: u = !1,
    muted: m = !1,
    pip: f = !1,
    playsinline: h = !1,
    showPortrait: d = !0,
    quality: p = "auto",
    responsive: b = !0,
    speed: T = !1,
    showTitle: v = !1,
    transparent: y = !0,
    showPreview: w = !1,
    autopip: R,
    controlsColor: N,
    interactiveParams: E,
    texttrack: _,
    children: be,
    ...H
  }, M) => {
    const [$, G] = L("initial"), [j, ge] = L(), { renderer: Y } = g(S), K = yt({
      url: e,
      autoplay: n,
      autopause: r,
      showControls: a,
      controlsColor: N,
      doNotTrack: o,
      interactiveParams: E,
      keyboard: c,
      loop: u,
      muted: m,
      pip: f,
      playsinline: h,
      quality: p,
      responsive: b,
      speed: T,
      texttrack: _,
      showTitle: v,
      transparent: y,
      showPortrait: d,
      autopip: R
    });
    return /* @__PURE__ */ i(
      C.Provider,
      {
        value: {
          status: $,
          previewImageUrl: j,
          onInitPlayer() {
            Y !== "canvas" && G("loading");
          }
        },
        children: /* @__PURE__ */ i(
          "div",
          {
            ...H,
            ref: (Z) => {
              M !== null && (typeof M == "function" ? M(Z) : M.current = Z);
            },
            children: K === void 0 ? /* @__PURE__ */ i(Nt, {}) : /* @__PURE__ */ ne(re, { children: [
              be,
              /* @__PURE__ */ i(
                wt,
                {
                  title: H.title,
                  autoplay: n,
                  playsinline: h,
                  videoUrl: K,
                  previewImageUrl: j,
                  loading: t,
                  showPreview: w,
                  renderer: Y,
                  status: $,
                  onStatusChange: G,
                  onPreviewImageUrlChange: ge
                }
              )
            ] })
          }
        )
      }
    );
  }
);
St.displayName = "Vimeo";
const At = "https://www.youtube-nocookie.com", Et = "https://www.youtube.com", me = "https://img.youtube.com", fe = (e) => {
  if (e)
    try {
      const t = new URL(e);
      return t.pathname === "/embed" ? void 0 : t.hostname === "youtu.be" ? t.pathname.slice(1) : t.searchParams.get("v") || t.pathname.split("/").pop();
    } catch {
      return e;
    }
}, Lt = (e, t) => {
  var o, c;
  const n = fe(e.url), r = new URL(t);
  if (n)
    r.pathname = `/embed/${n}`;
  else if (e.url)
    try {
      const u = new URL(e.url);
      r.pathname = u.pathname, r.search = u.search;
    } catch {
    }
  const s = Object.keys(e), a = {};
  a.autoplay = "1";
  for (const u of s)
    if (e[u] !== void 0)
      switch (u) {
        case "autoplay":
          e.autoplay && e.muted === void 0 && (a.mute = "1");
          break;
        case "muted":
          a.mute = e.muted ? "1" : "0";
          break;
        case "showControls":
          a.controls = e.showControls ? "1" : "0";
          break;
        case "showRelatedVideos":
          a.rel = e.showRelatedVideos ? "1" : "0";
          break;
        case "keyboard":
          a.keyboard = e.keyboard ? "1" : "0";
          break;
        case "loop":
          a.loop = e.loop ? "1" : "0", e.loop && (e.playlist ?? "").trim() === "" && (a.playlist = n);
          break;
        case "inline":
          a.playsinline = e.inline ? "1" : "0";
          break;
        case "allowFullscreen":
          a.fs = e.allowFullscreen ? "1" : "0";
          break;
        case "captionLanguage":
          a.cc_lang_pref = e.captionLanguage;
          break;
        case "showCaptions":
          a.cc_load_policy = e.showCaptions ? "1" : "0";
          break;
        case "showAnnotations":
          a.iv_load_policy = e.showAnnotations ? "1" : "3";
          break;
        case "startTime":
          a.start = (o = e.startTime) == null ? void 0 : o.toString();
          break;
        case "endTime":
          a.end = (c = e.endTime) == null ? void 0 : c.toString();
          break;
        case "disableKeyboard":
          a.disablekb = e.disableKeyboard ? "1" : "0";
          break;
        case "language":
          a.hl = e.language;
          break;
        case "listId":
          a.list = e.listId;
          break;
        case "listType":
          a.listType = e.listType;
          break;
        case "color":
          a.color = e.color;
          break;
        case "origin":
          a.origin = e.origin;
          break;
        case "referrer":
          a.widget_referrer = e.referrer;
          break;
        case "playlist":
          a.playlist = e.playlist;
          break;
        case "enablejsapi":
          a.enablejsapi = e.enablejsapi ? "1" : "0";
          break;
      }
  return Object.entries(a).forEach(([u, m]) => {
    m !== void 0 && r.searchParams.append(u, m.toString());
  }), r.toString();
}, J = (e) => {
  const t = document.createElement("link");
  t.rel = "preconnect", t.href = e, t.crossOrigin = "true", document.head.appendChild(t);
};
let X = !1;
const It = (e) => {
  if (!(X || window.matchMedia("(hover: none)").matches)) {
    try {
      const t = new URL(e);
      J(t.origin);
    } catch {
    }
    J(me), X = !0;
  }
}, Rt = (e) => new URL(`${me}/vi/${e}/maxresdefault.jpg`), Dt = () => /* @__PURE__ */ i("div", { className: "flex w-full h-full items-center justify-center text-lg", children: 'Open the "Settings" panel and paste a video URL, e.g. https://youtube.com/watch?v=dQw4w9WgXcQ' }), kt = ({
  title: e,
  status: t,
  loading: n,
  videoUrl: r,
  previewImageUrl: s,
  autoplay: a,
  inline: o,
  renderer: c,
  showPreview: u,
  onStatusChange: m,
  onPreviewImageUrlChange: f
}) => {
  const [h, d] = L(0), p = P(null);
  return A(() => {
    a && c !== "canvas" && t === "initial" && m("loading");
  }, [a, t, c, m]), A(() => {
    c !== "canvas" && It(r);
  }, [c, r]), A(() => {
    const b = fe(r);
    if (!b || !u) {
      f(void 0);
      return;
    }
    s || f(Rt(b));
  }, [f, u, r, s]), c === "canvas" || t === "initial" ? null : /* @__PURE__ */ i(
    "iframe",
    {
      ref: p,
      title: e,
      src: r,
      loading: n,
      allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
      allowFullScreen: !0,
      style: {
        position: "absolute",
        width: "100%",
        height: "100%",
        opacity: h,
        transition: "opacity 1s",
        border: "none"
      },
      onLoad: () => {
        m("ready"), d(1), !o && !a && p.current && le(p.current);
      }
    }
  );
}, Ct = l(
  ({
    url: e,
    loading: t = "lazy",
    autoplay: n,
    showPreview: r,
    showAnnotations: s,
    showCaptions: a,
    showControls: o,
    allowFullscreen: c,
    keyboard: u,
    children: m,
    privacyEnhancedMode: f,
    inline: h = !1,
    ...d
  }, p) => {
    const [b, T] = L("initial"), [v, y] = L(), { renderer: w } = g(S), R = f ?? !0 ? At : Et, N = Lt(
      {
        ...d,
        inline: h,
        url: e,
        keyboard: u,
        showAnnotations: s,
        showCaptions: a,
        allowFullscreen: c,
        showControls: o,
        autoplay: n,
        enablejsapi: !1
      },
      R
    );
    return /* @__PURE__ */ i(
      C.Provider,
      {
        value: {
          status: b,
          previewImageUrl: v,
          onInitPlayer() {
            w !== "canvas" && T("loading");
          }
        },
        children: /* @__PURE__ */ i("div", { ...d, ref: p, children: N ? /* @__PURE__ */ ne(re, { children: [
          m,
          /* @__PURE__ */ i(
            kt,
            {
              title: d.title,
              autoplay: n,
              videoUrl: N,
              previewImageUrl: v,
              loading: t,
              inline: h,
              showPreview: r,
              renderer: w,
              status: b,
              onStatusChange: T,
              onPreviewImageUrlChange: y
            }
          )
        ] }) : /* @__PURE__ */ i(Dt, {}) })
      }
    );
  }
);
Ct.displayName = "YouTube";
const Mt = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkOAMAANIAzr59FiYAAAAASUVORK5CYII=", Ot = l(({ src: e, ...t }, n) => {
  const r = g(C);
  return /* @__PURE__ */ i(
    ce,
    {
      ...t,
      src: String(r.previewImageUrl ?? e ?? Mt),
      ref: n
    }
  );
});
Ot.displayName = "VimeoPreviewImage";
const Pt = l(
  (e, t) => {
    const n = g(C), r = Ne(async () => {
      await De(), n.onInitPlayer();
    }, [n]);
    if (n.status === "initial")
      return /* @__PURE__ */ i(ie, { ...e, onClick: r, ref: t });
  }
);
Pt.displayName = "VimeoPlayButton";
const _t = l(
  (e, t) => {
    if (g(C).status === "loading")
      return /* @__PURE__ */ i("div", { ...e, ref: t });
  }
);
_t.displayName = "VimeoSpinner";
const Ut = "short", xt = "dateTime attribute is not set", Bt = "", Vt = (e) => {
  if (e === "")
    return;
  let t = new Date(e);
  if (Number.isNaN(t.getTime()) === !1)
    return t;
  if (/^\d+$/.test(e)) {
    let n = Number(e);
    e.length === 10 && (n *= 1e3), t = new Date(n);
  }
  if (Number.isNaN(t.getTime()) === !1)
    return t;
}, Sn = l(
  ({ dateStyle: e = Ut, datetime: t = xt }, n) => {
    const { renderer: r } = g(S), s = t === null ? Bt : t.toString(), a = Vt(s);
    let o = s;
    return a && (o = a.toISOString(), e === "short" && (o = o.split("T")[0])), r === void 0 ? o : /* @__PURE__ */ i("time", { ref: n, children: o });
  }
), Ft = [
  "af",
  "am",
  "ar",
  "az",
  "be",
  "bg",
  "bn",
  "bs",
  "ca",
  "cs",
  "cy",
  "da",
  "de",
  "el",
  "en",
  "es",
  "et",
  "eu",
  "fa",
  "fi",
  "fr",
  "ga",
  "gl",
  "gu",
  "he",
  "hi",
  "hr",
  "hu",
  "hy",
  "id",
  "is",
  "it",
  "ja",
  "ka",
  "kk",
  "km",
  "kn",
  "ko",
  "ky",
  "lb",
  "lt",
  "lv",
  "mk",
  "ml",
  "mn",
  "mr",
  "ms",
  "mt",
  "nb",
  "nl",
  "nn",
  "pl",
  "pt",
  "ro",
  "ru",
  "si",
  "sk",
  "sl",
  "sq",
  "sr",
  "sv",
  "sw",
  "ta",
  "te",
  "th",
  "tr",
  "uk",
  "ur",
  "uz",
  "vi",
  "zh"
], Ht = [
  "AF",
  "AL",
  "DZ",
  "AS",
  "AD",
  "AO",
  "AI",
  "AQ",
  "AG",
  "AR",
  "AM",
  "AW",
  "AU",
  "AT",
  "AZ",
  "BS",
  "BH",
  "BD",
  "BB",
  "BY",
  "BE",
  "BZ",
  "BJ",
  "BM",
  "BT",
  "BO",
  "BA",
  "BW",
  "BR",
  "BN",
  "BG",
  "BF",
  "BI",
  "CV",
  "KH",
  "CM",
  "CA",
  "KY",
  "CF",
  "TD",
  "CL",
  "CN",
  "CO",
  "KM",
  "CG",
  "CD",
  "CR",
  "HR",
  "CU",
  "CY",
  "CZ",
  "DK",
  "DJ",
  "DM",
  "DO",
  "EC",
  "EG",
  "SV",
  "GQ",
  "ER",
  "EE",
  "SZ",
  "ET",
  "FJ",
  "FI",
  "FR",
  "GA",
  "GM",
  "GE",
  "DE",
  "GH",
  "GR",
  "GD",
  "GT",
  "GN",
  "GW",
  "GY",
  "HT",
  "HN",
  "HU",
  "IS",
  "IN",
  "ID",
  "IR",
  "IQ",
  "IE",
  "IL",
  "IT",
  "JM",
  "JP",
  "JO",
  "KZ",
  "KE",
  "KI",
  "KP",
  "KR",
  "KW",
  "KG",
  "LA",
  "LV",
  "LB",
  "LS",
  "LR",
  "LY",
  "LI",
  "LT",
  "LU",
  "MG",
  "MW",
  "MY",
  "MV",
  "ML",
  "MT",
  "MH",
  "MR",
  "MU",
  "MX",
  "FM",
  "MD",
  "MC",
  "MN",
  "ME",
  "MA",
  "MZ",
  "MM",
  "NA",
  "NR",
  "NP",
  "NL",
  "NZ",
  "NI",
  "NE",
  "NG",
  "NO",
  "OM",
  "PK",
  "PW",
  "PA",
  "PG",
  "PY",
  "PE",
  "PH",
  "PL",
  "PT",
  "QA",
  "RO",
  "RU",
  "RW",
  "KN",
  "LC",
  "VC",
  "WS",
  "SM",
  "ST",
  "SA",
  "SN",
  "RS",
  "SC",
  "SL",
  "SG",
  "SK",
  "SI",
  "SB",
  "SO",
  "ZA",
  "SS",
  "ES",
  "LK",
  "SD",
  "SR",
  "SE",
  "CH",
  "SY",
  "TW",
  "TJ",
  "TZ",
  "TH",
  "TL",
  "TG",
  "TO",
  "TT",
  "TN",
  "TR",
  "TM",
  "TV",
  "UG",
  "UA",
  "AE",
  "GB",
  "US",
  "UY",
  "UZ",
  "VU",
  "VA",
  "VE",
  "VN",
  "YE",
  "ZM",
  "ZW"
], $t = "dateTime attribute is not set", Gt = "", pe = "en", he = "GB", jt = "medium", Yt = "none", k = "UTC", ye = "visitor", Kt = (e) => Ft.includes(e) ? e : pe, Zt = (e) => Ht.includes(e) ? e : he, Wt = (e) => {
  if (["full", "long", "medium", "short"].includes(e))
    return e;
}, qt = (e) => {
  if (["full", "long", "medium", "short"].includes(e))
    return e;
}, ee = (e) => {
  if (typeof e != "string")
    return k;
  const t = e.trim();
  if (t === "" || t === ye)
    return k;
  try {
    return new Intl.DateTimeFormat(void 0, { timeZone: t }), t;
  } catch {
    return k;
  }
}, Qt = (e) => {
  if (e === "")
    return;
  let t = new Date(e);
  if (Number.isNaN(t.getTime()) === !1)
    return t;
  if (/^\d+$/.test(e)) {
    let n = Number(e);
    e.length === 10 && (n *= 1e3), t = new Date(n);
  }
  if (Number.isNaN(t.getTime()) === !1)
    return t;
}, zt = (e, t, n = "en-US", r = k) => {
  const s = (N, E = 2) => String(N).padStart(E, "0"), a = new Intl.DateTimeFormat("en-US", {
    timeZone: r,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23"
  }).formatToParts(e), o = (N) => {
    var E;
    return ((E = a.find((_) => _.type === N)) == null ? void 0 : E.value) ?? "";
  }, c = o("year"), u = Number(o("month")), m = Number(o("day")), f = Number(o("hour")), h = Number(o("minute")), d = Number(o("second")), p = new Intl.DateTimeFormat(n, {
    timeZone: r,
    weekday: "long"
  }).format(e), b = new Intl.DateTimeFormat(n, {
    timeZone: r,
    weekday: "short"
  }).format(e), T = new Intl.DateTimeFormat(n, {
    timeZone: r,
    month: "long"
  }).format(e), v = new Intl.DateTimeFormat(n, {
    timeZone: r,
    month: "short"
  }).format(e), y = {
    YYYY: c,
    YY: c.slice(-2),
    MMMM: T,
    MMM: v,
    MM: s(u),
    M: u,
    DDDD: p,
    DDD: b,
    DD: s(m),
    D: m,
    HH: s(f),
    H: f,
    mm: s(h),
    m: h,
    ss: s(d),
    s: d
  }, w = Object.keys(y).sort((N, E) => E.length - N.length), R = new RegExp(`\\b(${w.join("|")})\\b`, "g");
  return t.replace(R, (N) => String(y[N]));
}, An = l(
  ({
    language: e = pe,
    country: t = he,
    dateStyle: n = jt,
    timeStyle: r = Yt,
    timeZone: s = k,
    format: a,
    datetime: o = $t,
    ...c
  }, u) => {
    const [m, f] = L(), h = `${Kt(e)}-${Zt(
      t
    )}`, d = typeof s == "string" && s.trim() === ye, p = ee(d ? m : s), b = {
      dateStyle: Wt(n),
      timeStyle: qt(r),
      timeZone: p
    };
    A(() => {
      d && f(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, [d]);
    const T = o === null ? Gt : o.toString(), v = Qt(T);
    let y = T;
    if (v)
      if (a)
        try {
          y = zt(v, a, h, p);
        } catch {
        }
      else
        try {
          y = new Intl.DateTimeFormat(h, b).format(v);
        } catch {
        }
    return /* @__PURE__ */ i("time", { ref: u, dateTime: T, ...c, children: y });
  }
), Jt = l(
  (e, t) => /* @__PURE__ */ i("option", { ...e, ref: t })
);
Jt.displayName = "Option";
const Xt = "link", en = ["rel", "hrefLang", "href", "type", "as"], tn = l(({ ...e }, t) => {
  const { renderer: n } = g(S), r = /* @__PURE__ */ new Set([...en, ...Object.keys(e)]), s = {};
  for (const o of r)
    o in e && e[o] !== void 0 && (s[o] = e[o]);
  if (n === void 0)
    return /* @__PURE__ */ i("link", { ...s });
  const a = Object.fromEntries(
    Object.entries(s).map(([o, c]) => [
      o == null ? void 0 : o.toLowerCase(),
      c
    ])
  );
  return /* @__PURE__ */ i(F, { tag: Xt, ...a, ref: t });
});
tn.displayName = "HeadLink";
const nn = "meta", rn = ["property", "name", "content"], on = l(({ ...e }, t) => {
  const { renderer: n } = g(S), r = /* @__PURE__ */ new Set([...rn, ...Object.keys(e)]), s = {};
  for (const o of r)
    o in e && e[o] !== void 0 && (s[o] = e[o]);
  if (n === void 0)
    return /* @__PURE__ */ i("meta", { ...s });
  const a = Object.fromEntries(
    Object.entries(s).map(([o, c]) => [
      o == null ? void 0 : o.toLowerCase(),
      c
    ])
  );
  return /* @__PURE__ */ i(F, { tag: nn, ...a, ref: t });
});
on.displayName = "HeadMeta";
const an = "title", sn = [], cn = l(({ ...e }, t) => {
  const { renderer: n } = g(S), r = /* @__PURE__ */ new Set([...sn, ...Object.keys(e)]), s = {};
  for (const o of r)
    o in e && e[o] !== void 0 && (s[o] = e[o]);
  if (n === void 0)
    return /* @__PURE__ */ i("title", { ...s });
  const a = Object.fromEntries(
    Object.entries(s).map(([o, c]) => [
      o == null ? void 0 : o.toLowerCase(),
      c
    ])
  );
  return /* @__PURE__ */ i(F, { tag: an, ...a, ref: t });
});
cn.displayName = "HeadTitle";
const te = "data-ws-video-id", ln = {
  HAVE_METADATA: 1
}, dn = l(
  ({
    $progress: e,
    $visible: t,
    $timeline: n,
    $webstudio$canvasOnly$assetId: r,
    children: s,
    src: a,
    ...o
  }, c) => {
    const u = we(), m = {
      [te]: u
    }, { videoLoader: f } = g(S), h = a && f ? f({ src: a }) : a;
    return A(() => {
      if (e === void 0 || t === void 0)
        return;
      const d = document.querySelector(`[${te}="${u}"]`);
      if (d === null || !(d instanceof HTMLVideoElement))
        return;
      if (d.play().catch(() => {
      }), d.pause(), n)
        return e.subscribe((y) => {
          if (d.readyState < ln.HAVE_METADATA || (d.paused || d.pause(), d.seeking))
            return;
          let w = d.duration;
          Number.isNaN(w) || (Number.isFinite(w) || (w = 60), d.currentTime = (y ?? 0) * w);
        });
      let p = !1, b = !1;
      const T = t.subscribe((y) => {
        b = y, b === !1 && p === !1 && !d.loop && (d.currentTime = 0);
      }), v = e.subscribe((y) => {
        if (p && (y === void 0 || y === 0 || y === 1)) {
          p = !1, d.pause(), b === !1 && p === !1 && !d.loop && (d.currentTime = 0);
          return;
        }
        p || (p = !0, d.ended || d.play().catch(() => {
        }));
      });
      return () => {
        v(), T();
      };
    }, [e, n, t, u]), /* @__PURE__ */ i("video", { src: h, ...o, ...m, ref: c, children: s });
  }
);
dn.displayName = "Video";
export {
  rt as Blockquote,
  He as Body,
  Qe as Bold,
  Ge as Box,
  ie as Button,
  ht as Checkbox,
  ut as CodeText,
  tt as Form,
  Ce as Fragment,
  tn as HeadLink,
  on as HeadMeta,
  kn as HeadSlot,
  cn as HeadTitle,
  Ze as Heading,
  Fe as HtmlEmbed,
  ce as Image,
  et as Input,
  ze as Italic,
  mt as Label,
  In as Link,
  st as List,
  it as ListItem,
  wn as MarkdownEmbed,
  Jt as Option,
  We as Paragraph,
  pt as RadioButton,
  nt as RemixForm,
  Rn as RichTextLink,
  Cn as Select,
  lt as Separator,
  ke as Slot,
  qe as Span,
  Xe as Subscript,
  Je as Superscript,
  Ye as Text,
  ft as Textarea,
  An as Time,
  dn as Video,
  St as Vimeo,
  Pt as VimeoPlayButton,
  Ot as VimeoPreviewImage,
  _t as VimeoSpinner,
  F as XmlNode,
  Sn as XmlTime,
  Ct as YouTube
};
