// P50 — CMS data binding proxy.
// POST /api/cms  { provider, config } → normalized { items: Record<string,unknown>[] }
//
// Server-side so provider tokens never reach the browser. Supports Contentful,
// Airtable, and Notion as live data sources feeding the Resource system (P44).

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Provider = "contentful" | "airtable" | "notion";

type CMSConfig = {
  token: string;
  // contentful
  spaceId?: string;
  environment?: string;
  // airtable
  baseId?: string;
  table?: string;
  // notion
  databaseId?: string;
};

async function fetchContentful(cfg: CMSConfig): Promise<Record<string, unknown>[]> {
  const env = cfg.environment || "master";
  const url = `https://cdn.contentful.com/spaces/${cfg.spaceId}/environments/${env}/entries?access_token=${cfg.token}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Contentful ${res.status}`);
  const json = (await res.json()) as { items?: Array<{ fields?: Record<string, unknown>; sys?: { id: string } }> };
  return (json.items ?? []).map((it) => ({ id: it.sys?.id, ...(it.fields ?? {}) }));
}

async function fetchAirtable(cfg: CMSConfig): Promise<Record<string, unknown>[]> {
  const url = `https://api.airtable.com/v0/${cfg.baseId}/${encodeURIComponent(cfg.table ?? "")}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${cfg.token}` } });
  if (!res.ok) throw new Error(`Airtable ${res.status}`);
  const json = (await res.json()) as { records?: Array<{ id: string; fields: Record<string, unknown> }> };
  return (json.records ?? []).map((r) => ({ id: r.id, ...r.fields }));
}

async function fetchNotion(cfg: CMSConfig): Promise<Record<string, unknown>[]> {
  const url = `https://api.notion.com/v1/databases/${cfg.databaseId}/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ page_size: 100 }),
  });
  if (!res.ok) throw new Error(`Notion ${res.status}`);
  const json = (await res.json()) as { results?: Array<{ id: string; properties: Record<string, unknown> }> };
  return (json.results ?? []).map((p) => ({ id: p.id, ...flattenNotionProps(p.properties) }));
}

// Notion properties are richly typed; flatten to plain primitives for binding.
function flattenNotionProps(props: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(props)) {
    const p = raw as { type?: string; [k: string]: unknown };
    switch (p.type) {
      case "title":
      case "rich_text": {
        const arr = p[p.type] as Array<{ plain_text?: string }> | undefined;
        out[key] = (arr ?? []).map((t) => t.plain_text ?? "").join("");
        break;
      }
      case "number": out[key] = p.number; break;
      case "checkbox": out[key] = p.checkbox; break;
      case "select": out[key] = (p.select as { name?: string } | null)?.name ?? ""; break;
      case "url": out[key] = p.url; break;
      case "date": out[key] = (p.date as { start?: string } | null)?.start ?? ""; break;
      default: out[key] = "";
    }
  }
  return out;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { provider?: Provider; config?: CMSConfig };
  if (!body.provider || !body.config?.token) {
    return NextResponse.json({ error: "provider and config.token required" }, { status: 400 });
  }

  try {
    let items: Record<string, unknown>[] = [];
    if (body.provider === "contentful") items = await fetchContentful(body.config);
    else if (body.provider === "airtable") items = await fetchAirtable(body.config);
    else if (body.provider === "notion") items = await fetchNotion(body.config);
    else return NextResponse.json({ error: "Unknown provider" }, { status: 400 });

    return NextResponse.json({ items, count: items.length });
  } catch (err) {
    return NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 502 });
  }
}
