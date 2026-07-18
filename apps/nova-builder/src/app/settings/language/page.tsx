"use client";

import React from "react";
import Link from "next/link";
import { useI18n, Locale } from "@/lib/i18n";

export default function LanguageSettingsPage() {
  const { locale, setLocale, autoDetectByIp, setAutoDetectByIp, t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href="/projects"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
          >
            {t.settings.backToProjects}
          </Link>
        </div>

        <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-slate-200">
          <div className="px-6 py-5 border-b border-slate-200">
            <h1 className="text-xl font-bold text-slate-900">
              {t.settings.languageTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {t.settings.languageDesc}
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                {t.settings.displayLanguage}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setLocale("en")}
                  className={`flex items-center justify-between p-4 border rounded-xl text-left transition-all ${
                    locale === "en"
                      ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>🇺🇸</span>
                      <span>{t.settings.englishLabel}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {t.settings.englishSublabel}
                    </div>
                  </div>
                  {locale === "en" && (
                    <span className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setLocale("vi")}
                  className={`flex items-center justify-between p-4 border rounded-xl text-left transition-all ${
                    locale === "vi"
                      ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>🇻🇳</span>
                      <span>{t.settings.vietnameseLabel}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {t.settings.vietnameseSublabel}
                    </div>
                  </div>
                  {locale === "vi" && (
                    <span className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <label
                    htmlFor="auto-detect-ip"
                    className="font-semibold text-slate-900 text-sm block"
                  >
                    {t.settings.autoDetectIpLabel}
                  </label>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">
                    {t.settings.autoDetectIpDesc}
                  </p>
                </div>

                <button
                  id="auto-detect-ip"
                  type="button"
                  role="switch"
                  aria-checked={autoDetectByIp}
                  onClick={() => setAutoDetectByIp(!autoDetectByIp)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                    autoDetectByIp ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      autoDetectByIp ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
