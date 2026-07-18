"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getDictionary } from "./dictionaries";
import { languageDetector } from "./detector";
import { I18nContextValue, Locale } from "./types";

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [autoDetectByIp, setAutoDetectState] = useState<boolean>(true);
  const [isLoadingIp, setIsLoadingIp] = useState<boolean>(true);

  useEffect(() => {
    const storedAutoDetect = languageDetector.getStoredAutoDetectPref();
    const storedLocale = languageDetector.getStoredLocale();

    setAutoDetectState(storedAutoDetect);

    // An explicit stored choice (cookie or localStorage) always wins over IP
    // auto-detection — the user's manual selection is authoritative (D10).
    if (storedLocale) {
      setLocaleState(storedLocale);
      setIsLoadingIp(false);
      return;
    }

    // No stored choice + auto-detect disabled → stay on the default.
    if (!storedAutoDetect) {
      setIsLoadingIp(false);
      return;
    }

    // No stored choice + auto-detect enabled → recommend by IP country.
    let isMounted = true;
    fetch("/api/i18n/detect")
      .then((res) => res.json())
      .then((data: { country?: string; recommendedLocale?: Locale }) => {
        if (!isMounted) return;
        if (data.recommendedLocale) {
          setLocaleState(data.recommendedLocale);
        } else if (storedLocale) {
          setLocaleState(storedLocale);
        }
      })
      .catch(() => {
        if (isMounted && storedLocale) {
          setLocaleState(storedLocale);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingIp(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    languageDetector.storePreferences(newLocale, autoDetectByIp);
  };

  const handleSetAutoDetectByIp = (enabled: boolean) => {
    setAutoDetectState(enabled);
    languageDetector.storePreferences(locale, enabled);
  };

  const dictionary = getDictionary(locale);

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale: handleSetLocale,
        autoDetectByIp,
        setAutoDetectByIp: handleSetAutoDetectByIp,
        t: dictionary,
        isLoadingIp,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      locale: "en",
      setLocale: () => {},
      autoDetectByIp: true,
      setAutoDetectByIp: () => {},
      t: getDictionary("en"),
      isLoadingIp: false,
    };
  }
  return context;
}
