"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogoIcon } from "@/components/LogoIcon";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { UserDropdown } from "@/components/UserDropdown";

export function PublicNav() {
  const { t } = useI18n();
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated" && session;

  return (
    <nav
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 64, borderBottom: "1px solid #e2e8f0",
        background: "#ffffff", position: "sticky", top: 0, zIndex: 50,
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
        <LogoIcon width={28} height={28} />
        <span style={{ fontSize: 17, fontWeight: 800, color: "#6d28d9", letterSpacing: "-0.01em" }}>Nova</span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <LanguageSwitcher />
        <Link href="/pricing" style={{ padding: "0 16px", height: 44, display: "flex", alignItems: "center", fontSize: 15, color: "#475569", fontWeight: 500, textDecoration: "none", borderRadius: 8, transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#6d28d9"} onMouseLeave={(e) => e.currentTarget.style.color = "#475569"}>
          {t.nav.pricing}
        </Link>
        <Link href="/builder/demo" style={{ padding: "0 16px", height: 44, display: "flex", alignItems: "center", fontSize: 15, color: "#475569", fontWeight: 500, textDecoration: "none", borderRadius: 8, transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#6d28d9"} onMouseLeave={(e) => e.currentTarget.style.color = "#475569"}>
          {t.landing.tryDemo}
        </Link>

        {isLoggedIn ? (
          <>
            <Link href="/projects" style={{ padding: "0 16px", height: 44, display: "flex", alignItems: "center", fontSize: 15, color: "#475569", fontWeight: 500, textDecoration: "none", borderRadius: 8, transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#6d28d9"} onMouseLeave={(e) => e.currentTarget.style.color = "#475569"}>
              {t.nav.projects}
            </Link>
            
            <UserDropdown mode="light" />
          </>
        ) : (
          <>
            <Link href="/login" style={{ padding: "0 16px", height: 44, display: "flex", alignItems: "center", fontSize: 15, color: "#475569", fontWeight: 500, textDecoration: "none", borderRadius: 8, transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#6d28d9"} onMouseLeave={(e) => e.currentTarget.style.color = "#475569"}>
              {t.nav.login}
            </Link>
            <Link
              href="/signup"
              style={{
                padding: "0 20px", height: 44, display: "flex", alignItems: "center",
                fontSize: 15, fontWeight: 700, color: "#ffffff", textDecoration: "none",
                borderRadius: 8, background: "#6d28d9", transition: "background 0.2s, transform 0.1s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#5b21b6"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#6d28d9"}
            >
              {t.nav.signup}
            </Link>
          </>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
}
