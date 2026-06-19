"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { submitAssistantPrompt } from "@/app/actions/assistant";
import type { AssistantMessage } from "@/lib/assistant/types";

const placeholder = "Ask ORIVOO AI to plan, write, design, research, or build...";
const emptyPrompt =
  "Build a launch-ready brief, create a research map, and draft the first landing page section for ORIVOO AI.";

export function AssistantPrompt({
  initialConversationId,
  initialMessages,
}: {
  initialConversationId: string | null;
  initialMessages: AssistantMessage[];
}) {
  const [prompt, setPrompt] = useState("");
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState(initialMessages);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    const optimisticUserMessage: AssistantMessage = {
      id: `pending-${Date.now()}`,
      role: "user",
      content: nextPrompt,
      created_at: new Date().toISOString(),
    };

    setError(null);
    setIsSubmitting(true);
    setMessages((currentMessages) => [
      ...currentMessages,
      optimisticUserMessage,
    ]);
    setPrompt("");

    requestAnimationFrame(() => {
      resizeTextarea();
      textareaRef.current?.focus();
    });

    try {
      const result = await submitAssistantPrompt({
        prompt: nextPrompt,
        conversationId,
      });

      if (!result.ok) {
        setError(result.error);

        if (result.conversationId) {
          setConversationId(result.conversationId);
        }

        if (result.messages) {
          setMessages(result.messages);
        }

        return;
      }

      setConversationId(result.conversationId);
      setMessages(result.messages);
    } catch {
      setError("The assistant request failed. Please try again.");
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
        <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
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
                  {message.content}
                </p>
              </article>
            ))
          ) : (
            <p className="whitespace-pre-wrap text-lg text-white">
              {emptyPrompt}
            </p>
          )}
          {isSubmitting ? (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-muted">
              ORIVOO AI is thinking...
            </div>
          ) : null}
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
