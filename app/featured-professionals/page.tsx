import { DirectoryCompanyCard } from "@/components/marketplace";
import { PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { companyTrustBadges } from "@/lib/trust";

type CompanyRow = {
  id: string;
  company_name: string;
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
  categories?: {
    name_en?: string | null;
    name_es?: string | null;
  } | null;
};

export default async function FeaturedProfessionalsPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("*, categories(name_en, name_es)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .or(`featured_until.is.null,featured_until.gte.${new Date().toISOString()}`)
    .order("featured_rank", { ascending: false });
  const companies = (data ?? []) as unknown as CompanyRow[];
  const badgeLabels = list(dictionary.trustV2.badges);
  const statusLabels = {
    approved: t(dictionary, "trustV2.approvedStatus"),
    pending: t(dictionary, "trustV2.pendingStatus"),
    expired: t(dictionary, "trustV2.expiredStatus"),
    missing: t(dictionary, "trustV2.missingStatus"),
    expires: t(dictionary, "trustV2.expires"),
  };

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader
        dictionary={dictionary}
        locale={locale}
        currentPath="/featured-professionals"
      />
      <PageHero
        badge={t(dictionary, "beta.featuredBadge")}
        title={t(dictionary, "beta.featuredTitle")}
        body={t(dictionary, "beta.featuredBody")}
      />
      <section className="section-shell grid gap-5 pb-16 xl:grid-cols-3">
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
              featured: true,
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
            quoteHref={`/quotes?companyId=${company.id}`}
          />
        ))}
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
