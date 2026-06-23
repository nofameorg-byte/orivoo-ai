import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  FileSignature,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";

export default async function LandingPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const valueProps = list(dictionary.landing.valueProps);
  const stats = list(dictionary.landing.stats);
  const sections = list(dictionary.landing.sections);
  const categories = list(dictionary.categories);
  const badges = list(dictionary.verification.badges);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="grid-mask pointer-events-none absolute inset-x-0 top-0 h-[46rem]" />
      <SiteHeader dictionary={dictionary} locale={locale} currentPath="/" />

      <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-28 lg:pt-20">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm font-medium text-gold-bright">
            <ShieldCheck className="size-4" aria-hidden />
            {t(dictionary, "landing.badge")}
          </div>
          <h1 className="max-w-5xl text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {t(dictionary, "landing.headlinePrefix")}{" "}
            <span className="text-gold-gradient">
              {t(dictionary, "landing.headlineHighlight")}
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            {t(dictionary, "landing.body")}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/professionals"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background transition hover:bg-gold-bright"
            >
              {t(dictionary, "landing.primaryCta")}
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-bold text-foreground transition hover:border-gold/50 hover:bg-panel-soft"
            >
              {t(dictionary, "landing.secondaryCta")}
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {valueProps.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border bg-panel p-4 text-sm text-muted"
              >
                <ShieldCheck className="mb-3 size-5 text-gold" aria-hidden />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card relative overflow-hidden rounded-[2rem] p-4">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          <div className="rounded-[1.5rem] border border-border bg-panel/80 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">
                  {t(dictionary, "brand.meaning")}
                </p>
                <h2 className="text-xl font-bold text-foreground">
                  {t(dictionary, "brand.tagline")}
                </h2>
              </div>
              <div className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold-bright">
                {t(dictionary, "common.ready")}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-panel-soft p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-black text-foreground">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-gold/10 p-3 text-sm font-medium text-foreground"
                >
                  <ShieldCheck className="size-5 text-gold" aria-hidden />
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-10 grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-gold">
              {t(dictionary, "landing.directoryEyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-black text-foreground md:text-5xl">
              {t(dictionary, "landing.directoryTitle")}
            </h2>
          </div>
          <p className="text-muted">{t(dictionary, "landing.directoryBody")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category}
              href="/professionals"
              className="group rounded-3xl border border-border bg-panel p-5 transition hover:-translate-y-1 hover:border-gold/50"
            >
              <Search className="mb-5 size-6 text-gold" aria-hidden />
              <h3 className="font-bold text-foreground">{category}</h3>
              <p className="mt-3 text-sm text-muted">
                {t(dictionary, "directory.profileCta")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-6 px-6 py-16 lg:grid-cols-3 lg:px-8">
        {sections.map((item, index) => {
          const Icon = [Users, BriefcaseBusiness, ClipboardCheck][index] ?? Users;

          return (
            <article key={item.title} className="surface-card rounded-3xl p-8">
              <Icon className="mb-8 size-8 text-gold" aria-hidden />
              <h3 className="text-2xl font-black text-foreground">
                {item.title}
              </h3>
              <p className="mt-4 leading-7 text-muted">{item.body}</p>
            </article>
          );
        })}
      </section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-8 lg:px-8">
        <div className="surface-card rounded-[2rem] p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-gold">
                {t(dictionary, "landing.toolsEyebrow")}
              </p>
              <h2 className="mt-4 text-3xl font-black text-foreground md:text-5xl">
                {t(dictionary, "landing.toolsTitle")}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {list(dictionary.tools.modules).slice(0, 4).map((module) => (
                <div
                  key={module.title}
                  className="rounded-2xl border border-border bg-panel-soft p-5"
                >
                  <FileSignature className="mb-4 size-6 text-gold" aria-hidden />
                  <h3 className="font-bold text-foreground">{module.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {module.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 rounded-3xl border border-border bg-panel-soft p-6">
            <div className="mb-4 flex items-center gap-3">
              <CheckCircle2 className="size-6 text-gold" aria-hidden />
              <h3 className="text-xl font-black text-foreground">
                {t(dictionary, "landing.adminEyebrow")}
              </h3>
            </div>
            <p className="text-muted">{t(dictionary, "landing.adminTitle")}</p>
          </div>
        </div>
      </section>

      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
