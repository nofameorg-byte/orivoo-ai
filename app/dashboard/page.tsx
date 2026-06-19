import {
  BookOpen,
  Bot,
  Brain,
  FileText,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  DashboardAssistant,
  type DashboardConversation,
  type DashboardMessage,
} from "@/app/dashboard/dashboard-assistant";
import { createClient } from "@/lib/supabase/server";

const memoryLinks = [
  {
    title: "Memory Approval",
    description: "Review extracted memory candidates before they are saved.",
    href: "/dashboard/memory",
    icon: Brain,
  },
  {
    title: "Saved Memory",
    description: "Edit approved long-term user memories and context.",
    href: "/dashboard/memory/saved",
    icon: FileText,
  },
  {
    title: "Knowledge Base",
    description: "Create durable workspace knowledge for future AI context.",
    href: "/dashboard/knowledge",
    icon: BookOpen,
  },
];

type MemoryCandidatePreview = {
  id: string;
  memory_type: string;
  content: string;
  approved: boolean | null;
  created_at: string;
};

type WorkspaceKnowledgePreview = {
  id: string;
  workspace_id: string;
  title: string;
  content: string;
  knowledge_type: string | null;
  created_at: string;
};

type ConversationPreview = {
  id: string;
  user_id: string;
  title: string;
  model: string | null;
  created_at: string;
  updated_at: string;
};

