export type AssistantRole = "user" | "assistant";

export type AssistantMessage = {
  id: string;
  role: AssistantRole;
  content: string;
  created_at: string;
};

export type AssistantConversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type SubmitPromptResult =
  | {
      ok: true;
      conversationId: string;
      conversation: AssistantConversation;
      assistantResponse: string;
      messages: AssistantMessage[];
    }
  | {
      ok: false;
      error: string;
      conversationId?: string;
      messages?: AssistantMessage[];
    };

export type LoadConversationResult =
  | {
      ok: true;
      conversationId: string;
      messages: AssistantMessage[];
    }
  | {
      ok: false;
      error: string;
    };
