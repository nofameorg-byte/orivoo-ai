import { NextResponse, type NextRequest } from "next/server";
import {
  estimateCost,
  estimateTokens,
  getAvailableModels,
  getRoutingCandidates,
  normalizeTier,
  type ChatMessage,
  type ModelDefinition,
} from "@/lib/ai/models";
import { streamProviderResponse } from "@/lib/ai/providers";
import { createClient } from "@/lib/supabase/server";

type StreamRequest = {
  model?: string;
  messages?: ChatMessage[];
  prompt?: string;
};

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Record<string, unknown>;

  return (
    (message.role === "system" ||
      message.role === "user" ||
      message.role === "assistant") &&
    typeof message.content === "string"
  );
}

function normalizeMessages(input: StreamRequest) {
  if (Array.isArray(input.messages) && input.messages.every(isChatMessage)) {
    return input.messages;
  }

  if (typeof input.prompt === "string" && input.prompt.trim()) {
    return [{ role: "user", content: input.prompt.trim() }] satisfies ChatMessage[];
  }

  throw new Error("Provide messages or a prompt.");
}

async function getUserTier(userId: string) {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("subscription_tier, plan")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeTier(profile?.subscription_tier ?? profile?.plan);
}

async function logUsage(input: {
  userId: string;
  model: ModelDefinition;
  messages: ChatMessage[];
  output: string;
}) {
  const supabase = await createClient();
  const inputTokens = estimateTokens(input.messages);
  const outputTokens = estimateTokens(input.output);
  const estimatedCost = estimateCost({
    model: input.model,
    inputTokens,
    outputTokens,
  });

  await supabase.from("usage_logs").insert({
    user_id: input.userId,
    model: input.model.id,
    provider: input.model.provider,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    estimated_cost: estimatedCost,
  });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = await getUserTier(user.id);

  return NextResponse.json({
    tier,
    models: getAvailableModels(tier).map((model) => ({
      id: model.id,
      label: model.label,
      provider: model.provider,
      permitted: model.permitted,
      configured: model.configured,
      available: model.permitted && model.configured,
      future: Boolean(model.future),
    })),
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as StreamRequest;
    const messages = normalizeMessages(body);
    const tier = await getUserTier(user.id);
    const candidates = getRoutingCandidates({
      requestedModelId: body.model,
      tier,
    });

    if (candidates.length === 0) {
      throw new Error("No configured models are available for your plan.");
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let selectedModel: ModelDefinition | null = null;
        let providerStream: ReadableStream<string> | null = null;
        const failures: string[] = [];

        for (const candidate of candidates) {
          try {
            const response = await streamProviderResponse({
              model: candidate,
              messages,
            });

            selectedModel = candidate;
            providerStream = response.stream;
            controller.enqueue(
              encoder.encode(
                `event: model\ndata: ${JSON.stringify({
                  model: candidate.id,
                  provider: candidate.provider,
                })}\n\n`,
              ),
            );
            break;
          } catch (error) {
            failures.push(
              `${candidate.id}: ${
                error instanceof Error ? error.message : "provider failed"
              }`,
            );
          }
        }

        if (!selectedModel || !providerStream) {
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({
                error: "All model providers failed.",
                failures,
              })}\n\n`,
            ),
          );
          controller.close();
          return;
        }

        const reader = providerStream.getReader();
        let output = "";

        try {
          while (true) {
            const { value, done } = await reader.read();

            if (done) {
              break;
            }

            output += value;
            controller.enqueue(
              encoder.encode(
                `event: token\ndata: ${JSON.stringify({ text: value })}\n\n`,
              ),
            );
          }

          await logUsage({
            userId: user.id,
            model: selectedModel,
            messages,
            output,
          });
          controller.enqueue(
            encoder.encode(
              `event: done\ndata: ${JSON.stringify({
                model: selectedModel.id,
                provider: selectedModel.provider,
                input_tokens: estimateTokens(messages),
                output_tokens: estimateTokens(output),
                estimated_cost: estimateCost({
                  model: selectedModel,
                  inputTokens: estimateTokens(messages),
                  outputTokens: estimateTokens(output),
                }),
              })}\n\n`,
            ),
          );
          controller.close();
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({
                error:
                  error instanceof Error
                    ? error.message
                    : "Streaming response failed.",
              })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Type": "text/event-stream; charset=utf-8",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to route AI request.",
      },
      { status: 400 },
    );
  }
}
