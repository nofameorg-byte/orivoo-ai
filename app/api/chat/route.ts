import Groq from "groq-sdk";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const MAX_PROMPT_LENGTH = 12000;

type ChatRequestBody = {
  conversationId?: string;
  message?: string;
};

const systemPrompt = `You are ORIVOO Assistant, the default AI operator inside ORIVOO AI.
Use a clear, modern, practical voice. Help users build, research, write, design,
plan, code, and reason across ORIVOO's specialist studios. Be concise by default,
ask clarifying questions when needed, and produce structured outputs when useful.`;

function createTitle(message: string) {
  const compact = message.replace(/\s+/g, " ").trim();

  if (!compact) {
    return "New chat";
  }

  return compact.length > 64 ? `${compact.slice(0, 61)}...` : compact;
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    return jsonError("Missing GROQ_API_KEY environment variable.", 500);
  }

  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return jsonError("Invalid JSON body.");
  }

  const prompt = body.message?.trim();

  if (!prompt) {
    return jsonError("Message is required.");
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return jsonError(`Message must be ${MAX_PROMPT_LENGTH} characters or less.`);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonError("Authentication required.", 401);
  }

  const model = process.env.GROQ_MODEL ?? DEFAULT_MODEL;
  let conversationId = body.conversationId;
  let conversationTitle = createTitle(prompt);

  if (conversationId) {
    const { data: conversation, error } = await supabase
      .from("conversations")
      .select("id,title")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (error || !conversation) {
      return jsonError("Conversation not found.", 404);
    }

    conversationTitle = conversation.title;
  } else {
    const { data: conversation, error } = await supabase
      .from("conversations")
      .insert({
        model,
        title: conversationTitle,
        user_id: user.id,
      })
      .select("id,title")
      .single();

    if (error || !conversation) {
      return jsonError("Could not create conversation.", 500);
    }

    conversationId = conversation.id;
    conversationTitle = conversation.title;
  }

  const { data: previousMessages, error: historyError } = await supabase
    .from("messages")
    .select("role,content,created_at")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(24);

  if (historyError) {
    return jsonError("Could not load conversation history.", 500);
  }

  const { error: insertError } = await supabase.from("messages").insert({
    content: prompt,
    conversation_id: conversationId,
    role: "user",
    user_id: user.id,
  });

  if (insertError) {
    return jsonError("Could not save message.", 500);
  }

  const groq = new Groq({ apiKey: groqApiKey });
  const encoder = new TextEncoder();
  let assistantResponse = "";

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...(previousMessages ?? [])
      .reverse()
      .map((message) => ({
        role: message.role,
        content: message.content,
      }))
      .filter((message) => message.role !== "system"),
    { role: "user" as const, content: prompt },
  ];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const completion = await groq.chat.completions.create({
          messages,
          model,
          stream: true,
          temperature: 0.7,
        });

        for await (const chunk of completion) {
          const token = chunk.choices[0]?.delta?.content ?? "";

          if (token) {
            assistantResponse += token;
            controller.enqueue(encoder.encode(token));
          }
        }

        if (assistantResponse.trim()) {
          await supabase.from("messages").insert({
            content: assistantResponse,
            conversation_id: conversationId,
            role: "assistant",
            user_id: user.id,
          });
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "ORIVOO Assistant could not complete the response.";

        controller.enqueue(
          encoder.encode(
            `\n\nORIVOO Assistant could not complete the response: ${message}`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Conversation-Id": conversationId,
      "X-Conversation-Title": encodeURIComponent(conversationTitle),
    },
  });
}
