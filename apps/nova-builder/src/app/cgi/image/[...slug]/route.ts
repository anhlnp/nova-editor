import { NextResponse } from "next/server";

// Catch-all route for wsImageLoader-generated URLs.
// wsImageLoader from @webstudio-is/image generates:
//   /cgi/image/<encodePathFragment(src)>?width=800&quality=80&format=auto
//
// encodePathFragment = encodeURIComponent(src).replace(/%2F/g, "/")
// So "https://ik.imagekit.io/foo/bar.png"
// becomes "https%3A//ik.imagekit.io/foo/bar.png"
// which the browser path-normalizes to "https%3A/ik.imagekit.io/foo/bar.png"
//
// Next.js App Router passes URL segments as decoded strings in params.slug,
// so we reconstruct the original URL from the slug array.

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const url = new URL(req.url);

  if (!slug || slug.length === 0) {
    return new NextResponse("Missing src", { status: 400 });
  }

  // Reconstruct the original URL from path segments.
  // slug = ["https:", "ik.imagekit.io", "foo", "bar.png"]  (Next.js decodes %3A → :)
  // We join: protocol "https:" + "//" + rest
  let src: string;
  const first = slug[0];

  if (first === "https:" || first === "http:") {
    // Full URL split across path segments
    src = first + "//" + slug.slice(1).join("/");
  } else if (first.startsWith("https%3A") || first.startsWith("http%3A")) {
    // Still percent-encoded (edge case)
    const decoded = decodeURIComponent(first);
    src = decoded + "//" + slug.slice(1).join("/");
  } else {
    // Relative path or already-decoded src
    src = slug.join("/");
    if (!src.startsWith("/")) src = "/" + src;
  }

  // Preserve any remaining query params from the original URL
  // (width, quality, format come from wsImageLoader as query params on the /cgi/image URL)
  const width = url.searchParams.get("width") ?? url.searchParams.get("w");
  const height = url.searchParams.get("height") ?? url.searchParams.get("h");
  const quality = url.searchParams.get("quality") ?? "80";
  const format = url.searchParams.get("format") ?? "auto";
  const fit = (url.searchParams.get("fit") ?? "cover") as "cover" | "contain" | "fill";

  // ── Trust check ──────────────────────────────────────────────────────────────
  const assetBase = process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "";
  const isTrusted =
    src.startsWith("/") ||
    (assetBase !== "" && src.startsWith(assetBase)) ||
    src.startsWith("https://imagedelivery.net/") ||
    src.startsWith("https://ik.imagekit.io/") ||
    src.startsWith("https://uploadthing.com/") ||
    src.startsWith("https://pub-") ||
    (assetBase === "" && src.startsWith("https://"));

  if (!isTrusted) {
    console.warn("[cgi/image] Blocked untrusted src:", src.slice(0, 100));
    return new NextResponse("Untrusted image source", { status: 403 });
  }

  // ── ImageKit: redirect with native transform params ──────────────────────────
  if (src.startsWith("https://ik.imagekit.io/")) {
    try {
      const ikUrl = new URL(src);
      const transforms: string[] = [];
      if (width) transforms.push(`w-${width}`);
      if (height) transforms.push(`h-${height}`);
      if (quality && quality !== "auto") transforms.push(`q-${quality}`);
      if (format && format !== "auto" && format !== "webp") {
        transforms.push(`f-${format}`);
      }
      if (fit === "contain") transforms.push("cm-pad_resize");
      if (transforms.length > 0) {
        ikUrl.searchParams.set("tr", transforms.join(","));
      }
      return NextResponse.redirect(ikUrl.toString(), {
        status: 302,
        headers: { "cache-control": "public, max-age=86400" },
      });
    } catch {
      // Fall through to passthrough on malformed URL
    }
  }

  // ── Cloudflare Images ────────────────────────────────────────────────────────
  const cfAccountHash = process.env.CF_IMAGES_ACCOUNT_HASH;
  if (cfAccountHash && assetBase && src.startsWith(assetBase)) {
    const objectKey = src.slice(assetBase.length).replace(/^\//, "");
    const cfUrl = `https://imagedelivery.net/${cfAccountHash}/${encodeURIComponent(objectKey)}/w=${width ?? ""},h=${height ?? ""},fit=${fit},f=auto`;
    return NextResponse.redirect(cfUrl, { status: 302 });
  }

  // ── Passthrough: fetch and forward (dev fallback, no resize) ─────────────────
  try {
    const upstream = await fetch(src, {
      headers: { "User-Agent": "nova-builder/image-proxy" },
    });
    if (!upstream.ok) {
      console.error("[cgi/image] upstream error", upstream.status, src.slice(0, 80));
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
        "x-nova-image-src": src.slice(0, 80),
      },
    });
  } catch (err) {
    console.error("[cgi/image] fetch failed:", src.slice(0, 80), err);
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}
