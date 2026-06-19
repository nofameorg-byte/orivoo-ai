"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { ArrowUp } from "lucide-react";
import { AssistantModelSelector } from "@/app/dashboard/assistant-model-selector";
import type {
  AssistantModelId,
  SubscriptionTier,
} from "@/lib/assistant/models";
import type {
  AssistantConversation,
  AssistantMessage,
  AssistantStreamEvent,
} from "@/lib/assistant/types";

const placeholder = "Ask ORIVOO AI to plan, write, design, research, or build...";
const emptyPrompt =
  "Build a launch-ready brief, create a research map, and draft the first landing page section for ORIVOO AI.";

export function AssistantPrompt({
  conversationId,
  messages,
  onConversationIdChange,
  onConversationSaved,
  onMessagesChange,
  onSelectedModelChange,
  selectedModel,
  subscriptionTier,
}: {
  conversationId: string | null;
  messages: AssistantMessage[];
  onConversationIdChange: (conversationId: string) => void;
  onConversationSaved: (conversation: AssistantConversation) => void;
  onMessagesChange: (messages: AssistantMessage[]) => void;
  onSelectedModelChange: (modelId: AssistantModelId) => void;
  selectedModel: AssistantModelId;
  subscriptionTier: SubscriptionTier;
}) {
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToNewestMessage = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, []);

  useEffect(() => {
    const frameId = requestAnimationFrame(scrollToNewestMessage);

    return () => cancelAnimationFrame(frameId);
  }, [messages, isSubmitting, scrollToNewestMessage]);

  function resizeTextarea() {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextPrompt = prompt.trim();

    if (!nextPrompt || isSubmitting) {
      return;
    }

    const pendingId = Date.now();
    const optimisticUserMessage: AssistantMessage = {
      id: `pending-user-${pendingId}`,
      role: "user",
      content: nextPrompt,
      created_at: new Date().toISOString(),
    };
    const streamingAssistantMessage: AssistantMessage = {
      id: `streaming-assistant-${pendingId}`,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
    };
    let workingMessages = [
      ...messages,
      optimisticUserMessage,
      streamingAssistantMessage,
    ];
    let streamingContent = "";
    let completed = false;

    setError(null);
    setIsSubmitting(true);
    onMessagesChange(workingMessages);
    setPrompt("");

    requestAnimationFrame(() => {
      resizeTextarea();
      textareaRef.current?.focus();
    });

    try {
      const response = await fetch("/api/assistant/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: nextPrompt,
          conversationId,
          modelId: selectedModel,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("The assistant stream could not be started.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamError: string | null = null;

      function updateWorkingMessages(nextMessages: AssistantMessage[]) {
        workingMessages = nextMessages;
        onMessagesChange(nextMessages);
      }

      function applyStreamEvent(event: AssistantStreamEvent) {
        switch (event.type) {
          case "conversation":
            onConversationIdChange(event.conversationId);
            onConversationSaved(event.conversation);
            break;
          case "user_message":
            updateWorkingMessages(
              workingMessages.map((message) =>
                message.id === optimisticUserMessage.id
                  ? event.message
                  : message,
              ),
            );
            break;
          case "token":
            streamingContent += event.content;
            updateWorkingMessages(
              workingMessages.map((message) =>
                message.id === streamingAssistantMessage.id
                  ? {
                      ...message,
                      content: streamingContent,
                    }
                  : message,
              ),
            );
            break;
          case "done":
            completed = true;
            onConversationIdChange(event.conversationId);
            onConversationSaved(event.conversation);
            updateWorkingMessages(event.messages);
            break;
          case "error":
            streamError = event.error;
            setError(event.error);

            if (event.conversationId) {
              onConversationIdChange(event.conversationId);
            }

            if (event.messages) {
              updateWorkingMessages(event.messages);
            } else if (!streamingContent.trim()) {
              updateWorkingMessages(
                workingMessages.filter(
                  (message) => message.id !== streamingAssistantMessage.id,
                ),
              );
            }

            break;
        }
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          applyStreamEvent(JSON.parse(line) as AssistantStreamEvent);
        }
      }

      if (buffer.trim()) {
        applyStreamEvent(JSON.parse(buffer) as AssistantStreamEvent);
      }

      if (streamError) {
        return;
      }
    } catch (caughtError) {
      setError(getStreamErrorMessage(caughtError));

      if (!completed && !streamingContent.trim()) {
        onMessagesChange(
          workingMessages.filter(
            (message) => message.id !== streamingAssistantMessage.id,
          ),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div
      className="relative mt-8 rounded-[1.5rem] border border-white/10 bg-black/60 p-3"
      aria-busy={isSubmitting}
    >
      <div className="min-h-32 rounded-2xl bg-panel-soft p-5">
        <p className="text-sm text-muted">Assistant prompt</p>
        <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {messages.length > 0 ? (
            messages.map((message) => (
              <article
                key={message.id}
                className={`rounded-2xl border p-4 ${
                  message.role === "user"
                    ? "border-gold/20 bg-gold/10"
                    : "border-white/10 bg-black/30"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {message.role === "user" ? "You" : "ORIVOO AI"}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white">
                  {message.content ||
                    (message.id.startsWith("streaming-assistant-") &&
                    isSubmitting
                      ? "ORIVOO AI is typing..."
                      : "")}
                </p>
              </article>
            ))
          ) : (
            <p className="whitespace-pre-wrap text-lg text-white">
              {emptyPrompt}
            </p>
          )}
          <div ref={messagesEndRef} aria-hidden="true" />
        </div>
        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100"
          >
            {error}
          </p>
        ) : null}
      </div>
      <AssistantModelSelector
        selectedModel={selectedModel}
        subscriptionTier={subscriptionTier}
        onSelectedModelChange={onSelectedModelChange}
      />
      <form
        onSubmit={handleSubmit}
        className="mt-3 flex items-end gap-3 rounded-[1.75rem] border border-white/10 bg-black/60 p-2 pl-5 transition focus-within:border-gold/50 focus-within:ring-2 focus-within:ring-gold/20"
      >
        <label htmlFor="assistant-prompt" className="sr-only">
          Assistant prompt
        </label>
        <textarea
          id="assistant-prompt"
          ref={textareaRef}
          value={prompt}
          rows={1}
          placeholder={placeholder}
          disabled={isSubmitting}
          onChange={(event) => {
            setPrompt(event.target.value);
            resizeTextarea();
          }}
          onKeyDown={handleKeyDown}
          className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm leading-6 text-white outline-none placeholder:text-muted disabled:cursor-wait disabled:opacity-70"
        />
        <button
          type="submit"
          className="gold-gradient flex size-10 shrink-0 items-center justify-center rounded-full text-black transition focus:outline-none focus:ring-2 focus:ring-gold/70 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!prompt.trim() || isSubmitting}
        >
          <ArrowUp className="size-4" aria-hidden />
          <span className="sr-only">
            {isSubmitting ? "Sending prompt" : "Send prompt"}
          </span>
        </button>
      </form>
    </div>
  );
}

function getStreamErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "The assistant stream was interrupted. Please try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The assistant stream was interrupted. Please try again.";
}
