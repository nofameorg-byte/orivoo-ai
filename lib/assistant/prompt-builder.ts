import { ORIVOO_SYSTEM_PROMPT } from "@/lib/assistant/system-prompt";
import {
  resolveAssistantStudio,
  type AssistantStudio,
} from "@/lib/assistant/studios";
import type { AssistantRole, ProjectMemory } from "@/lib/assistant/types";

export type AssistantPromptMessage = {
  role: "system" | AssistantRole;
  content: string;
};

export function buildAssistantPromptMessages({
  conversationHistory,
  projectMemory,
  requestedStudioId,
  userMessage,
}: {
  conversationHistory: Array<{
    role: AssistantRole;
    content: string;
  }>;
  projectMemory?: ProjectMemory[];
  requestedStudioId?: string | null;
  userMessage: string;
}): {
  messages: AssistantPromptMessage[];
  studio: AssistantStudio;
} {
  const studio = resolveAssistantStudio({
    requestedStudioId,
    userMessage,
  });

  return {
    studio,
    messages: [
      {
        role: "system",
        content: ORIVOO_SYSTEM_PROMPT,
      },
      {
        role: "system",
        content: studio.systemPrompt,
      },
      {
        role: "system",
        content: formatProjectMemory(projectMemory ?? []),
      },
      ...conversationHistory,
      {
        role: "user",
        content: userMessage,
      },
    ],
  };
}

function formatProjectMemory(projectMemory: ProjectMemory[]) {
  if (projectMemory.length === 0) {
    return "Project Memory:\nNo project memory has been saved for this conversation.";
  }

  return [
    "Project Memory:",
    "Use these persistent project facts across all conversations in this project.",
    ...projectMemory.map((memory) =>
      [
        `Memory Type: ${memory.memory_type}`,
        `Title: ${memory.title}`,
        `Content:\n${memory.content}`,
      ].join("\n"),
    ),
  ].join("\n\n");
}
