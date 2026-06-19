import { Save, Trash2 } from "lucide-react";
import { deleteUserMemory, updateUserMemory } from "@/app/actions/memory";
import { createClient } from "@/lib/supabase/server";

type SavedMemoryPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function SavedMemoryPage({
  searchParams,
}: SavedMemoryPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: memories } = user
    ? await supabase
        .from("user_memories")
        .select("id, memory_type, content, importance, updated_at")
        .eq("user_id", user.id)
        .order("importance", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-gold-bright">
          Saved memory
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white">
          Manage approved memories.
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          Edit long-term user memories, delete outdated context, or adjust
          importance scores used during memory retrieval.
        </p>
        {params?.message ? (
          <div className="mt-5 rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-gold-bright">
            {params.message}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {(memories ?? []).map((memory) => (
          <article
            key={memory.id}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
          >
            <form action={updateUserMemory} className="space-y-3">
              <input type="hidden" name="memoryId" value={memory.id} />
              <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
                <input
                  name="memoryType"
                  defaultValue={memory.memory_type}
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
                name="content"
                rows={5}
                defaultValue={memory.content}
                className="w-full rounded-2xl border border-white/10 bg-panel-soft px-4 py-3 text-sm leading-6 text-white outline-none"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-4 py-2 text-sm text-gold-bright"
                >
                  <Save className="size-4" aria-hidden />
                  Save
                </button>
              </div>
            </form>
            <form action={deleteUserMemory} className="mt-3">
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
