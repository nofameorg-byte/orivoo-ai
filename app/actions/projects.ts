"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AssetType = "conversation" | "document";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to manage ORIVOO projects.");
  }

  return { supabase, userId: user.id };
}

async function verifyProjectOwnership(projectId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  return Boolean(data);
}

export async function createProject(formData: FormData) {
  const name = formString(formData, "name");
  const description = formString(formData, "description");

  if (!name) {
    redirect("/dashboard/projects?message=Project name is required.");
  }

  const { supabase, userId } = await getUserId();
  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      description: description || null,
      name,
      user_id: userId,
    })
    .select("id")
    .single();

  if (error || !project) {
    redirect("/dashboard/projects?message=Could not create project.");
  }

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/projects/${project.id}`);
}

export async function updateProject(formData: FormData) {
  const projectId = formString(formData, "projectId");
  const name = formString(formData, "name");
  const description = formString(formData, "description");
  const status = formString(formData, "status") === "archived" ? "archived" : "active";

  if (!projectId || !name) {
    redirect("/dashboard/projects?message=Project name is required.");
  }

  const { supabase, userId } = await getUserId();
  const { error } = await supabase
    .from("projects")
    .update({
      description: description || null,
      name,
      status,
    })
    .eq("id", projectId)
    .eq("user_id", userId);

  if (error) {
    redirect(`/dashboard/projects/${projectId}?message=Could not update project.`);
  }

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/projects/${projectId}`);
}

export async function deleteProject(formData: FormData) {
  const projectId = formString(formData, "projectId");

  if (!projectId) {
    redirect("/dashboard/projects?message=Project is required.");
  }

  const { supabase, userId } = await getUserId();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", userId);

  if (error) {
    redirect(`/dashboard/projects/${projectId}?message=Could not delete project.`);
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/projects?message=Project deleted.");
}

export async function assignAssetToProject(formData: FormData) {
  const projectId = formString(formData, "projectId");
  const assetId = formString(formData, "assetId");
  const assetType = formString(formData, "assetType") as AssetType;

  if (!projectId || !assetId) {
    redirect("/dashboard/projects?message=Choose a project and asset.");
  }

  const { supabase, userId } = await getUserId();
  const ownsProject = await verifyProjectOwnership(projectId, userId);

  if (!ownsProject) {
    redirect("/dashboard/projects?message=Project not found.");
  }

  const { error } =
    assetType === "document"
      ? await supabase
          .from("documents")
          .update({ project_id: projectId })
          .eq("id", assetId)
          .eq("user_id", userId)
      : await supabase
          .from("conversations")
          .update({ project_id: projectId })
          .eq("id", assetId)
          .eq("user_id", userId);

  if (error) {
    redirect(`/dashboard/projects/${projectId}?message=Could not assign asset.`);
  }

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/projects/${projectId}`);
}

export async function removeAssetFromProject(formData: FormData) {
  const projectId = formString(formData, "projectId");
  const assetId = formString(formData, "assetId");
  const assetType = formString(formData, "assetType") as AssetType;

  if (!projectId || !assetId) {
    redirect("/dashboard/projects?message=Choose a project and asset.");
  }

  const { supabase, userId } = await getUserId();
  const { error } =
    assetType === "document"
      ? await supabase
          .from("documents")
          .update({ project_id: null })
          .eq("id", assetId)
          .eq("project_id", projectId)
          .eq("user_id", userId)
      : await supabase
          .from("conversations")
          .update({ project_id: null })
          .eq("id", assetId)
          .eq("project_id", projectId)
          .eq("user_id", userId);

  if (error) {
    redirect(`/dashboard/projects/${projectId}?message=Could not remove asset.`);
  }

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/projects/${projectId}`);
}
