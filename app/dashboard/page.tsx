import {
  ArrowUp,
  Bot,
  Braces,
  Building2,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  Eye,
  FileText,
  FlaskConical,
  FolderPlus,
  Globe2,
  Landmark,
  Layers3,
  Leaf,
  Palette,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Trees,
  Trash2,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import {
  createArtifact,
  createArtifactFolder,
  deleteArtifact,
  duplicateArtifact,
  updateArtifact,
} from "@/app/actions/artifacts";
import {
  deleteProjectFile,
  uploadProjectFile,
} from "@/app/actions/files";
import { startDeepResearch } from "@/app/actions/research";
import { artifactTypes, getArtifactTypeLabel } from "@/lib/artifacts";
import { ensureDefaultProject } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";

const studios = [
  {
    name: "Assistant",
    description: "Ask, plan, summarize, and coordinate across every studio.",
    icon: Bot,
  },
  {
    name: "Document Studio",
    description: "Draft, edit, and transform high-quality written assets.",
    icon: FileText,
  },
  {
    name: "Research Studio",
    description: "Explore topics, collect evidence, and turn findings into maps.",
    icon: Search,
  },
  {
    name: "Website Builder",
    description: "Shape landing pages, content blocks, and deployment plans.",
    icon: Globe2,
  },
  {
    name: "Code Studio",
    description: "Create implementation plans, code, tests, and technical notes.",
    icon: Braces,
  },
  {
    name: "Business Builder",
    description: "Model offers, operations, positioning, and growth systems.",
    icon: Building2,
  },
  {
    name: "Design Studio",
    description: "Develop brand systems, UI direction, and visual concepts.",
    icon: Palette,
  },
  {
    name: "Land Studio",
    description: "Organize property, planning, and land-use intelligence.",
    icon: Trees,
  },
  {
    name: "Concept Studio",
    description: "Turn raw ideas into structured concepts and next actions.",
    icon: Layers3,
  },
  {
    name: "Legal Studio",
    description: "Summarize legal context and prepare review-ready drafts.",
    icon: Scale,
  },
  {
    name: "Civic Studio",
    description: "Navigate public programs, policy, and civic research.",
    icon: Landmark,
  },
  {
    name: "Botanical Studio",
    description: "Study plants, cultivation workflows, and botanical data.",
    icon: Leaf,
  },
  {
    name: "Genealogy Studio",
    description: "Trace family history, records, and ancestry narratives.",
    icon: Users,
  },
  {
    name: "Science Studio",
    description: "Frame hypotheses, lab notes, and research explainers.",
    icon: FlaskConical,
  },
];

const baseMetrics = [
  { label: "Active studios", value: "14" },
  { label: "Auth provider", value: "Supabase" },
];

const researchWorkflowSteps = [
  "Queued research job",
  "Gathered source material",
  "Extracted findings",
  "Generated structured report",
  "Saved report artifact",
];

type DashboardPageProps = {
  searchParams?: Promise<{
    artifactId?: string;
    artifactMessage?: string;
    fileMessage?: string;
    researchJobId?: string;
    researchMessage?: string;
  }>;
};

const projectFilesBucket = "project-files";

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let size = sizeBytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function getResearchProgress(status: string) {
  if (status === "completed") {
    return 100;
  }

  if (status === "running") {
    return 55;
  }

  if (status === "failed") {
    return 100;
  }

  return 20;
}

function getResearchStatusIcon(status: string) {
  if (status === "completed") {
    return CheckCircle2;
  }

  if (status === "failed") {
    return XCircle;
  }

  if (status === "running") {
    return Search;
  }

  return Clock3;
}

function getMetadataObject(metadata: unknown) {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? (metadata as Record<string, unknown>)
    : {};
}

function getCitationSources(metadata: unknown) {
  const citations = getMetadataObject(metadata).citations;

  if (!Array.isArray(citations)) {
    return [];
  }

  return citations
    .map((citation) => {
      if (!citation || typeof citation !== "object") {
        return null;
      }

      const source = citation as Record<string, unknown>;
      const title = typeof source.title === "string" ? source.title : "";
      const url = typeof source.url === "string" ? source.url : "";
      const excerpt = typeof source.excerpt === "string" ? source.excerpt : "";

      if (!title && !url && !excerpt) {
        return null;
      }

      return { title, url, excerpt };
    })
    .filter((source): source is { title: string; url: string; excerpt: string } =>
      Boolean(source),
    );
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const supabase = await createClient();
  const params = await searchParams;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const displayName =
    profile?.display_name ??
    (typeof user?.user_metadata.display_name === "string"
      ? user.user_metadata.display_name
      : user?.email?.split("@")[0] ?? "Operator");

  const project = user ? await ensureDefaultProject(supabase, user.id) : null;
  const { data: projectFiles } = project
    ? await supabase
        .from("files")
        .select("id, name, file_type, storage_path, size_bytes, created_at")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
    : { data: [] };
  const { data: artifactFolders } = project
    ? await supabase
        .from("artifact_folders")
        .select("id, name, created_at, updated_at")
        .eq("project_id", project.id)
        .order("name", { ascending: true })
    : { data: [] };
  const { data: artifacts } = project
    ? await supabase
        .from("artifacts")
        .select(
          "id, folder_id, title, artifact_type, content, metadata, created_at, updated_at",
        )
        .eq("project_id", project.id)
        .order("updated_at", { ascending: false })
    : { data: [] };
  const { data: researchJobs } = project
    ? await supabase
        .from("research_jobs")
        .select(
          "id, title, status, query, result_artifact_id, created_at, updated_at",
        )
        .eq("project_id", project.id)
        .order("updated_at", { ascending: false })
    : { data: [] };

  const filesWithUrls = await Promise.all(
    (projectFiles ?? []).map(async (file) => {
      const { data } = await supabase.storage
        .from(projectFilesBucket)
        .createSignedUrl(file.storage_path, 60 * 60);

      return {
        ...file,
        signedUrl: data?.signedUrl ?? null,
      };
    }),
  );
  const artifactList = artifacts ?? [];
  const folders = artifactFolders ?? [];
  const researchJobList = researchJobs ?? [];
  const selectedArtifact =
    artifactList.find((artifact) => artifact.id === params?.artifactId) ??
    artifactList[0] ??
    null;
  const selectedResearchJob =
    researchJobList.find((job) => job.id === params?.researchJobId) ??
    researchJobList[0] ??
    null;
  const selectedResearchArtifact = selectedResearchJob?.result_artifact_id
    ? artifactList.find(
        (artifact) => artifact.id === selectedResearchJob.result_artifact_id,
      ) ?? null
    : null;
  const researchSources = selectedResearchArtifact
    ? getCitationSources(selectedResearchArtifact.metadata)
    : [];
  const getArtifactFolderName = (folderId: string | null) =>
    folderId
      ? folders.find((folder) => folder.id === folderId)?.name ??
        "Project folder"
      : "Unfiled";

  const metrics = [
    ...baseMetrics,
    { label: "Project files", value: filesWithUrls.length.toString() },
    { label: "Artifacts", value: artifactList.length.toString() },
    { label: "Research jobs", value: researchJobList.length.toString() },
  ];

  return (
    <div className="space-y-8">
      <section
        id="workspace"
        className="surface-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10"
      >
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm text-gold-bright">
              <Sparkles className="size-4" aria-hidden />
              ORIVOO AI Dashboard
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Welcome back, {displayName}. What are we building next?
            </h1>
            <p className="mt-5 max-w-2xl leading-7 text-muted">
              Start with the assistant, then route the work into specialist
              studios for documents, research, code, design, business, science,
              and more.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-white/10 bg-black/40 p-4"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-8 rounded-[1.5rem] border border-white/10 bg-black/60 p-3">
          <div className="min-h-32 rounded-2xl bg-panel-soft p-5">
            <p className="text-sm text-muted">Assistant prompt</p>
            <p className="mt-3 text-lg text-white">
              Build a launch-ready brief, create a research map, and draft the
              first landing page section for ORIVOO AI.
            </p>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-full border border-white/10 bg-black/60 p-2 pl-5">
            <span className="flex-1 text-sm text-muted">
              Ask ORIVOO AI to plan, write, design, research, or build...
            </span>
            <button
              type="button"
              className="gold-gradient flex size-10 items-center justify-center rounded-full text-black"
            >
              <ArrowUp className="size-4" aria-hidden />
              <span className="sr-only">Send prompt</span>
            </button>
          </div>
        </div>
      </section>

      <section
        id="files"
        className="grid gap-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 lg:grid-cols-[0.8fr_1.2fr]"
      >
        <div className="rounded-3xl border border-gold/20 bg-black/40 p-6">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
            <Upload className="size-5" aria-hidden />
          </div>
          <p className="text-xs uppercase tracking-[0.24em] text-gold-bright">
            Project files
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Store files for future AI analysis.
          </h2>
          <p className="mt-3 leading-6 text-muted">
            Upload PDFs, DOCX documents, TXT notes, CSV data, and common image
            formats to {project?.name ?? "your project"}. Analysis is not
            enabled yet.
          </p>

          {params?.fileMessage ? (
            <div className="mt-5 rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-gold-bright">
              {params.fileMessage}
            </div>
          ) : null}

          <form action={uploadProjectFile} className="mt-6 space-y-4">
            <input type="hidden" name="projectId" value={project?.id ?? ""} />
            <label className="block rounded-2xl border border-dashed border-white/15 bg-panel-soft p-4">
              <span className="text-sm font-medium text-white">
                Choose a supported file
              </span>
              <span className="mt-1 block text-xs text-muted">
                PDF, DOCX, TXT, CSV, JPG, PNG, GIF, or WEBP up to 50 MB.
              </span>
              <input
                required
                type="file"
                name="file"
                accept=".pdf,.docx,.txt,.csv,image/jpeg,image/png,image/gif,image/webp"
                className="mt-4 block w-full cursor-pointer rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
              />
            </label>
            <button
              type="submit"
              className="gold-gradient flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-black"
            >
              <Upload className="size-4" aria-hidden />
              Upload file
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                File listing
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                {filesWithUrls.length} stored{" "}
                {filesWithUrls.length === 1 ? "file" : "files"}
              </h3>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">
              Private bucket
            </span>
          </div>

          {filesWithUrls.length > 0 ? (
            <div className="mt-5 space-y-3">
              {filesWithUrls.map((file) => (
                <article
                  key={file.id}
                  className="rounded-2xl border border-white/10 bg-panel-soft p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gold/10 text-gold">
                          <FileText className="size-4" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate font-medium text-white">
                            {file.name}
                          </h4>
                          <p className="mt-1 text-xs text-muted">
                            {file.file_type} &bull;{" "}
                            {formatFileSize(file.size_bytes)} &bull;{" "}
                            {formatDate(file.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {file.signedUrl ? (
                        <a
                          href={file.signedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-white transition hover:border-gold/40 hover:text-gold-bright"
                        >
                          View
                        </a>
                      ) : (
                        <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-muted">
                          View unavailable
                        </span>
                      )}
                      <form action={deleteProjectFile}>
                        <input type="hidden" name="fileId" value={file.id} />
                        <button
                          type="submit"
                          className="flex items-center gap-2 rounded-full border border-red-400/20 px-3 py-2 text-xs font-medium text-red-200 transition hover:border-red-300/50 hover:bg-red-400/10"
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-panel-soft p-8 text-center">
              <FileText className="mx-auto mb-4 size-8 text-gold" aria-hidden />
              <h4 className="font-semibold text-white">No files yet</h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                Upload files here so each project can retain source material for
                future analysis.
              </p>
            </div>
          )}
        </div>
      </section>

      <section
        id="research"
        className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm text-gold-bright">
              <Search className="size-4" aria-hidden />
              Deep Research Engine
            </div>
            <h2 className="text-3xl font-semibold text-white">
              Run long-form research and save the report.
            </h2>
            <p className="mt-3 max-w-3xl leading-6 text-muted">
              Turn on Research Mode, gather evidence from multiple sources,
              generate a structured report, and store the final result as a
              project artifact.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "Scheduled research",
              "Monitoring topics",
              "Auto-update reports",
            ].map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted"
              >
                Future: {feature}
              </span>
            ))}
          </div>
        </div>

        {params?.researchMessage ? (
          <div className="rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-gold-bright">
            {params.researchMessage}
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <form
            action={startDeepResearch}
            className="rounded-3xl border border-gold/20 bg-black/40 p-5"
          >
            <input type="hidden" name="projectId" value={project?.id ?? ""} />
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.24em] text-gold-bright">
                Research mode
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                Start a multi-step research run
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Provide URLs for targeted source gathering, or leave sources
                blank to use a default public knowledge search.
              </p>
            </div>

            <label className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-panel-soft p-4">
              <span>
                <span className="block text-sm font-medium text-white">
                  Research Mode
                </span>
                <span className="mt-1 block text-xs text-muted">
                  Required before ORIVOO runs the deep workflow.
                </span>
              </span>
              <input
                type="checkbox"
                name="researchMode"
                defaultChecked
                className="size-5 accent-gold"
              />
            </label>

            <div className="space-y-3">
              <input
                required
                name="title"
                placeholder="Research report title"
                className="w-full rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm text-white outline-none placeholder:text-muted"
              />
              <textarea
                required
                name="query"
                rows={4}
                placeholder="What should ORIVOO research?"
                className="w-full rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-muted"
              />
              <textarea
                name="sourceUrls"
                rows={4}
                placeholder="Optional source URLs, one per line"
                className="w-full rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                className="gold-gradient flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-black"
              >
                <Search className="size-4" aria-hidden />
                Start deep research
              </button>
            </div>
          </form>

          <div className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">
                    Research progress
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    {selectedResearchJob?.title ?? "No research jobs yet"}
                  </h3>
                </div>
                {selectedResearchJob ? (
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
                    {selectedResearchJob.status}
                  </span>
                ) : null}
              </div>

              {selectedResearchJob ? (
                <>
                  <div className="mb-5 h-2 overflow-hidden rounded-full bg-panel-soft">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{
                        width: `${getResearchProgress(
                          selectedResearchJob.status,
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-5">
                    {researchWorkflowSteps.map((step, index) => {
                      const StatusIcon = getResearchStatusIcon(
                        selectedResearchJob.status,
                      );
                      const progress = getResearchProgress(
                        selectedResearchJob.status,
                      );
                      const isComplete = progress >= ((index + 1) / 5) * 100;

                      return (
                        <div
                          key={step}
                          className={`rounded-2xl border p-3 ${
                            isComplete
                              ? "border-gold/30 bg-gold/10"
                              : "border-white/10 bg-panel-soft"
                          }`}
                        >
                          <StatusIcon
                            className={`mb-3 size-4 ${
                              isComplete ? "text-gold" : "text-muted"
                            }`}
                            aria-hidden
                          />
                          <p className="text-xs leading-5 text-muted">{step}</p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-5 text-sm leading-6 text-muted">
                    Query: {selectedResearchJob.query}
                  </p>
                  {selectedResearchArtifact ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      <a
                        href={`/dashboard?artifactId=${selectedResearchArtifact.id}#artifacts`}
                        className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-4 py-2 text-sm font-medium text-gold-bright transition hover:bg-gold/10"
                      >
                        <FileText className="size-4" aria-hidden />
                        Open saved report
                      </a>
                      <a
                        href={`/dashboard/artifacts/${selectedResearchArtifact.id}/download`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-gold/40 hover:text-gold-bright"
                      >
                        <Download className="size-4" aria-hidden />
                        Download report
                      </a>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-panel-soft p-8 text-center">
                  <Search className="mx-auto mb-4 size-8 text-gold" aria-hidden />
                  <h4 className="font-semibold text-white">
                    No research started
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Run a research job to see queued, running, completed, or
                    failed progress here.
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Recent jobs</h3>
                  <span className="text-xs text-muted">
                    {researchJobList.length} total
                  </span>
                </div>
                {researchJobList.length > 0 ? (
                  <div className="space-y-3">
                    {researchJobList.map((job) => {
                      const StatusIcon = getResearchStatusIcon(job.status);

                      return (
                        <a
                          key={job.id}
                          href={`/dashboard?researchJobId=${job.id}#research`}
                          className={`block rounded-2xl border p-4 transition hover:border-gold/40 ${
                            job.id === selectedResearchJob?.id
                              ? "border-gold/30 bg-gold/10"
                              : "border-white/10 bg-panel-soft"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <StatusIcon
                              className="size-4 shrink-0 text-gold"
                              aria-hidden
                            />
                            <div className="min-w-0">
                              <h4 className="truncate text-sm font-medium text-white">
                                {job.title}
                              </h4>
                              <p className="mt-1 text-xs text-muted">
                                Created {formatDate(job.created_at)} &bull;
                                Updated {formatDate(job.updated_at)}
                              </p>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-white/10 bg-panel-soft p-5 text-sm leading-6 text-muted">
                    Research jobs will appear here after a deep run starts.
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-white">
                    Citations and sources
                  </h3>
                  <span className="text-xs text-muted">
                    {researchSources.length} sources
                  </span>
                </div>
                {researchSources.length > 0 ? (
                  <div className="space-y-3">
                    {researchSources.map((source, index) => (
                      <article
                        key={`${source.url}-${index}`}
                        className="rounded-2xl border border-white/10 bg-panel-soft p-4"
                      >
                        <p className="text-xs uppercase tracking-[0.18em] text-gold-bright">
                          Source {index + 1}
                        </p>
                        <h4 className="mt-2 text-sm font-medium text-white">
                          {source.title || source.url}
                        </h4>
                        {source.url && source.url !== "about:blank" ? (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 block break-all text-xs text-gold-bright"
                          >
                            {source.url}
                          </a>
                        ) : null}
                        <p className="mt-3 text-xs leading-5 text-muted">
                          {source.excerpt}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-white/10 bg-panel-soft p-5 text-sm leading-6 text-muted">
                    Completed research reports will show citations here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="artifacts"
        className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm text-gold-bright">
              <Layers3 className="size-4" aria-hidden />
              Artifact workspace
            </div>
            <h2 className="text-3xl font-semibold text-white">
              Save valuable AI-generated work.
            </h2>
            <p className="mt-3 max-w-3xl leading-6 text-muted">
              Store documents, reports, code, research, plans, legal drafts, and
              civic reports by project so outputs do not get lost in
              conversations.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["PDF Export", "DOCX Export", "Markdown Export", "Code Export"].map(
              (exportType) => (
                <span
                  key={exportType}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted"
                >
                  Future: {exportType}
                </span>
              ),
            )}
          </div>
        </div>

        {params?.artifactMessage ? (
          <div className="rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-gold-bright">
            {params.artifactMessage}
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl border border-gold/20 bg-gold/10 text-gold">
                  <FolderPlus className="size-4" aria-hidden />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    Project artifact folders
                  </h3>
                  <p className="text-xs text-muted">
                    {folders.length} {folders.length === 1 ? "folder" : "folders"}{" "}
                    in {project?.name ?? "this project"}
                  </p>
                </div>
              </div>

              <form action={createArtifactFolder} className="flex gap-2">
                <input type="hidden" name="projectId" value={project?.id ?? ""} />
                <input
                  required
                  name="folderName"
                  placeholder="Folder name"
                  className="min-w-0 flex-1 rounded-full border border-white/10 bg-panel-soft px-4 py-2 text-sm text-white outline-none placeholder:text-muted"
                />
                <button
                  type="submit"
                  className="rounded-full border border-gold/30 px-4 py-2 text-sm font-medium text-gold-bright transition hover:bg-gold/10"
                >
                  Create
                </button>
              </form>

              {folders.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {folders.map((folder) => (
                    <span
                      key={folder.id}
                      className="rounded-full border border-white/10 bg-panel-soft px-3 py-1 text-xs text-muted"
                    >
                      {folder.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <form
              action={createArtifact}
              className="rounded-3xl border border-gold/20 bg-black/40 p-5"
            >
              <input type="hidden" name="projectId" value={project?.id ?? ""} />
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.24em] text-gold-bright">
                  Save artifact
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  Capture an AI output
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Paste generated work here to store it as a reusable project
                  artifact.
                </p>
              </div>

              <div className="space-y-3">
                <input
                  required
                  name="title"
                  placeholder="Artifact title"
                  className="w-full rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm text-white outline-none placeholder:text-muted"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    name="artifactType"
                    defaultValue="document"
                    className="rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm text-white outline-none"
                  >
                    {artifactTypes.map((artifactType) => (
                      <option
                        key={artifactType.value}
                        value={artifactType.value}
                      >
                        {artifactType.label}
                      </option>
                    ))}
                  </select>
                  <select
                    name="folderId"
                    defaultValue=""
                    className="rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="">Unfiled</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  required
                  name="content"
                  rows={8}
                  placeholder="Paste artifact content..."
                  className="w-full rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-muted"
                />
                <button
                  type="submit"
                  className="gold-gradient flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-black"
                >
                  <FileText className="size-4" aria-hidden />
                  Save artifact
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-4 sm:p-6">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">
                    Artifact list
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    {artifactList.length} saved{" "}
                    {artifactList.length === 1 ? "artifact" : "artifacts"}
                  </h3>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">
                  Project scoped
                </span>
              </div>

              {artifactList.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] gap-3 border-b border-white/10 bg-panel-soft px-4 py-3 text-xs uppercase tracking-[0.18em] text-muted">
                    <span>Title</span>
                    <span>Type</span>
                    <span>Created</span>
                    <span>Last updated</span>
                  </div>
                  <div className="divide-y divide-white/10">
                    {artifactList.map((artifact) => (
                      <article
                        key={artifact.id}
                        className={`grid gap-3 px-4 py-4 text-sm lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] ${
                          artifact.id === selectedArtifact?.id
                            ? "bg-gold/10"
                            : "bg-black/30"
                        }`}
                      >
                        <div className="min-w-0">
                          <h4 className="truncate font-medium text-white">
                            {artifact.title}
                          </h4>
                          <p className="mt-1 text-xs text-muted">
                            Folder: {getArtifactFolderName(artifact.folder_id)}
                          </p>
                        </div>
                        <p className="text-muted">
                          {getArtifactTypeLabel(artifact.artifact_type)}
                        </p>
                        <p className="text-muted">
                          {formatDate(artifact.created_at)}
                        </p>
                        <div className="space-y-3">
                          <p className="text-muted">
                            {formatDate(artifact.updated_at)}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`/dashboard?artifactId=${artifact.id}#artifacts`}
                              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white transition hover:border-gold/40 hover:text-gold-bright"
                            >
                              <Eye className="size-3.5" aria-hidden />
                              View
                            </a>
                            <a
                              href={`/dashboard/artifacts/${artifact.id}/download`}
                              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white transition hover:border-gold/40 hover:text-gold-bright"
                            >
                              <Download className="size-3.5" aria-hidden />
                              Download
                            </a>
                            <form action={duplicateArtifact}>
                              <input
                                type="hidden"
                                name="artifactId"
                                value={artifact.id}
                              />
                              <button
                                type="submit"
                                className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white transition hover:border-gold/40 hover:text-gold-bright"
                              >
                                <Copy className="size-3.5" aria-hidden />
                                Duplicate
                              </button>
                            </form>
                            <form action={deleteArtifact}>
                              <input
                                type="hidden"
                                name="artifactId"
                                value={artifact.id}
                              />
                              <button
                                type="submit"
                                className="inline-flex items-center gap-1 rounded-full border border-red-400/20 px-3 py-1.5 text-xs text-red-200 transition hover:border-red-300/50 hover:bg-red-400/10"
                              >
                                <Trash2 className="size-3.5" aria-hidden />
                                Delete
                              </button>
                            </form>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-panel-soft p-8 text-center">
                  <Layers3
                    className="mx-auto mb-4 size-8 text-gold"
                    aria-hidden
                  />
                  <h4 className="font-semibold text-white">No artifacts yet</h4>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Save important outputs here once AI generation is connected.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              {selectedArtifact ? (
                <form action={updateArtifact} className="space-y-4">
                  <input
                    type="hidden"
                    name="artifactId"
                    value={selectedArtifact.id}
                  />
                  <input
                    type="hidden"
                    name="projectId"
                    value={project?.id ?? ""}
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted">
                        View and edit
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-white">
                        {selectedArtifact.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {getArtifactTypeLabel(selectedArtifact.artifact_type)}{" "}
                        in {getArtifactFolderName(selectedArtifact.folder_id)}
                      </p>
                    </div>
                    <a
                      href={`/dashboard/artifacts/${selectedArtifact.id}/download`}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/30 px-4 py-2 text-sm font-medium text-gold-bright transition hover:bg-gold/10"
                    >
                      <Download className="size-4" aria-hidden />
                      Download
                    </a>
                  </div>

                  <input
                    required
                    name="title"
                    defaultValue={selectedArtifact.title}
                    className="w-full rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm text-white outline-none"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      name="artifactType"
                      defaultValue={selectedArtifact.artifact_type}
                      className="rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm text-white outline-none"
                    >
                      {artifactTypes.map((artifactType) => (
                        <option
                          key={artifactType.value}
                          value={artifactType.value}
                        >
                          {artifactType.label}
                        </option>
                      ))}
                    </select>
                    <select
                      name="folderId"
                      defaultValue={selectedArtifact.folder_id ?? ""}
                      className="rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm text-white outline-none"
                    >
                      <option value="">Unfiled</option>
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    required
                    name="content"
                    rows={12}
                    defaultValue={selectedArtifact.content}
                    className="w-full rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 font-mono text-sm leading-6 text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="gold-gradient flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-black"
                  >
                    <FileText className="size-4" aria-hidden />
                    Save changes
                  </button>
                </form>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-panel-soft p-8 text-center">
                  <Eye className="mx-auto mb-4 size-8 text-gold" aria-hidden />
                  <h4 className="font-semibold text-white">
                    Select an artifact to view
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Saved artifacts can be reviewed, edited, duplicated,
                    deleted, or downloaded from this panel.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {studios.map((studio) => (
          <article
            key={studio.name}
            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-gold/40 hover:bg-gold/10"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
                <studio.icon className="size-5" aria-hidden />
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">
                Ready
              </span>
            </div>
            <h2 className="text-xl font-semibold text-white">{studio.name}</h2>
            <p className="mt-3 leading-6 text-muted">{studio.description}</p>
          </article>
        ))}
      </section>

      <section
        id="settings"
        className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 lg:grid-cols-3"
      >
        {[
          {
            title: "Authentication",
            body: "Email/password sessions are managed through Supabase Auth.",
          },
          {
            title: "Database",
            body: "Profiles, projects, files, artifact folders, artifacts, and research jobs are prepared with RLS-enabled SQL.",
          },
          {
            title: "Deployment",
            body: "Environment variables are ready for Vercel project settings.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-3xl bg-black/40 p-6">
            <ShieldCheck className="mb-6 size-6 text-gold" aria-hidden />
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-3 leading-6 text-muted">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
