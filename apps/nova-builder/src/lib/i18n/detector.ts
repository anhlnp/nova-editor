import { ILanguageDetector, Locale } from "./types";

const LOCALE_STORAGE_KEY = "nova_locale";
const AUTO_DETECT_STORAGE_KEY = "nova_auto_detect_ip";

export class LanguageDetector implements ILanguageDetector {
  public detectLocaleFromCountry(countryCode?: string | null): Locale {
    if (!countryCode) return "en";
    const normalized = countryCode.trim().toUpperCase();
    if (normalized === "VN" || normalized === "VNM") {
      return "vi";
    }
    return "en";
  }

  public getStoredLocale(): Locale | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored === "en" || stored === "vi") return stored;
    } catch {
      // Ignore localStorage access errors
    }
    // Fall back to the cookie so the client content matches the server-rendered
    // <html lang> (ADR-NB-016), which is cookie-driven. storePreferences writes
    // both, so they normally agree; this keeps them consistent when only the
    // cookie is present (e.g. a fresh session from a returning visitor).
    const fromCookie = this.readLocaleCookie();
    if (fromCookie) return fromCookie;
    return null;
  }

  private readLocaleCookie(): Locale | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|;\s*)nova_locale=(en|vi)/);
    return match ? (match[1] as Locale) : null;
  }

  public getStoredAutoDetectPref(): boolean {
    if (typeof window === "undefined") return true;
    try {
      const stored = localStorage.getItem(AUTO_DETECT_STORAGE_KEY);
      if (stored === "false") return false;
    } catch {
      // Ignore localStorage access errors
    }
    return true; // Default enabled for guest and user until overridden
  }

  public storePreferences(locale: Locale, autoDetect: boolean): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      localStorage.setItem(AUTO_DETECT_STORAGE_KEY, String(autoDetect));
      document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `${AUTO_DETECT_STORAGE_KEY}=${autoDetect}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore storage errors
    }
  }
}

export const languageDetector = new LanguageDetector();
