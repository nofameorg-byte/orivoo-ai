import {
  DirectoryCompanyCard,
  MarketplaceSearch,
} from "@/components/marketplace";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { companyTrustBadges } from "@/lib/trust";

type ProfessionalsPageProps = {
  searchParams: Promise<{
    service?: string;
    location?: string;
    category?: string;
    rating?: string;
    verified?: string;
    language?: string;
    page?: string;
  }>;
};

type CategoryRow = {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
};

type CompanyRow = {
  id: string;
  company_name: string;
  location?: string | null;
  service_areas?: string[] | null;
  years_in_business?: number | null;
  rating_average?: number | null;
  rating_count?: number | null;
  is_business_verified?: boolean | null;
  is_identity_verified?: boolean | null;
  is_license_verified?: boolean | null;
  is_insurance_verified?: boolean | null;
  is_revenue_verified?: boolean | null;
  is_vp23_elite?: boolean | null;
  is_featured?: boolean | null;
  featured_rank?: number | null;
  category_id?: string | null;
  categories?: {
    name_en?: string | null;
    name_es?: string | null;
  } | null;
};

function param(value: string | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function safeSearch(value: string) {
  return value.replace(/[%(),]/g, "").trim();
}

function categoryName(category: CategoryRow, locale: string) {
  return locale === "es" ? category.name_es : category.name_en;
}

export default async function ProfessionalsPage({
  searchParams,
}: ProfessionalsPageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();
  const examples = list(dictionary.marketplace.exampleServices);
  const service = param(params.service);
  const location = param(params.location);
  const category = param(params.category);
  const rating = Number(param(params.rating));
  const verified = param(params.verified);
  const language = param(params.language);
  const currentPage = Math.max(Number(param(params.page)) || 1, 1);
  const pageSize = 6;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, slug, name_en, name_es")
    .eq("is_active", true)
    .order("name_en");
  const categories = (categoriesData ?? []) as unknown as CategoryRow[];
  const selectedCategory = categories.find((item) => item.slug === category);
  const badgeLabels = list(dictionary.trustV2.badges);
  const statusLabels = {
    approved: t(dictionary, "trustV2.approvedStatus"),
    pending: t(dictionary, "trustV2.pendingStatus"),
    expired: t(dictionary, "trustV2.expiredStatus"),
    missing: t(dictionary, "trustV2.missingStatus"),
    expires: t(dictionary, "trustV2.expires"),
  };

  let query = supabase
    .from("companies")
    .select("*, categories(name_en, name_es)", { count: "exact" })
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("featured_rank", { ascending: false })
    .order("rating_average", { ascending: false })
    .range(from, to);

  if (service) {
    const term = safeSearch(service);
    query = query.or(`company_name.ilike.%${term}%,description.ilike.%${term}%`);
  }

  if (location) {
    query = query.contains("service_areas", [location]);
  }

  if (selectedCategory) {
    query = query.eq("category_id", selectedCategory.id);
  }

  if (rating) {
    query = query.gte("rating_average", rating);
  }

  if (verified === "true") {
    query = query.or(
      "is_business_verified.eq.true,is_license_verified.eq.true,is_insurance_verified.eq.true",
    );
  }

  if (language === "en" || language === "es") {
    query = query.contains("languages", [language]);
  }

  const { data: companiesData, count } = await query;
  const companies = (companiesData ?? []) as unknown as CompanyRow[];
  const totalPages = Math.max(Math.ceil((count ?? 0) / pageSize), 1);
  const makePageHref = (page: number) => {
    const nextParams = new URLSearchParams();
    for (const [key, value] of Object.entries({
      service,
      location,
      category,
      rating: rating ? String(rating) : "",
      verified,
      language,
      page: String(page),
    })) {
      if (value) {
        nextParams.set(key, value);
      }
    }

    return `/professionals?${nextParams.toString()}`;
  };

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
          defaultService={service}
          defaultLocation={location}
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
          <form action="/professionals" className="mt-5 grid gap-3">
            <input type="hidden" name="service" value={service} />
            <input type="hidden" name="location" value={location} />
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                {t(dictionary, "marketplace.filterCategory")}
              </span>
              <select
                name="category"
                defaultValue={category}
                className="mt-2 w-full rounded-2xl border border-border bg-panel-soft p-3 text-sm font-semibold text-foreground"
              >
                <option value="">{t(dictionary, "common.viewAll")}</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {categoryName(item, locale)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                {t(dictionary, "marketplace.filterRating")}
              </span>
              <select
                name="rating"
                defaultValue={rating ? String(rating) : ""}
                className="mt-2 w-full rounded-2xl border border-border bg-panel-soft p-3 text-sm font-semibold text-foreground"
              >
                <option value="">{t(dictionary, "common.viewAll")}</option>
                <option value="4">4+</option>
                <option value="4.5">4.5+</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                {t(dictionary, "marketplace.filterVerified")}
              </span>
              <select
                name="verified"
                defaultValue={verified}
                className="mt-2 w-full rounded-2xl border border-border bg-panel-soft p-3 text-sm font-semibold text-foreground"
              >
                <option value="">{t(dictionary, "common.viewAll")}</option>
                <option value="true">{t(dictionary, "common.verified")}</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                {t(dictionary, "marketplace.filterLanguage")}
              </span>
              <select
                name="language"
                defaultValue={language}
                className="mt-2 w-full rounded-2xl border border-border bg-panel-soft p-3 text-sm font-semibold text-foreground"
              >
                <option value="">{t(dictionary, "common.viewAll")}</option>
                <option value="en">{t(dictionary, "common.english")}</option>
                <option value="es">{t(dictionary, "common.spanish")}</option>
              </select>
            </label>
            <button
              type="submit"
              className="rounded-full bg-foreground px-4 py-3 text-sm font-black text-background"
            >
              {t(dictionary, "common.search")}
            </button>
          </form>
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
              {currentPage} / {totalPages}
            </div>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            {companies.map((company) => (
              <DirectoryCompanyCard
                key={company.id}
                company={{
                  id: company.id,
                  name: company.company_name,
                  category:
                    locale === "es"
                      ? company.categories?.name_es ?? ""
                      : company.categories?.name_en ?? "",
                  location: company.service_areas?.[0] ?? "",
                  rating: String(company.rating_average ?? 0),
                  reviewCount: String(company.rating_count ?? 0),
                  years: String(company.years_in_business ?? 0),
                  featured: Boolean(company.is_featured),
                  badges: companyTrustBadges(badgeLabels, company),
                }}
                labels={{
                  featured: t(dictionary, "marketplace.featured"),
                  reviews: t(dictionary, "marketplace.reviewCountLabel"),
                  years: t(dictionary, "marketplace.yearsLabel"),
                  viewProfile: t(dictionary, "marketplace.viewProfile"),
                  requestQuote: t(dictionary, "marketplace.requestQuote"),
                  noVerifiedBadges: t(dictionary, "marketplace.noVerifiedBadges"),
                }}
                statusLabels={statusLabels}
                profileHref={`/professionals/profile?id=${company.id}`}
              />
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-3">
            <a
              href={makePageHref(Math.max(currentPage - 1, 1))}
              className="rounded-full border border-border px-4 py-2 text-sm font-bold text-muted"
            >
              {t(dictionary, "marketplace.previousPage")}
            </a>
            <a
              href={makePageHref(Math.min(currentPage + 1, totalPages))}
              className="rounded-full border border-border px-4 py-2 text-sm font-bold text-muted"
            >
              {t(dictionary, "marketplace.nextPage")}
            </a>
          </div>
        </div>
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
