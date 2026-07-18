// src/resource-loader.ts
import hash from "@emotion/hash";

// src/to-string.ts
var createJsonStringifyProxy = (target) => {
  return new Proxy(target, {
    get(target2, prop, receiver) {
      if (prop === "toString") {
        return function() {
          return JSON.stringify(target2);
        };
      }
      const value = Reflect.get(target2, prop, receiver);
      if (typeof value === "object" && value !== null) {
        return createJsonStringifyProxy(value);
      }
      return value;
    }
  });
};
var isPlainObject = (value) => {
  return Object.prototype.toString.call(value) === "[object Object]" && (Object.getPrototypeOf(value) === null || Object.getPrototypeOf(value) === Object.prototype);
};
var serializeValue = (value) => {
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value);
};

// src/resource-loader.ts
var LOCAL_RESOURCE_PREFIX = "$resources";
var isLocalResource = (pathname, resourceName) => {
  const segments = pathname.split("/").filter(Boolean);
  if (resourceName === void 0) {
    return segments[0] === LOCAL_RESOURCE_PREFIX;
  }
  return segments.join("/") === `${LOCAL_RESOURCE_PREFIX}/${resourceName}`;
};
var sitemapResourceUrl = `/${LOCAL_RESOURCE_PREFIX}/sitemap.xml`;
var currentDateResourceUrl = `/${LOCAL_RESOURCE_PREFIX}/current-date`;
var assetsResourceUrl = `/${LOCAL_RESOURCE_PREFIX}/assets`;
var loadResource = async (customFetch, resourceRequest) => {
  try {
    const { method, searchParams, headers, body } = resourceRequest;
    let href = resourceRequest.url;
    try {
      const url = new URL(resourceRequest.url.trim());
      if (searchParams) {
        for (const { name, value } of searchParams) {
          url.searchParams.append(name, serializeValue(value));
        }
      }
      href = url.href;
    } catch {
    }
    const requestHeaders = new Headers(
      headers.map(({ name, value }) => [
        name,
        serializeValue(value)
      ])
    );
    const requestInit = {
      method,
      headers: requestHeaders
    };
    if (method !== "get" && body !== void 0) {
      requestInit.body = serializeValue(body);
    }
    const response = await customFetch(href, requestInit);
    let data = await response.text();
    try {
      data = JSON.parse(data);
    } catch {
    }
    if (!response.ok) {
      console.error(
        `Failed to load resource: ${href} - ${response.status}: ${JSON.stringify(data).slice(0, 300)}`
      );
    }
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data
    };
  } catch (error) {
    console.error(error);
    const message = error.message;
    return {
      ok: false,
      data: void 0,
      status: 500,
      statusText: message
    };
  }
};
var loadResources = async (customFetch, requests) => {
  return Object.fromEntries(
    await Promise.all(
      Array.from(
        requests,
        async ([name, request]) => [name, await loadResource(customFetch, request)]
      )
    )
  );
};
var getCacheKey = async (request) => {
  const url = new URL(request.url);
  const method = request.method;
  const body = await request.clone().text();
  const cacheControl = request.headers.get("Cache-Control");
  const resourceHash = hash(`${method}:${body}:${cacheControl}`);
  url.searchParams.set("ws-resource-hash", resourceHash);
  return url;
};
var cachedFetch = async (namespace, input, init) => {
  if (globalThis.caches) {
    const request = new Request(input, init);
    const requestCacheControl = request.headers.get("Cache-Control");
    if (!requestCacheControl) {
      return fetch(input, init);
    }
    const cache = await caches.open(namespace);
    const cacheKey = await getCacheKey(request);
    let response = await cache.match(cacheKey);
    if (response) {
      return new Response(response.body, response);
    }
    response = await fetch(request);
    if (!response.ok) {
      return response;
    }
    response = new Response(response.body, response);
    response.headers.set("Cache-Control", requestCacheControl);
    await cache.put(cacheKey, response.clone());
    return response;
  }
  return fetch(input, init);
};

// src/form-fields.ts
var formIdFieldName = `ws--form-id`;
var formBotFieldName = `ws--form-bot`;
var isBraveBrowser = () => {
  if (typeof navigator === "undefined") {
    return false;
  }
  return navigator.brave?.isBrave?.() === true || navigator.brave !== void 0;
};

// src/runtime.ts
var tagProperty = "data-ws-tag";
var getTagFromProps = (props) => {
  return props[tagProperty];
};
var indexProperty = "data-ws-index";
var getIndexWithinAncestorFromProps = (props) => {
  return props[indexProperty];
};
var animationCanPlayOnCanvasProperty = "data-ws-animation-can-play-on-canvas";
export {
  animationCanPlayOnCanvasProperty,
  assetsResourceUrl,
  cachedFetch,
  createJsonStringifyProxy,
  currentDateResourceUrl,
  formBotFieldName,
  formIdFieldName,
  getIndexWithinAncestorFromProps,
  getTagFromProps,
  indexProperty,
  isBraveBrowser,
  isLocalResource,
  isPlainObject,
  loadResource,
  loadResources,
  serializeValue,
  sitemapResourceUrl,
  tagProperty
};
