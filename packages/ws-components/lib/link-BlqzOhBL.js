import { jsx as h } from "react/jsx-runtime";
import { createContext as w, forwardRef as C, useContext as v } from "react";
import { ReactSdkContext as U } from "@webstudio-is/react-sdk/runtime";
import { resolveLocalLinkUrl as P, isLocalLinkActive as g, isInternalHref as x } from "@webstudio-is/sdk/link-utils";
const R = (e, s, c) => {
  const { href: l, "aria-current": u, className: p, ...t } = e, n = P(l, s, c), r = g(s, n), a = [p, r ? "active" : void 0].filter(Boolean).join(" ");
  return {
    linkProps: t,
    currentLinkProps: {
      ...r ? { "aria-current": u ?? "page" } : {},
      ...a === "" ? {} : { className: a }
    }
  };
}, L = ({
  prefetch: e,
  discover: s,
  reloadDocument: c,
  replace: l,
  preventScrollReset: u,
  relative: p,
  state: t,
  viewTransition: n,
  ...r
}) => r, N = w(
  void 0
), $ = () => {
  if (!(typeof window > "u"))
    return window.location.href;
}, y = (e) => {
  if (e !== void 0)
    return new URL(e, "https://webstudio.local");
}, B = C((e, s) => {
  const c = v(N), { assetBaseUrl: l } = v(U), {
    children: u,
    // @todo: it's a hack made for Image component for the builder and should't be in the runtime at all.
    $webstudio$canvasOnly$assetId: p,
    "aria-current": t,
    className: n,
    ...r
  } = e, a = r.href !== void 0, i = a ? String(r.href) : "#", k = c ?? $(), o = y(k);
  let f = L(r), d = {
    ...t === void 0 ? {} : { "aria-current": t },
    ...n === void 0 ? {} : { className: n }
  };
  if (o && a && x(i, l)) {
    const m = R(
      { ...r, href: i, "aria-current": t, className: n },
      o,
      new URL(i, o)
    );
    f = L(m.linkProps), d = m.currentLinkProps;
  }
  return /* @__PURE__ */ h(
    "a",
    {
      ...f,
      ...d,
      href: i === "" && o ? `${o.pathname}${o.search}` : i,
      ref: s,
      children: u
    }
  );
});
B.displayName = "Link";
export {
  B,
  N as L,
  R as g,
  L as s
};
