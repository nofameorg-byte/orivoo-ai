import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileArchive,
  FolderKanban,
  Globe2,
  Trash2,
} from "lucide-react";
import {
  assignWebsiteToProject,
  deleteWebsiteProject,
  updateWebsitePage,
} from "@/app/actions/websites";
import { WebsiteActions } from "@/components/websites/website-actions";
import { WebsitePreview } from "@/components/websites/website-preview";
import type { GeneratedWebsitePage } from "@/lib/websites/generation";
import { createClient } from "@/lib/supabase/server";

type WebsiteDetailPageProps = {
  params: Promise<{
    websiteId: string;
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

export default async function WebsiteDetailPage({
  params,
  searchParams,
}: WebsiteDetailPageProps) {
  const { websiteId } = await params;
  const { message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to access Website Builder.");
  }

  const [
    { data: website, error: websiteError },
    { data: pages },
    { data: projects },
  ] = await Promise.all([
    supabase
      .from("website_projects")
      .select("id,title,description,prompt,project_id,status,created_at,updated_at")
      .eq("id", websiteId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("website_pages")
      .select("id,page_name,page_slug,page_content,created_at,updated_at")
      .eq("website_project_id", websiteId)
      .order("created_at", { ascending: true }),
    supabase
      .from("projects")
      .select("id,name")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  if (websiteError || !website) {
    notFound();
  }

  const projectName =
    projects?.find((project) => project.id === website.project_id)?.name ?? null;
  const previewPages: GeneratedWebsitePage[] = (pages ?? []).map((page) => ({
    page_content: page.page_content,
    page_name: page.page_name,
    page_slug: page.page_slug,
  }));

  return (
    <div id="workspace" className="space-y-6">
      <Link
        href="/dashboard/websites"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to Website Builder
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
              <Globe2 className="size-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
                Website Project
              </p>
              <h1 className="mt-3 break-words text-3xl font-semibold text-white sm:text-4xl">
                {website.title}
              </h1>
              <p className="mt-3 max-w-3xl leading-7 text-muted">
                {website.description}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[30rem]">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Status
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {website.status}
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
                Pages
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {pages?.length ?? 0}
              </p>
            </div>
          </div>
        </div>
        <p className="mt-5 text-xs text-muted">
          Created {formatDate(website.created_at)} · Updated{" "}
          {formatDate(website.updated_at)}
        </p>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr_auto] lg:items-end">
          <form action={assignWebsiteToProject}>
            <input type="hidden" name="websiteId" value={website.id} />
            <label className="text-sm font-medium text-white">
              Assign website to project
              <select
                name="projectId"
                defaultValue={website.project_id ?? ""}
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
            <p className="mb-2 text-sm font-medium text-white">Export Options</p>
            <div className="flex flex-wrap gap-2">
              {[
                ["html", "Export HTML"],
                ["next", "Export Next.js"],
                ["static", "Export Static Website"],
                ["zip", "Download ZIP"],
              ].map(([format, label]) => (
                <a
                  key={format}
                  href={`/api/websites/${website.id}/export?format=${
                    format === "zip" ? "static" : format
                  }`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-muted transition hover:border-gold/35 hover:text-white"
                >
                  {format === "html" ? (
                    <Download className="size-4" aria-hidden />
                  ) : (
                    <FileArchive className="size-4" aria-hidden />
                  )}
                  {label}
                </a>
              ))}
            </div>
          </div>

          <form action={deleteWebsiteProject}>
            <input type="hidden" name="websiteId" value={website.id} />
            <button className="inline-flex items-center gap-2 rounded-full border border-red-400/25 px-4 py-2.5 text-sm text-red-100 transition hover:bg-red-500/10">
              <Trash2 className="size-4" aria-hidden />
              Delete website
            </button>
          </form>
        </div>
      </section>

      <WebsitePreview pages={previewPages} websiteTitle={website.title} />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Page Editor
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Generated Pages
            </h2>
          </div>

          {pages?.length ? (
            <div className="space-y-5">
              {pages.map((page) => (
                <form
                  key={page.id}
                  action={updateWebsitePage}
                  className="rounded-3xl border border-white/10 bg-black/35 p-5"
                >
                  <input type="hidden" name="websiteId" value={website.id} />
                  <input type="hidden" name="pageId" value={page.id} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-white">
                      Page Name
                      <input
                        name="pageName"
                        defaultValue={page.page_name}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-gold/50"
                      />
                    </label>
                    <label className="text-sm font-medium text-white">
                      Page Slug
                      <input
                        name="pageSlug"
                        defaultValue={page.page_slug}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-gold/50"
                      />
                    </label>
                  </div>
                  <label className="mt-4 block text-sm font-medium text-white">
                    Page Content
                    <textarea
                      name="pageContent"
                      defaultValue={page.page_content}
                      className="mt-2 min-h-72 w-full resize-y rounded-2xl border border-white/10 bg-black/60 px-4 py-3 font-mono text-sm text-white outline-none focus:border-gold/50"
                    />
                  </label>
                  <button className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gold-bright">
                    Save page
                  </button>
                </form>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 p-6 text-sm text-muted">
              No generated pages yet. Run Generate Website or Regenerate Website.
            </div>
          )}
        </section>

        <WebsiteActions websiteId={website.id} />
      </div>
    </div>
  );
}
