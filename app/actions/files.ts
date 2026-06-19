"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureDefaultProject } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";

const PROJECT_FILES_BUCKET = "project-files";
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const SUPPORTED_FILE_TYPES = new Map([
  [".pdf", "application/pdf"],
  [
    ".docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  [".txt", "text/plain"],
  [".csv", "text/csv"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".gif", "image/gif"],
  [".webp", "image/webp"],
]);

const SUPPORTED_MIME_TYPES = new Set(SUPPORTED_FILE_TYPES.values());

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function dashboardRedirect(message: string): never {
  redirect(`/dashboard?fileMessage=${encodeURIComponent(message)}#files`);
}

function getFileExtension(fileName: string) {
  const extension = fileName.toLowerCase().match(/\.[a-z0-9]+$/);
  return extension?.[0] ?? "";
}

function getSupportedFileType(file: File) {
  if (SUPPORTED_MIME_TYPES.has(file.type)) {
    return file.type;
  }

  return SUPPORTED_FILE_TYPES.get(getFileExtension(file.name)) ?? null;
}

function sanitizeStorageName(fileName: string) {
  const sanitized = fileName
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return sanitized || "upload";
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to manage project files.");
  }

  return { supabase, user };
}

export async function uploadProjectFile(formData: FormData) {
  const rawFile = formData.get("file");

  if (!(rawFile instanceof File) || rawFile.size === 0) {
    dashboardRedirect("Choose a file to upload.");
  }

  if (rawFile.size > MAX_FILE_SIZE_BYTES) {
    dashboardRedirect("Files must be 50 MB or smaller.");
  }

  const fileType = getSupportedFileType(rawFile);

  if (!fileType) {
    dashboardRedirect("Supported files are PDF, DOCX, TXT, CSV, and images.");
  }

  const { supabase, user } = await requireUser();
  const requestedProjectId = getFormString(formData, "projectId");
  let project: { id: string } | null;

  if (requestedProjectId) {
    const { data, error } = await supabase
      .from("projects")
      .select("id")
      .eq("id", requestedProjectId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      dashboardRedirect(error.message);
    }

    project = data;
  } else {
    project = await ensureDefaultProject(supabase, user.id);
  }

  if (!project) {
    dashboardRedirect("Project not found for this file upload.");
  }

  const fileId = randomUUID();
  const storagePath = `${user.id}/${project.id}/${fileId}-${sanitizeStorageName(
    rawFile.name,
  )}`;

  const { error: uploadError } = await supabase.storage
    .from(PROJECT_FILES_BUCKET)
    .upload(storagePath, rawFile, {
      contentType: fileType,
      upsert: false,
    });

  if (uploadError) {
    dashboardRedirect(uploadError.message);
  }

  const { error: insertError } = await supabase.from("files").insert({
    id: fileId,
    project_id: project.id,
    user_id: user.id,
    name: rawFile.name,
    file_type: fileType,
    storage_path: storagePath,
    size_bytes: rawFile.size,
  });

  if (insertError) {
    await supabase.storage.from(PROJECT_FILES_BUCKET).remove([storagePath]);
    dashboardRedirect(insertError.message);
  }

  revalidatePath("/dashboard");
  dashboardRedirect("File uploaded.");
}

export async function deleteProjectFile(formData: FormData) {
  const fileId = getFormString(formData, "fileId");

  if (!fileId) {
    dashboardRedirect("Select a file to delete.");
  }

  const { supabase, user } = await requireUser();
  const { data: file, error: lookupError } = await supabase
    .from("files")
    .select("id, storage_path")
    .eq("id", fileId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError) {
    dashboardRedirect(lookupError.message);
  }

  if (!file) {
    dashboardRedirect("File not found.");
  }

  const { error: storageError } = await supabase.storage
    .from(PROJECT_FILES_BUCKET)
    .remove([file.storage_path]);

  if (
    storageError &&
    !storageError.message.toLowerCase().includes("not found")
  ) {
    dashboardRedirect(storageError.message);
  }

  const { error: deleteError } = await supabase
    .from("files")
    .delete()
    .eq("id", file.id)
    .eq("user_id", user.id);

  if (deleteError) {
    dashboardRedirect(deleteError.message);
  }

  revalidatePath("/dashboard");
  dashboardRedirect("File deleted.");
}
