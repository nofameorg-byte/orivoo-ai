type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type MemoryCandidate = {
  memory_type: string;
  content: string;
  importance: number;
};

function hasGroqKey() {
  return Boolean(process.env.GROQ_API_KEY);
}

function getGroqModel() {
  return process.env.GROQ_MEMORY_MODEL ?? process.env.GROQ_DEFAULT_MODEL ?? "llama-3.3-70b-versatile";
}

async function groqJsonCall(messages: GroqMessage[]) {
  if (!hasGroqKey()) {
    return null;
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getGroqModel(),
      messages,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  return payload.choices?.[0]?.message?.content ?? null;
}

function parseJsonArray(value: string | null) {
  if (!value) {
    return [];
  }

  const json = value.match(/\[[\s\S]*\]/)?.[0] ?? value;

  try {
    const parsed = JSON.parse(json) as unknown;

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function extractMemoryCandidatesWithGroq(input: {
  userMessage: string;
  assistantResponse: string;
  memoryContext: string;
}) {
  const content = await groqJsonCall([
    {
      role: "system",
      content:
        "Extract long-term memories from this conversation. Only return information worth remembering. Return strict JSON only.",
    },
    {
      role: "user",
      content: [
        "Extract long-term memories from this conversation.",
        "",
        "Only return information worth remembering.",
        "",
        "Return JSON:",
        "[",
        '  { "memory_type": "preference", "content": "...", "importance": 1 }',
        "]",
        "",
        "Existing memory context:",
        input.memoryContext,
        "",
        "Conversation:",
        `User: ${input.userMessage}`,
        `Assistant: ${input.assistantResponse}`,
      ].join("\n"),
    },
  ]);

  return parseJsonArray(content)
    .map((item): MemoryCandidate | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const candidate = item as Record<string, unknown>;
      const memoryType =
        typeof candidate.memory_type === "string"
          ? candidate.memory_type
          : "note";
      const content =
        typeof candidate.content === "string" ? candidate.content.trim() : "";
      const importance =
        typeof candidate.importance === "number"
          ? Math.min(10, Math.max(1, Math.round(candidate.importance)))
          : 5;

      if (!content) {
        return null;
      }

      return {
        memory_type: memoryType,
        content,
        importance,
      };
    })
    .filter((item): item is MemoryCandidate => Boolean(item));
}

export async function summarizeConversationWithGroq(input: {
  messages: Array<{
    role: string;
    content: string;
  }>;
}) {
  const content = await groqJsonCall([
    {
      role: "system",
      content:
        "Summarize the conversation for future memory retrieval. Return concise plain text, not JSON.",
    },
    {
      role: "user",
      content: input.messages
        .map((message) => `${message.role}: ${message.content}`)
        .join("\n\n"),
    },
  ]);

  return content?.trim() ?? null;
}
