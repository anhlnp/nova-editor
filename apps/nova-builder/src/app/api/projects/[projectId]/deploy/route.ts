// POST /api/projects/[projectId]/deploy
// Trigger a deployment to Vercel, Netlify, or Cloudflare Pages.
//
// Body (provider = "vercel"):
//   { provider: "vercel", token, repoFullName, branch }
//
// Body (provider = "netlify"):
//   { provider: "netlify", token, siteId }
//
// Body (provider = "cloudflare"):
//   { provider: "cloudflare", token, accountId, projectName }
//
// Returns: { ok, deployUrl, error? }

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ownsProject } from "@/lib/projectOwnership";
import { getUserEntitlements } from "@/lib/userTier";
import {
  triggerVercelDeploy,
  triggerNetlifyDeploy,
  triggerCloudflareDeploy,
} from "@studio/deploy";

export async function POST(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // FA-001: ownership + entitlement. Deploy is a paid feature and must be
  // scoped to the project owner (was: any logged-in user could deploy any id).
  if (!(await ownsProject(projectId, userId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!(await getUserEntitlements(userId)).deploy) {
    return NextResponse.json(
      { error: "Deploying is available on Pro and above. Upgrade to publish to your own hosting.", upgrade: true },
      { status: 402 }
    );
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { provider } = body;

  if (provider === "vercel") {
    const { token, repoFullName, branch } = body;
    if (!token || !repoFullName || !branch) {
      return NextResponse.json({ error: "token, repoFullName, and branch are required" }, { status: 400 });
    }
    const result = await triggerVercelDeploy({ token, repoFullName, branch });
    return NextResponse.json(result);
  }

  if (provider === "netlify") {
    const { token, siteId } = body;
    if (!token || !siteId) {
      return NextResponse.json({ error: "token and siteId are required" }, { status: 400 });
    }
    const result = await triggerNetlifyDeploy({ token, siteId });
    return NextResponse.json(result);
  }

  if (provider === "cloudflare") {
    const { token, accountId, projectName } = body;
    if (!token || !accountId || !projectName) {
      return NextResponse.json({ error: "token, accountId, and projectName are required" }, { status: 400 });
    }
    const result = await triggerCloudflareDeploy({ token, accountId, projectName });
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "provider must be one of: vercel, netlify, cloudflare" }, { status: 400 });
}
