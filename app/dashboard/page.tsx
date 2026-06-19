import { ShieldCheck, Sparkles } from "lucide-react";
import { AssistantWorkspace } from "@/app/dashboard/assistant-workspace";
import type {
  AssistantConversation,
  AssistantMessage,
} from "@/lib/assistant/types";
import { createClient } from "@/lib/supabase/server";

const metrics = [
  { label: "Active studios", value: "14" },
  { label: "Auth provider", value: "Supabase" },
  { label: "Deploy target", value: "Vercel" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
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
  let initialConversationId: string | null = null;
  let initialConversations: AssistantConversation[] = [];
  let initialMessages: AssistantMessage[] = [];

  if (user) {
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id, title, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    initialConversations = conversations ?? [];
    initialConversationId = initialConversations[0]?.id ?? null;

    if (initialConversationId) {
      const { data: messages } = await supabase
        .from("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", initialConversationId)
        .order("created_at", { ascending: true });

      initialMessages = messages ?? [];
    }
  }

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

        <AssistantWorkspace
          initialConversations={initialConversations}
          initialConversationId={initialConversationId}
          initialMessages={initialMessages}
        />
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
            body: "Profiles and workspaces are prepared with RLS-enabled SQL.",
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
