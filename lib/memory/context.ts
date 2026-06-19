import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import {
  extractMemoryCandidatesWithGroq,
  summarizeConversationWithGroq,
} from "@/lib/memory/groq";

type Supabase = SupabaseClient<Database>;

export type MemoryScope = {
  userId: string;
  workspaceId?: string | null;
  conversationId?: string | null;
};

export type ConversationScope = MemoryScope & {
  title?: string;
};

function formatSection(title: string, items: string[]) {
  return [title, ...(items.length > 0 ? items : ["None found."])].join("\n");
}

export async function loadMemoryContext(supabase: Supabase, scope: MemoryScope) {
  const [userMemoriesResult, workspaceKnowledgeResult] = await Promise.all([
    supabase
      .from("user_memories")
      .select("memory_type, content, importance")
      .eq("user_id", scope.userId)
      .order("importance", { ascending: false })
      .limit(12),
    scope.workspaceId
      ? supabase
          .from("workspace_knowledge")
          .select("title, content, created_at")
          .eq("workspace_id", scope.workspaceId)
          .order("created_at", { ascending: false })
          .limit(8)
      : Promise.resolve({ data: [] }),
  ]);
  const summariesQuery = supabase
    .from("conversation_summaries")
    .select("summary, created_at")
    .eq("user_id", scope.userId)
    .order("created_at", { ascending: false })
    .limit(3);

  if (scope.conversationId) {
    summariesQuery.eq("conversation_id", scope.conversationId);
  }

  const { data: summaries } = await summariesQuery;

  return [
    formatSection(
      "USER MEMORIES:",
      (userMemoriesResult.data ?? []).map(
        (memory) =>
          `- (${memory.memory_type}, importance ${memory.importance}) ${memory.content}`,
      ),
    ),
    "",
    formatSection(
      "WORKSPACE KNOWLEDGE:",
      (workspaceKnowledgeResult.data ?? []).map(
        (note) => `- ${note.title}: ${note.content}`,
      ),
    ),
    "",
    formatSection(
      "CONVERSATION SUMMARY:",
      (summaries ?? []).map((summary) => `- ${summary.summary}`),
    ),
  ].join("\n");
}

export function injectMemoryContext<T extends { role: string; content: string }>(
  messages: T[],
  memoryContext: string,
) {
  const systemIndex = messages.findIndex((message) => message.role === "system");
  const memoryBlock = `ORIVOO MEMORY CONTEXT\n\n${memoryContext}`;

  if (systemIndex >= 0) {
    return messages.map((message, index) =>
      index === systemIndex
        ? {
            ...message,
            content: `${message.content}\n\n${memoryBlock}`,
          }
        : message,
    );
  }

  return [
    {
      role: "system",
      content: memoryBlock,
    } as T,
    ...messages,
  ];
}

export async function ensureConversation(
  supabase: Supabase,
  scope: ConversationScope,
) {
  if (scope.conversationId) {
    const { data } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", scope.conversationId)
      .maybeSingle();

    if (data) {
      return data;
    }
  }

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      user_id: scope.userId,
      title: scope.title || "ORIVOO Conversation",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return conversation;
}

export async function processMemoryAfterResponse(
  supabase: Supabase,
  input: {
    userId: string;
    workspaceId?: string | null;
    conversationId?: string | null;
    title?: string;
    userMessage: string;
    assistantResponse: string;
    memoryContext: string;
  },
) {
  const conversation = await ensureConversation(supabase, {
    userId: input.userId,
    workspaceId: input.workspaceId,
    conversationId: input.conversationId,
    title: input.title,
  });

  await supabase.from("messages").insert([
    {
      conversation_id: conversation.id,
      user_id: input.userId,
      role: "user",
      content: input.userMessage,
    },
    {
      conversation_id: conversation.id,
      user_id: input.userId,
      role: "assistant",
      content: input.assistantResponse,
    },
  ]);

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversation.id);

  const candidates = await extractMemoryCandidatesWithGroq({
    userMessage: input.userMessage,
    assistantResponse: input.assistantResponse,
    memoryContext: input.memoryContext,
  });

  if (candidates.length > 0) {
    await supabase.from("memory_candidates").insert(
      candidates.map((candidate) => ({
        user_id: input.userId,
        conversation_id: conversation.id,
        memory_type: candidate.memory_type,
        content: candidate.content,
      })),
    );
  }

  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversation.id);

  if (count && count % 20 === 0) {
    const { data: messages } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });
    const summary = await summarizeConversationWithGroq({
      messages: messages ?? [],
    });

    if (summary) {
      await supabase.from("conversation_summaries").insert({
        conversation_id: conversation.id,
        user_id: input.userId,
        summary,
      });
    }
  }

  return conversation.id;
}
