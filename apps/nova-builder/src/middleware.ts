import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/appUrl";

// Public paths — no auth required.
// /canvas MUST be public: it loads as an iframe src inside the builder
// without a session cookie being forwarded (ADR-NB-003).
// /preview + /api/preview MUST be public: share links open in incognito.
// /api/analytics/track + /api/submissions are called by anonymous visitors
// on published sites. /api/billing/webhook is called by payment providers.
const PUBLIC_PREFIXES = [
  "/canvas",
  "/preview",
  "/api/auth",
  "/api/preview",
  "/api/analytics/track",
  "/api/submissions",
  "/api/billing/webhook",
  "/api/billing/payos",
  "/api/i18n",
  "/api/projects/demo",
  "/builder/demo",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/pricing",
  "/terms",
  "/privacy",
  "/_next",
  "/favicon",
];

// "/" must match exactly — don't use startsWith which would also match "/projects" etc.
const PUBLIC_EXACT = new Set(["/"]);

const AUTH_PAGES = new Set([
  "/login",
  "/signup",
  "/reset-password",
  "/forgot-password",
  "/verify-email",
]);

function isPublic(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  // SEO endpoints must be crawlable without a session:
  // /api/projects/<id>/sitemap and /api/projects/<id>/robots
  if (
    pathname.startsWith("/api/projects/") &&
    (pathname.endsWith("/sitemap") || pathname.endsWith("/robots"))
  ) {
    return true;
  }
  return false;
}

async function getSessionToken(req: NextRequest) {
  process.env.AUTH_TRUST_HOST = "true";
  const isSecure =
    req.nextUrl.protocol === "https:" ||
    req.headers.get("x-forwarded-proto") === "https" ||
    process.env.NEXTAUTH_URL?.startsWith("https://") ||
    !!process.env.VERCEL ||
    !!process.env.CF_PAGES_URL;

  let token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: Boolean(isSecure),
  });
  if (!token) {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: !Boolean(isSecure),
    });
  }
  return token;
}

export async function middleware(req: NextRequest) {
  // Custom-domain host routing (P41): requests arriving on a host other than
  // the app's canonical host are forwarded to the domain resolver, which maps
  // verified project_domains rows to /preview/<projectId>.
  const appHost = process.env.NEXT_PUBLIC_APP_HOST;
  const reqHost = req.headers.get("host");
  const pathname = req.nextUrl.pathname;

  // Do not rewrite platform/dev/staging hostnames or internal system/auth paths
  const isPlatformHost =
    !reqHost ||
    reqHost.includes("localhost") ||
    reqHost.includes("127.0.0.1") ||
    reqHost.endsWith(".workers.dev") ||
    reqHost.endsWith(".pages.dev") ||
    reqHost.endsWith(".vercel.app");

  const isSystemPath =
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/settings");

  if (appHost && reqHost && reqHost !== appHost && !isPlatformHost && !isSystemPath) {
    const url = req.nextUrl.clone();
    url.pathname = "/preview/resolve";
    url.searchParams.set("host", reqHost);
    return NextResponse.rewrite(url);
  }

  // Redirect authenticated users trying to access auth pages to /
  if (AUTH_PAGES.has(pathname)) {
    const token = await getSessionToken(req);
    if (token) {
      return NextResponse.redirect(new URL("/", getAppUrl(req)));
    }
  }

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const token = await getSessionToken(req);

  if (!token) {
    const loginUrl = new URL("/login", getAppUrl(req));
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|woff2?|ttf|otf|eot|mp4|mp3|pdf|csv|zip)$).*)',
  ],
};
