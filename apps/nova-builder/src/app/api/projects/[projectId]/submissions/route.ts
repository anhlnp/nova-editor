// GET /api/projects/:projectId/submissions — list form submissions for the project owner.
// ?format=csv  → download as CSV
// ?formName=   → filter by form name (optional)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


export async function GET(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: project } = await getSupabaseAdmin()
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(req.url);
  const formName = url.searchParams.get("formName");
  const format = url.searchParams.get("format");

  let query = getSupabaseAdmin()
    .from("form_submissions")
    .select("id, form_name, fields, ip, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(500);

  if (formName) query = query.eq("form_name", formName);

  const { data: rows } = await query;
  const submissions = rows ?? [];

  if (format === "csv") {
    if (submissions.length === 0) {
      return new Response("id,form_name,created_at\n", {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="submissions.csv"`,
        },
      });
    }
    const allKeys = new Set<string>();
    for (const s of submissions) {
      Object.keys(s.fields as Record<string, string>).forEach((k) => allKeys.add(k));
    }
    const fieldCols = [...allKeys];
    const header = ["id", "form_name", "created_at", ...fieldCols].join(",");
    const csvRows = submissions.map((s) => {
      const fields = s.fields as Record<string, string>;
      const cols = [
        s.id,
        s.form_name,
        s.created_at,
        ...fieldCols.map((k) => `"${(fields[k] ?? "").replace(/"/g, '""')}"`),
      ];
      return cols.join(",");
    });
    return new Response([header, ...csvRows].join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="submissions.csv"`,
      },
    });
  }

  return NextResponse.json({ submissions });
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: project } = await getSupabaseAdmin()
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json()) as { id: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await getSupabaseAdmin()
    .from("form_submissions")
    .delete()
    .eq("id", body.id)
    .eq("project_id", projectId);

  return NextResponse.json({ ok: true });
}
