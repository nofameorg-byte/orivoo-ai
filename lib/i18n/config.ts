export const supportedLanguages = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "de", label: "Deutsch", dir: "ltr" },
  { code: "pt", label: "Português", dir: "ltr" },
  { code: "it", label: "Italiano", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "hi", label: "हिन्दी", dir: "ltr" },
  { code: "zh", label: "中文", dir: "ltr" },
  { code: "ja", label: "日本語", dir: "ltr" },
] as const;

export type Locale = (typeof supportedLanguages)[number]["code"];
export type TranslationDictionary = Record<string, string>;

export const defaultLocale: Locale = "en";

export function isLocale(value: string | null | undefined): value is Locale {
  return supportedLanguages.some((language) => language.code === value);
}

export function getLanguageDirection(locale: Locale) {
  return supportedLanguages.find((language) => language.code === locale)?.dir ?? "ltr";
}
