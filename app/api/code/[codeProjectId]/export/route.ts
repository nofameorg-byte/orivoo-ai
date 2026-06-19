import { NextResponse, type NextRequest } from "next/server";
import {
  createCodeZip,
  sanitizeDownloadName,
  type GeneratedCodeFile,
} from "@/lib/code/generation";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    codeProjectId: string;
  }>;
};

function toBody(bytes: Uint8Array) {
  const arrayBuffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(arrayBuffer).set(bytes);
  return arrayBuffer;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { codeProjectId } = await context.params;
  const format = request.nextUrl.searchParams.get("format") ?? "zip";
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const [{ data: project, error: projectError }, { data: files }] =
    await Promise.all([
      supabase
        .from("code_projects")
        .select("id,title")
        .eq("id", codeProjectId)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("code_files")
        .select("file_name,file_path,content")
        .eq("code_project_id", codeProjectId)
        .order("file_path", { ascending: true }),
    ]);

  if (projectError || !project) {
    return NextResponse.json({ error: "Code project not found." }, { status: 404 });
  }

  const exportType =
    format === "next"
      ? "next"
      : format === "react"
        ? "react"
        : format === "node"
          ? "node"
          : "zip";
  const normalizedFiles: GeneratedCodeFile[] = (files ?? []).map((file) => ({
    content: file.content,
    file_name: file.file_name,
    file_path: file.file_path,
  }));
  const zip = await createCodeZip({
    exportType,
    files: normalizedFiles,
    projectTitle: project.title,
  });
  const fileName = sanitizeDownloadName(project.title || "orivoo-code-project");

  return new Response(toBody(zip), {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}-${exportType}.zip"`,
      "Content-Type": "application/zip",
    },
  });
}
