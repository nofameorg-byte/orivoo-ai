"use server";

import { createClient } from "@/lib/supabase/server";
import { getRequiredEnv } from "@/lib/env";
import type {
  AssistantMessage,
  AssistantRole,
  SubmitPromptResult,
} from "@/lib/assistant/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type GroqMessage = {
  role: "system" | AssistantRole;
  content: string;
};

type GroqResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

const groqChatCompletionsUrl = "https://api.groq.com/openai/v1/chat/completions";
const groqModel = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

export async function submitAssistantPrompt(input: {
  prompt: string;
  conversationId?: string | null;
}): Promise<SubmitPromptResult> {
  const prompt = input.prompt.trim();

  if (!prompt) {
    return { ok: false, error: "Enter a prompt before sending." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "You must be signed in to send a prompt." };
  }

  const conversationResult = await getOrCreateConversation({
    supabase,
    userId: user.id,
    conversationId: input.conversationId,
    prompt,
  });

  if (!conversationResult.ok) {
    return { ok: false, error: conversationResult.error };
  }

  const { conversationId } = conversationResult;
  const historyBeforePrompt = await getGroqHistory(supabase, conversationId);

  if (!historyBeforePrompt.ok) {
    return {
      ok: false,
      error: historyBeforePrompt.error,
      conversationId,
    };
  }

  const { error: userMessageError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    user_id: user.id,
    role: "user",
    content: prompt,
  });

  if (userMessageError) {
    return {
      ok: false,
      error: "Could not save your message. Please try again.",
      conversationId,
    };
  }

  let assistantResponse: string;

  try {
    assistantResponse = await callGroq([
      ...historyBeforePrompt.messages,
      { role: "user", content: prompt },
    ]);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "The assistant request failed. Please try again.",
      conversationId,
      messages: await loadMessages(supabase, conversationId),
    };
  }

  const { error: assistantMessageError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    user_id: user.id,
    role: "assistant",
    content: assistantResponse,
  });

  if (assistantMessageError) {
    return {
      ok: false,
      error: "The assistant replied, but the response could not be saved.",
      conversationId,
      messages: await loadMessages(supabase, conversationId),
    };
  }

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId)
    .eq("user_id", user.id);

  return {
    ok: true,
    conversationId,
    messages: await loadMessages(supabase, conversationId),
  };
}

async function getOrCreateConversation({
  supabase,
  userId,
  conversationId,
  prompt,
}: {
  supabase: SupabaseServerClient;
  userId: string;
  conversationId?: string | null;
  prompt: string;
}): Promise<
  | {
      ok: true;
      conversationId: string;
    }
  | {
      ok: false;
      error: string;
    }
> {
  if (conversationId) {
    const { data, error } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return { ok: false, error: "Could not load the conversation." };
    }

    if (!data) {
      return { ok: false, error: "Conversation not found." };
    }

    return { ok: true, conversationId: data.id };
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: userId,
      title: createConversationTitle(prompt),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: "Could not create a conversation." };
  }

  return { ok: true, conversationId: data.id };
}

async function getGroqHistory(
  supabase: SupabaseServerClient,
  conversationId: string,
): Promise<
  | {
      ok: true;
      messages: Array<{
        role: AssistantRole;
        content: string;
      }>;
    }
  | {
      ok: false;
      error: string;
    }
> {
  const { data, error } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(20);

  if (error) {
    return { ok: false, error: "Could not load conversation history." };
  }

  return {
    ok: true,
    messages: data ?? [],
  };
}

async function loadMessages(
  supabase: SupabaseServerClient,
  conversationId: string,
): Promise<AssistantMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return data ?? [];
}

async function callGroq(messages: GroqMessage[]) {
  const response = await fetch(groqChatCompletionsUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getRequiredEnv("GROQ_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: groqModel,
      messages: [
        {
          role: "system",
          content:
            "You are ORIVOO AI, a concise assistant for planning, writing, designing, researching, and building.",
        },
        ...messages,
      ],
      temperature: 0.7,
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as GroqResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "The Groq API request failed.");
  }

  const content = payload.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Groq returned an empty response.");
  }

  return content;
}

function createConversationTitle(prompt: string) {
  const title = prompt.replace(/\s+/g, " ").trim();

  if (title.length <= 80) {
    return title;
  }

  return `${title.slice(0, 77)}...`;
}
