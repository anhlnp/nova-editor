"use client";

import React, { useState } from "react";
import { useI18n, Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale, autoDetectByIp, setAutoDetectByIp, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-expanded={isOpen}
      >
        <span>{locale === "vi" ? "🇻🇳 VI" : "🇺🇸 EN"}</span>
        <svg
          className="w-3.5 h-3.5 text-slate-400"
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
        <div className="absolute right-0 z-50 mt-1.5 w-64 origin-top-right rounded-lg bg-white p-2 shadow-lg ring-1 ring-black/5 focus:outline-none">
          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {t.settings.languageTitle}
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleSelectLocale("vi")}
              className={`w-full flex items-center justify-between rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                locale === "vi"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>🇻🇳 {t.settings.vietnameseLabel}</span>
              {locale === "vi" && (
                <span className="text-indigo-600 font-bold">✓</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSelectLocale("en")}
              className={`w-full flex items-center justify-between rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                locale === "en"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>🇺🇸 {t.settings.englishLabel}</span>
              {locale === "en" && (
                <span className="text-indigo-600 font-bold">✓</span>
              )}
            </button>
          </div>

          <div className="mt-2 border-t border-slate-100 pt-2">
            <label className="flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-600 cursor-pointer hover:bg-slate-50 rounded-md">
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
