"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isArtifactType } from "@/lib/artifacts";
import type { Json } from "@/lib/database.types";
import { ensureDefaultProject } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function artifactsRedirect(message: string, artifactId?: string): never {
  const params = new URLSearchParams({ artifactMessage: message });

  if (artifactId) {
    params.set("artifactId", artifactId);
  }

  redirect(`/dashboard?${params.toString()}#artifacts`);
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to manage artifacts.");
  }

  return { supabase, user };
}

async function getOwnedProject(projectId: string) {
  const { supabase, user } = await requireUser();

  if (!projectId) {
    return {
      supabase,
      user,
      project: await ensureDefaultProject(supabase, user.id),
    };
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .maybeSingle();

  if (error) {
    artifactsRedirect(error.message);
  }

  if (!project) {
    artifactsRedirect("Project not found.");
  }

  return { supabase, user, project };
}

async function ensureFolderBelongsToProject(
  folderId: string,
  projectId: string,
) {
  if (!folderId) {
    return null;
  }

  const supabase = await createClient();
  const { data: folder, error } = await supabase
    .from("artifact_folders")
    .select("id")
    .eq("id", folderId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) {
    artifactsRedirect(error.message);
  }

  if (!folder) {
    artifactsRedirect("Artifact folder not found.");
  }

  return folder.id;
}

function getArtifactFields(formData: FormData) {
  const title = getFormString(formData, "title");
  const artifactType = getFormString(formData, "artifactType");
  const content = getFormString(formData, "content");
  const folderId = getFormString(formData, "folderId");

  if (!title) {
    artifactsRedirect("Add an artifact title.");
  }

  if (!isArtifactType(artifactType)) {
    artifactsRedirect("Choose a supported artifact type.");
  }

  if (!content) {
    artifactsRedirect("Add artifact content before saving.");
  }

  return { title, artifactType, content, folderId };
}

export async function createArtifactFolder(formData: FormData) {
  const projectId = getFormString(formData, "projectId");
  const folderName = getFormString(formData, "folderName");

  if (!folderName) {
    artifactsRedirect("Add a folder name.");
  }

  const { supabase, user, project } = await getOwnedProject(projectId);
  const { error } = await supabase.from("artifact_folders").insert({
    project_id: project.id,
    user_id: user.id,
    name: folderName,
  });

  if (error) {
    artifactsRedirect(error.message);
  }

  revalidatePath("/dashboard");
  artifactsRedirect("Artifact folder created.");
}

export async function createArtifact(formData: FormData) {
  const projectId = getFormString(formData, "projectId");
  const { title, artifactType, content, folderId } = getArtifactFields(formData);
  const { supabase, user, project } = await getOwnedProject(projectId);
  const validFolderId = await ensureFolderBelongsToProject(folderId, project.id);

  const { data: artifact, error } = await supabase
    .from("artifacts")
    .insert({
      project_id: project.id,
      user_id: user.id,
      folder_id: validFolderId,
      title,
      artifact_type: artifactType,
      content,
      metadata: {
        source: "manual",
        export_support: ["pdf", "docx", "markdown", "code"],
      },
    })
    .select("id")
    .single();

  if (error) {
    artifactsRedirect(error.message);
  }

  revalidatePath("/dashboard");
  artifactsRedirect("Artifact saved.", artifact.id);
}

export async function updateArtifact(formData: FormData) {
  const artifactId = getFormString(formData, "artifactId");
  const projectId = getFormString(formData, "projectId");
  const { title, artifactType, content, folderId } = getArtifactFields(formData);

  if (!artifactId) {
    artifactsRedirect("Select an artifact to edit.");
  }

  const { supabase, project } = await getOwnedProject(projectId);
  const validFolderId = await ensureFolderBelongsToProject(folderId, project.id);

  const { error } = await supabase
    .from("artifacts")
    .update({
      title,
      artifact_type: artifactType,
      content,
      folder_id: validFolderId,
    })
    .eq("id", artifactId)
    .eq("project_id", project.id);

  if (error) {
    artifactsRedirect(error.message, artifactId);
  }

  revalidatePath("/dashboard");
  artifactsRedirect("Artifact updated.", artifactId);
}

export async function duplicateArtifact(formData: FormData) {
  const artifactId = getFormString(formData, "artifactId");

  if (!artifactId) {
    artifactsRedirect("Select an artifact to duplicate.");
  }

  const { supabase, user } = await requireUser();
  const { data: artifact, error: lookupError } = await supabase
    .from("artifacts")
    .select("project_id, folder_id, title, artifact_type, content")
    .eq("id", artifactId)
    .maybeSingle();

  if (lookupError) {
    artifactsRedirect(lookupError.message, artifactId);
  }

  if (!artifact) {
    artifactsRedirect("Artifact not found.");
  }

  const metadata: Json = {
    source: "duplicate",
    duplicated_from: artifactId,
    duplicated_at: new Date().toISOString(),
  };

  const { data: copy, error } = await supabase
    .from("artifacts")
    .insert({
      project_id: artifact.project_id,
      user_id: user.id,
      folder_id: artifact.folder_id,
      title: `${artifact.title} Copy`,
      artifact_type: artifact.artifact_type,
      content: artifact.content,
      metadata,
    })
    .select("id")
    .single();

  if (error) {
    artifactsRedirect(error.message, artifactId);
  }

  revalidatePath("/dashboard");
  artifactsRedirect("Artifact duplicated.", copy.id);
}

export async function deleteArtifact(formData: FormData) {
  const artifactId = getFormString(formData, "artifactId");

  if (!artifactId) {
    artifactsRedirect("Select an artifact to delete.");
  }

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("artifacts")
    .delete()
    .eq("id", artifactId);

  if (error) {
    artifactsRedirect(error.message, artifactId);
  }

  revalidatePath("/dashboard");
  artifactsRedirect("Artifact deleted.");
}
