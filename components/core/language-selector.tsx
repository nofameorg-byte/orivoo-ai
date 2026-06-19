"use client";

import { Languages } from "lucide-react";
import { updateLanguage } from "@/app/actions/settings";
import { supportedLanguages, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/language-provider";

export function LanguageSelector({ locale }: { locale: Locale }) {
  const { t } = useI18n();

  return (
    <form action={updateLanguage} className="flex items-center gap-2">
      <Languages className="size-4 text-gold" aria-hidden />
      <label className="sr-only" htmlFor="dashboard-language">
        {t("language.label")}
      </label>
      <select
        id="dashboard-language"
        name="language"
        defaultValue={locale}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="w-full rounded-full border border-white/10 bg-black/45 px-3 py-2 text-xs text-white outline-none transition focus:border-gold/50"
      >
        {supportedLanguages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </form>
  );
}
