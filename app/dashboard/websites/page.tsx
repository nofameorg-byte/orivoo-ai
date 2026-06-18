import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  FolderKanban,
  Globe2,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  deleteWebsiteProject,
  generateWebsite,
} from "@/app/actions/websites";
import { createClient } from "@/lib/supabase/server";

type WebsitesPageProps = {
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

export default async function WebsitesPage({ searchParams }: WebsitesPageProps) {
  const { message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to access Website Builder.");
  }

  const [{ data: websites }, { data: projects }] = await Promise.all([
    supabase
      .from("website_projects")
      .select("id,title,description,prompt,project_id,status,created_at,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
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
            Website Builder
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Generate complete websites from business prompts.
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-muted">
            Create full website projects with core pages, SEO metadata, CTAs,
            policies, page editing, previews, and export-ready code.
          </p>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <form action={generateWebsite} className="surface-card rounded-[2rem] p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Generate Website
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Describe the business
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-white">
                Website Name
              </span>
              <input
                required
                name="websiteName"
                placeholder="Palmetto Roofing Co."
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none transition placeholder:text-muted/70 focus:border-gold/50"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-white">
                Business Type
              </span>
              <input
                required
                name="businessType"
                placeholder="Roofing Company"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none transition placeholder:text-muted/70 focus:border-gold/50"
              />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-white">Description</span>
            <textarea
              required
              name="description"
              placeholder="Local roofing company serving homeowners with roof repair, replacement, and emergency storm response."
              className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none transition placeholder:text-muted/70 focus:border-gold/50"
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
          <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gold-bright">
            <Globe2 className="size-4" aria-hidden />
            Generate Website
          </button>
        </form>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
            Website types
          </p>
          <div className="mt-5 grid gap-3">
            {[
              "Roofing Company",
              "Nonprofit Organization",
              "Law Firm",
              "Restaurant",
              "Real Estate Agency",
            ].map((type) => (
              <div
                key={type}
                className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-muted"
              >
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Website history
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Generated websites
            </h2>
          </div>
          <Globe2 className="size-6 text-gold" aria-hidden />
        </div>

        {websites?.length ? (
          <div className="grid gap-4">
            {websites.map((website) => (
              <article
                key={website.id}
                className="rounded-3xl border border-white/10 bg-black/35 p-5"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-white">
                      {website.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                      {website.description}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold">
                      <FolderKanban className="size-3.5" aria-hidden />
                      {website.project_id
                        ? projectNames.get(website.project_id) ?? "Project"
                        : "No project"}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      Updated {formatDate(website.updated_at)} · {website.status}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/dashboard/websites/${website.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gold-bright"
                    >
                      Open builder
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                    <form action={deleteWebsiteProject}>
                      <input type="hidden" name="websiteId" value={website.id} />
                      <button className="inline-flex items-center gap-2 rounded-full border border-red-400/25 px-4 py-2 text-sm text-red-100 transition hover:bg-red-500/10">
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
            <Globe2 className="mx-auto mb-4 size-10 text-gold" aria-hidden />
            <h3 className="text-xl font-semibold text-white">
              No websites yet
            </h3>
            <p className="mt-3 text-muted">
              Generate your first website from a business prompt above.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
