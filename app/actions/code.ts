"use server";

import Groq from "groq-sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseGeneratedCodeProject } from "@/lib/code/generation";
import { createClient } from "@/lib/supabase/server";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function getUserContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to use ORIVOO Code Studio.");
  }

  return { supabase, userId: user.id };
}

async function verifyProject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string | null,
  userId: string,
) {
  if (!projectId) {
    return null;
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select("id,name")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (error || !project) {
    redirect("/dashboard/code?message=Project not found.");
  }

  return project;
}

export async function generateCodeProject(formData: FormData) {
  const title = formString(formData, "title");
  const language = formString(formData, "language");
  const framework = formString(formData, "framework");
  const prompt = formString(formData, "prompt");
  const projectId = formString(formData, "projectId") || null;
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!title || !language || !framework || !prompt) {
    redirect("/dashboard/code?message=Enter project name, language, framework, and prompt.");
  }

  if (!groqApiKey) {
    redirect("/dashboard/code?message=Missing GROQ_API_KEY.");
  }

  const { supabase, userId } = await getUserContext();
  const project = await verifyProject(supabase, projectId, userId);
  const groq = new Groq({ apiKey: groqApiKey });
  let generated;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are ORIVOO Code Studio. Generate complete, practical software projects. Return only valid JSON.",
        },
        {
          role: "user",
          content: `Generate a complete software project.

Project Name: ${title}
Programming Language: ${language}
Framework: ${framework}
Prompt: ${prompt}
ORIVOO Project: ${project?.name ?? "No project selected"}

The generated project must include:
- Folder Structure
- Files
- Components
- Pages
- Database Schema
- API Routes
- Authentication Setup

Return JSON exactly like:
{
  "title": "Project title",
  "description": "Short technical description",
  "language": "TypeScript",
  "framework": "Next.js",
  "files": [
    {
      "file_name": "README.md",
      "file_path": "README.md",
      "content": "full file content"
    }
  ]
}`,
        },
      ],
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      temperature: 0.25,
    });

    generated = parseGeneratedCodeProject(
      completion.choices[0]?.message?.content ?? "",
    );
  } catch {
    redirect("/dashboard/code?message=ORIVOO could not generate structured code. Please try again.");
  }

  const { data: codeProject, error: projectError } = await supabase
    .from("code_projects")
    .insert({
      description: generated.description,
      framework: generated.framework || framework,
      language: generated.language || language,
      project_id: projectId,
      prompt,
      title: generated.title || title,
      user_id: userId,
    })
    .select("id")
    .single();

  if (projectError || !codeProject) {
    redirect("/dashboard/code?message=Could not save code project.");
  }

  const { error: filesError } = await supabase.from("code_files").insert(
    generated.files.map((file) => ({
      code_project_id: codeProject.id,
      content: file.content,
      file_name: file.file_name,
      file_path: file.file_path,
    })),
  );

  if (filesError) {
    redirect(`/dashboard/code/${codeProject.id}?message=Project saved but files could not be created.`);
  }

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/code/${codeProject.id}`);
}

export async function updateCodeFile(formData: FormData) {
  const codeProjectId = formString(formData, "codeProjectId");
  const fileId = formString(formData, "fileId");
  const fileName = formString(formData, "fileName");
  const filePath = formString(formData, "filePath");
  const content = formString(formData, "content");
  const { supabase, userId } = await getUserContext();

  const { data: project } = await supabase
    .from("code_projects")
    .select("id")
    .eq("id", codeProjectId)
    .eq("user_id", userId)
    .single();

  if (!project) {
    redirect("/dashboard/code?message=Code project not found.");
  }

  const { error } = await supabase
    .from("code_files")
    .update({
      content,
      file_name: fileName,
      file_path: filePath,
    })
    .eq("id", fileId)
    .eq("code_project_id", project.id);

  if (error) {
    redirect(`/dashboard/code/${codeProjectId}?message=Could not update file.`);
  }

  revalidatePath(`/dashboard/code/${codeProjectId}`);
  redirect(`/dashboard/code/${codeProjectId}?message=File updated.`);
}

export async function assignCodeProjectToProject(formData: FormData) {
  const codeProjectId = formString(formData, "codeProjectId");
  const projectId = formString(formData, "projectId") || null;
  const { supabase, userId } = await getUserContext();

  await verifyProject(supabase, projectId, userId);

  const { error } = await supabase
    .from("code_projects")
    .update({ project_id: projectId })
    .eq("id", codeProjectId)
    .eq("user_id", userId);

  if (error) {
    redirect(`/dashboard/code/${codeProjectId}?message=Could not update project.`);
  }

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/code/${codeProjectId}`);
}

export async function deleteCodeProject(formData: FormData) {
  const codeProjectId = formString(formData, "codeProjectId");
  const redirectTo = formString(formData, "redirectTo") || "/dashboard/code";
  const { supabase, userId } = await getUserContext();

  const { error } = await supabase
    .from("code_projects")
    .delete()
    .eq("id", codeProjectId)
    .eq("user_id", userId);

  if (error) {
    redirect(`${redirectTo}?message=Could not delete code project.`);
  }

  revalidatePath("/dashboard", "layout");
  redirect(`${redirectTo}?message=Code project deleted.`);
}
