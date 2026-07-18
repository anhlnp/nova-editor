// src/link-utils.ts
var isInternalHref = (href, assetBaseUrl) => /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href) === false && (assetBaseUrl !== "" && href.startsWith("/") && href.startsWith(assetBaseUrl)) === false;
var resolveLocalLinkUrl = (href, location, resolvedPath) => {
  if (href === "") {
    return {
      pathname: location.pathname,
      search: location.search,
      hash: ""
    };
  }
  if (href.startsWith("#")) {
    return {
      pathname: location.pathname,
      search: location.search,
      hash: href === "#" ? "" : href
    };
  }
  return resolvedPath;
};
var isLocalLinkActive = (current, target) => {
  return current.pathname === target.pathname && current.search === target.search && current.hash === target.hash;
};
export {
  isInternalHref,
  isLocalLinkActive,
  resolveLocalLinkUrl
};
