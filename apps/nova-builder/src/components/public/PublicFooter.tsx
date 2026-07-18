import Link from "next/link";

export function PublicFooter() {
  return (
    <footer style={{ borderTop: "1px solid #e2e8f0", background: "#f8fafc", padding: "32px 32px 24px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 14, color: "#475569" }}>
          © {new Date().getFullYear()} Nova. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { href: "/pricing", label: "Pricing" },
            { href: "/terms", label: "Terms" },
            { href: "/privacy", label: "Privacy" },
            { href: "mailto:support@nova.build", label: "Support" },
          ].map(({ href, label }) => (
            <Link key={label} href={href} style={{ fontSize: 14, color: "#475569", textDecoration: "none" }}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
