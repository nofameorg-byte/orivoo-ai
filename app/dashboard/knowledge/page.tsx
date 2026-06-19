import { BookOpen, Save, Trash2 } from "lucide-react";
import {
  createWorkspaceKnowledge,
  deleteWorkspaceKnowledge,
  updateWorkspaceKnowledge,
} from "@/app/actions/memory";
import { createClient } from "@/lib/supabase/server";

type KnowledgePageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function KnowledgePage({ searchParams }: KnowledgePageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: workspaces } = user
    ? await supabase
        .from("workspaces")
        .select("id, name")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true })
    : { data: [] };
  const { data: notes } = user
    ? await supabase
        .from("workspace_knowledge")
        .select("id, workspace_id, title, content, updated_at")
        .order("updated_at", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-gold-bright">
          Knowledge base
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white">
          Workspace knowledge.
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          Create and maintain durable workspace-level notes that are injected
          into future AI context.
        </p>
        {params?.message ? (
          <div className="mt-5 rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-gold-bright">
            {params.message}
          </div>
        ) : null}
      </section>

      <form
        action={createWorkspaceKnowledge}
        className="rounded-3xl border border-gold/20 bg-black/40 p-5"
      >
        <div className="mb-4 flex items-center gap-3">
          <BookOpen className="size-5 text-gold" aria-hidden />
          <h2 className="text-xl font-semibold text-white">
            Create knowledge note
          </h2>
        </div>
        <div className="grid gap-3 lg:grid-cols-[0.8fr_1fr]">
          <select
            required
            name="workspaceId"
            className="rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">Assign to workspace</option>
            {(workspaces ?? []).map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
          <input
            required
            name="title"
            placeholder="Knowledge title"
            className="rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm text-white outline-none placeholder:text-muted"
          />
        </div>
        <textarea
          required
          name="content"
          rows={5}
          placeholder="Write reusable workspace knowledge..."
          className="mt-3 w-full rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          className="gold-gradient mt-3 rounded-full px-5 py-3 text-sm font-semibold text-black"
        >
          Create note
        </button>
      </form>

      <section className="grid gap-4 xl:grid-cols-2">
        {(notes ?? []).map((note) => (
          <article
            key={note.id}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
          >
            <form action={updateWorkspaceKnowledge} className="space-y-3">
              <input type="hidden" name="noteId" value={note.id} />
              <input
                required
                name="title"
                defaultValue={note.title}
                className="w-full rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm text-white outline-none"
              />
              <textarea
                required
                name="content"
                rows={6}
                defaultValue={note.content}
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
            <form action={deleteWorkspaceKnowledge} className="mt-3">
              <input type="hidden" name="noteId" value={note.id} />
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
