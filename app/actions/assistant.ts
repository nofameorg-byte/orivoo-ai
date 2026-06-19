"use server";

import { createClient } from "@/lib/supabase/server";
import {
  canUseAssistantModel,
  normalizeAssistantModelId,
  normalizeSubscriptionTier,
} from "@/lib/assistant/models";
import { normalizeAssistantStudioId } from "@/lib/assistant/studios";
import { loadAssistantMessages } from "@/lib/assistant/server";
import type {
  CreateProjectResult,
  LoadConversationResult,
  LoadProjectResult,
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

export async function createAssistantProject(input: {
  name: string;
  description?: string;
  studio: string;
}): Promise<CreateProjectResult> {
  const name = input.name.trim();

  if (!name) {
    return { ok: false, error: "Enter a project name." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "You must be signed in to create a project." };
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name,
      description: input.description?.trim() || null,
      studio: normalizeAssistantStudioId(input.studio),
    })
    .select("id, name, description, studio, created_at, updated_at")
    .single();

  if (error || !project) {
    return { ok: false, error: "Could not create the project." };
  }

  return { ok: true, project };
}

export async function loadAssistantProject(
  projectId: string,
): Promise<LoadProjectResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "You must be signed in to load projects." };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (projectError) {
    return { ok: false, error: "Could not load the project." };
  }

  if (!project) {
    return { ok: false, error: "Project not found." };
  }

  const { data: linkedRows, error: linkError } = await supabase
    .from("project_conversations")
    .select("conversation_id")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false });

  if (linkError) {
    return { ok: false, error: "Could not load project conversations." };
  }

  const conversationIds = linkedRows?.map((row) => row.conversation_id) ?? [];

  if (conversationIds.length === 0) {
    return {
      ok: true,
      projectId: project.id,
      conversations: [],
      activeConversationId: null,
      messages: [],
    };
  }

  const { data: conversations, error: conversationsError } = await supabase
    .from("conversations")
    .select("id, title, created_at, updated_at")
    .in("id", conversationIds)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (conversationsError) {
    return { ok: false, error: "Could not load project conversations." };
  }

  const orderedConversations = conversations ?? [];
  const activeConversationId = orderedConversations[0]?.id ?? null;

  return {
    ok: true,
    projectId: project.id,
    conversations: orderedConversations,
    activeConversationId,
    messages: activeConversationId
      ? await loadAssistantMessages(supabase, activeConversationId)
      : [],
  };
}
