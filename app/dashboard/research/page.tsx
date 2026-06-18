import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  FileSearch,
  FolderKanban,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  createResearchReport,
  deleteResearchReport,
} from "@/app/actions/research";
import { createClient } from "@/lib/supabase/server";

type ResearchPageProps = {
  searchParams: Promise<{
    message?: string;
    q?: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function ResearchPage({ searchParams }: ResearchPageProps) {
  const { message, q } = await searchParams;
  const query = q?.trim() ?? "";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to access Research Studio.");
  }

  let reportsQuery = supabase
    .from("research_reports")
    .select("id,title,topic,project_id,created_at,updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (query) {
    reportsQuery = reportsQuery.or(`title.ilike.%${query}%,topic.ilike.%${query}%`);
  }

  const [{ data: reports }, { data: projects }] = await Promise.all([
    reportsQuery,
    supabase
      .from("projects")
      .select("id,name")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  const projectNames = new Map(
    (projects ?? []).map((project) => [project.id, project.name]),
  );

  return (
    <div id="workspace" className="space-y-8">
      <section className="surface-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm text-gold-bright">
            <Sparkles className="size-4" aria-hidden />
            Research Studio
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Intelligence reports for markets, competitors, grants, and strategy.
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-muted">
            ORIVOO Research Studio creates structured reports, saves sources,
            and connects intelligence to projects as the research engine for all
            future studios.
          </p>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <form action={createResearchReport} className="surface-card rounded-[2rem] p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Create report
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Search a research topic
            </h2>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-white">Topic</span>
            <input
              required
              name="topic"
              placeholder="South Carolina solar energy market"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none transition placeholder:text-muted/70 focus:border-gold/50"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-white">Project</span>
            <select
              name="projectId"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none transition focus:border-gold/50"
            >
              <option value="">No project</option>
              {(projects ?? []).map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gold-bright"
          >
            <FileSearch className="size-4" aria-hidden />
            Create research report
          </button>
        </form>

        <form action="/dashboard/research" className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              History
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Search report history
            </h2>
          </div>
          <div className="flex gap-3 rounded-2xl border border-white/10 bg-black/45 p-2 pl-4">
            <Search className="mt-3 size-4 shrink-0 text-muted" aria-hidden />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search reports..."
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-muted/70"
            />
            <button className="rounded-full border border-gold/35 bg-gold/10 px-4 text-sm font-semibold text-gold-bright">
              Search
            </button>
          </div>
          <p className="mt-4 text-sm text-muted">
            Showing {reports?.length ?? 0} report
            {(reports?.length ?? 0) === 1 ? "" : "s"} for your account.
          </p>
        </form>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Research history
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Saved reports
            </h2>
          </div>
          <FileSearch className="size-6 text-gold" aria-hidden />
        </div>

        {reports?.length ? (
          <div className="grid gap-4">
            {reports.map((report) => (
              <article
                key={report.id}
                className="rounded-3xl border border-white/10 bg-black/35 p-5"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-white">
                      {report.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted">{report.topic}</p>
                    <p className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold">
                      <FolderKanban className="size-3.5" aria-hidden />
                      {report.project_id
                        ? projectNames.get(report.project_id) ?? "Project"
                        : "No project"}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      Created {formatDate(report.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/dashboard/research/${report.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gold-bright"
                    >
                      View report
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                    <form action={deleteResearchReport}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-full border border-red-400/25 px-4 py-2 text-sm text-red-100 transition hover:bg-red-500/10"
                      >
                        <Trash2 className="size-4" aria-hidden />
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
            <FileSearch className="mx-auto mb-4 size-10 text-gold" aria-hidden />
            <h3 className="text-xl font-semibold text-white">
              No research reports yet
            </h3>
            <p className="mt-3 text-muted">
              Enter a topic above to create your first ORIVOO intelligence
              report.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
