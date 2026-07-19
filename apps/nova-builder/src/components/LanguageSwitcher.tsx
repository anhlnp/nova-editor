"use client";

import React, { useState } from "react";
import { useI18n, Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  theme?: "light" | "dark";
}

export function LanguageSwitcher({ theme = "light" }: LanguageSwitcherProps) {
  const { locale, setLocale, autoDetectByIp, setAutoDetectByIp, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const isDark = theme === "dark";

  const handleSelectLocale = (targetLocale: Locale) => {
    setLocale(targetLocale);
    setAutoDetectByIp(false); // Manual selection overrides auto-detect
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md focus:outline-none ${
          isDark
            ? "text-[#fafafa] bg-white/10 border border-white/15 hover:bg-white/20"
            : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500"
        }`}
        aria-expanded={isOpen}
      >
        <span>{locale === "vi" ? "🇻🇳 VI" : "🇺🇸 EN"}</span>
        <svg
          className={`w-3.5 h-3.5 ${isDark ? "text-slate-400" : "text-slate-400"}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute right-0 z-50 mt-1.5 w-64 origin-top-right rounded-lg p-2 shadow-lg ring-1 focus:outline-none ${
          isDark
            ? "bg-[#2e2e2e] border border-white/10 ring-white/10"
            : "bg-white ring-black/5"
        }`}>
          <div className={`px-2 py-1.5 text-xs font-semibold uppercase tracking-wider ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}>
            {t.settings.languageTitle}
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleSelectLocale("vi")}
              className={`w-full flex items-center justify-between rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                locale === "vi"
                  ? (isDark ? "bg-white/10 text-white" : "bg-indigo-50 text-indigo-600")
                  : (isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-700 hover:bg-slate-50")
              }`}
            >
              <span>🇻🇳 {t.settings.vietnameseLabel}</span>
              {locale === "vi" && (
                <span className={isDark ? "text-white font-bold" : "text-indigo-600 font-bold"}>✓</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSelectLocale("en")}
              className={`w-full flex items-center justify-between rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                locale === "en"
                  ? (isDark ? "bg-white/10 text-white" : "bg-indigo-50 text-indigo-600")
                  : (isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-700 hover:bg-slate-50")
              }`}
            >
              <span>🇺🇸 {t.settings.englishLabel}</span>
              {locale === "en" && (
                <span className={isDark ? "text-white font-bold" : "text-indigo-600 font-bold"}>✓</span>
              )}
            </button>
          </div>

          <div className={`mt-2 border-t pt-2 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <label className={`flex items-center justify-between px-2.5 py-1.5 text-xs cursor-pointer rounded-md ${
              isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-50"
            }`}>
              <span>{t.settings.autoDetectIpLabel}</span>
              <input
                type="checkbox"
                checked={autoDetectByIp}
                onChange={(e) => setAutoDetectByIp(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
