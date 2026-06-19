import { CheckCircle2, Trash2, XCircle } from "lucide-react";
import {
  approveMemoryCandidate,
  rejectMemoryCandidate,
} from "@/app/actions/memory";
import { createClient } from "@/lib/supabase/server";

type MemoryPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function MemoryPage({ searchParams }: MemoryPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: candidates } = user
    ? await supabase
        .from("memory_candidates")
        .select("id, memory_type, content, importance, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-gold-bright">
          Memory approval
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white">
          Review memory candidates.
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          ORIVOO stores extracted memories here for approval. Nothing is added
          to long-term memory until you approve it.
        </p>
        {params?.message ? (
          <div className="mt-5 rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-gold-bright">
            {params.message}
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        {(candidates ?? []).length > 0 ? (
          candidates?.map((candidate) => (
            <article
              key={candidate.id}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gold-bright">
                    {candidate.memory_type} / importance {candidate.importance}
                  </p>
                  <p className="mt-3 leading-7 text-white">
                    {candidate.content}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <form action={approveMemoryCandidate}>
                    <input
                      type="hidden"
                      name="candidateId"
                      value={candidate.id}
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-4 py-2 text-sm text-gold-bright"
                    >
                      <CheckCircle2 className="size-4" aria-hidden />
                      Approve
                    </button>
                  </form>
                  <form action={rejectMemoryCandidate}>
                    <input
                      type="hidden"
                      name="candidateId"
                      value={candidate.id}
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full border border-red-400/20 px-4 py-2 text-sm text-red-200"
                    >
                      <XCircle className="size-4" aria-hidden />
                      Reject
                    </button>
                  </form>
                  <form action={rejectMemoryCandidate}>
                    <input
                      type="hidden"
                      name="candidateId"
                      value={candidate.id}
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-muted"
                    >
                      <Trash2 className="size-4" aria-hidden />
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
            <h2 className="text-xl font-semibold text-white">
              No pending memories
            </h2>
            <p className="mt-3 text-muted">
              Candidates extracted after AI responses will appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
