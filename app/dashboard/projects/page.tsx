import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Bot,
  FileText,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { createClient } from "@/lib/supabase/server";

type ProjectsPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to access ORIVOO projects.");
  }

  const [{ data: projects }, { data: conversations }, { data: documents }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id,name,description,status,created_at,updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("conversations")
        .select("id,project_id")
        .eq("user_id", user.id),
      supabase.from("documents").select("id,project_id").eq("user_id", user.id),
    ]);

  const chatCounts = new Map<string, number>();
  const documentCounts = new Map<string, number>();

  for (const conversation of conversations ?? []) {
    if (conversation.project_id) {
      chatCounts.set(
        conversation.project_id,
        (chatCounts.get(conversation.project_id) ?? 0) + 1,
      );
    }
  }

  for (const document of documents ?? []) {
    if (document.project_id) {
      documentCounts.set(
        document.project_id,
        (documentCounts.get(document.project_id) ?? 0) + 1,
      );
    }
  }

  return (
    <div id="workspace" className="space-y-8">
      <section className="surface-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm text-gold-bright">
              <Sparkles className="size-4" aria-hidden />
              Projects
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Organize every ORIVOO studio around projects.
            </h1>
            <p className="mt-5 max-w-2xl leading-7 text-muted">
              Projects are the foundation for chats, documents, and future
              studio assets. Create a project, assign work, and see everything
              in one place.
            </p>
          </div>
          <CreateProjectModal />
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
          {message}
        </div>
      ) : null}

      {projects?.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-gold/40 hover:bg-gold/10"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
                  <FolderKanban className="size-5" aria-hidden />
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">
                  {project.status}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-white">
                {project.name}
              </h2>
              <p className="mt-3 line-clamp-3 min-h-[4.5rem] leading-6 text-muted">
                {project.description ??
                  "No description yet. Open this project to add context and assets."}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
                  <Bot className="mb-3 size-4 text-gold" aria-hidden />
                  <p className="text-sm text-white">
                    {chatCounts.get(project.id) ?? 0} chats
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
                  <FileText className="mb-3 size-4 text-gold" aria-hidden />
                  <p className="text-sm text-white">
                    {documentCounts.get(project.id) ?? 0} documents
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between text-sm text-muted">
                <span>Updated {formatDate(project.updated_at)}</span>
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5 group-hover:text-gold" />
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
          <FolderKanban className="mx-auto mb-5 size-12 text-gold" aria-hidden />
          <h2 className="text-2xl font-semibold text-white">
            Create your first project
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Start by creating a project for a client, product, research
            initiative, or operating plan.
          </p>
          <div className="mt-6">
            <CreateProjectModal />
          </div>
        </section>
      )}
    </div>
  );
}
