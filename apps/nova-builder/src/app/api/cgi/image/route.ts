import { NextResponse } from "next/server";

// Image transform proxy: GET /api/cgi/image?src=<url>&w=<px>&h=<px>&fit=cover|contain|fill
//
// Workers runtime note: native Canvas API is not available in Cloudflare Workers.
// This route forwards to Cloudflare Images or falls back to a passthrough.
// When CF_IMAGES_ACCOUNT_HASH is set, we rewrite to the Cloudflare Images CDN URL
// which handles resizing natively. Otherwise we proxy the source URL unchanged.
//
// ADR-NB-003: /canvas must stay public — this route is under /api, no auth needed
// (asset URLs are already public CDN URLs).

export async function GET(req: Request) {
  const url = new URL(req.url);
  const src = url.searchParams.get("src");
  const w = url.searchParams.get("w");
  const h = url.searchParams.get("h");
  const fit = (url.searchParams.get("fit") ?? "cover") as "cover" | "contain" | "fill";

  if (!src) {
    return new NextResponse("Missing src", { status: 400 });
  }

  // Validate src is a trusted origin (NEXT_PUBLIC_ASSET_BASE_URL or relative path).
  const assetBase = process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "";
  const isTrusted =
    src.startsWith("/") ||
    (assetBase && src.startsWith(assetBase)) ||
    src.startsWith("https://imagedelivery.net/");

  if (!isTrusted) {
    return new NextResponse("Untrusted image source", { status: 403 });
  }

  // If Cloudflare Images is configured, rewrite to CF Images resize URL.
  const cfAccountHash = process.env.CF_IMAGES_ACCOUNT_HASH;
  if (cfAccountHash && assetBase && src.startsWith(assetBase)) {
    // Strip assetBase prefix to get the R2 object path
    const objectKey = src.slice(assetBase.length).replace(/^\//, "");
    const params = new URLSearchParams();
    if (w) params.set("width", w);
    if (h) params.set("height", h);
    params.set("fit", fit);
    params.set("format", "auto");
    const cfUrl = `https://imagedelivery.net/${cfAccountHash}/${encodeURIComponent(objectKey)}/w=${w ?? ""},h=${h ?? ""},fit=${fit},f=auto`;
    return NextResponse.redirect(cfUrl, { status: 302 });
  }

  // Passthrough: fetch the source image and forward it (no resize).
  // The wsImageLoader will still call this endpoint for cache-control headers.
  try {
    const upstream = await fetch(src, {
      headers: { "User-Agent": "nova-builder/image-proxy" },
    });
    if (!upstream.ok) {
      return new NextResponse("Upstream error", { status: upstream.status });
    }
    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const body = upstream.body;
    if (!body) return new NextResponse("Empty upstream", { status: 502 });

    return new NextResponse(body, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=31536000, immutable",
        "x-nova-image-transform": `w=${w ?? "orig"},h=${h ?? "orig"},fit=${fit}`,
      },
    });
  } catch (err) {
    console.error("[api/cgi/image] fetch failed:", err);
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}
