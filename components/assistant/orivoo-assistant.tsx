"use client";

import { FormEvent, KeyboardEvent, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Bot,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

export type AssistantConversation = {
  created_at: string;
  id: string;
  model: string;
  project_id: string | null;
  title: string;
  updated_at: string;
};

export type AssistantMessage = {
  content: string;
  conversation_id: string;
  created_at: string;
  id: string;
  role: "system" | "user" | "assistant";
};

type OrivooAssistantProps = {
  displayName: string;
  initialConversationId: string | null;
  initialConversations: AssistantConversation[];
  initialMessages: AssistantMessage[];
  initialProjects: {
    id: string;
    name: string;
  }[];
};

function formatConversationDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function createTemporaryMessage(
  role: "user" | "assistant",
  content: string,
  conversationId: string,
): AssistantMessage {
  return {
    content,
    conversation_id: conversationId,
    created_at: new Date().toISOString(),
    id: `temp-${role}-${crypto.randomUUID()}`,
    role,
  };
}

export function OrivooAssistant({
  displayName,
  initialConversationId,
  initialConversations,
  initialMessages,
  initialProjects,
}: OrivooAssistantProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState(
    initialConversationId,
  );
  const [selectedProjectId, setSelectedProjectId] = useState(
    initialConversations.find(
      (conversation) => conversation.id === initialConversationId,
    )?.project_id ?? "",
  );
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId,
      ) ?? null,
    [conversations, selectedConversationId],
  );

  function startNewChat() {
    setSelectedConversationId(null);
    setMessages([]);
    setInput("");
    setError(null);
    inputRef.current?.focus();
  }

  async function loadConversation(conversationId: string) {
    if (conversationId === selectedConversationId || isStreaming) {
      return;
    }

    setIsLoadingConversation(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
      );
      const body = (await response.json()) as {
        messages?: AssistantMessage[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(body.error ?? "Could not load conversation.");
      }

      setSelectedConversationId(conversationId);
      const conversation = conversations.find(
        (currentConversation) => currentConversation.id === conversationId,
      );
      setSelectedProjectId(conversation?.project_id ?? "");
      setMessages(body.messages ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load conversation.",
      );
    } finally {
      setIsLoadingConversation(false);
    }
  }

  function updateAssistantMessage(messageId: string, content: string) {
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId ? { ...message, content } : message,
      ),
    );
  }

  function upsertConversation(id: string, title: string, projectId: string | null) {
    const now = new Date().toISOString();

    setConversations((currentConversations) => {
      const existing = currentConversations.find(
        (conversation) => conversation.id === id,
      );

      const updatedConversation: AssistantConversation = existing
        ? {
            ...existing,
            project_id: projectId,
            title: title || existing.title,
            updated_at: now,
          }
        : {
            created_at: now,
            id,
            model: "llama-3.3-70b-versatile",
            project_id: projectId,
            title: title || "New chat",
            updated_at: now,
          };

      return [
        updatedConversation,
        ...currentConversations.filter((conversation) => conversation.id !== id),
      ];
    });
  }

  async function sendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const prompt = input.trim();

    if (!prompt || isStreaming) {
      return;
    }

    setError(null);
    setInput("");
    setIsStreaming(true);

    const optimisticConversationId = selectedConversationId ?? "pending";
    const userMessage = createTemporaryMessage(
      "user",
      prompt,
      optimisticConversationId,
    );
    const assistantMessage = createTemporaryMessage(
      "assistant",
      "",
      optimisticConversationId,
    );

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantMessage,
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          message: prompt,
          projectId: selectedProjectId || null,
        }),
      });

      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error ?? "ORIVOO Assistant is unavailable.");
      }

      const conversationId =
        response.headers.get("X-Conversation-Id") ?? selectedConversationId;
      const title = decodeURIComponent(
        response.headers.get("X-Conversation-Title") ?? "New chat",
      );

      if (conversationId) {
        setSelectedConversationId(conversationId);
        upsertConversation(conversationId, title, selectedProjectId || null);
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.conversation_id === "pending"
              ? { ...message, conversation_id: conversationId }
              : message,
          ),
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        assistantContent += decoder.decode(value, { stream: true });
        updateAssistantMessage(assistantMessage.id, assistantContent);
      }

      assistantContent += decoder.decode();
      updateAssistantMessage(assistantMessage.id, assistantContent);
    } catch (sendError) {
      const message =
        sendError instanceof Error
          ? sendError.message
          : "ORIVOO Assistant could not send your message.";

      setError(message);
      updateAssistantMessage(assistantMessage.id, message);
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <section
      id="workspace"
      className="grid min-h-[calc(100vh-5rem)] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/30 lg:grid-cols-[19rem_1fr]"
    >
      <aside className="border-b border-white/10 bg-black/35 p-4 lg:border-b-0 lg:border-r">
        <button
          type="button"
          onClick={startNewChat}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold-bright transition hover:bg-gold/15"
        >
          <Plus className="size-4" aria-hidden />
          New chat
        </button>

        <div className="mb-4 rounded-2xl border border-white/10 bg-black/40 px-3 py-2">
          <div className="flex items-center gap-2 text-muted">
            <Search className="size-4" aria-hidden />
            <span className="text-xs">Conversation history</span>
          </div>
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto pr-1 lg:max-h-[calc(100vh-14rem)]">
          {conversations.length ? (
            conversations.map((conversation) => {
              const isSelected = conversation.id === selectedConversationId;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  disabled={isStreaming}
                  onClick={() => void loadConversation(conversation.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    isSelected
                      ? "border-gold/35 bg-gold/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare
                      className={`mt-0.5 size-4 shrink-0 ${
                        isSelected ? "text-gold" : "text-muted"
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {conversation.title}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatConversationDate(conversation.updated_at)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm leading-6 text-muted">
              Your saved ORIVOO Assistant conversations will appear here.
            </div>
          )}
        </div>
      </aside>

      <div className="flex min-h-[42rem] flex-col">
        <header className="border-b border-white/10 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold-bright">
                <Sparkles className="size-3.5" aria-hidden />
                Default dashboard experience
              </div>
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                ORIVOO Assistant
              </h1>
              <p className="mt-2 text-sm text-muted">
                Welcome back, {displayName}. Ask anything, and ORIVOO will save
                the conversation automatically.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:min-w-72">
              <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-muted">
                {selectedConversation?.title ?? "New unsaved chat"}
              </div>
              <label className="text-xs text-muted">
                Project
                <select
                  value={selectedProjectId}
                  onChange={(event) => setSelectedProjectId(event.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none transition focus:border-gold/50"
                >
                  <option value="">No project</option>
                  {initialProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </header>

        {error ? (
          <div className="mx-5 mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100 sm:mx-6">
            {error}
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
          {isLoadingConversation ? (
            <div className="flex h-full items-center justify-center text-muted">
              <Loader2 className="mr-2 size-5 animate-spin" aria-hidden />
              Loading conversation...
            </div>
          ) : messages.length ? (
            <div className="mx-auto max-w-3xl space-y-6">
              {messages
                .filter((message) => message.role !== "system")
                .map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <article
                      key={message.id}
                      className={`flex gap-4 ${isUser ? "justify-end" : ""}`}
                    >
                      {!isUser ? (
                        <div className="gold-gradient flex size-9 shrink-0 items-center justify-center rounded-2xl text-black">
                          <Bot className="size-4" aria-hidden />
                        </div>
                      ) : null}
                      <div
                        className={`max-w-[86%] rounded-[1.4rem] px-5 py-4 ${
                          isUser
                            ? "bg-white text-black"
                            : "border border-white/10 bg-black/45 text-white"
                        }`}
                      >
                        {message.content ? (
                          <p className="whitespace-pre-wrap text-sm leading-7">
                            {message.content}
                          </p>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted">
                            <Loader2
                              className="size-4 animate-spin"
                              aria-hidden
                            />
                            ORIVOO is thinking...
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
            </div>
          ) : (
            <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center text-center">
              <div className="gold-gradient mb-6 flex size-16 items-center justify-center rounded-[1.5rem] text-black shadow-lg shadow-gold/20">
                <Bot className="size-8" aria-hidden />
              </div>
              <h2 className="text-3xl font-semibold text-white">
                How can ORIVOO help today?
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-muted">
                Start a new chat for research, writing, planning, code,
                business strategy, design direction, or any specialized studio
                workflow.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  "Draft a launch plan",
                  "Research a market",
                  "Design a landing page",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted transition hover:border-gold/35 hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-4 sm:p-6">
          <form
            onSubmit={(event) => void sendMessage(event)}
            className="mx-auto flex max-w-3xl items-end gap-3 rounded-[1.5rem] border border-white/10 bg-black/60 p-2 pl-4 shadow-xl shadow-black/30 focus-within:border-gold/45"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              rows={1}
              placeholder="Message ORIVOO Assistant..."
              className="max-h-40 min-h-12 flex-1 resize-none bg-transparent py-3 text-sm text-white outline-none placeholder:text-muted/70"
              disabled={isStreaming}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="gold-gradient flex size-11 shrink-0 items-center justify-center rounded-full text-black transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isStreaming ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <ArrowUp className="size-4" aria-hidden />
              )}
              <span className="sr-only">Send message</span>
            </button>
          </form>
          <p className="mt-3 text-center text-xs text-muted">
            Streaming with Groq. Chats are saved automatically to Supabase.
          </p>
        </div>
      </div>
    </section>
  );
}
