"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { LogoIcon } from "@/components/LogoIcon";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { UserDropdown } from "@/components/UserDropdown";

interface PublicNavProps {
  theme?: "light" | "dark";
}

/* ── Origin-style dropdown items ── */
const PRODUCT_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/templates", label: "Templates" },
  { href: "/builder/demo", label: "Live Demo" },
];

export function PublicNav({ theme = "light" }: PublicNavProps) {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = status === "authenticated" && session;
  const isDark = theme === "dark";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!isDark) {
    // Light theme — keep simple original style
    return (
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 64,
        borderBottom: "1px solid #e2e8f0",
        background: "#ffffff",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <LogoIcon width={28} height={28} />
          <span style={{ fontSize: 17, fontWeight: 800, color: "#6d28d9", letterSpacing: "-0.01em" }}>Nova</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LanguageSwitcher theme={theme} />
          {isLoggedIn ? (
            <>
              <Link href="/projects" style={{ padding: "0 16px", height: 44, display: "flex", alignItems: "center", fontSize: 15, color: "#475569", fontWeight: 500, textDecoration: "none", borderRadius: 8 }}>{t.nav.projects}</Link>
              <UserDropdown mode="light" />
            </>
          ) : (
            <>
              <Link href="/login" style={{ padding: "0 16px", height: 44, display: "flex", alignItems: "center", fontSize: 15, color: "#475569", fontWeight: 500, textDecoration: "none" }}>{t.nav.login}</Link>
              <Link href="/signup" style={{ padding: "0 20px", height: 44, display: "flex", alignItems: "center", fontSize: 15, fontWeight: 700, color: "#fff", textDecoration: "none", borderRadius: 8, background: "#6d28d9" }}>{t.nav.signup}</Link>
            </>
          )}
        </div>
      </nav>
    );
  }

  /* ═══════════════ ORIGIN-STYLE DARK NAVBAR ═══════════════ */
  return (
    <>
      <nav className="on-navbar">
        <div className="on-navbar__inner">
          {/* ── Left: Logo ── */}
          <div className="on-navbar__left">
            <Link href="/" className="on-navbar__brand" aria-label="home">
              <LogoIcon width={20} height={22} />
            </Link>
          </div>

          {/* ── Center: Nav links ── */}
          <div className="on-navbar__center">
            <div className="on-nav-menu">
              {/* Products dropdown */}
              <div className="on-nav-dropdown" ref={dropdownRef}>
                <button
                  className="on-nav-link on-nav-dropdown-toggle"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                >
                  <span>{t.nav.features}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 17" fill="none" className="on-nav-dropdown-icon" style={{ transform: dropdownOpen ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                    <path d="M14 8.5C14 8.63261 13.9473 8.75979 13.8536 8.85355C13.7598 8.94732 13.6326 9 13.5 9H8.5V14C8.5 14.1326 8.44732 14.2598 8.35355 14.3536C8.25979 14.4473 8.13261 14.5 8 14.5C7.86739 14.5 7.74021 14.4473 7.64645 14.3536C7.55268 14.2598 7.5 14.1326 7.5 14V9H2.5C2.36739 9 2.24021 8.94732 2.14645 8.85355C2.05268 8.75979 2 8.63261 2 8.5C2 8.36739 2.05268 8.24021 2.14645 8.14645C2.24021 8.05268 2.36739 8 2.5 8H7.5V3C7.5 2.86739 7.55268 2.74021 7.64645 2.64645C7.74021 2.55268 7.86739 2.5 8 2.5C8.13261 2.5 8.25979 2.55268 8.35355 2.64645C8.44732 2.74021 8.5 2.86739 8.5 3V8H13.5C13.6326 8 13.7598 8.05268 13.8536 8.14645C13.9473 8.24021 14 8.36739 14 8.5Z" fill="currentColor" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="on-nav-dropdown-list-wrapper">
                    <div className="on-nav-dropdown-list">
                      {PRODUCT_LINKS.map((link) => (
                        <Link key={link.href} href={link.href} className="on-nav-dropdown-link" onClick={() => setDropdownOpen(false)}>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link href="/pricing" className="on-nav-link">{t.nav.pricing}</Link>
              <Link href="/docs" className="on-nav-link">{t.nav.docs}</Link>

              {isLoggedIn && (
                <Link href="/projects" className="on-nav-link on-nav-link--current">{t.nav.projects}</Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button className="on-menu-button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              <div className={`on-menu-bar on-menu-bar-1 ${mobileOpen ? "active" : ""}`} />
              <div className={`on-menu-bar on-menu-bar-2 ${mobileOpen ? "active" : ""}`} />
              <div className={`on-menu-bar on-menu-bar-3 ${mobileOpen ? "active" : ""}`} />
            </button>
          </div>

          {/* ── Right: Auth buttons ── */}
          <div className="on-navbar__right">
            <LanguageSwitcher theme="dark" />
            {isLoggedIn ? (
              <UserDropdown mode="dark" />
            ) : (
              <>
                <Link href="/login" className="on-nav-link on-nav-link--text">{t.nav.login}</Link>
                <Link href="/signup" className="on-button-nav">
                  <span>{t.nav.signup}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile menu overlay ── */}
      {mobileOpen && (
        <div className="on-mobile-menu">
          {PRODUCT_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="on-mobile-link" onClick={() => setMobileOpen(false)}>{link.label}</Link>
          ))}
          <Link href="/pricing" className="on-mobile-link" onClick={() => setMobileOpen(false)}>{t.nav.pricing}</Link>
          <Link href="/docs" className="on-mobile-link" onClick={() => setMobileOpen(false)}>{t.nav.docs}</Link>
          {isLoggedIn ? (
            <Link href="/projects" className="on-mobile-link" onClick={() => setMobileOpen(false)}>{t.nav.projects}</Link>
          ) : (
            <>
              <Link href="/login" className="on-mobile-link" onClick={() => setMobileOpen(false)}>{t.nav.login}</Link>
              <Link href="/signup" className="on-button-nav" style={{ marginTop: 8, width: "100%", justifyContent: "center" }} onClick={() => setMobileOpen(false)}>
                <span>{t.nav.signup}</span>
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        /* ═══════════════ ORIGIN NAVBAR ═══════════════ */
        .on-navbar {
          z-index: 99;
          position: fixed;
          top: 24px;
          left: 24px;
          right: 24px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          background-color: rgba(15, 16, 17, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
        }

        .on-navbar__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 4px 4px 24px;
        }

        /* ── Left: Brand ── */
        .on-navbar__left {
          flex-shrink: 0;
        }

        .on-navbar__brand {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        /* ── Center: Nav menu ── */
        .on-navbar__center {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-left: 32px;
        }

        .on-nav-menu {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .on-nav-link {
          color: #fff;
          letter-spacing: 0.25px;
          text-transform: uppercase;
          background-color: rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          padding: 8px 12px;
          font-family: var(--font-roboto-mono);
          font-size: 12px;
          font-weight: 400;
          line-height: 1.5em;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.455, 0.03, 0.515, 0.955);
          display: flex;
          align-items: center;
          gap: 4px;
          border: none;
          cursor: pointer;
        }

        .on-nav-link:hover {
          background-color: rgba(255, 255, 255, 0.16);
        }

        .on-nav-link--current {
          pointer-events: none;
          background-color: rgba(255, 255, 255, 0.16);
        }

        .on-nav-link--text {
          background-color: transparent;
        }

        .on-nav-link--text:hover {
          color: #fff;
        }

        /* ── Dropdown ── */
        .on-nav-dropdown {
          position: relative;
        }

        .on-nav-dropdown-toggle {
          position: relative;
        }

        .on-nav-dropdown-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .on-nav-dropdown-list-wrapper {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          z-index: 100;
          animation: on-dropdown-in 0.2s ease-out;
        }

        .on-nav-dropdown-list {
          display: flex;
          flex-direction: column;
          background: rgba(15, 16, 17, 0.95);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 8px;
          min-width: 180px;
        }

        .on-nav-dropdown-link {
          color: rgba(255, 255, 255, 0.6);
          font-family: var(--font-roboto-mono);
          font-size: 12px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.25px;
          text-decoration: none;
          padding: 10px 12px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .on-nav-dropdown-link:hover {
          color: #fff;
          background-color: rgba(255, 255, 255, 0.08);
        }

        /* ── Right: Auth ── */
        .on-navbar__right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        /* ── CTA Button (Get Started) ── */
        .on-button-nav {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #000;
          background-color: #fff;
          border-radius: 8px;
          padding: 12px 18px;
          font-family: var(--font-roboto-mono);
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        .on-button-nav:hover {
          background-color: rgba(255, 255, 255, 0.86);
        }

        /* ── Hamburger ── */
        .on-menu-button {
          display: none;
          flex-direction: column;
          gap: 5px;
          padding: 8px;
          cursor: pointer;
          background: none;
          border: none;
        }

        .on-menu-bar {
          width: 20px;
          height: 2px;
          background: #fff;
          border-radius: 1px;
          transition: transform 0.3s, opacity 0.3s;
          transform-origin: left center;
        }

        .on-menu-bar-1.active { transform: translate(3px, -1px) rotate(45deg); }
        .on-menu-bar-2.active { opacity: 0; }
        .on-menu-bar-3.active { transform: translate(3px, 1px) rotate(-45deg); }

        /* ── Mobile menu ── */
        .on-mobile-menu {
          display: none;
          position: fixed;
          top: 80px;
          left: 24px;
          right: 24px;
          z-index: 98;
          background: rgba(15, 16, 17, 0.95);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 16px;
          flex-direction: column;
          gap: 4px;
          animation: on-dropdown-in 0.25s ease-out;
        }

        .on-mobile-link {
          color: rgba(255, 255, 255, 0.7);
          font-family: var(--font-roboto-mono);
          font-size: 13px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.25px;
          text-decoration: none;
          padding: 12px 16px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .on-mobile-link:hover {
          color: #fff;
          background-color: rgba(255, 255, 255, 0.08);
        }

        /* ── Animations ── */
        @keyframes on-dropdown-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Responsive ── */
        @media screen and (max-width: 991px) {
          .on-nav-menu { display: none; }
          .on-menu-button { display: flex; }
          .on-mobile-menu { display: flex; }
          .on-navbar__center { justify-content: flex-end; }
          .on-navbar__right .on-nav-link--text { display: none; }
        }

        @media screen and (max-width: 479px) {
          .on-navbar {
            top: 12px;
            left: 12px;
            right: 12px;
          }
          .on-navbar__inner {
            padding: 4px 4px 4px 16px;
          }
          .on-mobile-menu {
            left: 12px;
            right: 12px;
            top: 70px;
          }
        }
      `}</style>
    </>
  );
}
