import Groq from "groq-sdk";
import { NextResponse, type NextRequest } from "next/server";
import { CODE_ACTIONS, type CodeAction } from "@/lib/code/config";
import {
  fileNameFromPath,
  parseGeneratedCodeProject,
} from "@/lib/code/generation";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = {
  params: Promise<{
    codeProjectId: string;
  }>;
};

type ActionBody = {
  action?: CodeAction;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isCodeAction(action: string | undefined): action is CodeAction {
  return Boolean(action && action in CODE_ACTIONS);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    return jsonError("Missing GROQ_API_KEY environment variable.", 500);
  }

  const { codeProjectId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonError("Authentication required.", 401);
  }

  let body: ActionBody;

  try {
    body = (await request.json()) as ActionBody;
  } catch {
    return jsonError("Invalid JSON body.");
  }

  if (!isCodeAction(body.action)) {
    return jsonError("Choose a valid code action.");
  }

  const [{ data: project, error: projectError }, { data: files }] =
    await Promise.all([
      supabase
        .from("code_projects")
        .select("id,title,description,prompt,framework,language")
        .eq("id", codeProjectId)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("code_files")
        .select("id,file_name,file_path,content")
        .eq("code_project_id", codeProjectId)
        .order("file_path", { ascending: true }),
    ]);

  if (projectError || !project) {
    return jsonError("Code project not found.", 404);
  }

  const action = CODE_ACTIONS[body.action];
  const contextFiles = (files ?? [])
    .slice(0, 24)
    .map((file) => `--- ${file.file_path}\n${file.content}`)
    .join("\n\n");
  const groq = new Groq({ apiKey: groqApiKey });

  try {
    if (
      body.action === "explain" ||
      body.action === "security-audit" ||
      body.action === "performance-audit"
    ) {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are ORIVOO Code Studio. Produce practical engineering analysis in markdown.",
          },
          {
            role: "user",
            content: `${action.prompt}

Project: ${project.title}
Framework: ${project.framework}
Language: ${project.language}

Files:
${contextFiles}`,
          },
        ],
        model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
        temperature: 0.2,
      });

      const content =
        completion.choices[0]?.message?.content?.trim() ??
        "ORIVOO could not generate this code analysis.";
      const filePath = `orivoo/${body.action}.md`;

      await supabase.from("code_files").upsert(
        {
          code_project_id: project.id,
          content,
          file_name: fileNameFromPath(filePath),
          file_path: filePath,
        },
        { onConflict: "code_project_id,file_path" },
      );

      return NextResponse.json({ message: `${action.label} complete.` });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are ORIVOO Code Studio. Return only valid JSON for a complete updated code project.",
        },
        {
          role: "user",
          content: `${action.prompt}

Project: ${project.title}
Description: ${project.description}
Original prompt: ${project.prompt}
Framework: ${project.framework}
Language: ${project.language}

Existing files:
${contextFiles}

Return JSON exactly like:
{
  "title": "Project title",
  "description": "Short technical description",
  "language": "TypeScript",
  "framework": "Next.js",
  "files": [
    { "file_name": "README.md", "file_path": "README.md", "content": "full file content" }
  ]
}`,
        },
      ],
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      temperature: 0.25,
    });

    const generated = parseGeneratedCodeProject(
      completion.choices[0]?.message?.content ?? "",
    );

    await supabase
      .from("code_projects")
      .update({
        description: generated.description,
        framework: generated.framework,
        language: generated.language,
        title: generated.title,
      })
      .eq("id", project.id);

    await supabase.from("code_files").delete().eq("code_project_id", project.id);
    await supabase.from("code_files").insert(
      generated.files.map((file) => ({
        code_project_id: project.id,
        content: file.content,
        file_name: file.file_name,
        file_path: file.file_path,
      })),
    );

    return NextResponse.json({ message: `${action.label} complete.` });
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? error.message
        : "ORIVOO Code Studio could not complete this action.",
      500,
    );
  }
}
