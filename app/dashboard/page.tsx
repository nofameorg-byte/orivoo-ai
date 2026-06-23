import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ClipboardList,
  FileText,
  Handshake,
  MessageSquare,
  ShieldCheck,
  Star,
} from "lucide-react";
import {
  ProfessionalDashboardPanel,
  TrustBadgeGrid,
  type VerificationBadge,
} from "@/components/marketplace";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";
import { profileCompletionScore } from "@/lib/profile-completion";
import { createClient } from "@/lib/supabase/server";

const operatingAreas = [
  { href: "/professionals/profile", labelKey: "professionalDashboard.companyProfile", icon: Building2 },
  { href: "/professionals/profile", labelKey: "professionalDashboard.reviews", icon: MessageSquare },
  { href: "/document-center", labelKey: "professionalDashboard.licenses", icon: BadgeCheck },
  { href: "/document-center", labelKey: "professionalDashboard.insurance", icon: ShieldCheck },
  { href: "/quotes", labelKey: "professionalDashboard.quotes", icon: ClipboardList },
  { href: "/business-tools", labelKey: "professionalDashboard.jobs", icon: FileText },
  { href: "/partners", labelKey: "professionalDashboard.partners", icon: Handshake },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name, preferred_language")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };
  const locale = await getLocale(
    isLocale(profile?.preferred_language) ? profile?.preferred_language : null,
  );
  const dictionary = await getDictionary(locale);
  const displayName =
    profile?.display_name ??
    (typeof user?.user_metadata.display_name === "string"
      ? user.user_metadata.display_name
      : user?.email?.split("@")[0] ?? t(dictionary, "common.professional"));
  const cards = list(dictionary.professionalDashboard.cards);
  const checklist = list(dictionary.professionalDashboard.checklist);
  const dashboardNav = [
    t(dictionary, "professionalDashboard.overview"),
    t(dictionary, "professionalDashboard.companyProfile"),
    t(dictionary, "professionalDashboard.reviews"),
    t(dictionary, "professionalDashboard.licenses"),
    t(dictionary, "professionalDashboard.insurance"),
    t(dictionary, "professionalDashboard.verification"),
    t(dictionary, "professionalDashboard.quotes"),
    t(dictionary, "professionalDashboard.jobs"),
    t(dictionary, "professionalDashboard.documents"),
    t(dictionary, "professionalDashboard.partners"),
    t(dictionary, "professionalDashboard.settings"),
  ];
  const statusLabels = {
    approved: t(dictionary, "trustV2.approvedStatus"),
    pending: t(dictionary, "trustV2.pendingStatus"),
    expired: t(dictionary, "trustV2.expiredStatus"),
    missing: t(dictionary, "trustV2.missingStatus"),
    expires: t(dictionary, "trustV2.expires"),
  };
  const { data: companyData } = user
    ? await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", user.id)
        .limit(1)
        .maybeSingle()
    : { data: null };
  const company = companyData as {
    id?: string;
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
  } | null;
  const { count: licenseCount } = company?.id
    ? await supabase
        .from("licenses")
        .select("id", { count: "exact", head: true })
        .eq("company_id", company.id)
    : { count: 0 };
  const { count: insuranceCount } = company?.id
    ? await supabase
        .from("insurance_policies")
        .select("id", { count: "exact", head: true })
        .eq("company_id", company.id)
    : { count: 0 };
  const { count: reviewCount } = company?.id
    ? await supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("company_id", company.id)
        .eq("is_removed", false)
    : { count: 0 };
  const completion = profileCompletionScore({
    company,
    licenseCount: licenseCount ?? 0,
    insuranceCount: insuranceCount ?? 0,
    reviewCount: reviewCount ?? 0,
  });
  const verificationBadges: VerificationBadge[] = list(dictionary.trustV2.badges).map(
    (label) => ({
      label,
      status: "missing",
    }),
  );

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-panel p-6 shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm font-bold text-gold-bright">
              <Star className="size-4" aria-hidden />
              {t(dictionary, "professionalDashboard.overview")}
            </div>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              {t(dictionary, "dashboard.welcome", { name: displayName })}
            </h1>
            <p className="mt-5 max-w-2xl leading-7 text-muted">
              {t(dictionary, "professionalDashboard.subtitle")}
            </p>
          </div>
          <Link
            href="/professionals/profile"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-black text-background transition hover:bg-gold-bright"
          >
            {t(dictionary, "professionalDashboard.companyProfile")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      <ProfessionalDashboardPanel
        title={t(dictionary, "professionalDashboard.title")}
        subtitle={t(dictionary, "professionalDashboard.subtitle")}
        navItems={dashboardNav}
        cards={cards}
        checklist={checklist}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[2rem] border border-border bg-panel p-6">
          <h2 className="text-2xl font-black text-foreground">
            {t(dictionary, "dashboard.sectionsTitle")}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {operatingAreas.map((area) => (
              <Link
                key={area.labelKey}
                href={area.href}
                className="group rounded-3xl border border-border bg-panel-soft p-5 transition hover:-translate-y-1 hover:border-gold/50"
              >
                <area.icon className="mb-5 size-6 text-gold" aria-hidden />
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-foreground">
                    {t(dictionary, area.labelKey)}
                  </h3>
                  <ArrowRight className="size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-gold" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-panel p-6">
          <h2 className="text-2xl font-black text-foreground">
            {t(dictionary, "trustV2.badgeSystemTitle")}
          </h2>
          <div className="mt-5 rounded-[2rem] border border-border bg-panel-soft p-5 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted">
              {t(dictionary, "beta.completionScore")}
            </p>
            <p className="mt-2 text-5xl font-black text-foreground">
              {completion.score}%
            </p>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            {t(dictionary, "trustV2.body")}
          </p>
          <div className="mt-6">
            <TrustBadgeGrid
              badges={verificationBadges}
              statusLabels={statusLabels}
              compact
            />
          </div>
        </div>
      </section>
    </div>
  );
}
