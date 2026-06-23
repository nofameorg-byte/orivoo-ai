import Link from "next/link";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Camera,
  Clock,
  Flag,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
  Star,
  ThumbsUp,
  Upload,
  Video,
} from "lucide-react";

export type VerificationStatus = "approved" | "pending" | "expired" | "missing";

export type VerificationBadge = {
  label: string;
  status: VerificationStatus;
  expiresAt?: string;
};

type StatusLabels = Record<VerificationStatus, string> & {
  expires: string;
};

type MarketplaceSearchProps = {
  question: string;
  serviceLabel: string;
  locationLabel: string;
  servicePlaceholder: string;
  locationPlaceholder: string;
  primaryCta: string;
  secondaryCta: string;
  examplesLabel: string;
  examples: string[];
  action?: string;
  defaultService?: string;
  defaultLocation?: string;
};

type TrustBadgeGridProps = {
  badges: VerificationBadge[];
  statusLabels: StatusLabels;
  compact?: boolean;
};

type DirectoryCompanyCardProps = {
  company: {
    name: string;
    category: string;
    location: string;
    rating: string;
    reviewCount: string;
    years: string;
    featured: boolean;
    badges: VerificationBadge[];
  };
  labels: {
    featured: string;
    reviews: string;
    years: string;
    viewProfile: string;
    requestQuote: string;
    noVerifiedBadges: string;
  };
  statusLabels: StatusLabels;
};

type ReviewSystemPanelProps = {
  labels: {
    title: string;
    body: string;
    createTitle: string;
    ratingLabel: string;
    reviewTitleLabel: string;
    reviewBodyLabel: string;
    uploadPhotos: string;
    uploadVideos: string;
    submitReview: string;
    responseTitle: string;
    moderationQueue: string;
    flagReview: string;
    helpfulVotes: string;
    verifiedCustomer: string;
  };
  queueItems: string[];
};

type ProfessionalDashboardPanelProps = {
  title: string;
  subtitle: string;
  navItems: string[];
  cards: Array<{ label: string; value: string }>;
  checklist: string[];
};

function statusClasses(status: VerificationStatus) {
  switch (status) {
    case "approved":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600";
    case "expired":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600";
    case "pending":
      return "border-gold/30 bg-gold/10 text-gold-deep";
    case "missing":
      return "border-border bg-panel-soft text-muted";
  }
}

function StatusIcon({ status }: { status: VerificationStatus }) {
  if (status === "approved") {
    return <BadgeCheck className="size-4" aria-hidden />;
  }

  return <Clock className="size-4" aria-hidden />;
}

