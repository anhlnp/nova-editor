import { I18nDictionary, Locale } from "./types";
import { enDictionary } from "./locales/en";
import { viDictionary } from "./locales/vi";

export const DICTIONARIES: Record<Locale, I18nDictionary> = {
  en: enDictionary,
  vi: viDictionary,
};

export function getDictionary(locale: Locale): I18nDictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES.en;
}
