// Trigger a Cloudflare Pages deployment.
// Never throws — all errors are returned as { ok: false }.

export interface TriggerCFDeployArgs {
  token: string;
  accountId: string;
  projectName: string;
}

export interface CFDeployResult {
  ok: boolean;
  deployUrl: string;
  error?: string;
}

export async function triggerCloudflareDeploy(
  args: TriggerCFDeployArgs
): Promise<CFDeployResult> {
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${args.accountId}/pages/projects/${args.projectName}/deployments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${args.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[deploy/cloudflare] HTTP ${res.status}`, detail);
      return { ok: false, deployUrl: "", error: `HTTP ${res.status}` };
    }

    const data = (await res.json().catch(() => ({}))) as { result?: { url?: string } };
    return { ok: true, deployUrl: data.result?.url ?? "" };
  } catch (err) {
    console.error("[deploy/cloudflare] error", err);
    return { ok: false, deployUrl: "", error: String(err) };
  }
}
