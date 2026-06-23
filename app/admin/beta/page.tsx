import { redirect } from "next/navigation";
import { Building2, Eye, ShieldCheck, Star } from "lucide-react";
import {
  decideBusinessClaim,
  updateFeaturedPlacement,
} from "@/app/actions/beta";
import { PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary, getLocale, t } from "@/lib/i18n/server";
import { profileCompletionScore } from "@/lib/profile-completion";
import { createClient } from "@/lib/supabase/server";
import { signedStorageUrl } from "@/lib/storage";

type CompanyRow = {
  id: string;
  company_name: string;
  logo_url?: string | null;
  cover_image_url?: string | null;
  photos?: string[] | null;
  videos?: string[] | null;
  is_business_verified?: boolean | null;
  is_license_verified?: boolean | null;
  is_insurance_verified?: boolean | null;
  is_identity_verified?: boolean | null;
  is_revenue_verified?: boolean | null;
  is_vp23_elite?: boolean | null;
  is_featured?: boolean | null;
  featured_rank?: number | null;
  featured_until?: string | null;
};

type ClaimRow = {
  id: string;
  claimant_name: string;
  claimant_email: string;
  status: string;
  documents?: {
    storage_path?: string | null;
  } | null;
  companies?: {
    company_name?: string | null;
  } | null;
};

type ViewedCompany = {
  company_id: string;
  count: number;
};

