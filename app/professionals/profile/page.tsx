import Link from "next/link";
import {
  Building2,
  FileText,
  Image as ImageIcon,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Star,
} from "lucide-react";
import {
  createReview,
  editReview,
  flagReview,
  markReviewHelpful,
  respondToReview,
  saveCompanyProfile,
  submitInsuranceVerification,
  submitLicenseVerification,
} from "@/app/actions/trust";
import { TrustBadgeGrid, type VerificationBadge } from "@/components/marketplace";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";
import { profileCompletionScore } from "@/lib/profile-completion";
import { createClient } from "@/lib/supabase/server";
import { signedStorageUrl } from "@/lib/storage";
import { companyTrustBadges } from "@/lib/trust";

type ProfilePageProps = {
  searchParams: Promise<{
    id?: string;
    message?: string;
  }>;
};

type CategoryRow = {
  id: string;
  name_en: string;
  name_es: string;
};

type CompanyRow = {
  id: string;
  owner_id: string;
  category_id?: string | null;
  company_name: string;
  owner_name?: string | null;
  description?: string | null;
  service_areas?: string[] | null;
  years_in_business?: number | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  social_media?: Record<string, string> | null;
  languages?: string[] | null;
  rating_average?: number | null;
  rating_count?: number | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  is_identity_verified?: boolean | null;
  is_business_verified?: boolean | null;
  is_license_verified?: boolean | null;
  is_insurance_verified?: boolean | null;
  is_revenue_verified?: boolean | null;
  is_vp23_elite?: boolean | null;
  categories?: {
    name_en?: string | null;
    name_es?: string | null;
  } | null;
};

type LicenseRow = {
  id: string;
  license_number?: string | null;
  license_type?: string | null;
  expires_at?: string | null;
  verification_status?: string | null;
  documents?: {
    storage_path?: string | null;
  } | null;
};

type InsuranceRow = {
  id: string;
  provider_name?: string | null;
  policy_number?: string | null;
  expires_at?: string | null;
  verification_status?: string | null;
  documents?: {
    storage_path?: string | null;
  } | null;
};

type ReviewRow = {
  id: string;
  customer_id: string;
  job_id?: string | null;
  rating: number;
  title?: string | null;
  body?: string | null;
  professional_response?: string | null;
  is_flagged?: boolean | null;
  created_at: string;
};

type JobRow = {
  id: string;
  title: string;
};

function textAreaValue(items?: string[] | null) {
  return (items ?? []).join("\n");
}

function socialValue(company: CompanyRow | null, key: string) {
  return company?.social_media?.[key] ?? "";
}

