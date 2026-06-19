"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getImportance(formData: FormData) {
  const value = Number.parseInt(getFormString(formData, "importance"), 10);

  if (!Number.isFinite(value)) {
    return 5;
  }

  return Math.min(10, Math.max(1, value));
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to manage memory.");
  }

  return { supabase, user };
}

function memoryRedirect(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

export async function approveMemoryCandidate(formData: FormData) {
  const candidateId = getFormString(formData, "candidateId");
  const { supabase, user } = await requireUser();
  const { data: candidate, error: lookupError } = await supabase
    .from("memory_candidates")
    .select("memory_type, content, importance")
    .eq("id", candidateId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError) {
    memoryRedirect("/dashboard/memory", lookupError.message);
  }

  if (!candidate) {
    memoryRedirect("/dashboard/memory", "Memory candidate not found.");
  }

  const { error: insertError } = await supabase.from("user_memories").insert({
    user_id: user.id,
    memory_type: candidate.memory_type,
    content: candidate.content,
    importance: candidate.importance,
  });

  if (insertError) {
    memoryRedirect("/dashboard/memory", insertError.message);
  }

  await supabase
    .from("memory_candidates")
    .delete()
    .eq("id", candidateId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/memory");
  revalidatePath("/dashboard/memory/saved");
  memoryRedirect("/dashboard/memory", "Memory approved.");
}

export async function rejectMemoryCandidate(formData: FormData) {
  const candidateId = getFormString(formData, "candidateId");
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("memory_candidates")
    .delete()
    .eq("id", candidateId)
    .eq("user_id", user.id);

  if (error) {
    memoryRedirect("/dashboard/memory", error.message);
  }

  revalidatePath("/dashboard/memory");
  memoryRedirect("/dashboard/memory", "Memory candidate removed.");
}

export async function updateUserMemory(formData: FormData) {
  const memoryId = getFormString(formData, "memoryId");
  const memoryType = getFormString(formData, "memoryType") || "note";
  const content = getFormString(formData, "content");
  const { supabase, user } = await requireUser();

  if (!content) {
    memoryRedirect("/dashboard/memory/saved", "Memory content is required.");
  }

  const { error } = await supabase
    .from("user_memories")
    .update({
      memory_type: memoryType,
      content,
      importance: getImportance(formData),
    })
    .eq("id", memoryId)
    .eq("user_id", user.id);

  if (error) {
    memoryRedirect("/dashboard/memory/saved", error.message);
  }

  revalidatePath("/dashboard/memory/saved");
  memoryRedirect("/dashboard/memory/saved", "Memory updated.");
}

export async function deleteUserMemory(formData: FormData) {
  const memoryId = getFormString(formData, "memoryId");
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("user_memories")
    .delete()
    .eq("id", memoryId)
    .eq("user_id", user.id);

  if (error) {
    memoryRedirect("/dashboard/memory/saved", error.message);
  }

  revalidatePath("/dashboard/memory/saved");
  memoryRedirect("/dashboard/memory/saved", "Memory deleted.");
}

export async function createWorkspaceKnowledge(formData: FormData) {
  const workspaceId = getFormString(formData, "workspaceId");
  const title = getFormString(formData, "title");
  const content = getFormString(formData, "content");
  const { supabase, user } = await requireUser();

  if (!workspaceId || !title || !content) {
    memoryRedirect("/dashboard/knowledge", "Workspace, title, and content are required.");
  }

  const { error } = await supabase.from("workspace_knowledge").insert({
    workspace_id: workspaceId,
    user_id: user.id,
    title,
    content,
  });

  if (error) {
    memoryRedirect("/dashboard/knowledge", error.message);
  }

  revalidatePath("/dashboard/knowledge");
  memoryRedirect("/dashboard/knowledge", "Knowledge note created.");
}

export async function updateWorkspaceKnowledge(formData: FormData) {
  const noteId = getFormString(formData, "noteId");
  const title = getFormString(formData, "title");
  const content = getFormString(formData, "content");
  const { supabase } = await requireUser();

  if (!title || !content) {
    memoryRedirect("/dashboard/knowledge", "Title and content are required.");
  }

  const { error } = await supabase
    .from("workspace_knowledge")
    .update({ title, content })
    .eq("id", noteId);

  if (error) {
    memoryRedirect("/dashboard/knowledge", error.message);
  }

  revalidatePath("/dashboard/knowledge");
  memoryRedirect("/dashboard/knowledge", "Knowledge note updated.");
}

export async function deleteWorkspaceKnowledge(formData: FormData) {
  const noteId = getFormString(formData, "noteId");
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("workspace_knowledge")
    .delete()
    .eq("id", noteId);

  if (error) {
    memoryRedirect("/dashboard/knowledge", error.message);
  }

  revalidatePath("/dashboard/knowledge");
  memoryRedirect("/dashboard/knowledge", "Knowledge note deleted.");
}

export async function createProjectMemory(formData: FormData) {
  const projectId = getFormString(formData, "projectId");
  const title = getFormString(formData, "title");
  const summary = getFormString(formData, "summary");
  const { supabase, user } = await requireUser();

  if (!projectId || !title || !summary) {
    memoryRedirect("/dashboard/projects", "Project, title, and summary are required.");
  }

  const { error } = await supabase.from("project_memories").insert({
    project_id: projectId,
    user_id: user.id,
    title,
    summary,
    importance: getImportance(formData),
  });

  if (error) {
    memoryRedirect("/dashboard/projects", error.message);
  }

  revalidatePath("/dashboard/projects");
  memoryRedirect("/dashboard/projects", "Project memory created.");
}

export async function updateProjectMemory(formData: FormData) {
  const memoryId = getFormString(formData, "memoryId");
  const title = getFormString(formData, "title");
  const summary = getFormString(formData, "summary");
  const { supabase } = await requireUser();

  if (!title || !summary) {
    memoryRedirect("/dashboard/projects", "Title and summary are required.");
  }

  const { error } = await supabase
    .from("project_memories")
    .update({
      title,
      summary,
      importance: getImportance(formData),
    })
    .eq("id", memoryId);

  if (error) {
    memoryRedirect("/dashboard/projects", error.message);
  }

  revalidatePath("/dashboard/projects");
  memoryRedirect("/dashboard/projects", "Project memory updated.");
}

export async function deleteProjectMemory(formData: FormData) {
  const memoryId = getFormString(formData, "memoryId");
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("project_memories")
    .delete()
    .eq("id", memoryId);

  if (error) {
    memoryRedirect("/dashboard/projects", error.message);
  }

  revalidatePath("/dashboard/projects");
  memoryRedirect("/dashboard/projects", "Project memory deleted.");
}
