// GET /api/projects  — list all projects for the authenticated user
// POST /api/projects — create a new empty project

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserProjects, createProject } from "@/lib/supabase-server";
import { emptyProjectSchema } from "@/lib/emptyProject";
import { getUserEntitlements } from "@/lib/userTier";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await getUserProjects(userId);
  return NextResponse.json(
    projects.map((p) => ({
      id: p.id,
      name: p.project_name ?? "Untitled",
      updatedAt: p.updated_at ?? null,
    }))
  );
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // FA-004: enforce the tier's project cap (free = 3). null = unlimited.
  const { maxProjects } = await getUserEntitlements(userId);
  if (maxProjects !== null) {
    const existing = await getUserProjects(userId);
    if (existing.length >= maxProjects) {
      return NextResponse.json(
        { error: `Free plan is limited to ${maxProjects} projects. Upgrade to create more.`, upgrade: true },
        { status: 402 }
      );
    }
  }

  let name = "Untitled Project";
  try {
    const body = await req.json() as { name?: string };
    if (body.name?.trim()) name = body.name.trim();
  } catch {
    // empty body is fine — default name is used
  }

  const now = new Date().toISOString();
  const schema = emptyProjectSchema(name, now);

  try {
    const { id } = await createProject(userId, name, schema);
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error("[api/projects] create failed:", err);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
