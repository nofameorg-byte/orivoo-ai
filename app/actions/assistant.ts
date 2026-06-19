"use server";

import { createClient } from "@/lib/supabase/server";
import {
  canUseAssistantModel,
  normalizeAssistantModelId,
  normalizeSubscriptionTier,
} from "@/lib/assistant/models";
import { loadAssistantMessages } from "@/lib/assistant/server";
import type {
  LoadConversationResult,
  SelectAssistantModelResult,
} from "@/lib/assistant/types";

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

export async function selectAssistantModel(
  modelId: string,
): Promise<SelectAssistantModelResult> {
  const selectedModel = normalizeAssistantModelId(modelId);
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "You must be signed in to choose a model." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { ok: false, error: "Could not load your subscription tier." };
  }

  const subscriptionTier = normalizeSubscriptionTier(
    profile?.subscription_tier,
  );

  if (
    !canUseAssistantModel({
      modelId: selectedModel,
      subscriptionTier,
    })
  ) {
    return {
      ok: false,
      error: "Upgrade to ORIVOO Pro to access premium models.",
    };
  }

  const { error: updateError } = await supabase.from("profiles").upsert({
    id: user.id,
    subscription_tier: subscriptionTier,
    selected_model: selectedModel,
  });

  if (updateError) {
    return { ok: false, error: "Could not save your selected model." };
  }

  return { ok: true, selectedModel };
}
