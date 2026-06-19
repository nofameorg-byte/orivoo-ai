import { FolderPlus, Save, Trash2 } from "lucide-react";
import {
  createProjectMemory,
  deleteProjectMemory,
  updateProjectMemory,
} from "@/app/actions/memory";
import { createClient } from "@/lib/supabase/server";

type ProjectsPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: projects } = user
    ? await supabase
        .from("projects")
        .select("id, name")
        .order("created_at", { ascending: true })
    : { data: [] };
  const { data: memories } = user
    ? await supabase
        .from("project_memories")
        .select("id, project_id, title, summary, importance, updated_at")
        .order("importance", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-gold-bright">
          Project memory
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white">
          Project summaries and memory.
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          Store durable project-specific summaries that ORIVOO uses when
          building memory context for future AI responses.
        </p>
        {params?.message ? (
          <div className="mt-5 rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-gold-bright">
            {params.message}
          </div>
        ) : null}
      </section>

      <form
        action={createProjectMemory}
        className="rounded-3xl border border-gold/20 bg-black/40 p-5"
      >
        <div className="mb-4 flex items-center gap-3">
          <FolderPlus className="size-5 text-gold" aria-hidden />
          <h2 className="text-xl font-semibold text-white">
            Create project memory
          </h2>
        </div>
        <div className="grid gap-3 lg:grid-cols-[0.8fr_1fr_8rem]">
          <select
            required
            name="projectId"
            className="rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">Assign to project</option>
            {(projects ?? []).map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <input
            required
            name="title"
            placeholder="Memory title"
            className="rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm text-white outline-none placeholder:text-muted"
          />
          <input
            name="importance"
            type="number"
            min={1}
            max={10}
            defaultValue={5}
            className="rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm text-white outline-none"
          />
        </div>
        <textarea
          required
          name="summary"
          rows={5}
          placeholder="Write the project memory summary..."
          className="mt-3 w-full rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          className="gold-gradient mt-3 rounded-full px-5 py-3 text-sm font-semibold text-black"
        >
          Create memory
        </button>
      </form>

      <section className="grid gap-4 xl:grid-cols-2">
        {(memories ?? []).map((memory) => (
          <article
            key={memory.id}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
          >
            <form action={updateProjectMemory} className="space-y-3">
              <input type="hidden" name="memoryId" value={memory.id} />
              <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
                <input
                  required
                  name="title"
                  defaultValue={memory.title}
                  className="rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm text-white outline-none"
                />
                <input
                  name="importance"
                  type="number"
                  min={1}
                  max={10}
                  defaultValue={memory.importance}
                  className="rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm text-white outline-none"
                />
              </div>
              <textarea
                required
                name="summary"
                rows={6}
                defaultValue={memory.summary}
                className="w-full rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm leading-6 text-white outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-4 py-2 text-sm text-gold-bright"
              >
                <Save className="size-4" aria-hidden />
                Save
              </button>
            </form>
            <form action={deleteProjectMemory} className="mt-3">
              <input type="hidden" name="memoryId" value={memory.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-red-400/20 px-4 py-2 text-sm text-red-200"
              >
                <Trash2 className="size-4" aria-hidden />
                Delete
              </button>
            </form>
          </article>
        ))}
      </section>
    </div>
  );
}
