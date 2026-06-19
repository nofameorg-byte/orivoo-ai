import { ORIVOO_SYSTEM_PROMPT } from "@/lib/assistant/system-prompt";
import {
  resolveAssistantStudio,
  type AssistantStudio,
} from "@/lib/assistant/studios";
import type { AssistantRole } from "@/lib/assistant/types";

export type AssistantPromptMessage = {
  role: "system" | AssistantRole;
  content: string;
};

export function buildAssistantPromptMessages({
  conversationHistory,
  requestedStudioId,
  userMessage,
}: {
  conversationHistory: Array<{
    role: AssistantRole;
    content: string;
  }>;
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
      ...conversationHistory,
      {
        role: "user",
        content: userMessage,
      },
    ],
  };
}
