import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRequiredEnv } from "@/lib/env";
import { ORIVOO_SYSTEM_PROMPT } from "@/lib/assistant/system-prompt";
import {
  canUseAssistantModel,
  getAssistantModel,
  normalizeAssistantModelId,
  normalizeSubscriptionTier,
} from "@/lib/assistant/models";
import {
  getOrCreateAssistantConversation,
  loadAssistantConversationSummary,
  loadAssistantMessages,
  loadGroqMessageHistory,
} from "@/lib/assistant/server";
import type {
  AssistantRole,
  AssistantStreamEvent,
} from "@/lib/assistant/types";

type GroqMessage = {
  role: "system" | AssistantRole;
  content: string;
};

type GroqStreamChunk = {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

const groqChatCompletionsUrl = "https://api.groq.com/openai/v1/chat/completions";
const expectedDebugUserId = "77731924-62eb-47fc-9016-7f32a7e8ea7f";

export async function POST(request: NextRequest) {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();

      function send(event: AssistantStreamEvent) {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      }

      try {
        const body = (await request.json().catch(() => null)) as {
          prompt?: unknown;
          conversationId?: unknown;
          modelId?: unknown;
        } | null;
        const prompt =
          typeof body?.prompt === "string" ? body.prompt.trim() : "";
        const requestedConversationId =
          typeof body?.conversationId === "string"
            ? body.conversationId
            : null;

        if (!prompt) {
          send({ type: "error", error: "Enter a prompt before sending." });
          return;
        }

        const supabase = await createClient();
        console.log(
          "SUPABASE CLIENT",
          "authenticated server client from @/lib/supabase/server",
        );
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.log("AUTH USER", user);
        console.log("USER ID", user?.id);
        console.log("USER ID MATCH", user?.id === expectedDebugUserId);
        console.log("SESSION", session);
        console.log("SESSION ERROR", sessionError);

        if (userError || !user) {
          console.log("AUTH USER ERROR", userError);
          send({
            type: "error",
            error: "You must be signed in to send a prompt.",
          });
          return;
        }

        console.log("PROFILE LOOKUP USER ID", user.id);
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("subscription_tier, selected_model")
          .eq("id", user.id)
          .maybeSingle();

        console.log("PROFILE RESULT", profile);
        console.log("PROFILE ERROR", profileError);

        if (profileError) {
          console.log("PROFILE ERROR CODE", profileError.code);
          console.log("PROFILE ERROR MESSAGE", profileError.message);
          console.log("PROFILE ERROR DETAILS", profileError.details);
          console.log("PROFILE ERROR HINT", profileError.hint);
          send({
            type: "error",
            error: "Could not load your model permissions.",
          });
          return;
        }

        const subscriptionTier = normalizeSubscriptionTier(
          profile?.subscription_tier,
        );
        const selectedModelId = normalizeAssistantModelId(
          typeof body?.modelId === "string"
            ? body.modelId
            : profile?.selected_model,
        );

        if (
          !canUseAssistantModel({
            modelId: selectedModelId,
            subscriptionTier,
          })
        ) {
          send({
            type: "error",
            error: "Upgrade to ORIVOO Pro to access premium models.",
          });
          return;
        }

        const selectedModel = getAssistantModel(selectedModelId);

        if (!selectedModel) {
          send({ type: "error", error: "Selected model is not available." });
          return;
        }

        if (selectedModel.route !== "groq") {
          send({
            type: "error",
            error:
              "This premium model is ready for ORIVOO Pro routing, but its API is not connected yet.",
          });
          return;
        }

        const conversationResult = await getOrCreateAssistantConversation({
          supabase,
          userId: user.id,
          conversationId: requestedConversationId,
          prompt,
        });

        if (!conversationResult.ok) {
          send({ type: "error", error: conversationResult.error });
          return;
        }

        const { conversationId } = conversationResult;
        const historyBeforePrompt = await loadGroqMessageHistory(
          supabase,
          conversationId,
        );

        if (!historyBeforePrompt.ok) {
          send({
            type: "error",
            conversationId,
            error: historyBeforePrompt.error,
          });
          return;
        }

        const conversation = await loadAssistantConversationSummary(
          supabase,
          conversationId,
        );
        send({ type: "conversation", conversationId, conversation });

        const { data: userMessage, error: userMessageError } = await supabase
          .from("messages")
          .insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: "user",
            content: prompt,
          })
          .select("id, role, content, created_at")
          .single();

        if (userMessageError || !userMessage) {
          send({
            type: "error",
            conversationId,
            error: "Could not save your message. Please try again.",
          });
          return;
        }

        send({ type: "user_message", message: userMessage });

        let assistantResponse = "";

        try {
          assistantResponse = await streamGroqResponse(
            [
              ...historyBeforePrompt.messages,
              { role: "user", content: prompt },
            ],
            selectedModel.providerModel,
            request.signal,
            (token) => {
              assistantResponse += token;
              send({ type: "token", content: token });
            },
          );
        } catch (error) {
          send({
            type: "error",
            conversationId,
            error:
              error instanceof Error
                ? error.message
                : "The assistant request failed. Please try again.",
            messages: await loadAssistantMessages(supabase, conversationId),
          });
          return;
        }

        const finalResponse = assistantResponse.trim();

        if (!finalResponse) {
          send({
            type: "error",
            conversationId,
            error: "Groq returned an empty response.",
            messages: await loadAssistantMessages(supabase, conversationId),
          });
          return;
        }

        const { error: assistantMessageError } = await supabase
          .from("messages")
          .insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: "assistant",
            content: finalResponse,
          });

        if (assistantMessageError) {
          send({
            type: "error",
            conversationId,
            error: "The assistant replied, but the response could not be saved.",
            messages: await loadAssistantMessages(supabase, conversationId),
          });
          return;
        }

        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId)
          .eq("user_id", user.id);

        send({
          type: "done",
          conversationId,
          conversation: await loadAssistantConversationSummary(
            supabase,
            conversationId,
          ),
          messages: await loadAssistantMessages(supabase, conversationId),
        });
      } catch (error) {
        send({
          type: "error",
          error:
            error instanceof Error
              ? error.message
              : "The assistant stream failed. Please try again.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
}

async function streamGroqResponse(
  messages: GroqMessage[],
  model: string,
  signal: AbortSignal,
  onToken: (token: string) => void,
) {
  const response = await fetch(groqChatCompletionsUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getRequiredEnv("GROQ_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: ORIVOO_SYSTEM_PROMPT,
        },
        ...messages,
      ],
      stream: true,
      temperature: 0.7,
    }),
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(await getGroqErrorMessage(response));
  }

  if (!response.body) {
    throw new Error("Groq did not return a response stream.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (!trimmedLine.startsWith("data:")) {
        continue;
      }

      const data = trimmedLine.slice(5).trim();

      if (data === "[DONE]") {
        continue;
      }

      const chunk = JSON.parse(data) as GroqStreamChunk;
      const error = chunk.error?.message;

      if (error) {
        throw new Error(error);
      }

      const token = chunk.choices?.[0]?.delta?.content ?? "";

      if (token) {
        content += token;
        onToken(token);
      }
    }
  }

  return content;
}

async function getGroqErrorMessage(response: Response) {
  const body = await response.text().catch(() => "");

  if (!body) {
    return "The Groq API request failed.";
  }

  try {
    const parsed = JSON.parse(body) as GroqStreamChunk;

    return parsed.error?.message ?? "The Groq API request failed.";
  } catch {
    return body;
  }
}
