"use client";

import { useMemo, useState, useTransition } from "react";
import { MessageSquareText, Plus, Search, Trash2 } from "lucide-react";
import { deleteConversation } from "@/app/actions/conversations";

export type DashboardConversation = {
  id: string;
  title: string;
  model: string | null;
  created_at: string;
  updated_at: string;
};

export type DashboardMessage = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
};

type LocalMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type DashboardAssistantProps = {
  conversations: DashboardConversation[];
  messages: DashboardMessage[];
  workspaceId: string | null;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function DashboardAssistant({
  conversations: initialConversations,
  messages,
  workspaceId,
}: DashboardAssistantProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [search, setSearch] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(
    initialConversations[0]?.id ?? null,
  );
  const [draft, setDraft] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<
    Record<string, LocalMessage[]>
  >({});
  const [isPending, startTransition] = useTransition();
  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  );
  const serverMessages = useMemo(
    () =>
      selectedConversationId
        ? messages
            .filter((message) => message.conversation_id === selectedConversationId)
            .map((message) => ({
              id: message.id,
              role: message.role === "assistant" ? "assistant" : "user",
              content: message.content,
            })) satisfies LocalMessage[]
        : [],
    [messages, selectedConversationId],
  );
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const visibleMessages = selectedConversationId
    ? [
        ...serverMessages,
        ...(pendingMessages[selectedConversationId] ?? []),
      ]
    : localMessages;
  const filteredConversations = conversations.filter((conversation) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      conversation.title.toLowerCase().includes(query) ||
      messages.some(
        (message) =>
          message.conversation_id === conversation.id &&
          message.content.toLowerCase().includes(query),
      )
    );
  });

  function startNewChat() {
    setSelectedConversationId(null);
    setLocalMessages([]);
    setDraft("");
  }

  function handleDelete(conversationId: string) {
    const conversation = conversations.find((item) => item.id === conversationId);
    const confirmed = window.confirm(
      `Delete "${conversation?.title ?? "this conversation"}" and all messages?`,
    );

    if (!confirmed) {
      return;
    }

    setConversations((current) =>
      current.filter((item) => item.id !== conversationId),
    );

    if (selectedConversationId === conversationId) {
      setSelectedConversationId(null);
      setLocalMessages([]);
    }
    setPendingMessages((current) => {
      const next = { ...current };
      delete next[conversationId];
      return next;
    });

    startTransition(async () => {
      await deleteConversation(conversationId);
    });
  }

  async function sendMessage() {
    const content = draft.trim();

    if (!content || isStreaming) {
      return;
    }

    const userMessage: LocalMessage = {
      id: `local-user-${Date.now()}`,
      role: "user",
      content,
    };
    const assistantMessage: LocalMessage = {
      id: `local-assistant-${Date.now()}`,
      role: "assistant",
      content: "",
    };

    setDraft("");
    if (selectedConversationId) {
      setPendingMessages((current) => ({
        ...current,
        [selectedConversationId]: [
          ...(current[selectedConversationId] ?? []),
          userMessage,
          assistantMessage,
        ],
      }));
    } else {
      setLocalMessages((current) => [...current, userMessage, assistantMessage]);
    }
    setIsStreaming(true);

    try {
      const response = await fetch("/api/ai/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          workspaceId,
          title: selectedConversation?.title ?? content.slice(0, 80),
          messages: [
            ...visibleMessages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
            {
              role: "user",
              content,
            },
          ],
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Unable to start AI response.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const eventName = event
            .split("\n")
            .find((line) => line.startsWith("event: "))
            ?.slice(7);
          const dataLine = event
            .split("\n")
            .find((line) => line.startsWith("data: "));

          if (!eventName || !dataLine) {
            continue;
          }

          const payload = JSON.parse(dataLine.slice(6)) as {
            text?: string;
            conversation_id?: string;
          };

          if (eventName === "token" && payload.text) {
            assistantText += payload.text;
            if (selectedConversationId) {
              setPendingMessages((current) => ({
                ...current,
                [selectedConversationId]: (
                  current[selectedConversationId] ?? []
                ).map((message) =>
                  message.id === assistantMessage.id
                    ? { ...message, content: assistantText }
                    : message,
                ),
              }));
            } else {
              setLocalMessages((current) =>
                current.map((message) =>
                  message.id === assistantMessage.id
                    ? { ...message, content: assistantText }
                    : message,
                ),
              );
            }
          }

          if (eventName === "done" && payload.conversation_id) {
            const conversationId = payload.conversation_id;

            if (!selectedConversationId) {
              setPendingMessages((current) => ({
                ...current,
                [conversationId]: [
                  ...localMessages,
                  userMessage,
                  {
                    ...assistantMessage,
                    content: assistantText,
                  },
                ],
              }));
              setLocalMessages([]);
            }
            setSelectedConversationId(conversationId);
            setConversations((current) =>
              current.some((item) => item.id === conversationId)
                ? current
                : [
                    {
                      id: conversationId,
                      title: content.slice(0, 80) || "New conversation",
                      model: null,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    },
                    ...current,
                  ],
            );
          }
        }
      }
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : "The assistant response failed.";

      if (selectedConversationId) {
        setPendingMessages((current) => ({
          ...current,
          [selectedConversationId]: (
            current[selectedConversationId] ?? []
          ).map((message) =>
            message.id === assistantMessage.id
              ? {
                  ...message,
                  content: errorText,
                }
              : message,
          ),
        }));
      } else {
        setLocalMessages((current) =>
          current.map((message) =>
            message.id === assistantMessage.id
              ? {
                  ...message,
                  content: errorText,
                }
              : message,
          ),
        );
      }
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <section className="grid min-h-[42rem] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] lg:grid-cols-[22rem_1fr]">
      <aside className="border-b border-white/10 bg-black/40 p-4 lg:border-b-0 lg:border-r">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Assistant
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Conversations
            </h2>
          </div>
          <button
            type="button"
            onClick={startNewChat}
            className="gold-gradient inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-black"
          >
            <Plus className="size-4" aria-hidden />
            New Chat
          </button>
        </div>

        <label className="mb-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-panel-soft px-3 py-2">
          <Search className="size-4 text-muted" aria-hidden />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-muted"
          />
        </label>

        <div className="space-y-2">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`rounded-2xl border p-3 ${
                  selectedConversationId === conversation.id
                    ? "border-gold/30 bg-gold/10"
                    : "border-white/10 bg-panel-soft"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className="block w-full text-left"
                >
                  <span className="block truncate text-sm font-medium text-white">
                    {conversation.title}
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    {conversation.model ?? "ORIVOO"} /{" "}
                    {formatDate(conversation.updated_at)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(conversation.id)}
                  disabled={isPending}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-red-400/20 px-3 py-1.5 text-xs text-red-200 disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Delete
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-panel-soft p-5 text-sm leading-6 text-muted">
              No conversations match your search.
            </div>
          )}
        </div>
      </aside>

      <div className="flex min-h-[42rem] flex-col">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-gold/20 bg-gold/10 text-gold">
              <MessageSquareText className="size-4" aria-hidden />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {selectedConversation?.title ?? "New conversation"}
              </h2>
              <p className="text-sm text-muted">
                Workspace-only memory context is injected before each response.
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {visibleMessages.length > 0 ? (
            visibleMessages.map((message) => (
              <article
                key={message.id}
                className={`max-w-3xl rounded-3xl border p-4 ${
                  message.role === "user"
                    ? "ml-auto border-gold/20 bg-gold/10 text-white"
                    : "border-white/10 bg-panel-soft text-muted"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.18em] text-gold-bright">
                  {message.role === "user" ? "You" : "ORIVOO"}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                  {message.content || "Thinking..."}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-panel-soft p-10 text-center">
              <MessageSquareText
                className="mx-auto mb-4 size-8 text-gold"
                aria-hidden
              />
              <h3 className="text-xl font-semibold text-white">
                Start a conversation
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Ask ORIVOO to plan, write, research, design, or build using your
                workspace memory.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex gap-3 rounded-3xl border border-white/10 bg-black/50 p-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={2}
              placeholder="Ask ORIVOO AI..."
              className="min-h-16 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-white outline-none placeholder:text-muted"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!draft.trim() || isStreaming}
              className="gold-gradient self-end rounded-full px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isStreaming ? "Sending" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
