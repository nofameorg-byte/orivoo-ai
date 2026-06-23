import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck } from "lucide-react";
import { signUp } from "@/app/actions/auth";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { locales } from "@/lib/i18n/config";
import { getDictionary, getLocale, t } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return {
    title: t(dictionary, "auth.signupTitle"),
  };
}

type AuthPageProps = {
  searchParams: Promise<{
    message?: string;
    messageKey?: string;
  }>;
};

export default async function SignupPage({ searchParams }: AuthPageProps) {
  const { message, messageKey } = await searchParams;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const alertMessage = messageKey ? t(dictionary, messageKey) : message;
  const roleOptions = [
    { value: "customer", label: t(dictionary, "common.customer") },
    { value: "professional", label: t(dictionary, "common.professional") },
  ];

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-panel shadow-2xl shadow-black/30 md:grid-cols-[0.95fr_1fr]">
        <section className="p-8 sm:p-10">
          <div className="mb-8 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="gold-gradient flex size-10 items-center justify-center rounded-2xl text-black">
                <Building2 className="size-5" aria-hidden />
              </div>
              <span className="font-black tracking-[0.22em] text-foreground">
                {t(dictionary, "brand.name")}
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle
                label={t(dictionary, "common.theme")}
                lightLabel={t(dictionary, "common.light")}
                darkLabel={t(dictionary, "common.dark")}
              />
              <LanguageSelector
                currentLocale={locale}
                redirectTo="/signup"
                label={t(dictionary, "common.language")}
                names={{
                  en: t(dictionary, "common.english"),
                  es: t(dictionary, "common.spanish"),
                }}
              />
            </div>
          </div>

          <h1 className="text-3xl font-black text-foreground">
            {t(dictionary, "auth.signupTitle")}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {t(dictionary, "auth.signupBody")}
          </p>

          {alertMessage ? (
            <div className="mt-6 rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
              {alertMessage}
            </div>
          ) : null}

          <form action={signUp} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                {t(dictionary, "common.displayName")}
              </span>
              <input
                name="displayName"
                type="text"
                autoComplete="name"
                placeholder={t(dictionary, "auth.displayNamePlaceholder")}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted/60 focus:border-gold/60"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                {t(dictionary, "common.email")}
              </span>
              <input
                required
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t(dictionary, "auth.emailPlaceholder")}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted/60 focus:border-gold/60"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                {t(dictionary, "common.password")}
              </span>
              <input
                required
                minLength={8}
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder={t(dictionary, "auth.passwordPlaceholder")}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted/60 focus:border-gold/60"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                {t(dictionary, "common.role")}
              </span>
              <select
                name="role"
                defaultValue="customer"
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-gold/60"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                {t(dictionary, "common.language")}
              </span>
              <select
                name="preferredLanguage"
                defaultValue={locale}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-gold/60"
              >
                {locales.map((optionLocale) => (
                  <option key={optionLocale} value={optionLocale}>
                    {optionLocale === "en"
                      ? t(dictionary, "common.english")
                      : t(dictionary, "common.spanish")}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 font-bold text-background transition hover:bg-gold-bright"
            >
              {t(dictionary, "auth.signupSubmit")}
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {t(dictionary, "auth.signupHelp")}{" "}
            <Link href="/login" className="font-bold text-gold-bright">
              {t(dictionary, "auth.loginLink")}
            </Link>
          </p>
        </section>

        <section className="hidden bg-panel-soft p-10 md:block">
          <div className="surface-card mt-12 rounded-[2rem] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-gold">
              {t(dictionary, "auth.signupEyebrow")}
            </p>
            <h2 className="mt-4 text-4xl font-black text-foreground">
              {t(dictionary, "auth.signupHeadline")}
            </h2>
            <p className="mt-5 leading-7 text-muted">
              {t(dictionary, "auth.signupBody")}
            </p>
            <div className="mt-8 grid gap-3">
              {roleOptions.map((role) => (
                <div
                  key={role.value}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-panel p-4 text-foreground"
                >
                  <ShieldCheck className="size-5 text-gold" aria-hidden />
                  {role.label}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
