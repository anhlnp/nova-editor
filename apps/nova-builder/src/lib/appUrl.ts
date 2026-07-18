import type { NextRequest } from "next/server";

/**
 * Returns the base origin URL for the application (e.g. "https://nova.app" or "http://localhost:3000").
 * Dynamically resolves from incoming request headers or Cloudflare/Vercel/app environment variables,
 * preventing accidental fallbacks to `http://localhost:3000` on production deployments.
 */
export function getAppUrl(req?: Request | NextRequest): string {
  // 1. If we have a Request object, derive origin directly from request or forwarded headers
  if (req) {
    try {
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
      if (host && host !== "null") {
        const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
        // In production, do not return localhost derived from internal worker requests
        if (!isLocal || process.env.NODE_ENV !== "production") {
          const proto = req.headers.get("x-forwarded-proto") || (isLocal ? "http" : "https");
          return `${proto}://${host}`;
        }
      }
      const origin = new URL(req.url).origin;
      if (origin && origin !== "null" && origin !== "about:blank") {
        const isLocal = origin.includes("localhost") || origin.includes("127.0.0.1");
        if (!isLocal || process.env.NODE_ENV !== "production") {
          return origin;
        }
      }
    } catch {
      // Fallback to environment checks below
    }
  }

  // 2. Check platform environment variables first (Cloudflare Pages, Vercel)
  if (process.env.CF_PAGES_URL) {
    return process.env.CF_PAGES_URL.startsWith("http")
      ? process.env.CF_PAGES_URL
      : `https://${process.env.CF_PAGES_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Check explicitly set runtime or build environment variables
  const envUrl = process.env.NEXT_PUBLIC_APP_HOST || process.env.NEXTAUTH_URL;
  if (envUrl) {
    const isLocal = envUrl.includes("localhost") || envUrl.includes("127.0.0.1");
    // In production, ignore hardcoded or defaulted localhost environment variables
    if (!isLocal || process.env.NODE_ENV !== "production") {
      return envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
    }
  }

  // 4. Default local development fallback
  return envUrl || "http://localhost:3000";
}
