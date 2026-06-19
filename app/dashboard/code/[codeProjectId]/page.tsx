import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Braces,
  Download,
  FileArchive,
  FolderKanban,
  Trash2,
} from "lucide-react";
import {
  assignCodeProjectToProject,
  deleteCodeProject,
} from "@/app/actions/code";
import { CodeActions } from "@/components/code/code-actions";
import { CodeFileExplorer } from "@/components/code/code-file-explorer";
import { createClient } from "@/lib/supabase/server";

type CodeProjectPageProps = {
  params: Promise<{
    codeProjectId: string;
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

export default async function CodeProjectPage({
  params,
  searchParams,
}: CodeProjectPageProps) {
  const { codeProjectId } = await params;
  const { message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to access Code Studio.");
  }

  const [
    { data: codeProject, error: projectError },
    { data: files },
    { data: projects },
  ] = await Promise.all([
    supabase
      .from("code_projects")
      .select("id,title,description,prompt,framework,language,project_id,created_at,updated_at")
      .eq("id", codeProjectId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("code_files")
      .select("id,file_name,file_path,content,created_at,updated_at")
      .eq("code_project_id", codeProjectId)
      .order("file_path", { ascending: true }),
    supabase
      .from("projects")
      .select("id,name")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  if (projectError || !codeProject) {
    notFound();
  }

  const projectName =
    projects?.find((project) => project.id === codeProject.project_id)?.name ??
    null;

  return (
    <div id="workspace" className="space-y-6">
      <Link
        href="/dashboard/code"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to Code Studio
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
              <Braces className="size-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
                Code Project
              </p>
              <h1 className="mt-3 break-words text-3xl font-semibold text-white sm:text-4xl">
                {codeProject.title}
              </h1>
              <p className="mt-3 max-w-3xl leading-7 text-muted">
                {codeProject.description}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[30rem]">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Language
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {codeProject.language}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Framework
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {codeProject.framework}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Files
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {files?.length ?? 0}
              </p>
            </div>
          </div>
        </div>
        <p className="mt-5 text-xs text-muted">
          Project: {projectName ?? "No ORIVOO project"} · Created{" "}
          {formatDate(codeProject.created_at)} · Updated{" "}
          {formatDate(codeProject.updated_at)}
        </p>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr_auto] lg:items-end">
          <form action={assignCodeProjectToProject}>
            <input type="hidden" name="codeProjectId" value={codeProject.id} />
            <label className="text-sm font-medium text-white">
              Assign code project to ORIVOO project
              <select
                name="projectId"
                defaultValue={codeProject.project_id ?? ""}
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
              {[
                ["zip", "Export ZIP"],
                ["next", "Export Next.js Project"],
                ["react", "Export React Project"],
                ["node", "Export Node API"],
                ["source", "Download Source Code"],
              ].map(([format, label]) => (
                <a
                  key={format}
                  href={`/api/code/${codeProject.id}/export?format=${
                    format === "source" ? "zip" : format
                  }`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-muted transition hover:border-gold/35 hover:text-white"
                >
                  {format === "source" ? (
                    <Download className="size-4" aria-hidden />
                  ) : (
                    <FileArchive className="size-4" aria-hidden />
                  )}
                  {label}
                </a>
              ))}
            </div>
          </div>

          <form action={deleteCodeProject}>
            <input type="hidden" name="codeProjectId" value={codeProject.id} />
            <button className="inline-flex items-center gap-2 rounded-full border border-red-400/25 px-4 py-2.5 text-sm text-red-100 transition hover:bg-red-500/10">
              <Trash2 className="size-4" aria-hidden />
              Delete project
            </button>
          </form>
        </div>
      </section>

      <CodeFileExplorer codeProjectId={codeProject.id} files={files ?? []} />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
            Prompt
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Original build request
          </h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted">
            {codeProject.prompt}
          </p>
        </section>
        <CodeActions codeProjectId={codeProject.id} />
      </div>
    </div>
  );
}
