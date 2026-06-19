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

export type AssistantProject = {
  id: string;
  name: string;
  description: string | null;
  studio: string;
  created_at: string;
  updated_at: string;
};

export type ProjectMemoryType =
  | "project_context"
  | "requirements"
  | "architecture"
  | "preferences"
  | "notes";

export type ProjectMemory = {
  id: string;
  project_id: string;
  memory_type: ProjectMemoryType;
  title: string;
  content: string;
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

export type RenameConversationResult =
  | {
      ok: true;
      conversation: AssistantConversation;
    }
  | {
      ok: false;
      error: string;
    };

export type DeleteConversationResult =
  | {
      ok: true;
      conversationId: string;
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

export type CreateProjectResult =
  | {
      ok: true;
      project: AssistantProject;
    }
  | {
      ok: false;
      error: string;
    };

export type LoadProjectResult =
  | {
      ok: true;
      projectId: string;
      conversations: AssistantConversation[];
      activeConversationId: string | null;
      messages: AssistantMessage[];
      memory: ProjectMemory[];
    }
  | {
      ok: false;
      error: string;
    };

export type SaveProjectMemoryResult =
  | {
      ok: true;
      memory: ProjectMemory;
    }
  | {
      ok: false;
      error: string;
    };

export type DeleteProjectMemoryResult =
  | {
      ok: true;
      memoryId: string;
    }
  | {
      ok: false;
      error: string;
    };
