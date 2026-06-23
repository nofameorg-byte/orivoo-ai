import {
  convertQuoteToJob,
  respondToQuote,
} from "@/app/actions/transactions";
import { getDictionary, getLocale, t } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

type QuoteRow = {
  id: string;
  company_id?: string | null;
  customer_id?: string | null;
  title: string;
  project_details: string;
  location?: string | null;
  status: string;
  professional_response?: string | null;
  companies?: {
    company_name?: string | null;
    owner_id?: string | null;
  } | null;
};

type DashboardQuotesPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function DashboardQuotesPage({
  searchParams,
}: DashboardQuotesPageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("quote_requests")
    .select("*, companies(company_name, owner_id)")
    .order("created_at", { ascending: false });
  const quotes = (data ?? []) as unknown as QuoteRow[];

  return (
    <div className="space-y-6">
      {params.message ? (
        <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm font-semibold text-gold-deep">
          {params.message}
        </div>
      ) : null}
      <section className="rounded-[2rem] border border-border bg-panel p-6">
        <h1 className="text-3xl font-black text-foreground">
          {t(dictionary, "transaction.quoteInbox")}
        </h1>
        <div className="mt-6 grid gap-4">
          {quotes.map((quote) => {
            const isProfessional = quote.companies?.owner_id === user?.id;
            return (
              <article
                key={quote.id}
                className="rounded-3xl border border-border bg-panel-soft p-5"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <p className="text-sm font-semibold text-muted">
                      {quote.companies?.company_name}
                    </p>
                    <h2 className="mt-1 text-xl font-black text-foreground">
                      {quote.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {quote.project_details}
                    </p>
                    {quote.professional_response ? (
                      <p className="mt-3 rounded-2xl border border-border bg-background p-3 text-sm text-muted">
                        {quote.professional_response}
                      </p>
                    ) : null}
                  </div>
                  <span className="h-fit rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted">
                    {quote.status}
                  </span>
                </div>
                {isProfessional ? (
                  <div className="mt-5 grid gap-3">
                    <form action={respondToQuote} className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                      <input type="hidden" name="quoteId" value={quote.id} />
                      <input
                        name="professionalResponse"
                        placeholder={t(dictionary, "transaction.professionalResponse")}
                        className="rounded-2xl border border-border bg-background p-3 text-foreground"
                      />
                      <button
                        type="submit"
                        name="decision"
                        value="accepted"
                        className="rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground"
                      >
                        {t(dictionary, "transaction.acceptQuote")}
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="declined"
                        className="rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground"
                      >
                        {t(dictionary, "transaction.declineQuote")}
                      </button>
                    </form>
                    {quote.status === "accepted" ? (
                      <form action={convertQuoteToJob} className="grid gap-3 md:grid-cols-[1fr_auto]">
                        <input type="hidden" name="quoteId" value={quote.id} />
                        <input
                          name="scheduledStart"
                          type="datetime-local"
                          aria-label={t(dictionary, "transaction.scheduledStart")}
                          className="rounded-2xl border border-border bg-background p-3 text-foreground"
                        />
                        <button
                          type="submit"
                          className="rounded-full bg-foreground px-4 py-2 text-sm font-black text-background"
                        >
                          {t(dictionary, "transaction.convertToJob")}
                        </button>
                      </form>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