export default async function AdminBetaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?messageKey=auth.messageDashboardRequired");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_language, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const locale = await getLocale(
    isLocale(profile?.preferred_language) ? profile?.preferred_language : null,
  );
  const dictionary = await getDictionary(locale);
  const { data: companiesData, count: totalCompanies } = await supabase
    .from("companies")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("company_name");
  const companies = (companiesData ?? []) as unknown as CompanyRow[];
  const verifiedCompanies = companies.filter(
    (company) =>
      company.is_business_verified ||
      company.is_license_verified ||
      company.is_insurance_verified,
  ).length;
  const { count: pendingVerifications } = await supabase
    .from("verification_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  const { count: pendingReviews } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("is_flagged", true)
    .eq("is_removed", false);
  const { count: newProfessionals } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "professional");
  const { count: newCustomers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "customer");
  const { count: quoteRequests } = await supabase
    .from("quote_requests")
    .select("id", { count: "exact", head: true });
  const { count: jobsCreated } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true });
  const { count: jobsCompleted } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("status", "completed");
  const { count: reviewsSubmitted } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true });
  const { count: verificationApprovals } = await supabase
    .from("verification_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved");
  const { data: claimsData } = await supabase
    .from("company_claims")
    .select("id, claimant_name, claimant_email, status, documents(storage_path), companies(company_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  const claims = (claimsData ?? []) as unknown as ClaimRow[];
  const claimLinks = await Promise.all(
    claims.map(async (claim) => ({
      ...claim,
      href: await signedStorageUrl(claim.documents?.storage_path),
    })),
  );
  const { data: viewsData } = await supabase
    .from("company_views")
    .select("company_id")
    .limit(500);
  const viewCounts = new Map<string, number>();
  for (const view of (viewsData ?? []) as unknown as Array<{ company_id: string }>) {
    viewCounts.set(view.company_id, (viewCounts.get(view.company_id) ?? 0) + 1);
  }
  const mostViewed: ViewedCompany[] = [...viewCounts.entries()]
    .map(([company_id, count]) => ({ company_id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const completionScores = companies.map((company) =>
    profileCompletionScore({
      company,
      licenseCount: company.is_license_verified ? 1 : 0,
      insuranceCount: company.is_insurance_verified ? 1 : 0,
      reviewCount: 0,
    }).score,
  );
  const averageCompletion = completionScores.length
    ? Math.round(
        completionScores.reduce((total, score) => total + score, 0) /
          completionScores.length,
      )
    : 0;
  const cards = [
    { label: t(dictionary, "beta.totalCompanies"), value: totalCompanies ?? 0 },
    { label: t(dictionary, "beta.verifiedCompanies"), value: verifiedCompanies },
    { label: t(dictionary, "beta.pendingVerifications"), value: pendingVerifications ?? 0 },
    { label: t(dictionary, "beta.pendingReviews"), value: pendingReviews ?? 0 },
    { label: t(dictionary, "beta.profileCompletionStats"), value: `${averageCompletion}%` },
    { label: t(dictionary, "beta.newProfessionals"), value: newProfessionals ?? 0 },
    { label: t(dictionary, "beta.newCustomers"), value: newCustomers ?? 0 },
    { label: t(dictionary, "beta.quoteRequests"), value: quoteRequests ?? 0 },
    { label: t(dictionary, "beta.jobsCreated"), value: jobsCreated ?? 0 },
    { label: t(dictionary, "beta.jobsCompleted"), value: jobsCompleted ?? 0 },
    { label: t(dictionary, "beta.reviewsSubmitted"), value: reviewsSubmitted ?? 0 },
    { label: t(dictionary, "beta.verificationApprovals"), value: verificationApprovals ?? 0 },
  ];

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader dictionary={dictionary} locale={locale} currentPath="/admin/beta" />
      <PageHero
        badge={t(dictionary, "beta.betaDashboard")}
        title={t(dictionary, "beta.betaDashboard")}
        body={t(dictionary, "beta.featuredBody")}
      />
      <section className="section-shell space-y-6 pb-16">
        <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-6">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-3xl border border-border bg-panel p-5"
            >
              <p className="text-3xl font-black text-foreground">{card.value}</p>
              <p className="mt-2 text-sm text-muted">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-border bg-panel p-6">
            <h2 className="flex items-center gap-3 text-2xl font-black text-foreground">
              <ShieldCheck className="size-6 text-gold" aria-hidden />
              {t(dictionary, "beta.claimQueue")}
            </h2>
            <div className="mt-5 grid gap-3">
              {claimLinks.map((claim) => (
                <div
                  key={claim.id}
                  className="rounded-2xl border border-border bg-panel-soft p-4"
                >
                  <h3 className="font-bold text-foreground">
                    {claim.companies?.company_name}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {claim.claimant_name} - {claim.claimant_email}
                  </p>
                  {claim.href ? (
                    <a
                      href={claim.href}
                      className="mt-2 inline-flex text-sm font-bold text-gold"
                    >
                      {t(dictionary, "beta.ownershipDocument")}
                    </a>
                  ) : null}
                  <form action={decideBusinessClaim} className="mt-4 grid gap-2 sm:grid-cols-2">
                    <input type="hidden" name="claimId" value={claim.id} />
                    <button
                      type="submit"
                      name="decision"
                      value="approved"
                      className="vp23-secondary-action rounded-full px-3 py-2 text-sm font-bold"
                    >
                      {t(dictionary, "beta.approveClaim")}
                    </button>
                    <button
                      type="submit"
                      name="decision"
                      value="rejected"
                      className="vp23-secondary-action rounded-full px-3 py-2 text-sm font-bold"
                    >
                      {t(dictionary, "beta.rejectClaim")}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-border bg-panel p-6">
            <h2 className="flex items-center gap-3 text-2xl font-black text-foreground">
              <Eye className="size-6 text-gold" aria-hidden />
              {t(dictionary, "beta.mostViewedCompanies")}
            </h2>
            <div className="mt-5 grid gap-3">
              {mostViewed.map((view) => {
                const company = companies.find((item) => item.id === view.company_id);
                return (
                  <div
                    key={view.company_id}
                    className="rounded-2xl border border-border bg-panel-soft p-4 text-sm text-muted"
                  >
                    <p className="font-bold text-foreground">
                      {company?.company_name ?? view.company_id}
                    </p>
                    <p className="mt-1">{view.count}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="rounded-[2rem] border border-border bg-panel p-6">
          <h2 className="flex items-center gap-3 text-2xl font-black text-foreground">
            <Star className="size-6 text-gold" aria-hidden />
            {t(dictionary, "beta.featuredTitle")}
          </h2>
          <div className="mt-5 grid gap-3">
            {companies.map((company) => (
              <form
                key={company.id}
                action={updateFeaturedPlacement}
                className="grid gap-3 rounded-2xl border border-border bg-panel-soft p-4 md:grid-cols-[1fr_auto_auto_auto_auto]"
              >
                <input type="hidden" name="companyId" value={company.id} />
                <div className="flex items-center gap-3">
                  <Building2 className="size-5 text-gold" aria-hidden />
                  <span className="font-bold text-foreground">{company.company_name}</span>
                </div>
                <select
                  name="isFeatured"
                  defaultValue={company.is_featured ? "true" : "false"}
                  className="rounded-2xl border border-border bg-background p-2 text-sm text-foreground"
                >
                  <option value="false">{t(dictionary, "common.pending")}</option>
                  <option value="true">{t(dictionary, "beta.featuredBadge")}</option>
                </select>
                <input
                  name="featuredRank"
                  type="number"
                  defaultValue={company.featured_rank ?? 0}
                  aria-label={t(dictionary, "beta.featuredRank")}
                  className="rounded-2xl border border-border bg-background p-2 text-sm text-foreground"
                />
                <input
                  name="featuredUntil"
                  type="datetime-local"
                  aria-label={t(dictionary, "beta.featuredUntil")}
                  className="rounded-2xl border border-border bg-background p-2 text-sm text-foreground"
                />
                <button
                  type="submit"
                  className="vp23-primary-action rounded-full px-3 py-2 text-sm font-black"
                >
                  {t(dictionary, "beta.updateFeatured")}
                </button>
              </form>
            ))}
          </div>
        </section>
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
