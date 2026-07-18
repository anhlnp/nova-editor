import { jsx as a } from "react/jsx-runtime";
import { forwardRef as i, useState as d, useEffect as f, Children as h, useContext as N, useCallback as D, useRef as x } from "react";
import { Content as R, Root as L, Trigger as E } from "@radix-ui/react-collapsible";
import { getClosestInstance as l, ReactSdkContext as S } from "@webstudio-is/react-sdk/runtime";
import O from "await-interaction-response";
import * as p from "@radix-ui/react-dialog";
import * as P from "@radix-ui/react-popover";
import * as $ from "@radix-ui/react-tooltip";
import { List as U, Root as W, Content as H, Trigger as _ } from "@radix-ui/react-tabs";
import { getIndexWithinAncestorFromProps as w } from "@webstudio-is/sdk/runtime";
import { Content as F, Header as K, Trigger as j, Root as q, Item as z } from "@radix-ui/react-accordion";
import * as g from "@radix-ui/react-navigation-menu";
import { Item as B, ItemIndicator as G, ItemText as J, Viewport as Q, Root as X, Portal as Y, Content as Z, Trigger as tt, Value as nt } from "@radix-ui/react-select";
const dt = i((o, t) => {
  const e = o.open ?? !1, [n, s] = d(e);
  return f(() => s(e), [e]), /* @__PURE__ */ a(L, { ...o, ref: t, open: n, onOpenChange: s });
}), pt = i(({ children: o, ...t }, e) => {
  const n = h.toArray(o)[0];
  return /* @__PURE__ */ a(E, { asChild: !0, ref: e, ...t, children: n ?? /* @__PURE__ */ a("button", { children: "Add button" }) });
}), gt = R, b = "@webstudio-is/sdk-components-react-radix", mt = {
  onNavigatorSelect: (o, t) => {
    for (const e of t.instancePath)
      if (e.component === `${b}:CollapsibleContent`) {
        const n = l(
          t.instancePath,
          e,
          `${b}:Collapsible`
        );
        n && o.setMemoryProp(n, "open", !0);
      }
  },
  onNavigatorUnselect: (o, t) => {
    for (const e of t.instancePath)
      if (e.component === `${b}:CollapsibleContent`) {
        const n = l(
          t.instancePath,
          e,
          `${b}:Collapsible`
        );
        n && o.setMemoryProp(n, "open", void 0);
      }
  }
}, I = (o) => {
  const { target: t } = o;
  return !(!(t instanceof HTMLAnchorElement) || t.hasAttribute("href") === !1 || t.href === "#" || t.hasAttribute("target") && t.target === "_blank" || o.ctrlKey || o.metaKey);
}, ht = i((o, t) => {
  const { renderer: e } = N(S), n = o.open ?? !1, [s, r] = d(n);
  f(() => r(n), [n]);
  const c = D(async (u) => {
    await O(), r(u);
  }, []);
  return f(() => {
    if (e !== void 0 || s === !1)
      return;
    const u = (T) => {
      const { target: v } = T;
      if (I(T) !== !1) {
        if (!(v instanceof HTMLAnchorElement))
          return !1;
        v.closest('[role="dialog"]') && (c == null || c(!1));
      }
    };
    return window.addEventListener("click", u), () => window.removeEventListener("click", u);
  }, [s, c, e]), /* @__PURE__ */ a(
    p.Root,
    {
      ...o,
      onOpenChange: c,
      open: s
    }
  );
}), vt = i(({ children: o, ...t }, e) => {
  const n = h.toArray(o)[0];
  return /* @__PURE__ */ a(p.Trigger, { ref: e, asChild: !0, ...t, children: n ?? /* @__PURE__ */ a("button", { children: "Add button or link" }) });
}), Ct = i((o, t) => /* @__PURE__ */ a(p.DialogPortal, { children: /* @__PURE__ */ a(p.Overlay, { ref: t, ...o }) })), Pt = i((o, t) => {
  const e = x(!1), { renderer: n } = N(S);
  return f(() => {
    if (n !== void 0)
      return;
    e.current = !1;
    const s = (r) => {
      const { target: c } = r;
      if (I(r) !== !1) {
        if (!(c instanceof HTMLAnchorElement))
          return !1;
        c.closest('[role="dialog"]') && (e.current = !0);
      }
    };
    return window.addEventListener("click", s), () => window.removeEventListener("click", s);
  }, [n]), /* @__PURE__ */ a(
    p.Content,
    {
      ref: t,
      ...o,
      onCloseAutoFocus: (s) => {
        e.current && s.preventDefault();
      }
    }
  );
}), $t = p.Close, et = "h1", Tt = i(({ tag: o = et, children: t, ...e }, n) => /* @__PURE__ */ a(p.DialogTitle, { asChild: !0, children: /* @__PURE__ */ a(o, { ref: n, ...e, children: t }) })), bt = p.Description, A = "@webstudio-is/sdk-components-react-radix", At = {
  onNavigatorUnselect: (o, t) => {
    for (const e of t.instancePath)
      if (e.component === `${A}:DialogOverlay`) {
        const n = l(
          t.instancePath,
          e,
          `${A}:Dialog`
        );
        n && o.setMemoryProp(n, "open", void 0);
      }
  },
  onNavigatorSelect: (o, t) => {
    for (const e of t.instancePath)
      if (e.component === `${A}:DialogOverlay`) {
        const n = l(
          t.instancePath,
          e,
          `${A}:Dialog`
        );
        n && o.setMemoryProp(n, "open", !0);
      }
  }
}, kt = i((o, t) => {
  const e = o.open ?? !1, [n, s] = d(e);
  return f(() => s(e), [e]), /* @__PURE__ */ a(P.Root, { ...o, open: n, onOpenChange: s });
}), Mt = i(({ children: o, ...t }, e) => {
  const n = h.toArray(o)[0];
  return /* @__PURE__ */ a(P.Trigger, { asChild: !0, ref: e, ...t, children: n ?? /* @__PURE__ */ a("button", { children: "Add button or link" }) });
}), yt = i(
  ({ sideOffset: o = 4, align: t = "center", hideWhenDetached: e = !0, ...n }, s) => /* @__PURE__ */ a(P.Portal, { children: /* @__PURE__ */ a(
    P.Content,
    {
      ref: s,
      align: "center",
      sideOffset: o,
      hideWhenDetached: e,
      ...n
    }
  ) })
), Nt = P.Close, k = "@webstudio-is/sdk-components-react-radix", St = {
  onNavigatorUnselect: (o, t) => {
    for (const e of t.instancePath)
      if (e.component === `${k}:PopoverContent`) {
        const n = l(
          t.instancePath,
          e,
          `${k}:Popover`
        );
        n && o.setMemoryProp(n, "open", void 0);
      }
  },
  onNavigatorSelect: (o, t) => {
    for (const e of t.instancePath)
      if (e.component === `${k}:PopoverContent`) {
        const n = l(
          t.instancePath,
          e,
          `${k}:Popover`
        );
        n && o.setMemoryProp(n, "open", !0);
      }
  }
}, wt = i((o, t) => {
  const e = o.open ?? !1, [n, s] = d(e);
  return f(() => s(e), [e]), /* @__PURE__ */ a($.Provider, { children: /* @__PURE__ */ a($.Root, { ...o, open: n, onOpenChange: s }) });
}), Vt = i(({ children: o, ...t }, e) => {
  const n = h.toArray(o)[0];
  return /* @__PURE__ */ a($.Trigger, { asChild: !0, ref: e, ...t, children: n ?? /* @__PURE__ */ a("button", { children: "Add button or link" }) });
}), Dt = i(({ sideOffset: o = 4, hideWhenDetached: t = !0, ...e }, n) => /* @__PURE__ */ a($.Portal, { children: /* @__PURE__ */ a(
  $.Content,
  {
    ref: n,
    hideWhenDetached: t,
    sideOffset: o,
    ...e
  }
) })), M = "@webstudio-is/sdk-components-react-radix", Ot = {
  onNavigatorUnselect: (o, t) => {
    for (const e of t.instancePath)
      if (e.component === `${M}:TooltipContent`) {
        const n = l(
          t.instancePath,
          e,
          `${M}:Tooltip`
        );
        n && o.setMemoryProp(n, "open", void 0);
      }
  },
  onNavigatorSelect: (o, t) => {
    for (const e of t.instancePath)
      if (e.component === `${M}:TooltipContent`) {
        const n = l(
          t.instancePath,
          e,
          `${M}:Tooltip`
        );
        n && o.setMemoryProp(n, "open", !0);
      }
  }
}, It = i(
  ({ defaultValue: o, ...t }, e) => {
    const n = t.value ?? o ?? "", [s, r] = d(n);
    f(() => r(n), [n]);
    const c = D(async (u) => {
      await O(), r(u);
    }, []);
    return /* @__PURE__ */ a(
      W,
      {
        ref: e,
        ...t,
        value: s,
        onValueChange: c
      }
    );
  }
), xt = U, Rt = i(({ value: o, ...t }, e) => {
  const n = w(t);
  return /* @__PURE__ */ a(_, { ref: e, value: o ?? n ?? "", ...t });
}), Lt = i(({ value: o, ...t }, e) => {
  const n = w(t);
  return /* @__PURE__ */ a(H, { ref: e, value: o ?? n ?? "", ...t });
}), m = "@webstudio-is/sdk-components-react-radix", Et = {
  onNavigatorSelect: (o, t) => {
    var e;
    for (const n of t.instancePath)
      if (n.component === `${m}:TabsContent` || n.component === `${m}:TabsTrigger`) {
        const s = l(
          t.instancePath,
          n,
          `${m}:Tabs`
        ), r = o.getPropValue(n, "value") ?? ((e = o.indexesWithinAncestors.get(n.id)) == null ? void 0 : e.toString());
        s && r && o.setMemoryProp(s, "value", r);
      }
  },
  onNavigatorUnselect: (o, t) => {
    var e;
    for (const n of t.instancePath)
      if (n.component === `${m}:TabsContent` || n.component === `${m}:TabsTrigger`) {
        const s = l(
          t.instancePath,
          n,
          `${m}:Tabs`
        ), r = o.getPropValue(n, "value") ?? ((e = o.indexesWithinAncestors.get(n.id)) == null ? void 0 : e.toString());
        s && r && o.setMemoryProp(s, "value", void 0);
      }
  }
}, Ut = i(({ defaultValue: o, ...t }, e) => {
  const n = t.value ?? o ?? "", [s, r] = d(n);
  return f(() => r(n), [n]), /* @__PURE__ */ a(
    q,
    {
      ...t,
      ref: e,
      type: "single",
      value: s,
      onValueChange: r
    }
  );
}), Wt = i(({ value: o, ...t }, e) => {
  const n = w(t);
  return /* @__PURE__ */ a(z, { ref: e, value: o ?? n ?? "", ...t });
}), Ht = K, _t = j, Ft = F, V = "@webstudio-is/sdk-components-react-radix", Kt = {
  onNavigatorSelect: (o, t) => {
    var e;
    for (const n of t.instancePath)
      if (n.component === `${V}:AccordionContent`) {
        const s = l(
          t.instancePath,
          n,
          `${V}:Accordion`
        ), r = l(
          t.instancePath,
          n,
          `${V}:AccordionItem`
        );
        if (s && r) {
          const c = o.getPropValue(r, "value") ?? ((e = o.indexesWithinAncestors.get(r.id)) == null ? void 0 : e.toString());
          c && o.setMemoryProp(s, "value", c);
        }
      }
  }
}, jt = i(({ value: o, ...t }, e) => {
  const { renderer: n } = N(S);
  let s = o;
  return n === "canvas" && (s = s === "" ? "-1" : s), /* @__PURE__ */ a(g.Root, { ref: e, value: s, ...t });
}), qt = g.List, zt = g.Viewport, Bt = g.Content, Gt = i(({ value: o, ...t }, e) => {
  const n = w(t);
  return /* @__PURE__ */ a(g.Item, { ref: e, value: o ?? n, ...t });
}), Jt = i(({ children: o, ...t }, e) => {
  const n = h.toArray(o)[0];
  return /* @__PURE__ */ a(g.Link, { asChild: !0, ref: e, ...t, children: n ?? /* @__PURE__ */ a("a", { children: "Add link component" }) });
}), Qt = i(({ children: o, ...t }, e) => {
  const n = h.toArray(o)[0];
  return /* @__PURE__ */ a(g.Trigger, { asChild: !0, ref: e, ...t, children: n ?? /* @__PURE__ */ a("button", { children: "Add button or link" }) });
}), C = "@webstudio-is/sdk-components-react-radix", Xt = {
  onNavigatorUnselect: (o, t) => {
    for (const e of t.instancePath)
      if (e.component === `${C}:NavigationMenuContent`) {
        const n = l(
          t.instancePath,
          e,
          `${C}:NavigationMenu`
        );
        n && o.setMemoryProp(n, "value", void 0);
      }
  },
  onNavigatorSelect: (o, t) => {
    var e;
    for (const n of t.instancePath)
      if (n.component === `${C}:NavigationMenuContent`) {
        const s = l(
          t.instancePath,
          n,
          `${C}:NavigationMenu`
        ), r = l(
          t.instancePath,
          n,
          `${C}:NavigationMenuItem`
        );
        if (r === void 0 || s === void 0)
          return;
        const c = o.getPropValue(r, "value") ?? ((e = o.indexesWithinAncestors.get(r.id)) == null ? void 0 : e.toString());
        c && o.setMemoryProp(s, "value", c);
      }
  }
}, Yt = i(({ defaultOpen: o, defaultValue: t, ...e }, n) => {
  const s = e.open ?? o ?? !1, [r, c] = d(s);
  f(() => c(s), [s]);
  const u = e.value ?? t ?? "", [T, v] = d(u);
  return f(() => v(u), [u]), /* @__PURE__ */ a(
    X,
    {
      ...e,
      open: r,
      onOpenChange: c,
      value: T,
      onValueChange: v
    }
  );
}), Zt = i((o, t) => {
  const { renderer: e } = N(S);
  return /* @__PURE__ */ a(tt, { onPointerDown: e === "canvas" ? (s) => {
    s.preventDefault();
  } : void 0, ref: t, ...o });
}), tn = i((o, t) => /* @__PURE__ */ a(nt, { ref: t, ...o })), nn = i((o, t) => /* @__PURE__ */ a(Y, { children: /* @__PURE__ */ a(Z, { ref: t, ...o, position: "popper" }) })), en = Q, on = B, sn = G, an = J, y = "@webstudio-is/sdk-components-react-radix", rn = {
  onNavigatorUnselect: (o, t) => {
    for (const e of t.instancePath)
      if (e.component === `${y}:SelectContent`) {
        const n = l(
          t.instancePath,
          e,
          `${y}:Select`
        );
        n && o.setMemoryProp(n, "open", void 0);
      }
  },
  onNavigatorSelect: (o, t) => {
    for (const e of t.instancePath)
      if (e.component === `${y}:SelectContent`) {
        const n = l(
          t.instancePath,
          e,
          `${y}:Select`
        );
        n && o.setMemoryProp(n, "open", !0);
      }
  }
};
export {
  Ut as A,
  tn as B,
  dt as C,
  ht as D,
  en as E,
  Lt as F,
  xt as G,
  Rt as H,
  wt as I,
  Dt as J,
  Vt as K,
  mt as L,
  Et as M,
  jt as N,
  At as O,
  kt as P,
  St as Q,
  Ot as R,
  Yt as S,
  It as T,
  Kt as U,
  Xt as V,
  rn as W,
  Ft as a,
  Ht as b,
  Wt as c,
  _t as d,
  gt as e,
  pt as f,
  $t as g,
  Pt as h,
  bt as i,
  Ct as j,
  Tt as k,
  vt as l,
  Bt as m,
  Gt as n,
  Jt as o,
  qt as p,
  Qt as q,
  zt as r,
  Nt as s,
  yt as t,
  Mt as u,
  nn as v,
  on as w,
  sn as x,
  an as y,
  Zt as z
};
