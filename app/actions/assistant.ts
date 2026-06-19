"use server";

import { createClient } from "@/lib/supabase/server";
import { loadAssistantMessages } from "@/lib/assistant/server";
import type { LoadConversationResult } from "@/lib/assistant/types";

export async function loadAssistantConversation(
  conversationId: string,
): Promise<LoadConversationResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "You must be signed in to load conversations." };
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (conversationError) {
    return { ok: false, error: "Could not load the conversation." };
  }

  if (!conversation) {
    return { ok: false, error: "Conversation not found." };
  }

  return {
    ok: true,
    conversationId: conversation.id,
    messages: await loadAssistantMessages(supabase, conversation.id),
  };
}
