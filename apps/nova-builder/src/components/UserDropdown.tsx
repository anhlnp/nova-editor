"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useI18n } from "@/lib/i18n";
import { usePathname } from "next/navigation";

interface UserDropdownProps {
  mode?: "light" | "dark";
}

const colorModes = {
  light: {
    avatarBorder: "#e2e8f0",
    buttonHoverBg: "#f1f5f9",
    dropdownBg: "#ffffff",
    dropdownBorder: "#e2e8f0",
    dropdownShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    nameColor: "#0f172a",
    emailColor: "#64748b",
    linkColor: "#334155",
    linkHoverBg: "#f8fafc",
    signOutHoverBg: "#fdf2f2",
  },
  dark: {
    avatarBorder: "rgba(255,255,255,0.08)",
    buttonHoverBg: "rgba(255,255,255,0.05)",
    dropdownBg: "#0f172a",
    dropdownBorder: "rgba(255,255,255,0.08)",
    dropdownShadow: "0 12px 32px rgba(0,0,0,0.4)",
    nameColor: "#e2e8f0",
    emailColor: "rgba(255,255,255,0.60)",
    linkColor: "#e2e8f0",
    linkHoverBg: "rgba(255,255,255,0.05)",
    signOutHoverBg: "rgba(239, 68, 68, 0.1)",
  }
};

export function UserDropdown({ mode = "dark" }: UserDropdownProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const colors = colorModes[mode];
  const isLoggedIn = status === "authenticated" && session;

  const isProjectRoute =
    pathname === "/projects" || pathname.startsWith("/projects/");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isLoggedIn) return null;

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", outline: "none",
          borderRadius: "50%", padding: 4, transition: "background 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.buttonHoverBg}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User Avatar"}
            style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: `2px solid ${colors.avatarBorder}` }}
          />
        ) : (
          <div
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)",
              color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700, textTransform: "uppercase", border: `2px solid ${colors.avatarBorder}`
            }}
          >
            {(session.user?.name || session.user?.email || "U")[0]}
          </div>
        )}
      </button>

      {dropdownOpen && (
        <div
          style={{
            position: "absolute", right: 0, top: "100%", marginTop: 8, width: 220,
            background: colors.dropdownBg, border: `1px solid ${colors.dropdownBorder}`, borderRadius: 12,
            boxShadow: colors.dropdownShadow,
            padding: "8px 0", zIndex: 100, display: "flex", flexDirection: "column",
            animation: "userDropdownFadeIn 0.15s ease-out"
          }}
        >
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.dropdownBorder}`, display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.nameColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {session.user?.name || session.user?.email?.split("@")[0] || "User"}
            </span>
            <span style={{ fontSize: 12, color: colors.emailColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {session.user?.email}
            </span>
          </div>

          {!isProjectRoute && (
            <Link
              href="/projects"
              onClick={() => setDropdownOpen(false)}
              style={{
                padding: "10px 16px",
                fontSize: 14,
                color: colors.linkColor,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = colors.linkHoverBg)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>

              {t.nav.projects}
            </Link>
          )}

          <Link
            href="/settings/subscription"
            onClick={() => setDropdownOpen(false)}
            style={{
              padding: "10px 16px",
              fontSize: 14,
              color: colors.linkColor,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = colors.linkHoverBg)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            {t.panels.billingTitle}
          </Link>

          <button
            onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: "/" }); }}
            style={{
              width: "100%", border: "none", background: "none", cursor: "pointer",
              padding: "10px 16px", fontSize: 14, color: "#ef4444", textAlign: "left",
              display: "flex", alignItems: "center", gap: 8, transition: "background 0.15s",
              fontFamily: "inherit"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.signOutHoverBg}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {t.nav.signOut}
          </button>
        </div>
      )}
      <style>{`
        @keyframes userDropdownFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
