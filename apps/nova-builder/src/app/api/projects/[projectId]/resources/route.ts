import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// POST /api/projects/[projectId]/resources
// Server-side Resource loader (M5). Fetches a Resource's URL with its method,
// headers and body and returns the parsed JSON so the canvas can bind props to
// live API data without CORS or leaking request secrets to the browser.
// Owner-scoped per ADR-NB-015.

type ResourceRequest = {
  url: string;
  method?: "get" | "post" | "put" | "delete";
  headers?: Array<{ name: string; value: string }>;
  body?: unknown;
};

const isHttpUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

export async function POST(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ownership check — only the project owner may run its resource loaders.
  const supabase = getSupabaseAdmin();
  const { data: project, error } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();
  if (error || !project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let resource: ResourceRequest;
  try {
    resource = (await req.json()) as ResourceRequest;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!resource.url || !isHttpUrl(resource.url)) {
    return NextResponse.json({ error: "Invalid or missing url" }, { status: 400 });
  }

  const method = (resource.method ?? "get").toUpperCase();
  const headers = new Headers();
  for (const h of resource.headers ?? []) {
    if (h.name) headers.set(h.name, h.value);
  }

  try {
    const upstream = await fetch(resource.url, {
      method,
      headers,
      body:
        method === "GET" || method === "DELETE" || resource.body == null
          ? undefined
          : typeof resource.body === "string"
            ? resource.body
            : JSON.stringify(resource.body),
      // guard against a hung upstream stalling the Worker
      signal: AbortSignal.timeout(10_000),
    });

    const contentType = upstream.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await upstream.json()
      : await upstream.text();

    return NextResponse.json({ ok: upstream.ok, status: upstream.status, data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Fetch failed" },
      { status: 502 }
    );
  }
}
