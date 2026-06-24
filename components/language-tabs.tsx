"use client";

import { useState } from "react";

type LanguageTabsProps = {
  compact?: boolean;
};

export function LanguageTabs({ compact = false }: LanguageTabsProps) {
  const [language, setLanguage] = useState<"en" | "es">("en");

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/45 p-1 ${
        compact ? "text-[0.68rem]" : "text-xs"
      }`}
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-full px-3 py-1 font-semibold transition ${
          language === "en"
            ? "border border-gold/40 bg-gold/10 text-gold-bright"
            : "text-muted hover:text-white"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage("es")}
        className={`rounded-full px-3 py-1 font-semibold transition ${
          language === "es"
            ? "border border-gold/40 bg-gold/10 text-gold-bright"
            : "text-muted hover:text-white"
        }`}
      >
        Espanol
      </button>
    </div>
  );
}
