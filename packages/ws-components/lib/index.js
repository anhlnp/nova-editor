import { jsx as e } from "react/jsx-runtime";
import { forwardRef as c, useContext as C } from "react";
import { ReactSdkContext as P } from "@webstudio-is/react-sdk/runtime";
import { g, B as a, s as f, L as x } from "./link-BlqzOhBL.js";
import { isInternalHref as R } from "@webstudio-is/sdk/link-utils";
const $ = (t, s) => t === "" ? `${s.pathname}${s.search}` : t, v = (t) => `https://webstudio.local${t.pathname}${t.search}${t.hash}`, u = ({
  children: t,
  location: s
}) => /* @__PURE__ */ e(x.Provider, { value: v(s), children: t }), N = ({
  Link: t,
  useLocation: s,
  useResolvedPath: m
}) => {
  const l = c((r, n) => {
    const o = s(), i = $(r.href, o), { linkProps: d, currentLinkProps: L } = g(
      r,
      o,
      m(r.href)
    );
    return /* @__PURE__ */ e(u, { location: o, children: /* @__PURE__ */ e(t, { ...d, ...L, to: i, ref: n }) });
  }), k = c(
    (r, n) => {
      const o = s();
      return /* @__PURE__ */ e(u, { location: o, children: /* @__PURE__ */ e(
        a,
        {
          ...f(r),
          href: r.href,
          ref: n
        }
      ) });
    }
  ), h = c(
    (r, n) => {
      const { assetBaseUrl: o } = C(P);
      if (r.href === void 0)
        return /* @__PURE__ */ e(a, { ...f(r), ref: n });
      const i = String(r.href);
      return i.startsWith("#") === !1 && R(i, o) ? /* @__PURE__ */ e(l, { ...r, href: i, ref: n }) : i.startsWith("#") ? /* @__PURE__ */ e(k, { ...r, href: i, ref: n }) : /* @__PURE__ */ e(a, { ...f(r), ref: n });
    }
  );
  return h.displayName = a.displayName, h;
};
export {
  x as LinkCurrentUrlContext,
  N as createLink
};
