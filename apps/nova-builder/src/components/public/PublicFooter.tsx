import Link from "next/link";

interface PublicFooterProps {
  theme?: "light" | "dark";
}

export function PublicFooter({ theme = "light" }: PublicFooterProps) {
  const isDark = theme === "dark";

  return (
    <footer style={{
      borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
      background: isDark ? "#090a0b" : "#f8fafc",
      padding: "32px 32px 24px"
    }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 14, color: isDark ? "#9f9fa0" : "#475569", fontFamily: isDark ? "var(--font-suisse-intl)" : "inherit" }}>
          © {new Date().getFullYear()} Nova. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { href: "/pricing", label: "Pricing" },
            { href: "/terms", label: "Terms" },
            { href: "/privacy", label: "Privacy" },
            { href: "mailto:support@nova.build", label: "Support" },
          ].map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              style={{
                fontSize: 14,
                color: isDark ? "#9f9fa0" : "#475569",
                textDecoration: "none",
                fontFamily: isDark ? "var(--font-suisse-intl)" : "inherit",
                transition: "color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = isDark ? "#ffffff" : "#6d28d9"}
              onMouseLeave={(e) => e.currentTarget.style.color = isDark ? "#9f9fa0" : "#475569"}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
