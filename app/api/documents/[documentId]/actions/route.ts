import Groq from "groq-sdk";
import { NextResponse, type NextRequest } from "next/server";
import {
  DOCUMENT_ACTION_PROMPTS,
  DOCUMENT_BUCKET,
  type DocumentAction,
} from "@/lib/documents/config";
import { buildDocumentContext } from "@/lib/documents/processing";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

type ActionBody = {
  action?: DocumentAction;
  question?: string;
};

const MAX_CONTEXT_LENGTH = 42000;

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isDocumentAction(action: string | undefined): action is DocumentAction {
  return (
    action === "summarize" ||
    action === "question" ||
    action === "facts" ||
    action === "timeline"
  );
}

export async function POST(request: NextRequest, context: RouteContext) {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    return jsonError("Missing GROQ_API_KEY environment variable.", 500);
  }

  const { documentId } = await context.params;
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

  if (!isDocumentAction(body.action)) {
    return jsonError("Choose summarize, question, facts, or timeline.");
  }

  if (body.action === "question" && !body.question?.trim()) {
    return jsonError("Ask a question about this document.");
  }

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id,title,file_name,file_path,file_type,status")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single();

  if (documentError || !document) {
    return jsonError("Document not found.", 404);
  }

  const groq = new Groq({ apiKey: groqApiKey });
  const actionPrompt = DOCUMENT_ACTION_PROMPTS[body.action];
  const question = body.question?.trim();
  const systemPrompt =
    "You are ORIVOO Document Studio. Analyze user-owned documents with accuracy, cite the provided chunks when possible, and clearly separate facts from assumptions.";

  try {
    if (document.file_type === "image") {
      const { data: signedUrl, error: signedUrlError } = await supabase.storage
        .from(DOCUMENT_BUCKET)
        .createSignedUrl(document.file_path, 120);

      if (signedUrlError || !signedUrl) {
        return jsonError("Could not create image analysis URL.", 500);
      }

      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${actionPrompt}\n\nDocument: ${document.title}\nQuestion: ${
                  question ?? "N/A"
                }`,
              },
              {
                type: "image_url",
                image_url: {
                  url: signedUrl.signedUrl,
                },
              },
            ],
          },
        ] as never,
        model:
          process.env.GROQ_VISION_MODEL ??
          "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.2,
      });

      return NextResponse.json({
        result:
          completion.choices[0]?.message?.content ??
          "ORIVOO could not analyze this image.",
      });
    }

    const { data: chunks, error: chunksError } = await supabase
      .from("document_chunks")
      .select("content")
      .eq("document_id", document.id)
      .eq("user_id", user.id)
      .order("chunk_index", { ascending: true });

    if (chunksError) {
      return jsonError("Could not load document chunks.", 500);
    }

    const documentContext = buildDocumentContext(chunks ?? []).slice(
      0,
      MAX_CONTEXT_LENGTH,
    );

    if (!documentContext) {
      return jsonError(
        "This document does not have extracted text yet. Try another document or upload a text-based PDF/DOCX.",
        422,
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `${actionPrompt}\n\nDocument title: ${document.title}\nQuestion: ${
            question ?? "N/A"
          }\n\nDocument context:\n${documentContext}`,
        },
      ],
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      temperature: 0.2,
    });

    return NextResponse.json({
      result:
        completion.choices[0]?.message?.content ??
        "ORIVOO could not complete the document action.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "ORIVOO Document Studio could not complete this action.";

    return jsonError(message, 500);
  }
}
