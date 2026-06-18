import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  FileText,
  FolderKanban,
  Link2,
  Search,
  Trash2,
} from "lucide-react";
import {
  assignAssetToProject,
  deleteProject,
  removeAssetFromProject,
  updateProject,
} from "@/app/actions/projects";
import { createClient } from "@/lib/supabase/server";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
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

export default async function ProjectDetailPage({
  params,
  searchParams,
}: ProjectDetailPageProps) {
  const { projectId } = await params;
  const { message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to access this project.");
  }

  const [
    { data: project, error: projectError },
    { data: projectConversations },
    { data: projectDocuments },
    { data: projectReports },
    { data: availableConversations },
    { data: availableDocuments },
    { data: availableReports },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id,name,description,status,created_at,updated_at")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("conversations")
      .select("id,title,updated_at")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("documents")
      .select("id,title,file_name,file_type,status,updated_at")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("research_reports")
      .select("id,title,topic,updated_at")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("conversations")
      .select("id,title,updated_at")
      .is("project_id", null)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("documents")
      .select("id,title,file_name,updated_at")
      .is("project_id", null)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("research_reports")
      .select("id,title,topic,updated_at")
      .is("project_id", null)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  if (projectError || !project) {
    notFound();
  }

  return (
    <div id="workspace" className="space-y-6">
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to projects
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
              <FolderKanban className="size-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
                Project
              </p>
              <h1 className="mt-3 break-words text-3xl font-semibold text-white sm:text-4xl">
                {project.name}
              </h1>
              <p className="mt-3 max-w-3xl leading-7 text-muted">
                {project.description ??
                  "No description yet. Add one below to guide future ORIVOO studios."}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-muted">
            {project.status} · Updated {formatDate(project.updated_at)}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-semibold text-white">Edit project</h2>
          <form action={updateProject} className="mt-6 space-y-4">
            <input type="hidden" name="projectId" value={project.id} />
            <label className="block">
              <span className="text-sm font-medium text-white">Name</span>
              <input
                required
                name="name"
                defaultValue={project.name}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none transition focus:border-gold/50"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-white">
                Description
              </span>
              <textarea
                name="description"
                defaultValue={project.description ?? ""}
                className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none transition focus:border-gold/50"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-white">Status</span>
              <select
                name="status"
                defaultValue={project.status}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none transition focus:border-gold/50"
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gold-bright"
            >
              Save project
            </button>
          </form>

          <form action={deleteProject} className="mt-4">
            <input type="hidden" name="projectId" value={project.id} />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-red-400/25 px-5 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/10"
            >
              <Trash2 className="size-4" aria-hidden />
              Delete project
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-semibold text-white">Assign assets</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Add unassigned chats and documents to make this project the shared
            workspace for every future studio.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <form action={assignAssetToProject} className="rounded-3xl border border-white/10 bg-black/35 p-4">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="assetType" value="conversation" />
              <Bot className="mb-4 size-5 text-gold" aria-hidden />
              <label className="block text-sm font-medium text-white">
                Add chat
                <select
                  name="assetId"
                  required
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-gold/50"
                >
                  <option value="">Choose chat</option>
                  {(availableConversations ?? []).map((conversation) => (
                    <option key={conversation.id} value={conversation.id}>
                      {conversation.title}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="mt-4 w-full rounded-full border border-gold/35 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold-bright transition hover:bg-gold/15"
              >
                Assign chat
              </button>
            </form>

            <form action={assignAssetToProject} className="rounded-3xl border border-white/10 bg-black/35 p-4">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="assetType" value="document" />
              <FileText className="mb-4 size-5 text-gold" aria-hidden />
              <label className="block text-sm font-medium text-white">
                Add document
                <select
                  name="assetId"
                  required
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-gold/50"
                >
                  <option value="">Choose document</option>
                  {(availableDocuments ?? []).map((document) => (
                    <option key={document.id} value={document.id}>
                      {document.title}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="mt-4 w-full rounded-full border border-gold/35 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold-bright transition hover:bg-gold/15"
              >
                Assign document
              </button>
            </form>

            <form action={assignAssetToProject} className="rounded-3xl border border-white/10 bg-black/35 p-4">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="assetType" value="research_report" />
              <Search className="mb-4 size-5 text-gold" aria-hidden />
              <label className="block text-sm font-medium text-white">
                Add report
                <select
                  name="assetId"
                  required
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-gold/50"
                >
                  <option value="">Choose report</option>
                  {(availableReports ?? []).map((report) => (
                    <option key={report.id} value={report.id}>
                      {report.title}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="mt-4 w-full rounded-full border border-gold/35 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold-bright transition hover:bg-gold/15"
              >
                Assign report
              </button>
            </form>
          </div>
        </section>
      </div>

      <section className="grid gap-6 xl:grid-cols-3">
        <AssetList
          title="Project chats"
          empty="No chats are assigned to this project yet."
          icon="chat"
          projectId={project.id}
          assetType="conversation"
          assets={(projectConversations ?? []).map((conversation) => ({
            href: `/dashboard?conversationId=${conversation.id}`,
            id: conversation.id,
            subtitle: `Updated ${formatDate(conversation.updated_at)}`,
            title: conversation.title,
          }))}
        />
        <AssetList
          title="Project documents"
          empty="No documents are assigned to this project yet."
          icon="document"
          projectId={project.id}
          assetType="document"
          assets={(projectDocuments ?? []).map((document) => ({
            href: `/dashboard/document-studio/${document.id}`,
            id: document.id,
            subtitle: `${document.file_name} · ${document.status}`,
            title: document.title,
          }))}
        />
        <AssetList
          title="Project reports"
          empty="No research reports are assigned to this project yet."
          icon="report"
          projectId={project.id}
          assetType="research_report"
          assets={(projectReports ?? []).map((report) => ({
            href: `/dashboard/research/${report.id}`,
            id: report.id,
            subtitle: report.topic,
            title: report.title,
          }))}
        />
      </section>
    </div>
  );
}

function AssetList({
  assets,
  assetType,
  empty,
  icon,
  projectId,
  title,
}: {
  assets: {
    href: string;
    id: string;
    subtitle: string;
    title: string;
  }[];
  assetType: "conversation" | "document" | "research_report";
  empty: string;
  icon: "chat" | "document" | "report";
  projectId: string;
  title: string;
}) {
  const Icon = icon === "chat" ? Bot : icon === "report" ? Search : FileText;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-5 flex items-center gap-3">
        <Icon className="size-6 text-gold" aria-hidden />
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
      </div>

      {assets.length ? (
        <div className="space-y-3">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="rounded-3xl border border-white/10 bg-black/35 p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link href={asset.href} className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {asset.title}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted">
                    {asset.subtitle}
                  </p>
                </Link>
                <form action={removeAssetFromProject} className="shrink-0">
                  <input type="hidden" name="projectId" value={projectId} />
                  <input type="hidden" name="assetId" value={asset.id} />
                  <input type="hidden" name="assetType" value={assetType} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-muted transition hover:border-gold/35 hover:text-white"
                  >
                    <Link2 className="size-3.5" aria-hidden />
                    Remove
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/10 p-6 text-sm text-muted">
          {empty}
        </div>
      )}
    </div>
  );
}
