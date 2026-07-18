import { NextRequest, NextResponse } from "next/server";
import { languageDetector } from "@/lib/i18n/detector";

// No `runtime = "edge"`: on Cloudflare Workers via OpenNext the whole app runs
// on the Workers runtime already, and OpenNext cannot bundle per-route edge
// functions the default way (it fails the Workers Build). This route only reads
// request headers, so the default (node-compat) runtime is correct.

export async function GET(req: NextRequest) {
  // Check Cloudflare country header first, then Vercel, then custom country header
  const country =
    req.headers.get("cf-ipcountry") ??
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("x-country-code") ??
    null;

  // FA-I05: prefer the IP country when present; otherwise fall back to the
  // browser's Accept-Language. The previous guard (`recommendedLocale === "en"`)
  // made the fallback unreachable whenever the country mapping already returned
  // "en", so a `vi` browser with no country header was never detected.
  let recommendedLocale = country ? languageDetector.detectLocaleFromCountry(country) : "en";

  if (!country) {
    const acceptLanguage = req.headers.get("accept-language");
    if (acceptLanguage && acceptLanguage.toLowerCase().includes("vi")) {
      recommendedLocale = "vi";
    }
  }

  return NextResponse.json({
    country,
    recommendedLocale,
  });
}
