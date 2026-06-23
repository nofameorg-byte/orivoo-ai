import Link from "next/link";
import { ArrowRight, Search, ShieldCheck, Star } from "lucide-react";
import {
  MarketplaceSearch,
  TrustBadgeGrid,
  type VerificationBadge,
} from "@/components/marketplace";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";

export default async function LandingPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const examples = list(dictionary.marketplace.exampleServices);
  const categories = list(dictionary.categories);
  const trustStats = list(dictionary.marketplace.trustStats);
  const trustPrograms = list(dictionary.trustV2.badges);
  const trustFoundations = list(dictionary.trustV2.foundations);
  const statusLabels = {
    approved: t(dictionary, "trustV2.approvedStatus"),
    pending: t(dictionary, "trustV2.pendingStatus"),
    expired: t(dictionary, "trustV2.expiredStatus"),
    missing: t(dictionary, "trustV2.missingStatus"),
    expires: t(dictionary, "trustV2.expires"),
  };
  const trustBadges: VerificationBadge[] = trustPrograms.map((label) => ({
    label,
    status: "missing",
  }));

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="grid-mask pointer-events-none absolute inset-x-0 top-0 h-[42rem]" />
      <SiteHeader dictionary={dictionary} locale={locale} currentPath="/" />

      <section className="section-shell relative z-10 grid gap-10 pb-14 pt-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pb-20 lg:pt-16">
        <MarketplaceSearch
          question={t(dictionary, "marketplace.searchQuestion")}
          serviceLabel={t(dictionary, "marketplace.serviceLabel")}
          locationLabel={t(dictionary, "marketplace.locationLabel")}
          servicePlaceholder={t(dictionary, "marketplace.servicePlaceholder")}
          locationPlaceholder={t(dictionary, "marketplace.locationPlaceholder")}
          primaryCta={t(dictionary, "marketplace.findProfessionals")}
          secondaryCta={t(dictionary, "marketplace.joinVp23")}
          examplesLabel={t(dictionary, "marketplace.examplesLabel")}
          examples={examples}
        />

        <aside className="rounded-[2rem] border border-border bg-panel p-6 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="gold-gradient flex size-12 items-center justify-center rounded-2xl text-black">
              <ShieldCheck className="size-6" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">
                {t(dictionary, "marketplace.trustTopline")}
              </p>
              <h2 className="text-2xl font-black text-foreground">
                {t(dictionary, "trustV2.badgeSystemTitle")}
              </h2>
            </div>
          </div>
          <p className="text-sm leading-6 text-muted">
            {t(dictionary, "trustV2.body")}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {trustStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-panel-soft p-4"
              >
                <p className="text-3xl font-black text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="section-shell py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-gold">
              {t(dictionary, "trustV2.title")}
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black text-foreground md:text-5xl">
              {t(dictionary, "marketplace.marketplaceHeadline")}
            </h2>
          </div>
          <p className="max-w-xl text-muted">
            {t(dictionary, "marketplace.marketplaceBody")}
          </p>
        </div>
        <TrustBadgeGrid badges={trustBadges} statusLabels={statusLabels} />
      </section>

      <section className="section-shell grid gap-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-border bg-panel p-6">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-gold">
            {t(dictionary, "directory.categoriesTitle")}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category}
                href="/professionals"
                className="group flex items-center justify-between rounded-2xl border border-border bg-panel-soft p-4 text-sm font-bold text-foreground transition hover:border-gold/50"
              >
                <span className="flex items-center gap-3">
                  <Search className="size-5 text-gold" aria-hidden />
                  {category}
                </span>
                <ArrowRight className="size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-gold" />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-panel p-6">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-gold">
            {t(dictionary, "trustV2.uploadFoundationTitle")}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {trustFoundations.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border bg-panel-soft p-4 text-sm font-semibold text-muted"
              >
                <Star className="mb-3 size-5 text-gold" aria-hidden />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
