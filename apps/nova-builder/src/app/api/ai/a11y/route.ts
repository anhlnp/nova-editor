// POST /api/ai/a11y — AI-assisted accessibility checker.
// Scans the serialized instance tree and returns a list of a11y issues with AI-suggested fixes.
// Rule-based detection; AI enriches the fix suggestions.

import { getToken } from "next-auth/jwt";
import { getOrProvisionUser } from "@/lib/supabase-server";
import { getProvider } from "@studio/ai";
import type { ProviderName } from "@studio/ai";

type InstanceNode = {
  id: string;
  component: string;
  props: Record<string, unknown>;
  textContent?: string;
};

export type A11yIssue = {
  instanceId: string;
  component: string;
  severity: "error" | "warning" | "info";
  rule: string;
  message: string;
  fix: string;
};

function runRuleChecks(instances: InstanceNode[]): A11yIssue[] {
  const issues: A11yIssue[] = [];

  for (const inst of instances) {
    const p = inst.props ?? {};

    if (inst.component === "Image" || inst.component === "img") {
      if (!p["alt"] && !p["aria-label"]) {
        issues.push({ instanceId: inst.id, component: inst.component, severity: "error", rule: "img-alt", message: "Image is missing alt text.", fix: 'Add an alt prop: alt="Description of image"' });
      }
    }

    if (inst.component === "Link" || inst.component === "a") {
      if (!p["href"] && !p["onClick"]) {
        issues.push({ instanceId: inst.id, component: inst.component, severity: "warning", rule: "link-href", message: "Link has no href attribute.", fix: 'Add href="/destination" or an onClick handler.' });
      }
      if (!inst.textContent?.trim() && !p["aria-label"]) {
        issues.push({ instanceId: inst.id, component: inst.component, severity: "error", rule: "link-text", message: "Link has no accessible text.", fix: 'Add visible text content or aria-label="...".' });
      }
    }

    if (inst.component === "Input" || inst.component === "Textarea") {
      if (!p["aria-label"] && !p["id"] && !p["placeholder"]) {
        issues.push({ instanceId: inst.id, component: inst.component, severity: "warning", rule: "input-label", message: "Form input has no label.", fix: 'Add aria-label="..." or associate with a <Label> element.' });
      }
    }

    if (inst.component === "Button" || inst.component === "button") {
      if (!inst.textContent?.trim() && !p["aria-label"]) {
        issues.push({ instanceId: inst.id, component: inst.component, severity: "error", rule: "button-text", message: "Button has no accessible text.", fix: 'Add text content or aria-label="...".' });
      }
    }
  }

  return issues;
}

export async function POST(req: Request) {
  const token = await getToken({ req: req as Parameters<typeof getToken>[0]["req"] });
  if (!token?.githubId && !token?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let user: Awaited<ReturnType<typeof getOrProvisionUser>>;
  try {
    user = await getOrProvisionUser(token);
  } catch {
    return Response.json({ error: "User not found" }, { status: 404 });
  }
  void user;

  const { instances, provider: clientProvider } = (await req.json()) as {
    instances: InstanceNode[];
    provider?: ProviderName;
  };

  if (!instances?.length) {
    return Response.json({ issues: [] });
  }

  // Rule-based checks (no AI cost)
  const issues = runRuleChecks(instances);

  // If there are issues, optionally enrich with AI suggestions
  if (issues.length > 0) {
    try {
      const providerName: ProviderName =
        clientProvider ?? (process.env["AI_PROVIDER"] as ProviderName | undefined) ?? "anthropic";
      const provider = getProvider(providerName);
      const summary = issues.map((i, n) => `${n + 1}. [${i.rule}] ${i.message}`).join("\n");
      const prompt = `You are an accessibility expert. Given these detected issues in a web page, suggest concise, actionable fixes (max 80 chars each):

${summary}

Reply with a JSON array of strings, one fix per issue (same order): ["fix1", "fix2", ...]`;
      const raw = await provider.complete(
        [{ role: "user", content: prompt }],
        { tier: "patcher", maxTokens: 800 }
      );
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) {
        const fixes = JSON.parse(match[0]) as string[];
        issues.forEach((issue, i) => {
          if (fixes[i]) issue.fix = fixes[i];
        });
      }
    } catch {
      // Enrichment failed — return rule-based issues with default fixes
    }
  }

  return Response.json({ issues, count: issues.length });
}
