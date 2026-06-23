import {
  DirectoryCompanyCard,
  MarketplaceSearch,
  type VerificationBadge,
} from "@/components/marketplace";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";

export default async function ProfessionalsPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const examples = list(dictionary.marketplace.exampleServices);
  const filters = [
    t(dictionary, "marketplace.filterCategory"),
    t(dictionary, "marketplace.filterLocation"),
    t(dictionary, "marketplace.filterRating"),
    t(dictionary, "marketplace.filterVerified"),
    t(dictionary, "marketplace.filterLanguage"),
    t(dictionary, "marketplace.filterServiceArea"),
  ];
  const statusLabels = {
    approved: t(dictionary, "trustV2.approvedStatus"),
    pending: t(dictionary, "trustV2.pendingStatus"),
    expired: t(dictionary, "trustV2.expiredStatus"),
    missing: t(dictionary, "trustV2.missingStatus"),
    expires: t(dictionary, "trustV2.expires"),
  };
  const badgeLabels = list(dictionary.trustV2.badges);
  const unverifiedBadges: VerificationBadge[] = badgeLabels.map((label) => ({
    label,
    status: "missing",
  }));
  const profiles = list(dictionary.directory.sampleProfiles).map((profile, index) => ({
    name: profile.company,
    category: profile.category,
    location: profile.location,
    rating: profile.rating,
    reviewCount: index === 0 ? "128" : index === 1 ? "84" : "61",
    years: index === 0 ? "12" : index === 1 ? "9" : "7",
    featured: index === 0,
    badges: unverifiedBadges,
  }));

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader
        dictionary={dictionary}
        locale={locale}
        currentPath="/professionals"
      />
      <section className="section-shell py-10">
        <MarketplaceSearch
          question={t(dictionary, "directory.headline")}
          serviceLabel={t(dictionary, "marketplace.serviceLabel")}
          locationLabel={t(dictionary, "marketplace.locationLabel")}
          servicePlaceholder={t(dictionary, "marketplace.servicePlaceholder")}
          locationPlaceholder={t(dictionary, "marketplace.locationPlaceholder")}
          primaryCta={t(dictionary, "marketplace.findProfessionals")}
          secondaryCta={t(dictionary, "marketplace.joinVp23")}
          examplesLabel={t(dictionary, "marketplace.examplesLabel")}
          examples={examples}
        />
      </section>

      <section className="section-shell grid gap-6 pb-16 lg:grid-cols-[18rem_1fr]">
        <aside className="h-fit rounded-[2rem] border border-border bg-panel p-5 lg:sticky lg:top-28">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-foreground">
              {t(dictionary, "common.filters")}
            </h2>
            <span className="rounded-full border border-border bg-panel-soft px-3 py-1 text-xs font-bold text-muted">
              {t(dictionary, "marketplace.sortBestMatch")}
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            {filters.map((filter) => (
              <div
                key={filter}
                className="rounded-2xl border border-border bg-panel-soft p-4 text-sm font-semibold text-muted"
              >
                {filter}
              </div>
            ))}
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">
                {t(dictionary, "marketplace.directoryResults")}
              </p>
              <h1 className="mt-2 text-3xl font-black text-foreground">
                {t(dictionary, "marketplace.showingResults")}
              </h1>
            </div>
            <div className="rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-muted">
              {t(dictionary, "marketplace.paginationLabel")}
            </div>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            {profiles.map((company) => (
              <DirectoryCompanyCard
                key={company.name}
                company={company}
                labels={{
                  featured: t(dictionary, "marketplace.featured"),
                  reviews: t(dictionary, "marketplace.reviewCountLabel"),
                  years: t(dictionary, "marketplace.yearsLabel"),
                  viewProfile: t(dictionary, "marketplace.viewProfile"),
                  requestQuote: t(dictionary, "marketplace.requestQuote"),
                  noVerifiedBadges: t(dictionary, "marketplace.noVerifiedBadges"),
                }}
                statusLabels={statusLabels}
              />
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              className="rounded-full border border-border px-4 py-2 text-sm font-bold text-muted"
            >
              {t(dictionary, "marketplace.previousPage")}
            </button>
            <button
              type="button"
              className="rounded-full border border-border px-4 py-2 text-sm font-bold text-muted"
            >
              {t(dictionary, "marketplace.nextPage")}
            </button>
          </div>
        </div>
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
