// Trigger a Netlify deploy for an existing site.
// Never throws — all errors are returned as { ok: false }.

export interface TriggerNetlifyDeployArgs {
  token: string;
  /** Netlify site ID (from your site's API settings) */
  siteId: string;
}

export interface NetlifyDeployResult {
  ok: boolean;
  deployUrl: string;
  error?: string;
}

export async function triggerNetlifyDeploy(
  args: TriggerNetlifyDeployArgs
): Promise<NetlifyDeployResult> {
  try {
    const res = await fetch(
      `https://api.netlify.com/api/v1/sites/${args.siteId}/deploys`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${args.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[deploy/netlify] HTTP ${res.status}`, detail);
      return { ok: false, deployUrl: "", error: `HTTP ${res.status}` };
    }

    const data = (await res.json().catch(() => ({}))) as { ssl_url?: string; deploy_url?: string };
    return { ok: true, deployUrl: data.ssl_url ?? data.deploy_url ?? "" };
  } catch (err) {
    console.error("[deploy/netlify] error", err);
    return { ok: false, deployUrl: "", error: String(err) };
  }
}
