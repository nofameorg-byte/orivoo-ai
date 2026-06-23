import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";
import { profileCompletionScore } from "@/lib/profile-completion";
import { nextOnboardingAction } from "@/lib/workflow-rules";
import { createClient } from "@/lib/supabase/server";

type CompanyRow = {
  id: string;
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
};

export default async function OnboardingPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?messageKey=auth.messageDashboardRequired");
  }

  const { data: companyData } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();
  const company = companyData as unknown as CompanyRow | null;
  const companyId = company?.id ?? "";
  const { count: licenseCount } = companyId
    ? await supabase
        .from("licenses")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId)
    : { count: 0 };
  const { count: insuranceCount } = companyId
    ? await supabase
        .from("insurance_policies")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId)
    : { count: 0 };
  const { count: reviewCount } = companyId
    ? await supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("is_removed", false)
    : { count: 0 };
  const completion = profileCompletionScore({
    company,
    licenseCount: licenseCount ?? 0,
    insuranceCount: insuranceCount ?? 0,
    reviewCount: reviewCount ?? 0,
  });
  const steps = list(dictionary.beta.steps);
  const scoreItems = list(dictionary.beta.scoreItems);
  const nextAction = nextOnboardingAction(completion.checks, scoreItems);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader dictionary={dictionary} locale={locale} currentPath="/onboarding" />
      <PageHero
        badge={t(dictionary, "beta.profileCompletion")}
        title={t(dictionary, "beta.onboardingTitle")}
        body={t(dictionary, "beta.onboardingBody")}
      />
      <section className="section-shell grid gap-6 pb-16 lg:grid-cols-[1fr_22rem]">
        <div className="grid gap-4">
          {steps.map((step, index) => (
            <Link
              key={step}
              href="/professionals/profile"
              className="group rounded-[2rem] border border-border bg-panel p-6 transition hover:border-gold/50"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-11 items-center justify-center rounded-2xl border border-border bg-panel-soft font-black text-gold">
                    {index + 1}
                  </div>
                  <h2 className="text-xl font-black text-foreground">{step}</h2>
                </div>
                <ArrowRight className="size-5 text-muted transition group-hover:translate-x-1 group-hover:text-gold" />
              </div>
            </Link>
          ))}
        </div>
        <aside className="rounded-[2rem] border border-border bg-panel p-6">
          <h2 className="text-2xl font-black text-foreground">
            {t(dictionary, "beta.completionScore")}
          </h2>
          <div className="mt-5 rounded-[2rem] border border-border bg-panel-soft p-6 text-center">
            <p className="text-6xl font-black text-foreground">
              {completion.score}%
            </p>
          </div>
          {nextAction ? (
            <div className="mt-4 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm font-bold text-gold-deep">
              {nextAction}
            </div>
          ) : null}
          <div className="mt-5 grid gap-2">
            {scoreItems.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-border bg-panel-soft p-3 text-sm text-muted"
              >
                <CheckCircle2
                  className={`size-5 ${completion.checks[index] ? "text-gold" : "text-muted"}`}
                  aria-hidden
                />
                {item}
              </div>
            ))}
          </div>
        </aside>
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