export function MarketplaceSearch({
  question,
  serviceLabel,
  locationLabel,
  servicePlaceholder,
  locationPlaceholder,
  primaryCta,
  secondaryCta,
  examplesLabel,
  examples,
  action = "/professionals",
  defaultService = "",
  defaultLocation = "",
}: MarketplaceSearchProps) {
  return (
    <div className="rounded-[2rem] border border-border bg-panel p-4 shadow-2xl shadow-black/20 sm:p-5">
      <h1 className="px-2 pt-2 text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
        {question}
      </h1>
      <form
        action={action}
        className="mt-8 grid gap-3 rounded-[1.5rem] border border-border bg-background p-3 lg:grid-cols-[1fr_0.85fr_auto]"
      >
        <label className="block rounded-2xl bg-panel-soft p-4">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted">
            <Search className="size-4 text-gold" aria-hidden />
            {serviceLabel}
          </span>
          <input
            name="service"
            type="search"
            placeholder={servicePlaceholder}
            defaultValue={defaultService}
            className="mt-3 w-full bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-muted/70"
          />
        </label>
        <label className="block rounded-2xl bg-panel-soft p-4">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted">
            <MapPin className="size-4 text-gold" aria-hidden />
            {locationLabel}
          </span>
          <input
            name="location"
            type="search"
            placeholder={locationPlaceholder}
            defaultValue={defaultLocation}
            className="mt-3 w-full bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-muted/70"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-foreground px-6 py-4 text-sm font-black text-background transition hover:bg-gold-bright"
          >
            {primaryCta}
          </button>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-2xl border border-border px-6 py-4 text-sm font-black text-foreground transition hover:border-gold/50"
          >
            {secondaryCta}
          </Link>
        </div>
      </form>
      <div className="mt-5 flex flex-wrap items-center gap-2 px-2 text-sm">
        <span className="font-semibold text-muted">{examplesLabel}</span>
        {examples.map((example) => (
          <Link
            href="/professionals"
            key={example}
            className="rounded-full border border-border bg-panel-soft px-3 py-1.5 font-medium text-foreground transition hover:border-gold/50"
          >
            {example}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function TrustBadgeGrid({
  badges,
  statusLabels,
  compact = false,
}: TrustBadgeGridProps) {
  return (
    <div className={compact ? "grid gap-2" : "grid gap-3 sm:grid-cols-2 xl:grid-cols-3"}>
      {badges.map((badge) => (
        <div
          key={badge.label}
          className={`rounded-2xl border p-4 ${statusClasses(badge.status)}`}
        >
          <div className="flex items-start gap-3">
            <StatusIcon status={badge.status} />
            <div className="min-w-0">
              <p className="font-bold">{badge.label}</p>
              <p className="mt-1 text-xs font-semibold opacity-80">
                {statusLabels[badge.status]}
              </p>
              {badge.expiresAt ? (
                <p className="mt-2 text-xs opacity-80">
                  {statusLabels.expires}: {badge.expiresAt}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DirectoryCompanyCard({
  company,
  labels,
  statusLabels,
}: DirectoryCompanyCardProps) {
  const approvedBadges = company.badges.filter(
    (badge) => badge.status === "approved",
  );

  return (
    <article className="overflow-hidden rounded-[2rem] border border-border bg-panel shadow-sm transition hover:-translate-y-1 hover:border-gold/50 hover:shadow-xl">
      <div className="h-24 bg-gradient-to-r from-gold/30 via-panel-soft to-background" />
      <div className="-mt-10 p-5">
        <div className="flex items-end justify-between gap-3">
          <div className="flex size-20 items-center justify-center rounded-3xl border border-border bg-background shadow-lg">
            <Building2 className="size-9 text-gold" aria-hidden />
          </div>
          {company.featured ? (
            <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold text-gold-deep">
              {labels.featured}
            </span>
          ) : null}
        </div>
        <div className="mt-5">
          <p className="text-sm font-semibold text-muted">{company.category}</p>
          <h2 className="mt-1 text-2xl font-black text-foreground">
            {company.name}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted">
            <MapPin className="size-4 text-gold" aria-hidden />
            {company.location}
          </p>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-2xl bg-panel-soft p-3">
            <p className="flex items-center gap-1 font-black text-foreground">
              <Star className="size-4 fill-gold text-gold" aria-hidden />
              {company.rating}
            </p>
            <p className="mt-1 text-xs text-muted">{labels.reviews}</p>
          </div>
          <div className="rounded-2xl bg-panel-soft p-3">
            <p className="font-black text-foreground">{company.reviewCount}</p>
            <p className="mt-1 text-xs text-muted">{labels.reviews}</p>
          </div>
          <div className="rounded-2xl bg-panel-soft p-3">
            <p className="font-black text-foreground">{company.years}</p>
            <p className="mt-1 text-xs text-muted">{labels.years}</p>
          </div>
        </div>
        <div className="mt-5 min-h-16">
          {approvedBadges.length > 0 ? (
            <TrustBadgeGrid
              badges={approvedBadges.slice(0, 3)}
              statusLabels={statusLabels}
              compact
            />
          ) : (
            <div className="rounded-2xl border border-border bg-panel-soft p-4 text-sm font-medium text-muted">
              {labels.noVerifiedBadges}
            </div>
          )}
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link
            href="/professionals/profile"
            className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2.5 text-sm font-bold text-foreground transition hover:border-gold/50"
          >
            {labels.viewProfile}
          </Link>
          <Link
            href="/quotes"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2.5 text-sm font-bold text-background transition hover:bg-gold-bright"
          >
            {labels.requestQuote}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ReviewSystemPanel({ labels, queueItems }: ReviewSystemPanelProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] border border-border bg-panel p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-foreground">{labels.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{labels.body}</p>
          </div>
          <MessageSquare className="size-7 shrink-0 text-gold" aria-hidden />
        </div>
        <div className="rounded-3xl border border-border bg-panel-soft p-5">
          <h3 className="font-black text-foreground">{labels.createTitle}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[labels.ratingLabel, labels.reviewTitleLabel, labels.reviewBodyLabel].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-border bg-background p-4 text-sm font-semibold text-muted"
                >
                  {item}
                </div>
              ),
            )}
            <div className="rounded-2xl border border-border bg-background p-4 text-sm font-semibold text-muted">
              <Camera className="mb-2 size-5 text-gold" aria-hidden />
              {labels.uploadPhotos}
            </div>
            <div className="rounded-2xl border border-border bg-background p-4 text-sm font-semibold text-muted">
              <Video className="mb-2 size-5 text-gold" aria-hidden />
              {labels.uploadVideos}
            </div>
          </div>
          <div className="mt-4 rounded-full bg-foreground px-4 py-3 text-center text-sm font-black text-background">
            {labels.submitReview}
          </div>
        </div>
      </section>
      <section className="grid gap-5">
        <div className="rounded-[2rem] border border-border bg-panel p-6">
          <h3 className="text-xl font-black text-foreground">
            {labels.responseTitle}
          </h3>
          <div className="mt-4 rounded-2xl border border-border bg-panel-soft p-4 text-sm text-muted">
            <ShieldCheck className="mb-3 size-5 text-gold" aria-hidden />
            {labels.verifiedCustomer}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-panel-soft p-4 text-sm font-semibold text-muted">
              <Flag className="mb-2 size-5 text-gold" aria-hidden />
              {labels.flagReview}
            </div>
            <div className="rounded-2xl border border-border bg-panel-soft p-4 text-sm font-semibold text-muted">
              <ThumbsUp className="mb-2 size-5 text-gold" aria-hidden />
              {labels.helpfulVotes}
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-border bg-panel p-6">
          <h3 className="text-xl font-black text-foreground">
            {labels.moderationQueue}
          </h3>
          <div className="mt-4 grid gap-2">
            {queueItems.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border bg-panel-soft p-3 text-sm text-muted"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function ProfessionalDashboardPanel({
  title,
  subtitle,
  navItems,
  cards,
  checklist,
}: ProfessionalDashboardPanelProps) {
  return (
    <section className="rounded-[2rem] border border-border bg-panel p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">
            {title}
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black text-foreground">
            {subtitle}
          </h2>
        </div>
        <BriefcaseBusiness className="size-9 text-gold" aria-hidden />
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {navItems.map((item, index) => (
          <div
            key={item}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${
              index === 0
                ? "border-gold/40 bg-gold/10 text-gold-deep"
                : "border-border bg-panel-soft text-muted"
            }`}
          >
            {item}
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-border bg-panel-soft p-5"
          >
            <p className="text-3xl font-black text-foreground">{card.value}</p>
            <p className="mt-2 text-sm text-muted">{card.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {checklist.map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 text-sm font-semibold text-foreground"
          >
            <Upload className="size-5 text-gold" aria-hidden />
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
