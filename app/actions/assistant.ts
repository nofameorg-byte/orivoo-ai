"use server";

import { createClient } from "@/lib/supabase/server";
import {
  canUseAssistantModel,
  normalizeAssistantModelId,
  normalizeSubscriptionTier,
} from "@/lib/assistant/models";
import { normalizeAssistantStudioId } from "@/lib/assistant/studios";
import {
  loadAssistantMessages,
  loadProjectMemory,
} from "@/lib/assistant/server";
import type {
  CreateProjectResult,
  DeleteConversationResult,
  DeleteProjectMemoryResult,
  LoadConversationResult,
  LoadProjectResult,
  ProjectMemoryType,
  RenameConversationResult,
  SaveProjectMemoryResult,
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

export async function renameAssistantConversation(input: {
  conversationId: string;
  title: string;
}): Promise<RenameConversationResult> {
  const title = input.title.trim();

  if (!title) {
    return { ok: false, error: "Enter a conversation title." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      error: "You must be signed in to rename conversations.",
    };
  }

  const { data: conversation, error } = await supabase
    .from("conversations")
    .update({ title })
    .eq("id", input.conversationId)
    .eq("user_id", user.id)
    .select("id, title, created_at, updated_at")
    .single();

  if (error || !conversation) {
    return { ok: false, error: "Could not rename the conversation." };
  }

  return { ok: true, conversation };
}

export async function deleteAssistantConversation(
  conversationId: string,
): Promise<DeleteConversationResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      error: "You must be signed in to delete conversations.",
    };
  }

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: "Could not delete the conversation." };
  }

  return { ok: true, conversationId };
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
      memory: await loadProjectMemory(supabase, project.id),
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
    memory: await loadProjectMemory(supabase, project.id),
  };
}

export async function saveProjectMemory(input: {
  projectId: string;
  memoryId?: string;
  memoryType: ProjectMemoryType;
  title: string;
  content: string;
}): Promise<SaveProjectMemoryResult> {
  const title = input.title.trim();
  const content = input.content.trim();

  if (!title || !content) {
    return { ok: false, error: "Enter a memory title and content." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "You must be signed in to save memory." };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", input.projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (projectError || !project) {
    return { ok: false, error: "Project not found." };
  }

  const query = input.memoryId
    ? supabase
        .from("project_memory")
        .update({
          memory_type: input.memoryType,
          title,
          content,
        })
        .eq("id", input.memoryId)
        .eq("project_id", project.id)
    : supabase.from("project_memory").insert({
        project_id: project.id,
        memory_type: input.memoryType,
        title,
        content,
      });

  const { data: memory, error } = await query
    .select("id, project_id, memory_type, title, content, created_at, updated_at")
    .single();

  if (error || !memory) {
    return { ok: false, error: "Could not save project memory." };
  }

  return { ok: true, memory };
}

export async function deleteProjectMemory(
  memoryId: string,
): Promise<DeleteProjectMemoryResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "You must be signed in to delete memory." };
  }

  const { data: memory, error: memoryError } = await supabase
    .from("project_memory")
    .select("id, project_id")
    .eq("id", memoryId)
    .maybeSingle();

  if (memoryError || !memory) {
    return { ok: false, error: "Project memory not found." };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", memory.project_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (projectError || !project) {
    return { ok: false, error: "Project memory not found." };
  }

  const { error } = await supabase
    .from("project_memory")
    .delete()
    .eq("id", memory.id);

  if (error) {
    return { ok: false, error: "Could not delete project memory." };
  }

  return { ok: true, memoryId: memory.id };
}
