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

export type AssistantStreamEvent =
  | {
      type: "conversation";
      conversationId: string;
      conversation: AssistantConversation;
    }
  | {
      type: "user_message";
      message: AssistantMessage;
    }
  | {
      type: "token";
      content: string;
    }
  | {
      type: "done";
      conversationId: string;
      conversation: AssistantConversation;
      messages: AssistantMessage[];
    }
  | {
      type: "error";
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

export type SelectAssistantModelResult =
  | {
      ok: true;
      selectedModel: string;
    }
  | {
      ok: false;
      error: string;
    };
