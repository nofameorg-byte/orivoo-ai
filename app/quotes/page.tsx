import { redirect } from "next/navigation";
import { ClipboardList, Send } from "lucide-react";
import { requestQuote } from "@/app/actions/transactions";
import { PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, t } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

type QuotesPageProps = {
  searchParams: Promise<{
    companyId?: string;
    message?: string;
  }>;
};

type CompanyOption = {
  id: string;
  company_name: string;
  category_id?: string | null;
};

export default async function QuotesPage({ searchParams }: QuotesPageProps) {
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
    .select("id, company_name, category_id")
    .eq("is_active", true)
    .order("company_name");
  const companies = (companiesData ?? []) as unknown as CompanyOption[];
  const selectedCompany = companies.find((company) => company.id === params.companyId);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader dictionary={dictionary} locale={locale} currentPath="/quotes" />
      <PageHero
        badge={t(dictionary, "quotes.badge")}
        title={t(dictionary, "transaction.requestQuoteTitle")}
        body={t(dictionary, "quotes.body")}
      />
      <section className="section-shell pb-16">
        <form
          action={requestQuote}
          encType="multipart/form-data"
          className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-panel p-6"
        >
          {params.message ? (
            <div className="mb-4 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm font-semibold text-gold-deep">
              {params.message}
            </div>
          ) : null}
          <h2 className="flex items-center gap-3 text-2xl font-black text-foreground">
            <ClipboardList className="size-6 text-gold" aria-hidden />
            {t(dictionary, "quotes.requestDetails")}
          </h2>
          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="text-sm font-bold text-foreground">
                {t(dictionary, "common.companyName")}
              </span>
              <select
                required
                name="companyId"
                defaultValue={selectedCompany?.id ?? ""}
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
            <input
              type="hidden"
              name="categoryId"
              value={selectedCompany?.category_id ?? ""}
            />
            <label className="block">
              <span className="text-sm font-bold text-foreground">
                {t(dictionary, "transaction.quoteTitle")}
              </span>
              <input
                required
                name="title"
                className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-foreground">
                {t(dictionary, "transaction.projectDetails")}
              </span>
              <textarea
                required
                name="projectDetails"
                className="mt-2 min-h-32 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-foreground">
                  {t(dictionary, "common.location")}
                </span>
                <input
                  name="location"
                  className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-foreground">
                  {t(dictionary, "common.serviceArea")}
                </span>
                <input
                  name="serviceArea"
                  className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-bold text-foreground">
                {t(dictionary, "transaction.projectPhoto")}
              </span>
              <input
                name="projectPhoto"
                type="file"
                accept="image/*"
                className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
              />
            </label>
            <input type="hidden" name="preferredLanguage" value={locale} />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-black text-background"
            >
              <Send className="size-4" aria-hidden />
              {t(dictionary, "quotes.sendRequest")}
            </button>
          </div>
        </form>
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
