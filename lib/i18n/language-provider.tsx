"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { getLanguageDirection, type Locale } from "@/lib/i18n/config";
import { loadDictionary } from "@/lib/i18n/dictionaries";

type LanguageContextValue = {
  dir: "ltr" | "rtl";
  locale: Locale;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  const value = useMemo(() => {
    const dictionary = loadDictionary(locale);

    return {
      dir: getLanguageDirection(locale),
      locale,
      t(key: string) {
        return dictionary[key] ?? key;
      },
    };
  }, [locale]);

  return (
    <LanguageContext.Provider value={value}>
      <div dir={value.dir}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useI18n must be used within LanguageProvider.");
  }

  return context;
}
