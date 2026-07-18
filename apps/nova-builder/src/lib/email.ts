// R4 (P0-3) — Transactional email via the Resend REST API (server-only).
// Plain fetch, no SDK. Degrades to a logged no-op when RESEND_API_KEY is unset
// so every caller can fire-and-forget without env guards.

const FROM = process.env.EMAIL_FROM ?? "Nova <noreply@nova.build>";

export async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY unset — skipped "${args.subject}" to ${args.to}`);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [args.to], subject: args.subject, html: args.html }),
    });
    if (!res.ok) {
      console.error(`[email] Resend ${res.status}: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

// Shared dark-card wrapper so all Nova emails look consistent.
export function emailShell(title: string, bodyHtml: string, ctaLabel?: string, ctaUrl?: string): string {
  const cta = ctaLabel && ctaUrl
    ? `<a href="${ctaUrl}" style="display:inline-block;margin-top:20px;padding:10px 24px;background:#7c3aed;color:#ffffff;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">${ctaLabel}</a>`
    : "";
  return `<!DOCTYPE html>
<html><body style="margin:0;background:#f4f4f7;font-family:system-ui,-apple-system,sans-serif;padding:32px 16px">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb">
    <div style="font-size:14px;font-weight:800;color:#7c3aed;letter-spacing:-0.02em;margin-bottom:20px">Nova</div>
    <h1 style="font-size:18px;color:#111827;margin:0 0 12px">${title}</h1>
    <div style="font-size:14px;color:#4b5563;line-height:1.6">${bodyHtml}</div>
    ${cta}
  </div>
  <div style="max-width:480px;margin:12px auto 0;text-align:center;font-size:11px;color:#9ca3af">
    Sent by Nova · You can manage notifications in Settings
  </div>
</body></html>`;
}