type MessagePreview = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const displayName =
    (typeof user?.user_metadata.display_name === "string"
      ? user.user_metadata.display_name
      : user?.email?.split("@")[0]) ?? "Operator";

  const [
    workspacesResult,
    userMemoriesResult,
    memoryCandidatesResult,
    workspaceKnowledgeResult,
    conversationSummariesResult,
    conversationsResult,
    messagesResult,
    memoryEmbeddingsResult,
  ] = await Promise.all([
    supabase
      .from("workspaces")
      .select("id, name, created_at, updated_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("user_memories")
      .select("id, memory_type, content, importance, updated_at")
      .order("importance", { ascending: false })
      .limit(5),
    supabase
      .from("memory_candidates")
      .select("id, memory_type, content, approved, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("workspace_knowledge")
      .select("id, workspace_id, title, content, knowledge_type, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("conversation_summaries")
      .select("id, conversation_id, user_id, summary, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("conversations")
      .select("id, user_id, title, model, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50),
    supabase
      .from("messages")
      .select("id, conversation_id, role, content, created_at")
      .order("created_at", { ascending: true })
      .limit(500),
    supabase
      .from("memory_embeddings")
      .select("id", { count: "exact", head: true }),
  ]);

  const workspaces = workspacesResult.data ?? [];
  const userMemories = userMemoriesResult.data ?? [];
  const memoryCandidates = (memoryCandidatesResult.data ??
    []) as unknown as MemoryCandidatePreview[];
  const workspaceKnowledge = (workspaceKnowledgeResult.data ??
    []) as unknown as WorkspaceKnowledgePreview[];
  const conversationSummaries = conversationSummariesResult.data ?? [];
  const conversations = (conversationsResult.data ??
    []) as unknown as ConversationPreview[];
  const messages = (messagesResult.data ?? []) as unknown as MessagePreview[];
  const selectedWorkspaceId = workspaces[0]?.id ?? null;
  const metrics = [
    { label: "Workspaces", value: workspaces.length.toString() },
    { label: "Saved memories", value: userMemories.length.toString() },
    { label: "Pending memories", value: memoryCandidates.length.toString() },
    { label: "Knowledge notes", value: workspaceKnowledge.length.toString() },
    {
      label: "Messages",
      value: messages.length.toString(),
    },
    {
      label: "Embedding records",
      value: (memoryEmbeddingsResult.count ?? 0).toString(),
    },
  ];

  return (
    <div className="space-y-8">
      <section className="surface-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm text-gold-bright">
            <Sparkles className="size-4" aria-hidden />
            ORIVOO AI Dashboard
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Welcome back, {displayName}. Your workspace memory is ready.
          </h1>
          <p className="mt-5 max-w-3xl leading-7 text-muted">
            ORIVOO now loads workspace knowledge, approved user memories, and
            conversation summaries before AI responses. Memory candidates remain
            reviewable before they become long-term context.
          </p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-white/10 bg-black/40 p-5"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              {metric.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {metric.value}
            </p>
          </div>
        ))}
      </section>

      <DashboardAssistant
        conversations={conversations as DashboardConversation[]}
        messages={messages as DashboardMessage[]}
        workspaceId={selectedWorkspaceId}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        {memoryLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-gold/40 hover:bg-gold/10"
          >
            <div className="mb-6 flex size-12 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
              <item.icon className="size-5" aria-hidden />
            </div>
            <h2 className="text-xl font-semibold text-white">{item.title}</h2>
            <p className="mt-3 leading-6 text-muted">{item.description}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-gold/20 bg-gold/10 text-gold">
              <Bot className="size-4" aria-hidden />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Workspaces
              </p>
              <h2 className="text-xl font-semibold text-white">
                Workspace context
              </h2>
            </div>
          </div>
          <div className="space-y-3">
            {workspaces.length > 0 ? (
              workspaces.map((workspace) => (
                <article
                  key={workspace.id}
                  className="rounded-2xl border border-white/10 bg-panel-soft p-4"
                >
                  <h3 className="font-medium text-white">{workspace.name}</h3>
                  <p className="mt-2 text-xs text-muted">
                    Created {formatDate(workspace.created_at)}
                  </p>
                </article>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 bg-panel-soft p-5 text-sm leading-6 text-muted">
                No workspaces were returned for this user.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-gold/20 bg-gold/10 text-gold">
              <Brain className="size-4" aria-hidden />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Conversation memory
              </p>
              <h2 className="text-xl font-semibold text-white">
                Recent summaries
              </h2>
            </div>
          </div>
          <div className="space-y-3">
            {conversationSummaries.length > 0 ? (
              conversationSummaries.map((summary) => (
                <article
                  key={summary.id}
                  className="rounded-2xl border border-white/10 bg-panel-soft p-4"
                >
                  <p className="text-sm leading-6 text-white">
                    {summary.summary}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    Created {formatDate(summary.created_at)}
                  </p>
                </article>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 bg-panel-soft p-5 text-sm leading-6 text-muted">
                Conversation summaries will appear after every 20 messages.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
          <h2 className="text-lg font-semibold text-white">
            Pending memory candidates
          </h2>
          <div className="mt-4 space-y-3">
            {memoryCandidates.length > 0 ? (
              memoryCandidates.map((candidate) => (
                <p
                  key={candidate.id}
                  className="rounded-2xl border border-white/10 bg-panel-soft p-4 text-sm leading-6 text-muted"
                >
                  {candidate.content}
                </p>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted">
                No pending memory candidates.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
          <h2 className="text-lg font-semibold text-white">Saved memories</h2>
          <div className="mt-4 space-y-3">
            {userMemories.length > 0 ? (
              userMemories.map((memory) => (
                <p
                  key={memory.id}
                  className="rounded-2xl border border-white/10 bg-panel-soft p-4 text-sm leading-6 text-muted"
                >
                  {memory.content}
                </p>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted">
                No approved memories yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
          <h2 className="text-lg font-semibold text-white">
            Workspace knowledge
          </h2>
          <div className="mt-4 space-y-3">
            {workspaceKnowledge.length > 0 ? (
              workspaceKnowledge.map((note) => (
                <article
                  key={note.id}
                  className="rounded-2xl border border-white/10 bg-panel-soft p-4"
                >
                  <h3 className="font-medium text-white">{note.title}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gold-bright">
                    {note.knowledge_type}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {note.content}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted">
                No workspace knowledge notes yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-muted">
          Recent conversations
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <article
                key={conversation.id}
                className="rounded-2xl border border-white/10 bg-black/40 p-4"
              >
                <h3 className="font-medium text-white">{conversation.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gold-bright">
                  {conversation.model}
                </p>
                <p className="mt-2 text-xs text-muted">
                  Updated {formatDate(conversation.updated_at)}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm text-muted">
              Conversations will appear after AI responses are stored.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
