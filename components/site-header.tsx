import Link from "next/link";
import { Building2, ShieldCheck } from "lucide-react";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { t } from "@/lib/i18n/server";

type SiteHeaderProps = {
  dictionary: Dictionary;
  locale: Locale;
  currentPath: string;
};

const navItems = [
  { href: "/professionals", labelKey: "nav.directory" },
  { href: "/business-tools", labelKey: "nav.businessTools" },
  { href: "/partners", labelKey: "nav.partners" },
  { href: "/equipment", labelKey: "nav.equipment" },
  { href: "/ai", labelKey: "nav.ai" },
];

export function SiteHeader({ dictionary, locale, currentPath }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="gold-gradient flex size-10 shrink-0 items-center justify-center rounded-2xl text-black shadow-lg shadow-gold/20">
            <Building2 className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-black tracking-[0.22em] text-foreground">
              {t(dictionary, "brand.name")}
            </p>
            <p className="hidden truncate text-xs text-muted sm:block">
              {t(dictionary, "brand.tagline")}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-foreground"
            >
              {t(dictionary, item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle
            label={t(dictionary, "common.theme")}
            lightLabel={t(dictionary, "common.light")}
            darkLabel={t(dictionary, "common.dark")}
          />
          <LanguageSelector
            currentLocale={locale}
            redirectTo={currentPath}
            label={t(dictionary, "common.language")}
            names={{
              en: t(dictionary, "common.english"),
              es: t(dictionary, "common.spanish"),
            }}
          />
          <Link
            href="/login"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground sm:inline-flex"
          >
            {t(dictionary, "nav.login")}
          </Link>
          <Link
            href="/signup"
            className="hidden items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background transition hover:bg-gold-bright sm:inline-flex"
          >
            <ShieldCheck className="size-4" aria-hidden />
            {t(dictionary, "nav.signup")}
          </Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full border border-border bg-panel-soft px-3 py-2 text-xs text-muted"
          >
            {t(dictionary, item.labelKey)}
          </Link>
        ))}
      </div>
    </header>
  );
}
