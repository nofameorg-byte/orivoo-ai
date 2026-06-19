import {
  ArrowUp,
  Bot,
  Braces,
  Building2,
  FileText,
  FlaskConical,
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
} from "lucide-react";
import {
  deleteProjectFile,
  uploadProjectFile,
} from "@/app/actions/files";
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

type DashboardPageProps = {
  searchParams?: Promise<{
    fileMessage?: string;
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

  const metrics = [
    ...baseMetrics,
    { label: "Project files", value: filesWithUrls.length.toString() },
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
            body: "Profiles, projects, workspaces, and file metadata are prepared with RLS-enabled SQL.",
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
