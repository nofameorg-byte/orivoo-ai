"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteConversation(conversationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Login required.");
  }

  const { data: conversation, error: lookupError } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError) {
    throw new Error(lookupError.message);
  }

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  const { error: messageDeleteError } = await supabase
    .from("messages")
    .delete()
    .eq("conversation_id", conversation.id);

  if (messageDeleteError) {
    throw new Error(messageDeleteError.message);
  }

  const { error: conversationDeleteError } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversation.id)
    .eq("user_id", user.id);

  if (conversationDeleteError) {
    throw new Error(conversationDeleteError.message);
  }

  revalidatePath("/dashboard");
}
