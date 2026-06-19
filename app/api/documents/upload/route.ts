import { NextResponse, type NextRequest } from "next/server";
import {
  ALLOWED_DOCUMENT_TYPES,
  DOCUMENT_BUCKET,
  MAX_DOCUMENT_SIZE,
} from "@/lib/documents/config";
import {
  chunkText,
  extractTextFromBuffer,
  sanitizeFileName,
  titleFromFileName,
} from "@/lib/documents/processing";
import { incrementUsage } from "@/lib/billing/usage";
import { createNotification } from "@/lib/core/notifications";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonError("Authentication required.", 401);
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("Upload a PDF, DOCX, or image file.");
  }

  if (file.size > MAX_DOCUMENT_SIZE) {
    return jsonError("Files must be 25MB or smaller.");
  }

  const fileType =
    ALLOWED_DOCUMENT_TYPES[file.type as keyof typeof ALLOWED_DOCUMENT_TYPES];

  if (!fileType) {
    return jsonError("Supported formats are PDF, DOCX, JPEG, PNG, WEBP, and GIF.");
  }

  const documentId = crypto.randomUUID();
  const safeName = sanitizeFileName(file.name);
  const filePath = `${user.id}/${documentId}/${safeName}`;
  const title =
    typeof formData.get("title") === "string" && formData.get("title")
      ? String(formData.get("title")).trim()
      : titleFromFileName(file.name) || "Untitled document";

  const buffer = Buffer.from(await file.arrayBuffer());
  const projectId =
    typeof formData.get("projectId") === "string" && formData.get("projectId")
      ? String(formData.get("projectId")).trim()
      : null;

  if (projectId) {
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return jsonError("Project not found.", 404);
    }
  }

  const { error: documentError } = await supabase.from("documents").insert({
    file_name: file.name,
    file_path: filePath,
    file_size: file.size,
    file_type: fileType,
    id: documentId,
    mime_type: file.type,
    project_id: projectId,
    status: "processing",
    title,
    user_id: user.id,
  });

  if (documentError) {
    return jsonError("Could not create document record.", 500);
  }

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    await supabase.from("documents").delete().eq("id", documentId);
    return jsonError("Could not upload file to storage.", 500);
  }

  try {
    const extractedText = await extractTextFromBuffer(buffer, fileType, file.name);
    const chunks = chunkText(extractedText);

    if (chunks.length) {
      const { error: chunksError } = await supabase
        .from("document_chunks")
        .insert(
          chunks.map((content, chunkIndex) => ({
            content,
            chunk_index: chunkIndex,
            document_id: documentId,
            metadata: {
              source: fileType,
            },
            user_id: user.id,
          })),
        );

      if (chunksError) {
        throw chunksError;
      }
    }

    const { data: document, error: updateError } = await supabase
      .from("documents")
      .update({
        error_message: null,
        extracted_text_preview: extractedText.slice(0, 600),
        status: "ready",
      })
      .eq("id", documentId)
      .eq("user_id", user.id)
      .select(
        "id,title,file_name,file_type,mime_type,file_size,status,created_at,updated_at,extracted_text_preview",
      )
      .single();

    if (updateError || !document) {
      return jsonError("Document uploaded, but status could not be updated.", 500);
    }

    await createNotification({
      body: `${document.title} is ready in Document Studio.`,
      metadata: { documentId },
      title: "Document processing complete",
      type: "document_processing",
      userId: user.id,
    });
    await Promise.all([
      incrementUsage({ metric: "documents_uploaded", userId: user.id }),
      incrementUsage({
        amount: file.size,
        metric: "storage_used",
        userId: user.id,
      }),
    ]);

    return NextResponse.json({ document });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not extract text from document.";

    const { data: document } = await supabase
      .from("documents")
      .update({
        error_message: message,
        status: "failed",
      })
      .eq("id", documentId)
      .eq("user_id", user.id)
      .select(
        "id,title,file_name,file_type,mime_type,file_size,status,created_at,updated_at,error_message",
      )
      .single();

    return NextResponse.json(
      {
        document,
        error: "File uploaded, but ORIVOO could not process its text.",
      },
      { status: 202 },
    );
  }
}
