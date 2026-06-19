import { getArtifactTypeLabel } from "@/lib/artifacts";
import { createClient } from "@/lib/supabase/server";

type DownloadRouteContext = {
  params: Promise<{
    artifactId: string;
  }>;
};

function sanitizeFileName(value: string) {
  const sanitized = value
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return sanitized || "artifact";
}

export async function GET(_request: Request, context: DownloadRouteContext) {
  const { artifactId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: artifact, error } = await supabase
    .from("artifacts")
    .select("title, artifact_type, content, updated_at")
    .eq("id", artifactId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  if (!artifact) {
    return new Response("Artifact not found", { status: 404 });
  }

  const body = [
    `# ${artifact.title}`,
    "",
    `Type: ${getArtifactTypeLabel(artifact.artifact_type)}`,
    `Last Updated: ${artifact.updated_at}`,
    "",
    artifact.content,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Disposition": `attachment; filename="${sanitizeFileName(
        artifact.title,
      )}.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
