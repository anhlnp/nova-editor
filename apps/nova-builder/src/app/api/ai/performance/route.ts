// POST /api/ai/performance — AI-assisted performance advisor.
// Analyzes the project structure and assets for common performance issues.
// Returns scored hints with estimated impact.
// No AI credits deducted — uses heuristic analysis.

import { getToken } from "next-auth/jwt";
import { getOrProvisionUser } from "@/lib/supabase-server";

type AssetInfo = {
  id: string;
  name: string;
  type: string;
  size?: number;
  width?: number;
  height?: number;
};

type InstanceNode = {
  id: string;
  component: string;
  props: Record<string, unknown>;
  childCount: number;
  depth: number;
};

export type PerfHint = {
  id: string;
  severity: "error" | "warning" | "info";
  category: "images" | "structure" | "fonts" | "layout";
  message: string;
  impact: "high" | "medium" | "low";
  recommendation: string;
};

const MAX_IMAGE_SIZE_BYTES = 200 * 1024; // 200 KB
const MAX_NEST_DEPTH = 12;

function analyzePerformance(instances: InstanceNode[], assets: AssetInfo[]): PerfHint[] {
  const hints: PerfHint[] = [];

  // Image size checks
  const largeImages = assets.filter((a) => a.type === "image" && a.size != null && a.size > MAX_IMAGE_SIZE_BYTES);
  if (largeImages.length > 0) {
    hints.push({
      id: "large-images",
      severity: "warning",
      category: "images",
      message: `${largeImages.length} image(s) over 200 KB`,
      impact: "high",
      recommendation: "Convert to WebP and compress. Images should be under 200 KB for fast loads.",
    });
  }

  // Unoptimized raster images (no WebP)
  const nonWebP = assets.filter((a) => a.type === "image" && !a.name.endsWith(".webp") && !a.name.endsWith(".avif") && !a.name.endsWith(".svg"));
  if (nonWebP.length > 2) {
    hints.push({
      id: "non-webp",
      severity: "info",
      category: "images",
      message: `${nonWebP.length} images are not in WebP/AVIF format`,
      impact: "medium",
      recommendation: "Use WebP or AVIF for 25–50% smaller file sizes vs JPEG/PNG.",
    });
  }

  // Deep nesting check
  const deepNodes = instances.filter((n) => n.depth > MAX_NEST_DEPTH);
  if (deepNodes.length > 0) {
    hints.push({
      id: "deep-nesting",
      severity: "warning",
      category: "structure",
      message: `${deepNodes.length} elements nested deeper than ${MAX_NEST_DEPTH} levels`,
      impact: "medium",
      recommendation: "Flatten the component tree. Deep nesting increases layout recalculation cost.",
    });
  }

  // Total instance count
  if (instances.length > 200) {
    hints.push({
      id: "instance-count",
      severity: "info",
      category: "structure",
      message: `Page has ${instances.length} elements`,
      impact: "low",
      recommendation: "Consider extracting repeated patterns into components to reduce DOM size.",
    });
  }

  // Font count
  const fontAssets = assets.filter((a) => a.type === "font");
  if (fontAssets.length > 4) {
    hints.push({
      id: "font-count",
      severity: "warning",
      category: "fonts",
      message: `${fontAssets.length} custom fonts loaded`,
      impact: "medium",
      recommendation: "Use 2 fonts maximum per page. Each font adds a render-blocking request.",
    });
  }

  if (hints.length === 0) {
    hints.push({
      id: "all-clear",
      severity: "info",
      category: "structure",
      message: "No major performance issues detected",
      impact: "low",
      recommendation: "Your page structure looks healthy. Monitor Core Web Vitals after publishing.",
    });
  }

  return hints;
}

// Score 0–100: 100 = no issues, deduct per severity
function computeScore(hints: PerfHint[]): number {
  let score = 100;
  for (const h of hints) {
    if (h.id === "all-clear") continue;
    if (h.severity === "error") score -= 20;
    else if (h.severity === "warning") score -= 10;
    else score -= 3;
  }
  return Math.max(0, score);
}

export async function POST(req: Request) {
  const token = await getToken({ req: req as Parameters<typeof getToken>[0]["req"] });
  if (!token?.githubId && !token?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await getOrProvisionUser(token);
  } catch {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const { instances = [], assets = [] } = (await req.json()) as {
    instances?: InstanceNode[];
    assets?: AssetInfo[];
  };

  const hints = analyzePerformance(instances, assets);
  const score = computeScore(hints);

  return Response.json({ hints, score });
}