export default async function ProfessionalProfilePage({
  searchParams,
}: ProfilePageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name_en, name_es")
    .eq("is_active", true)
    .order("name_en");
  const categories = (categoriesData ?? []) as unknown as CategoryRow[];

  const requestedCompanyId = params.id;
  let company: CompanyRow | null = null;

  if (requestedCompanyId) {
    const { data } = await supabase
      .from("companies")
      .select("*, categories(name_en, name_es)")
      .eq("id", requestedCompanyId)
      .maybeSingle();
    company = data as unknown as CompanyRow | null;
  } else if (user) {
    const { data } = await supabase
      .from("companies")
      .select("*, categories(name_en, name_es)")
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle();
    company = data as unknown as CompanyRow | null;
  }

  const companyId = company?.id ?? "";
  const isOwner = Boolean(user && company?.owner_id === user.id);
  if (companyId) {
    await supabase.from("company_views").insert({
      company_id: companyId,
      viewer_id: user?.id ?? null,
      source: "profile",
    });
  }
  const categoryLabel =
    locale === "es"
      ? company?.categories?.name_es ?? ""
      : company?.categories?.name_en ?? "";
  const badgeLabels = list(dictionary.trustV2.badges);
  const verificationBadges: VerificationBadge[] = companyTrustBadges(
    badgeLabels,
    company,
  );
  const statusLabels = {
    approved: t(dictionary, "trustV2.approvedStatus"),
    pending: t(dictionary, "trustV2.pendingStatus"),
    expired: t(dictionary, "trustV2.expiredStatus"),
    missing: t(dictionary, "trustV2.missingStatus"),
    expires: t(dictionary, "trustV2.expires"),
  };
  const logoUrl = await signedStorageUrl(company?.logo_url);
  const coverUrl = await signedStorageUrl(company?.cover_image_url);
  const { data: licensesData } = companyId
    ? await supabase
        .from("licenses")
        .select("id, license_number, license_type, expires_at, verification_status, documents(storage_path)")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
    : { data: [] };
  const licenses = (licensesData ?? []) as unknown as LicenseRow[];
  const licenseLinks = await Promise.all(
    licenses.map(async (license) => ({
      ...license,
      href: await signedStorageUrl(license.documents?.storage_path),
    })),
  );
  const { data: insuranceData } = companyId
    ? await supabase
        .from("insurance_policies")
        .select("id, provider_name, policy_number, expires_at, verification_status, documents(storage_path)")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
    : { data: [] };
  const insurancePolicies = (insuranceData ?? []) as unknown as InsuranceRow[];
  const insuranceLinks = await Promise.all(
    insurancePolicies.map(async (policy) => ({
      ...policy,
      href: await signedStorageUrl(policy.documents?.storage_path),
    })),
  );
  const { data: reviewsData } = companyId
    ? await supabase
        .from("reviews")
        .select("id, customer_id, job_id, rating, title, body, professional_response, is_flagged, created_at")
        .eq("company_id", companyId)
        .eq("is_removed", false)
        .order("created_at", { ascending: false })
    : { data: [] };
  const reviews = (reviewsData ?? []) as unknown as ReviewRow[];
  const { data: completedJobsData } =
    companyId && user
      ? await supabase
          .from("jobs")
          .select("id, title")
          .eq("company_id", companyId)
          .eq("customer_id", user.id)
          .eq("status", "completed")
      : { data: [] };
  const reviewedJobIds = new Set(
    reviews
      .filter((review) => review.customer_id === user?.id && review.job_id)
      .map((review) => review.job_id),
  );
  const eligibleReviewJobs = ((completedJobsData ?? []) as unknown as JobRow[]).filter(
    (job) => !reviewedJobIds.has(job.id),
  );
  const { data: helpfulVotesData } = reviews.length
    ? await supabase
        .from("review_helpful_votes")
        .select("review_id")
        .in(
          "review_id",
          reviews.map((review) => review.id),
        )
    : { data: [] };
  const helpfulCounts = new Map<string, number>();
  for (const vote of (helpfulVotesData ?? []) as unknown as Array<{ review_id: string }>) {
    helpfulCounts.set(vote.review_id, (helpfulCounts.get(vote.review_id) ?? 0) + 1);
  }
  const displayName =
    company?.company_name ?? t(dictionary, "trustEngine.noCompanyPublic");
  const completion = profileCompletionScore({
    company,
    licenseCount: licenses.length,
    insuranceCount: insurancePolicies.length,
    reviewCount: reviews.length,
  });

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader
        dictionary={dictionary}
        locale={locale}
        currentPath="/professionals/profile"
      />

      <section className="section-shell py-8">
        {params.message ? (
          <div className="mb-4 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm font-semibold text-gold-deep">
            {params.message}
          </div>
        ) : null}
        <div className="overflow-hidden rounded-[2rem] border border-border bg-panel shadow-xl">
          <div
            role="img"
            aria-label={t(dictionary, "profileV2.coverAlt")}
            className="h-44 bg-cover bg-center sm:h-56"
            style={{
              backgroundImage: coverUrl
                ? `url(${coverUrl})`
                : "linear-gradient(to right, rgb(216 180 90 / 0.35), var(--panel-soft), var(--background))",
            }}
          />
          <div className="-mt-14 px-5 pb-6 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div
                  role="img"
                  aria-label={t(dictionary, "profileV2.logoAlt")}
                  className="flex size-28 items-center justify-center overflow-hidden rounded-[2rem] border border-border bg-background shadow-xl"
                  style={
                    logoUrl
                      ? {
                          backgroundImage: `url(${logoUrl})`,
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                        }
                      : undefined
                  }
                >
                  {!logoUrl ? (
                    <Building2 className="size-12 text-gold" aria-hidden />
                  ) : null}
                </div>
                <div className="pb-2">
                  <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">
                    {t(dictionary, "profileV2.headerLabel")}
                  </p>
                  <h1 className="mt-2 text-4xl font-black text-foreground">
                    {displayName}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
                    {categoryLabel ? <span>{categoryLabel}</span> : null}
                    <span className="flex items-center gap-1">
                      <MapPin className="size-4 text-gold" aria-hidden />
                      {company?.service_areas?.[0] ?? t(dictionary, "common.location")}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-foreground">
                      <Star className="size-4 fill-gold text-gold" aria-hidden />
                      {company?.rating_average ?? 0}
                    </span>
                    <span>
                      {company?.rating_count ?? 0}{" "}
                      {t(dictionary, "marketplace.reviewCountLabel")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <Link
                  href={`/quotes?companyId=${companyId}`}
                  className="vp23-primary-action inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-black transition"
                >
                  <Send className="size-4" aria-hidden />
                  {t(dictionary, "profile.quoteCta")}
                </Link>
                <a
                  href={company?.phone ? `tel:${company.phone}` : "#"}
                  className="vp23-secondary-action inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-black transition"
                >
                  <Phone className="size-4" aria-hidden />
                  {t(dictionary, "profileV2.call")}
                </a>
                <Link
                  href="/signup"
                  className="vp23-secondary-action inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-black transition"
                >
                  <ShieldCheck className="size-4" aria-hidden />
                  {t(dictionary, "profileV2.save")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell grid gap-6 pb-16 lg:grid-cols-[1fr_23rem]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-border bg-panel p-6">
            <h2 className="text-2xl font-black text-foreground">
              {t(dictionary, "profileV2.about")}
            </h2>
            <p className="mt-4 leading-7 text-muted">
              {company?.description ?? t(dictionary, "profile.body")}
            </p>
          </section>

          {user && (isOwner || !company) ? (
            <section className="rounded-[2rem] border border-border bg-panel p-6">
              <h2 className="text-2xl font-black text-foreground">
                {t(dictionary, "trustEngine.profileEditor")}
              </h2>
              <form
                action={saveCompanyProfile}
                className="mt-6 grid gap-4"
                encType="multipart/form-data"
              >
                <input type="hidden" name="companyId" value={companyId} />
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-foreground">
                      {t(dictionary, "common.companyName")}
                    </span>
                    <input
                      required
                      name="companyName"
                      defaultValue={company?.company_name ?? ""}
                      className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-foreground">
                      {t(dictionary, "common.category")}
                    </span>
                    <select
                      name="categoryId"
                      defaultValue={company?.category_id ?? ""}
                      className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                    >
                      <option value="">{t(dictionary, "common.optional")}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {locale === "es" ? category.name_es : category.name_en}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-foreground">
                      {t(dictionary, "common.ownerName")}
                    </span>
                    <input
                      name="ownerName"
                      defaultValue={company?.owner_name ?? ""}
                      className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-foreground">
                      {t(dictionary, "common.yearsInBusiness")}
                    </span>
                    <input
                      name="yearsInBusiness"
                      type="number"
                      min="0"
                      defaultValue={company?.years_in_business ?? ""}
                      className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-foreground">
                      {t(dictionary, "common.phone")}
                    </span>
                    <input
                      name="phone"
                      defaultValue={company?.phone ?? ""}
                      className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-foreground">
                      {t(dictionary, "common.email")}
                    </span>
                    <input
                      name="email"
                      type="email"
                      defaultValue={company?.email ?? ""}
                      className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-foreground">
                      {t(dictionary, "common.website")}
                    </span>
                    <input
                      name="website"
                      defaultValue={company?.website ?? ""}
                      className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-foreground">
                      {t(dictionary, "marketplace.filterLocation")}
                    </span>
                    <input
                      name="city"
                      defaultValue={company?.city ?? ""}
                      className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-foreground">
                      {t(dictionary, "trustEngine.state")}
                    </span>
                    <input
                      name="state"
                      defaultValue={company?.state ?? ""}
                      className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-foreground">
                      {t(dictionary, "trustEngine.postalCode")}
                    </span>
                    <input
                      name="postalCode"
                      defaultValue={company?.postal_code ?? ""}
                      className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-foreground">
                      {t(dictionary, "trustEngine.logoUpload")}
                    </span>
                    <input
                      name="logo"
                      type="file"
                      accept="image/*"
                      className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-foreground">
                      {t(dictionary, "trustEngine.coverUpload")}
                    </span>
                    <input
                      name="cover"
                      type="file"
                      accept="image/*"
                      className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-foreground">
                      {t(dictionary, "common.language")}
                    </span>
                    <input
                      name="languages"
                      defaultValue={company?.languages?.join(", ") ?? "en"}
                      aria-describedby="languages-help"
                      className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                    />
                    <span id="languages-help" className="mt-1 block text-xs text-muted">
                      {t(dictionary, "trustEngine.languagesHelp")}
                    </span>
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm font-bold text-foreground">
                    {t(dictionary, "common.description")}
                  </span>
                  <textarea
                    name="description"
                    defaultValue={company?.description ?? ""}
                    className="mt-2 min-h-28 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-foreground">
                    {t(dictionary, "common.serviceArea")}
                  </span>
                  <textarea
                    name="serviceAreas"
                    defaultValue={textAreaValue(company?.service_areas)}
                    aria-describedby="service-area-help"
                    className="mt-2 min-h-24 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                  />
                  <span id="service-area-help" className="mt-1 block text-xs text-muted">
                    {t(dictionary, "trustEngine.serviceAreasHelp")}
                  </span>
                </label>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {t(dictionary, "trustEngine.socialLinks")}
                  </p>
                  <div className="mt-2 grid gap-4 md:grid-cols-3">
                    {["linkedin", "facebook", "instagram"].map((social) => (
                      <label key={social} className="block">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                          {t(dictionary, `trustEngine.${social}`)}
                        </span>
                        <input
                          name={social}
                          defaultValue={socialValue(company, social)}
                          className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                        />
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="vp23-primary-action rounded-full px-5 py-3 text-sm font-black"
                >
                  {t(dictionary, "trustEngine.saveCompany")}
                </button>
              </form>
            </section>
          ) : null}

          <section className="grid gap-5 md:grid-cols-2">
            <div className="rounded-[2rem] border border-border bg-panel p-6">
              <h2 className="text-2xl font-black text-foreground">
                {t(dictionary, "profileV2.services")}
              </h2>
              <div className="mt-5 grid gap-2">
                {(company?.service_areas ?? []).map((service) => (
                  <div
                    key={service}
                    className="rounded-2xl border border-border bg-panel-soft p-3 text-sm font-semibold text-foreground"
                  >
                    {service}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-border bg-panel p-6">
              <h2 className="text-2xl font-black text-foreground">
                {t(dictionary, "profileV2.documents")}
              </h2>
              <div className="mt-5 grid gap-2">
                {licenseLinks.map((item) => (
                  <a
                    key={item.id}
                    href={item.href ?? "#"}
                    className="rounded-2xl border border-border bg-panel-soft p-3 text-sm font-semibold text-muted"
                  >
                    {item.license_number} - {item.verification_status}
                  </a>
                ))}
                {insuranceLinks.map((item) => (
                  <a
                    key={item.id}
                    href={item.href ?? "#"}
                    className="rounded-2xl border border-border bg-panel-soft p-3 text-sm font-semibold text-muted"
                  >
                    {item.provider_name} - {item.verification_status}
                  </a>
                ))}
                {!licenseLinks.length && !insuranceLinks.length ? (
                  <div className="rounded-2xl border border-border bg-panel-soft p-3 text-sm font-semibold text-muted">
                    {t(dictionary, "documents.badge")}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-border bg-panel p-6">
            <h2 className="flex items-center gap-3 text-2xl font-black text-foreground">
              <ImageIcon className="size-6 text-gold" aria-hidden />
              {t(dictionary, "profileV2.portfolio")}
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                t(dictionary, "common.photos"),
                t(dictionary, "common.videos"),
                t(dictionary, "profileV2.documents"),
              ].map((item) => (
                <div
                  key={item}
                  className="flex h-28 items-center justify-center rounded-3xl border border-border bg-panel-soft text-sm font-bold text-muted"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-border bg-panel p-6">
            <h2 className="text-2xl font-black text-foreground">
              {t(dictionary, "reviewsV2.title")}
            </h2>
            {eligibleReviewJobs.length ? (
              <div className="mt-5 grid gap-3">
                {eligibleReviewJobs.map((job) => (
                  <form
                    key={job.id}
                    action={createReview}
                    className="grid gap-3 rounded-3xl border border-border bg-panel-soft p-4"
                    encType="multipart/form-data"
                  >
                    <input type="hidden" name="companyId" value={companyId} />
                    <input type="hidden" name="jobId" value={job.id} />
                    <p className="font-bold text-foreground">
                      {t(dictionary, "transaction.leaveReview")}: {job.title}
                    </p>
                    <input
                      required
                      name="rating"
                      type="number"
                      min="1"
                      max="5"
                      placeholder={t(dictionary, "reviewsV2.ratingLabel")}
                      className="rounded-2xl border border-border bg-background p-3 text-foreground"
                    />
                    <input
                      name="title"
                      placeholder={t(dictionary, "reviewsV2.reviewTitleLabel")}
                      className="rounded-2xl border border-border bg-background p-3 text-foreground"
                    />
                    <textarea
                      name="body"
                      placeholder={t(dictionary, "reviewsV2.reviewBodyLabel")}
                      className="min-h-24 rounded-2xl border border-border bg-background p-3 text-foreground"
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        name="photo"
                        type="file"
                        accept="image/*"
                        className="rounded-2xl border border-border bg-background p-3 text-foreground"
                      />
                      <input
                        name="video"
                        type="file"
                        accept="video/*"
                        className="rounded-2xl border border-border bg-background p-3 text-foreground"
                      />
                    </div>
                    <button
                      type="submit"
                      className="vp23-primary-action rounded-full px-4 py-3 text-sm font-black"
                    >
                      {t(dictionary, "reviewsV2.submitReview")}
                    </button>
                  </form>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-border bg-panel-soft p-4 text-sm text-muted">
                {t(dictionary, "transaction.noEligibleReviews")}
              </p>
            )}
            <div className="mt-6 grid gap-4">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-3xl border border-border bg-panel-soft p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-2 font-black text-foreground">
                        <Star className="size-4 fill-gold text-gold" aria-hidden />
                        {review.rating}
                      </p>
                      <h3 className="mt-2 text-lg font-black text-foreground">
                        {review.title}
                      </h3>
                    </div>
                    {review.job_id ? (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
                        {t(dictionary, "reviewsV2.verifiedCustomer")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">{review.body}</p>
                  {review.professional_response ? (
                    <div className="mt-4 rounded-2xl border border-border bg-background p-4 text-sm text-muted">
                      <p className="font-bold text-foreground">
                        {t(dictionary, "profileV2.responseFromOwner")}
                      </p>
                      <p className="mt-2">{review.professional_response}</p>
                    </div>
                  ) : null}
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <form action={markReviewHelpful}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <button
                        type="submit"
                        className="vp23-secondary-action w-full rounded-full px-3 py-2 text-sm font-bold"
                      >
                        {t(dictionary, "trustEngine.helpfulVote")} (
                        {helpfulCounts.get(review.id) ?? 0})
                      </button>
                    </form>
                    <form action={flagReview} className="flex gap-2">
                      <input type="hidden" name="reviewId" value={review.id} />
                      <input
                        name="reason"
                        placeholder={t(dictionary, "trustEngine.reason")}
                        className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm text-foreground"
                      />
                      <button
                        type="submit"
                        className="vp23-secondary-action rounded-full px-3 py-2 text-sm font-bold"
                      >
                        {t(dictionary, "reviewsV2.flagReview")}
                      </button>
                    </form>
                    {isOwner ? (
                      <form action={respondToReview} className="flex gap-2">
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input
                          name="response"
                          placeholder={t(dictionary, "trustEngine.response")}
                          className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                        <button
                          type="submit"
                          className="vp23-secondary-action rounded-full px-3 py-2 text-sm font-bold"
                        >
                          {t(dictionary, "reviewsV2.responseTitle")}
                        </button>
                      </form>
                    ) : null}
                  </div>
                  {user?.id === review.customer_id ? (
                    <form action={editReview} className="mt-4 grid gap-2 md:grid-cols-4">
                      <input type="hidden" name="reviewId" value={review.id} />
                      <input
                        name="rating"
                        type="number"
                        min="1"
                        max="5"
                        defaultValue={review.rating}
                        className="rounded-2xl border border-border bg-background p-3 text-foreground"
                      />
                      <input
                        name="title"
                        defaultValue={review.title ?? ""}
                        className="rounded-2xl border border-border bg-background p-3 text-foreground"
                      />
                      <input
                        name="body"
                        defaultValue={review.body ?? ""}
                        className="rounded-2xl border border-border bg-background p-3 text-foreground"
                      />
                      <button
                        type="submit"
                        className="vp23-primary-action rounded-full px-3 py-2 text-sm font-black"
                      >
                        {t(dictionary, "trustEngine.editReview")}
                      </button>
                    </form>
                  ) : null}
                </article>
              ))}
              {!reviews.length ? (
                <div className="rounded-3xl border border-border bg-panel-soft p-8 text-center">
                  <p className="font-bold text-foreground">
                    {t(dictionary, "reviews.title")}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-border bg-panel p-6">
            <h2 className="text-2xl font-black text-foreground">
              {t(dictionary, "profileV2.verificationStatus")}
            </h2>
            <div className="mt-4 rounded-2xl border border-border bg-panel-soft p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                {t(dictionary, "beta.completionScore")}
              </p>
              <p className="mt-2 text-4xl font-black text-foreground">
                {completion.score}%
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              {t(dictionary, "trustV2.body")}
            </p>
            <div className="mt-5">
              <TrustBadgeGrid
                badges={verificationBadges}
                statusLabels={statusLabels}
                compact
              />
            </div>
          </section>

          <section className="rounded-[2rem] border border-border bg-panel p-6">
            <h2 className="flex items-center gap-3 text-xl font-black text-foreground">
              <FileText className="size-5 text-gold" aria-hidden />
              {t(dictionary, "profileV2.licenses")}
            </h2>
            {isOwner && companyId ? (
              <form
                action={submitLicenseVerification}
                className="mt-5 grid gap-3"
                encType="multipart/form-data"
              >
                <input type="hidden" name="companyId" value={companyId} />
                <input
                  required
                  name="licenseNumber"
                  placeholder={t(dictionary, "trustEngine.licenseNumber")}
                  className="rounded-2xl border border-border bg-background p-3 text-foreground"
                />
                <input
                  name="licenseType"
                  placeholder={t(dictionary, "trustEngine.licenseType")}
                  className="rounded-2xl border border-border bg-background p-3 text-foreground"
                />
                <input
                  name="issuingAuthority"
                  placeholder={t(dictionary, "trustEngine.issuingAuthority")}
                  className="rounded-2xl border border-border bg-background p-3 text-foreground"
                />
                <input
                  name="state"
                  placeholder={t(dictionary, "trustEngine.state")}
                  className="rounded-2xl border border-border bg-background p-3 text-foreground"
                />
                <input
                  name="expiresAt"
                  type="date"
                  aria-label={t(dictionary, "trustEngine.expirationDate")}
                  className="rounded-2xl border border-border bg-background p-3 text-foreground"
                />
                <input
                  required
                  name="licenseDocument"
                  type="file"
                  aria-label={t(dictionary, "trustEngine.licenseDocument")}
                  className="rounded-2xl border border-border bg-background p-3 text-foreground"
                />
                <button
                  type="submit"
                  className="vp23-primary-action rounded-full px-4 py-3 text-sm font-black"
                >
                  {t(dictionary, "trustEngine.submitLicense")}
                </button>
              </form>
            ) : null}
            <div className="mt-5 grid gap-2">
              {licenses.map((license) => (
                <div
                  key={license.id}
                  className="rounded-2xl border border-border bg-panel-soft p-3 text-sm text-muted"
                >
                  {license.license_number} - {license.verification_status}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-border bg-panel p-6">
            <h2 className="flex items-center gap-3 text-xl font-black text-foreground">
              <ShieldCheck className="size-5 text-gold" aria-hidden />
              {t(dictionary, "profileV2.insurance")}
            </h2>
            {isOwner && companyId ? (
              <form
                action={submitInsuranceVerification}
                className="mt-5 grid gap-3"
                encType="multipart/form-data"
              >
                <input type="hidden" name="companyId" value={companyId} />
                <input
                  required
                  name="providerName"
                  placeholder={t(dictionary, "trustEngine.providerName")}
                  className="rounded-2xl border border-border bg-background p-3 text-foreground"
                />
                <input
                  name="policyNumber"
                  placeholder={t(dictionary, "trustEngine.policyNumber")}
                  className="rounded-2xl border border-border bg-background p-3 text-foreground"
                />
                <input
                  name="coverageType"
                  placeholder={t(dictionary, "trustEngine.coverageType")}
                  className="rounded-2xl border border-border bg-background p-3 text-foreground"
                />
                <input
                  name="expiresAt"
                  type="date"
                  aria-label={t(dictionary, "trustEngine.expirationDate")}
                  className="rounded-2xl border border-border bg-background p-3 text-foreground"
                />
                <input
                  required
                  name="insuranceDocument"
                  type="file"
                  aria-label={t(dictionary, "trustEngine.insuranceDocument")}
                  className="rounded-2xl border border-border bg-background p-3 text-foreground"
                />
                <button
                  type="submit"
                  className="vp23-primary-action rounded-full px-4 py-3 text-sm font-black"
                >
                  {t(dictionary, "trustEngine.submitInsurance")}
                </button>
              </form>
            ) : null}
            <div className="mt-5 grid gap-2">
              {insurancePolicies.map((policy) => (
                <div
                  key={policy.id}
                  className="rounded-2xl border border-border bg-panel-soft p-3 text-sm text-muted"
                >
                  {policy.provider_name} - {policy.verification_status}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
