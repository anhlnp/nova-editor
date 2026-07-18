// packages/deploy/src/vercel.ts
// W5 (PRD §8.7): trigger a Vercel deployment after a successful publish.
// CRITICAL (risk register §19): this NEVER throws — a deploy failure must not
// fail the publish. All errors are logged and returned as { ok: false }.

export interface TriggerVercelDeployArgs {
  token: string;
  /** "owner/repo" */
  repoFullName: string;
  branch: string;
}

export interface DeployResult {
  ok: boolean;
  deployUrl: string;
  error?: string;
}

export async function triggerVercelDeploy(
  args: TriggerVercelDeployArgs
): Promise<DeployResult> {
  const projectName = args.repoFullName.split("/")[1] ?? args.repoFullName;
  try {
    const res = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        gitSource: { type: "github", repoId: args.repoFullName, ref: args.branch },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[deploy] Vercel deploy failed (HTTP ${res.status})`, detail);
      return { ok: false, deployUrl: "", error: `HTTP ${res.status}` };
    }

    const data = (await res.json().catch(() => ({}))) as { url?: string };
    return { ok: true, deployUrl: data.url ? `https://${data.url}` : "" };
  } catch (err) {
    // Network/unexpected error — log, don't throw.
    console.error("[deploy] Vercel deploy error", err);
    return { ok: false, deployUrl: "", error: String(err) };
  }
}
