import { redirect } from "next/navigation";
import { Building2, FileCheck2 } from "lucide-react";
import { submitBusinessClaim } from "@/app/actions/beta";
import { PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, t } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

type ClaimPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

type CompanyOption = {
  id: string;
  company_name: string;
};

type ClaimRow = {
  id: string;
  status: string;
  created_at: string;
  companies?: {
    company_name?: string | null;
  } | null;
};

export default async function ClaimBusinessPage({ searchParams }: ClaimPageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?messageKey=auth.messageDashboardRequired");
  }

  const { data: companiesData } = await supabase
    .from("companies")
    .select("id, company_name")
    .eq("is_active", true)
    .order("company_name");
  const companies = (companiesData ?? []) as unknown as CompanyOption[];
  const { data: claimsData } = await supabase
    .from("company_claims")
    .select("id, status, created_at, companies(company_name)")
    .eq("claimant_id", user.id)
    .order("created_at", { ascending: false });
  const claims = (claimsData ?? []) as unknown as ClaimRow[];

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader dictionary={dictionary} locale={locale} currentPath="/claim-business" />
      <PageHero
        badge={t(dictionary, "beta.verifyOwnership")}
        title={t(dictionary, "beta.claimBusinessTitle")}
        body={t(dictionary, "beta.claimBusinessBody")}
      />
      <section className="section-shell grid gap-6 pb-16 lg:grid-cols-[1fr_0.8fr]">
        <form
          action={submitBusinessClaim}
          encType="multipart/form-data"
          className="rounded-[2rem] border border-border bg-panel p-6"
        >
          {params.message ? (
            <div className="mb-4 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm font-semibold text-gold-deep">
              {params.message}
            </div>
          ) : null}
          <h2 className="flex items-center gap-3 text-2xl font-black text-foreground">
            <Building2 className="size-6 text-gold" aria-hidden />
            {t(dictionary, "beta.existingCompany")}
          </h2>
          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="text-sm font-bold text-foreground">
                {t(dictionary, "common.companyName")}
              </span>
              <select
                required
                name="companyId"
                className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
              >
                <option value="">{t(dictionary, "common.required")}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-foreground">
                {t(dictionary, "common.displayName")}
              </span>
              <input
                required
                name="claimantName"
                className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-foreground">
                {t(dictionary, "common.email")}
              </span>
              <input
                required
                name="claimantEmail"
                type="email"
                defaultValue={user.email ?? ""}
                className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-foreground">
                {t(dictionary, "common.phone")}
              </span>
              <input
                name="claimantPhone"
                className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-foreground">
                {t(dictionary, "beta.ownershipNotes")}
              </span>
              <textarea
                name="ownershipNotes"
                className="mt-2 min-h-28 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-foreground">
                {t(dictionary, "beta.ownershipDocument")}
              </span>
              <input
                required
                name="ownershipDocument"
                type="file"
                className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
              />
            </label>
            <button
              type="submit"
              className="rounded-full bg-foreground px-5 py-3 text-sm font-black text-background"
            >
              {t(dictionary, "beta.submitClaim")}
            </button>
          </div>
        </form>

        <aside className="rounded-[2rem] border border-border bg-panel p-6">
          <h2 className="flex items-center gap-3 text-2xl font-black text-foreground">
            <FileCheck2 className="size-6 text-gold" aria-hidden />
            {t(dictionary, "beta.claimQueue")}
          </h2>
          <div className="mt-5 grid gap-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="rounded-2xl border border-border bg-panel-soft p-4 text-sm text-muted"
              >
                <p className="font-bold text-foreground">
                  {claim.companies?.company_name}
                </p>
                <p className="mt-1">{claim.status}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
