import { getRequiredEnv } from "@/lib/env";
import type { ChatMessage, ModelDefinition } from "@/lib/ai/models";

type StreamInput = {
  model: ModelDefinition;
  messages: ChatMessage[];
};

type ProviderStream = {
  stream: ReadableStream<string>;
};

function assertResponse(
  response: Response,
  provider: string,
): asserts response is Response & { body: ReadableStream<Uint8Array> } {
  if (!response.ok || !response.body) {
    throw new Error(`${provider} request failed with status ${response.status}.`);
  }
}

function parseOpenAiCompatibleStream(body: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder();
  let buffer = "";

  return body.pipeThrough(
    new TransformStream<Uint8Array, string>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();

          if (!trimmed.startsWith("data: ")) {
            continue;
          }

          const payload = trimmed.slice(6);

          if (payload === "[DONE]") {
            continue;
          }

          try {
            const parsed = JSON.parse(payload) as {
              choices?: Array<{
                delta?: {
                  content?: string;
                };
              }>;
            };
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              controller.enqueue(content);
            }
          } catch {
            // Ignore malformed provider keepalive chunks.
          }
        }
      },
    }),
  );
}

function parseAnthropicStream(body: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder();
  let buffer = "";

  return body.pipeThrough(
    new TransformStream<Uint8Array, string>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();

          if (!trimmed.startsWith("data: ")) {
            continue;
          }

          try {
            const parsed = JSON.parse(trimmed.slice(6)) as {
              type?: string;
              delta?: {
                text?: string;
              };
            };

            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              controller.enqueue(parsed.delta.text);
            }
          } catch {
            // Ignore malformed provider keepalive chunks.
          }
        }
      },
    }),
  );
}

function splitSystemPrompt(messages: ChatMessage[]) {
  const system = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n");
  const chatMessages = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));

  return { system, chatMessages };
}

async function streamOpenAiCompatible(input: StreamInput) {
  const apiKey =
    input.model.provider === "groq"
      ? getRequiredEnv("GROQ_API_KEY")
      : getRequiredEnv("OPENAI_API_KEY");
  const url =
    input.model.provider === "groq"
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model.providerModel,
      messages: input.messages,
      stream: true,
    }),
  });

  assertResponse(response, input.model.provider);

  return {
    stream: parseOpenAiCompatibleStream(response.body),
  };
}

async function streamAnthropic(input: StreamInput) {
  const { system, chatMessages } = splitSystemPrompt(input.messages);
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "anthropic-version": "2023-06-01",
      "x-api-key": getRequiredEnv("ANTHROPIC_API_KEY"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model.providerModel,
      max_tokens: 2048,
      system: system || undefined,
      messages: chatMessages,
      stream: true,
    }),
  });

  assertResponse(response, "anthropic");

  return {
    stream: parseAnthropicStream(response.body),
  };
}

async function streamGemini(): Promise<ProviderStream> {
  throw new Error("Gemini support is registered for future availability.");
}

export async function streamProviderResponse(
  input: StreamInput,
): Promise<ProviderStream> {
  if (input.model.provider === "openai" || input.model.provider === "groq") {
    return streamOpenAiCompatible(input);
  }

  if (input.model.provider === "anthropic") {
    return streamAnthropic(input);
  }

  return streamGemini();
}
