// POST /api/submissions — public endpoint, no auth required.
// Called from form components embedded in published sites.
// Body: { projectId: string; formName?: string; fields: Record<string, string> }
// Notifies the project owner by email (honoring notification_prefs.form_submission).

import { NextResponse } from "next/server";
import { sendEmail, emailShell } from "@/lib/email";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { getAppUrl } from "@/lib/appUrl";


export async function POST(req: Request) {
  // FA-010: public unauthenticated endpoint — cap per client to blunt
  // submission floods and the owner-email amplification they trigger.
  const limit = rateLimit(clientKey(req, "submissions"), 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  const body = (await req.json()) as {
    projectId?: string;
    formName?: string;
    fields?: Record<string, string>;
  };

  if (!body.projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: project } = await supabase
    .from("projects")
    .select("id, project_name, user_id")
    .eq("id", body.projectId)
    .single();

  if (!project) return NextResponse.json({ ok: false }, { status: 404 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  await supabase.from("form_submissions").insert({
    project_id: body.projectId,
    form_name: body.formName ?? "default",
    fields: body.fields ?? {},
    ip,
  });

  // Owner notification — honors notification_prefs.form_submission (default on).
  const { data: owner } = await supabase
    .from("users")
    .select("email, notification_prefs")
    .eq("id", project.user_id)
    .single();
  const prefs = (owner?.notification_prefs ?? {}) as Record<string, boolean>;
  // FA-010: cap owner notifications per project independent of source IP, so a
  // distributed flood still can't bomb the owner's inbox (max 3 emails / 5 min).
  const emailAllowed = rateLimit(`submission-email:${body.projectId}`, 3, 5 * 60_000).ok;
  if (owner?.email && prefs["form_submission"] !== false && emailAllowed) {
    const rows = Object.entries(body.fields ?? {})
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">${k}</td><td style="padding:4px 0;color:#111827">${String(v)}</td></tr>`)
      .join("");
    const appUrl = getAppUrl(req);
    sendEmail({
      to: owner.email,
      subject: `New form submission — ${project.project_name ?? "your site"}`,
      html: emailShell(
        "New form submission",
        `Someone submitted the <strong>${body.formName ?? "default"}</strong> form on <strong>${project.project_name ?? "your site"}</strong>:<table style="margin-top:12px;font-size:13px;border-collapse:collapse">${rows}</table>`,
        "View all submissions",
        `${appUrl}/submissions/${body.projectId}`
      ),
    }).catch(() => { /* non-fatal */ });
  }

  return NextResponse.json({ ok: true });
}
