import { forwardRef as p, useContext as f, createElement as u, Children as P } from "react";
import { ReactSdkContext as m, xmlNodeTagSuffix as b, getClosestInstance as g } from "@webstudio-is/react-sdk/runtime";
import { jsxs as a, jsx as s, Fragment as H } from "react/jsx-runtime";
const y = p(
  ({ tag: n = "", children: e, ...t }, o) => {
    const { renderer: c } = f(m), l = Object.entries(t).filter(
      ([r]) => r.startsWith("data-") === !1 && r.startsWith("aria-") === !1
    ).filter(([r]) => r.toLowerCase() !== "tabindex").filter(([, r]) => typeof r != "function"), d = n.replace(/^[^\p{L}_]+/u, "").replaceAll(/[^\p{L}\p{N}\-._:]+/gu, "").trim();
    if (c === void 0) {
      const r = Object.fromEntries(l);
      return u(
        `${d}${b}`,
        r,
        e
      );
    }
    const i = P.toArray(e), h = i.length > 0 && i.every((r) => typeof r == "string"), S = (r) => r.map(([v, x], N) => /* @__PURE__ */ a("span", { children: [
      " ",
      /* @__PURE__ */ s("span", { style: { color: "#FF0000" }, children: v }),
      /* @__PURE__ */ s("span", { style: { color: "#000000" }, children: "=" }),
      /* @__PURE__ */ a("span", { style: { color: "#0000FF" }, children: [
        '"',
        x,
        '"'
      ] })
    ] }, N));
    return /* @__PURE__ */ a("div", { ...t, style: { backgroundColor: "rgba(255,255,255,1)" }, children: [
      /* @__PURE__ */ a("span", { children: [
        /* @__PURE__ */ a("span", { style: { color: "#800000" }, children: [
          "<",
          d
        ] }),
        l.length > 0 && S(l),
        i.length === 0 ? /* @__PURE__ */ s("span", { style: { color: "#800000" }, children: "/>" }) : /* @__PURE__ */ s("span", { style: { color: "#800000" }, children: ">" })
      ] }),
      i.length > 0 && /* @__PURE__ */ a(H, { children: [
        /* @__PURE__ */ s(
          "div",
          {
            ref: o,
            style: {
              display: h ? "inline" : "block",
              marginLeft: h ? 0 : "1rem",
              color: "#000000"
            },
            children: e
          }
        ),
        /* @__PURE__ */ a("span", { style: { color: "#800000" }, children: [
          "</",
          d,
          ">"
        ] })
      ] })
    ] });
  }
);
y.displayName = "XmlNode";
const C = p(
  ({ value: n, defaultValue: e, ...t }, o) => {
    const { renderer: c } = f(m), l = c === "canvas" ? String(n ?? e) : void 0;
    return /* @__PURE__ */ u(
      "select",
      {
        ...t,
        key: l,
        defaultValue: n ?? e,
        ref: o
      }
    );
  }
);
C.displayName = "Select";
const L = {
  onNavigatorUnselect: (n, e) => {
    for (const t of e.instancePath)
      (t.component === "Select" || t.tag === "select") && n.setMemoryProp(t, "value", void 0);
  },
  onNavigatorSelect: (n, e) => {
    let t;
    for (const o of e.instancePath)
      (o.component === "Option" || o.tag === "option") && (t = n.getPropValue(o, "value")), (o.component === "Select" || o.tag === "select") && n.setMemoryProp(o, "value", t);
  }
}, k = "head", w = p(({ children: n, ...e }, t) => {
  const { renderer: o } = f(m);
  return o === void 0 ? n : e["data-ws-expand"] !== !0 ? null : /* @__PURE__ */ s(
    "div",
    {
      ref: t,
      style: {
        padding: "8px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1e3
      },
      ...e,
      children: /* @__PURE__ */ s(y, { tag: k, children: n })
    }
  );
});
w.displayName = "HeadSlot";
const M = {
  onNavigatorUnselect: (n, e) => {
    for (const t of e.instancePath)
      if (t.component === "HeadSlot") {
        const o = g(
          e.instancePath,
          t,
          "HeadSlot"
        );
        o && n.setMemoryProp(o, "data-ws-expand", void 0);
      }
  },
  onNavigatorSelect: (n, e) => {
    for (const t of e.instancePath)
      if (t.component === "HeadSlot") {
        const o = g(
          e.instancePath,
          t,
          "HeadSlot"
        );
        o && n.setMemoryProp(o, "data-ws-expand", !0);
      }
  }
};
export {
  w as H,
  C as S,
  y as X,
  M as a,
  L as h
};
