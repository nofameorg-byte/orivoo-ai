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
  ReviewSystemPanel,
  TrustBadgeGrid,
  type VerificationBadge,
} from "@/components/marketplace";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";

export default async function ProfessionalProfilePage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const company = dictionary.profileV2.sampleCompany;
  const badgeLabels = list(dictionary.trustV2.badges);
  const verificationBadges: VerificationBadge[] = badgeLabels.map((label) => ({
    label,
    status: "missing",
  }));
  const statusLabels = {
    approved: t(dictionary, "trustV2.approvedStatus"),
    pending: t(dictionary, "trustV2.pendingStatus"),
    expired: t(dictionary, "trustV2.expiredStatus"),
    missing: t(dictionary, "trustV2.missingStatus"),
    expires: t(dictionary, "trustV2.expires"),
  };
  const reviewLabels = {
    title: t(dictionary, "reviewsV2.title"),
    body: t(dictionary, "reviewsV2.body"),
    createTitle: t(dictionary, "reviewsV2.createTitle"),
    ratingLabel: t(dictionary, "reviewsV2.ratingLabel"),
    reviewTitleLabel: t(dictionary, "reviewsV2.reviewTitleLabel"),
    reviewBodyLabel: t(dictionary, "reviewsV2.reviewBodyLabel"),
    uploadPhotos: t(dictionary, "reviewsV2.uploadPhotos"),
    uploadVideos: t(dictionary, "reviewsV2.uploadVideos"),
    submitReview: t(dictionary, "reviewsV2.submitReview"),
    responseTitle: t(dictionary, "reviewsV2.responseTitle"),
    moderationQueue: t(dictionary, "reviewsV2.moderationQueue"),
    flagReview: t(dictionary, "reviewsV2.flagReview"),
    helpfulVotes: t(dictionary, "reviewsV2.helpfulVotes"),
    verifiedCustomer: t(dictionary, "reviewsV2.verifiedCustomer"),
  };

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader
        dictionary={dictionary}
        locale={locale}
        currentPath="/professionals/profile"
      />

      <section className="section-shell py-8">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-panel shadow-xl">
          <div
            role="img"
            aria-label={t(dictionary, "profileV2.coverAlt")}
            className="h-44 bg-gradient-to-r from-gold/35 via-panel-soft to-background sm:h-56"
          />
          <div className="-mt-14 px-5 pb-6 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div
                  role="img"
                  aria-label={t(dictionary, "profileV2.logoAlt")}
                  className="flex size-28 items-center justify-center rounded-[2rem] border border-border bg-background shadow-xl"
                >
                  <Building2 className="size-12 text-gold" aria-hidden />
                </div>
                <div className="pb-2">
                  <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">
                    {t(dictionary, "profileV2.headerLabel")}
                  </p>
                  <h1 className="mt-2 text-4xl font-black text-foreground">
                    {company.name}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
                    <span>{company.category}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-4 text-gold" aria-hidden />
                      {company.location}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-foreground">
                      <Star className="size-4 fill-gold text-gold" aria-hidden />
                      {company.rating}
                    </span>
                    <span>
                      {company.reviews} {t(dictionary, "marketplace.reviewCountLabel")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <Link
                  href="/quotes"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-black text-background transition hover:bg-gold-bright"
                >
                  <Send className="size-4" aria-hidden />
                  {t(dictionary, "profile.quoteCta")}
                </Link>
                <Link
                  href="/quotes"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-black text-foreground transition hover:border-gold/50"
                >
                  <Phone className="size-4" aria-hidden />
                  {t(dictionary, "profileV2.call")}
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-black text-foreground transition hover:border-gold/50"
                >
                  <ShieldCheck className="size-4" aria-hidden />
                  {t(dictionary, "profileV2.save")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell grid gap-6 pb-16 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-border bg-panel p-6">
            <h2 className="text-2xl font-black text-foreground">
              {t(dictionary, "profileV2.about")}
            </h2>
            <p className="mt-4 leading-7 text-muted">{company.about}</p>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="rounded-[2rem] border border-border bg-panel p-6">
              <h2 className="text-2xl font-black text-foreground">
                {t(dictionary, "profileV2.services")}
              </h2>
              <div className="mt-5 grid gap-2">
                {list(company.services).map((service) => (
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
                {t(dictionary, "profileV2.serviceAreas")}
              </h2>
              <div className="mt-5 grid gap-2">
                {list(company.serviceAreas).map((area) => (
                  <div
                    key={area}
                    className="rounded-2xl border border-border bg-panel-soft p-3 text-sm font-semibold text-foreground"
                  >
                    {area}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-border bg-panel p-6">
            <h2 className="flex items-center gap-3 text-2xl font-black text-foreground">
              <ImageIcon className="size-6 text-gold" aria-hidden />
              {t(dictionary, "profileV2.portfolio")}
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[t(dictionary, "common.photos"), t(dictionary, "common.videos"), t(dictionary, "profileV2.documents")].map(
                (item) => (
                  <div
                    key={item}
                    className="flex h-28 items-center justify-center rounded-3xl border border-border bg-panel-soft text-sm font-bold text-muted"
                  >
                    {item}
                  </div>
                ),
              )}
            </div>
          </section>

          <ReviewSystemPanel
            labels={reviewLabels}
            queueItems={list(dictionary.reviewsV2.queueItems)}
          />
        </div>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-border bg-panel p-6">
            <h2 className="text-2xl font-black text-foreground">
              {t(dictionary, "profileV2.verificationStatus")}
            </h2>
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
              {t(dictionary, "trustV2.uploadFoundationTitle")}
            </h2>
            <div className="mt-5 grid gap-3">
              {[
                t(dictionary, "profileV2.licenseUploads"),
                t(dictionary, "profileV2.insuranceUploads"),
                t(dictionary, "trustV2.historyTitle"),
                t(dictionary, "trustV2.expirationTitle"),
                t(dictionary, "trustV2.renewalReminder"),
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-border bg-panel-soft p-3 text-sm font-semibold text-muted"
                >
                  {item}
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
