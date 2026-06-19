import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AssistantConversation,
  AssistantMessage,
  AssistantRole,
} from "@/lib/assistant/types";
import type { Database } from "@/lib/database.types";

export type AssistantSupabaseClient = SupabaseClient<Database>;

export async function getOrCreateAssistantConversation({
  supabase,
  userId,
  conversationId,
  prompt,
}: {
  supabase: AssistantSupabaseClient;
  userId: string;
  conversationId?: string | null;
  prompt: string;
}): Promise<
  | {
      ok: true;
      conversationId: string;
    }
  | {
      ok: false;
      error: string;
    }
> {
  if (conversationId) {
    const { data, error } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return { ok: false, error: "Could not load the conversation." };
    }

    if (!data) {
      return { ok: false, error: "Conversation not found." };
    }

    return { ok: true, conversationId: data.id };
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: userId,
      title: createConversationTitle(prompt),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: "Could not create a conversation." };
  }

  return { ok: true, conversationId: data.id };
}

export async function loadGroqMessageHistory(
  supabase: AssistantSupabaseClient,
  conversationId: string,
): Promise<
  | {
      ok: true;
      messages: Array<{
        role: AssistantRole;
        content: string;
      }>;
    }
  | {
      ok: false;
      error: string;
    }
> {
  const { data, error } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(20);

  if (error) {
    return { ok: false, error: "Could not load conversation history." };
  }

  return {
    ok: true,
    messages: data ?? [],
  };
}

export async function loadAssistantMessages(
  supabase: AssistantSupabaseClient,
  conversationId: string,
): Promise<AssistantMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function loadAssistantConversationSummary(
  supabase: AssistantSupabaseClient,
  conversationId: string,
): Promise<AssistantConversation> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, created_at, updated_at")
    .eq("id", conversationId)
    .single();

  if (error || !data) {
    throw new Error("Could not load the conversation summary.");
  }

  return data;
}

function createConversationTitle(prompt: string) {
  const title = prompt.replace(/\s+/g, " ").trim();

  if (title.length <= 80) {
    return title;
  }

  return `${title.slice(0, 77)}...`;
}
