export type AssistantRole = "user" | "assistant";

export type AssistantMessage = {
  id: string;
  role: AssistantRole;
  content: string;
  created_at: string;
};

export type SubmitPromptResult =
  | {
      ok: true;
      conversationId: string;
      assistantResponse: string;
      messages: AssistantMessage[];
    }
  | {
      ok: false;
      error: string;
      conversationId?: string;
      messages?: AssistantMessage[];
    };
