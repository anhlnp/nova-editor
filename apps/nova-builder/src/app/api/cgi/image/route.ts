import { NextResponse } from "next/server";

// Image transform proxy: handles wsImageLoader-generated URLs.
//
// wsImageLoader from @webstudio-is/image generates URLs like:
//   /cgi/image/<src>?width=800&quality=80&format=auto
//
// next.config.mjs rewrites /cgi/image/:src* → /api/cgi/image?src=:src*
// preserving the query params (width, quality, format, height, fit).
//
// This route then:
//  1. For ImageKit sources → appends ImageKit transform params and redirects (no proxy)
//  2. For Cloudflare Images (CF_IMAGES_ACCOUNT_HASH set) → redirects to CF Images URL
//  3. Otherwise → passes through to the source URL (no resize in dev)
//
// ADR-NB-003: /canvas must stay public — no auth needed (asset URLs are CDN-public).

export async function GET(req: Request) {
  const url = new URL(req.url);
  let src = url.searchParams.get("src");

  if (!src) {
    return new NextResponse("Missing src", { status: 400 });
  }

  // wsImageLoader percent-encodes the src when embedding in the path.
  // Next.js rewrites convert https:// to https:/ (one slash stripped by path normalization).
  // Fix: decode %3A -> : first, then restore the missing double-slash.
  try {
    src = decodeURIComponent(src);
  } catch {
    // leave as-is if decoding fails
  }
  // Restore double-slash after protocol (Next.js rewrite strips one slash from https://).
  // "https:/foo" -> "https://foo"  |  "http:/foo" -> "http://foo"
  src = src.replace(/^(https?):\/([^/])/, "$1://$2");

  // wsImageLoader uses 'width'/'quality'/'format'/'height'/'fit' param names.
  // The route also accepts legacy 'w'/'h' for backward compat.
  const width = url.searchParams.get("width") ?? url.searchParams.get("w");
  const height = url.searchParams.get("height") ?? url.searchParams.get("h");
  const quality = url.searchParams.get("quality") ?? "80";
  const format = url.searchParams.get("format") ?? "auto";
  const fit = (url.searchParams.get("fit") ?? "cover") as "cover" | "contain" | "fill";

  // ── Trust check ─────────────────────────────────────────────────────────────
  const assetBase = process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "";
  const isTrusted =
    src.startsWith("/") ||
    (assetBase !== "" && src.startsWith(assetBase)) ||
    src.startsWith("https://imagedelivery.net/") ||
    src.startsWith("https://ik.imagekit.io/") ||
    src.startsWith("https://uploadthing.com/") ||
    src.startsWith("https://pub-") || // Cloudflare R2 public bucket pattern
    // When no assetBase is configured (local dev), allow any https:// URL
    (assetBase === "" && src.startsWith("https://"));

  if (!isTrusted) {
    console.warn("[api/cgi/image] Blocked untrusted src:", src.slice(0, 100));
    return new NextResponse("Untrusted image source", { status: 403 });
  }

  // ── ImageKit: redirect with transform params (no proxy needed) ───────────────
  // ImageKit supports URL-based transforms: https://ik.imagekit.io/id/path?tr=w-800,q-80
  if (src.startsWith("https://ik.imagekit.io/")) {
    try {
      const ikUrl = new URL(src);
      const transforms: string[] = [];
      if (width) transforms.push(`w-${width}`);
      if (height) transforms.push(`h-${height}`);
      if (quality && quality !== "auto") transforms.push(`q-${quality}`);
      if (format && format !== "auto") transforms.push(`f-${format}`);
      if (fit === "contain") transforms.push("cm-pad_resize");
      else if (fit === "fill") transforms.push("cm-fill");
      // else default is crop/cover

      if (transforms.length > 0) {
        ikUrl.searchParams.set("tr", transforms.join(","));
      }

      return NextResponse.redirect(ikUrl.toString(), {
        status: 302,
        headers: { "cache-control": "public, max-age=86400" },
      });
    } catch {
      // Malformed URL — fall through to passthrough
    }
  }

  // ── Cloudflare Images: redirect to CF resize URL ─────────────────────────────
  const cfAccountHash = process.env.CF_IMAGES_ACCOUNT_HASH;
  if (cfAccountHash && assetBase && src.startsWith(assetBase)) {
    const objectKey = src.slice(assetBase.length).replace(/^\//, "");
    const cfUrl = `https://imagedelivery.net/${cfAccountHash}/${encodeURIComponent(objectKey)}/w=${width ?? ""},h=${height ?? ""},fit=${fit},f=auto`;
    return NextResponse.redirect(cfUrl, { status: 302 });
  }

  // ── Passthrough: proxy the image (dev mode, no resize) ──────────────────────
  try {
    const upstream = await fetch(src, {
      headers: { "User-Agent": "nova-builder/image-proxy" },
    });
    if (!upstream.ok) {
      return new NextResponse(`Upstream error: ${upstream.status}`, {
        status: upstream.status,
      });
    }
    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const body = upstream.body;
    if (!body) return new NextResponse("Empty upstream", { status: 502 });

    return new NextResponse(body, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=31536000, immutable",
        "x-nova-image-transform": `w=${width ?? "orig"},h=${height ?? "orig"},fit=${fit},fmt=${format}`,
      },
    });
  } catch (err) {
    console.error("[api/cgi/image] fetch failed:", err);
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}
