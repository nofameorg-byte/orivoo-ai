import {
  acceptJob,
  updateJobStatus,
} from "@/app/actions/transactions";
import { getDictionary, getLocale, t } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

type JobRow = {
  id: string;
  company_id?: string | null;
  customer_id?: string | null;
  title: string;
  description?: string | null;
  status: string;
  scheduled_start?: string | null;
  companies?: {
    company_name?: string | null;
    owner_id?: string | null;
  } | null;
};

type DashboardJobsPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function DashboardJobsPage({
  searchParams,
}: DashboardJobsPageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("jobs")
    .select("*, companies(company_name, owner_id)")
    .order("created_at", { ascending: false });
  const jobs = (data ?? []) as unknown as JobRow[];

  return (
    <div className="space-y-6">
      {params.message ? (
        <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm font-semibold text-gold-deep">
          {params.message}
        </div>
      ) : null}
      <section className="rounded-[2rem] border border-border bg-panel p-6">
        <h1 className="text-3xl font-black text-foreground">
          {t(dictionary, "transaction.jobs")}
        </h1>
        <div className="mt-6 grid gap-4">
          {jobs.length ? jobs.map((job) => {
            const isProfessional = job.companies?.owner_id === user?.id;
            const isCustomer = job.customer_id === user?.id;
            return (
              <article
                key={job.id}
                className="rounded-3xl border border-border bg-panel-soft p-5"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <p className="text-sm font-semibold text-muted">
                      {job.companies?.company_name}
                    </p>
                    <h2 className="mt-1 text-xl font-black text-foreground">
                      {job.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {job.description}
                    </p>
                  </div>
                  <span className="h-fit rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted">
                    {job.status}
                  </span>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {isCustomer && job.status === "pending" ? (
                    <form action={acceptJob}>
                      <input type="hidden" name="jobId" value={job.id} />
                      <button
                        type="submit"
                        className="w-full rounded-full bg-foreground px-4 py-2 text-sm font-black text-background"
                      >
                        {t(dictionary, "transaction.acceptJob")}
                      </button>
                    </form>
                  ) : null}
                  {isProfessional ? (
                    <form action={updateJobStatus} className="grid gap-2 md:grid-cols-[1fr_auto]">
                      <input type="hidden" name="jobId" value={job.id} />
                      <select
                        name="status"
                        defaultValue={job.status}
                        className="rounded-2xl border border-border bg-background p-3 text-foreground"
                      >
                        <option value="scheduled">
                          {t(dictionary, "transaction.scheduled")}
                        </option>
                        <option value="in_progress">
                          {t(dictionary, "transaction.inProgress")}
                        </option>
                        <option value="completed">
                          {t(dictionary, "transaction.completed")}
                        </option>
                        <option value="cancelled">
                          {t(dictionary, "transaction.cancelled")}
                        </option>
                      </select>
                      <button
                        type="submit"
                        className="rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground"
                      >
                        {t(dictionary, "transaction.updateStatus")}
                      </button>
                    </form>
                  ) : null}
                </div>
              </article>
            );
          }) : (
            <div className="rounded-3xl border border-border bg-panel-soft p-8 text-center">
              <p className="font-bold text-foreground">
                {t(dictionary, "transaction.noJobs")}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
