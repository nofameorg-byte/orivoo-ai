"use client";

import { updateLanguage } from "@/app/actions/preferences";
import { locales, type Locale } from "@/lib/i18n/config";

type LanguageSelectorProps = {
  currentLocale: Locale;
  redirectTo: string;
  label: string;
  names: Record<Locale, string>;
};

export function LanguageSelector({
  currentLocale,
  redirectTo,
  label,
  names,
}: LanguageSelectorProps) {
  return (
    <form action={updateLanguage} className="inline-flex items-center gap-2">
      <label htmlFor="vp23-language" className="sr-only">
        {label}
      </label>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <select
        id="vp23-language"
        name="locale"
        defaultValue={currentLocale}
        aria-label={label}
        className="vp23-secondary-action rounded-full px-3 py-2 text-xs font-medium outline-none transition focus:border-gold/70"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {names[locale]}
          </option>
        ))}
      </select>
    </form>
  );
}
