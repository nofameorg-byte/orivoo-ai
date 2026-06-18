import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileDown,
  FileSearch,
  FolderKanban,
  Trash2,
} from "lucide-react";
import {
  assignResearchReportToProject,
  deleteResearchReport,
} from "@/app/actions/research";
import { ResearchReportContent } from "@/components/research/research-report-content";
import { createClient } from "@/lib/supabase/server";

type ResearchReportPageProps = {
  params: Promise<{
    reportId: string;
  }>;
  searchParams: Promise<{
    message?: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function ResearchReportPage({
  params,
  searchParams,
}: ResearchReportPageProps) {
  const { reportId } = await params;
  const { message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to view this research report.");
  }

  const [
    { data: report, error: reportError },
    { data: sources },
    { data: projects },
  ] = await Promise.all([
    supabase
      .from("research_reports")
      .select("id,title,topic,project_id,report_content,created_at,updated_at")
      .eq("id", reportId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("research_sources")
      .select("id,source_title,source_url,source_type,source_content,created_at")
      .eq("report_id", reportId)
      .order("created_at", { ascending: true }),
    supabase
      .from("projects")
      .select("id,name")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  if (reportError || !report) {
    notFound();
  }

  const projectName =
    projects?.find((project) => project.id === report.project_id)?.name ?? null;

  return (
    <div id="workspace" className="space-y-6">
      <Link
        href="/dashboard/research"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to Research Studio
      </Link>

      {message ? (
        <div className="rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
          {message}
        </div>
      ) : null}

      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
              <FileSearch className="size-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
                Research Report
              </p>
              <h1 className="mt-3 break-words text-3xl font-semibold text-white sm:text-4xl">
                {report.title}
              </h1>
              <p className="mt-3 text-lg text-muted">{report.topic}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[30rem]">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Created
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {formatDate(report.created_at)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Project
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {projectName ?? "No project"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Sources
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {sources?.length ?? 0}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <form action={assignResearchReportToProject}>
            <input type="hidden" name="reportId" value={report.id} />
            <label className="text-sm font-medium text-white">
              Assign report to project
              <select
                name="projectId"
                defaultValue={report.project_id ?? ""}
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
            <button className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold-bright transition hover:bg-gold/15">
              <FolderKanban className="size-4" aria-hidden />
              Save project
            </button>
          </form>

          <div>
            <p className="mb-2 text-sm font-medium text-white">Exports</p>
            <div className="flex flex-wrap gap-2">
              <a
                href={`/api/research/${report.id}/export?format=pdf`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-muted transition hover:border-gold/35 hover:text-white"
              >
                <FileDown className="size-4" aria-hidden />
                Export to PDF
              </a>
              <a
                href={`/api/research/${report.id}/export?format=docx`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-muted transition hover:border-gold/35 hover:text-white"
              >
                <FileDown className="size-4" aria-hidden />
                Export to DOCX
              </a>
              <a
                href={`/api/research/${report.id}/export?format=txt`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-muted transition hover:border-gold/35 hover:text-white"
              >
                <Download className="size-4" aria-hidden />
                Download report
              </a>
            </div>
          </div>

          <form action={deleteResearchReport}>
            <input type="hidden" name="reportId" value={report.id} />
            <button className="inline-flex items-center gap-2 rounded-full border border-red-400/25 px-4 py-2.5 text-sm text-red-100 transition hover:bg-red-500/10">
              <Trash2 className="size-4" aria-hidden />
              Delete report
            </button>
          </form>
        </div>
      </section>

      <ResearchReportContent
        initialContent={report.report_content}
        reportId={report.id}
      />

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
            Sources
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Research sources
          </h2>
        </div>
        {sources?.length ? (
          <div className="grid gap-3">
            {sources.map((source) => (
              <div
                key={source.id}
                className="rounded-3xl border border-white/10 bg-black/35 p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">
                      {source.source_title}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gold">
                      {source.source_type}
                    </p>
                  </div>
                  {source.source_url ? (
                    <a
                      href={source.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-gold-bright transition hover:text-white"
                    >
                      Open source
                    </a>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {source.source_content ?? "No source summary saved."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 p-6 text-sm text-muted">
            No sources saved for this report yet.
          </div>
        )}
      </section>
    </div>
  );
}
